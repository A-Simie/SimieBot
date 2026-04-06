import { randomUUID } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { access, mkdtemp, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { spawn } from 'node:child_process';

import { ConverseCommand, type Message, type SystemContentBlock, type VideoFormat } from '@aws-sdk/client-bedrock-runtime';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { google } from 'googleapis';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { NOVA_LITE_2_MODEL_ID, createBedrockRuntimeClient, getConverseTextContent } from './bedrock';

const region = process.env.BEDROCK_AWS_REGION ?? process.env.AWS_REGION ?? 'us-east-1';
const accessKeyId = process.env.BEDROCK_AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.BEDROCK_AWS_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY;
const sessionToken = process.env.BEDROCK_AWS_SESSION_TOKEN ?? process.env.AWS_SESSION_TOKEN;

const ffmpegPath = process.env.FFMPEG_PATH ?? 'ffmpeg';
const ffprobePath = process.env.FFPROBE_PATH ?? 'ffprobe';
const defaultBucketPrefix = process.env.SIMIEBOT_VIDEO_PREFIX ?? 'simiebot/creator';

const s3Client = new S3Client({
  region,
  ...(accessKeyId && secretAccessKey
    ? {
        credentials: {
          accessKeyId,
          secretAccessKey,
          ...(sessionToken ? { sessionToken } : {}),
        },
      }
    : {}),
});

export const aspectRatioSchema = z.enum(['9:16', '16:9', '1:1']);

const segmentSchema = z.object({
  start: z.number().min(0),
  end: z.number().gt(0),
  rationale: z.string().min(1),
});

const captionSchema = z.object({
  text: z.string().min(1),
  start: z.number().min(0),
  end: z.number().gt(0),
  position: z.enum(['top', 'bottom', 'center']).default('bottom'),
});

export const videoEditPlanSchema = z.object({
  summary: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  output: z.object({
    aspectRatio: aspectRatioSchema,
    format: z.literal('mp4'),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    videoCodec: z.literal('libx264'),
    audioCodec: z.literal('aac'),
  }),
  segments: z.array(segmentSchema).min(1).max(4),
  captions: z.array(captionSchema).max(12).default([]),
});

export type VideoEditPlan = z.infer<typeof videoEditPlanSchema>;

export interface CreatorPipelineEvent {
  stage: string;
  status: 'started' | 'completed' | 'failed' | 'warning';
  message: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

type PipelineReporter = {
  emit: (event: Omit<CreatorPipelineEvent, 'timestamp'>) => void;
  events: CreatorPipelineEvent[];
};

export interface DriveAssetSummary {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number | null;
  createdTime?: string | null;
  modifiedTime?: string | null;
  webViewLink?: string | null;
  thumbnailLink?: string | null;
  durationSeconds?: number | null;
  width?: number | null;
  height?: number | null;
}

export interface StagedVideoAsset extends DriveAssetSummary {
  bucket: string;
  key: string;
  s3Uri: string;
}

const requireEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const getCreatorBucket = () => requireEnv('SIMIEBOT_VIDEO_BUCKET');

const getBucketPrefix = () => defaultBucketPrefix.replace(/^\/+|\/+$/g, '');

const createPipelineReporter = (context: string): PipelineReporter => {
  const events: CreatorPipelineEvent[] = [];

  return {
    events,
    emit: (event) => {
      const fullEvent: CreatorPipelineEvent = {
        ...event,
        timestamp: new Date().toISOString(),
      };

      events.push(fullEvent);
      const logPayload = {
        context,
        ...fullEvent,
      };

      if (event.status === 'failed') {
        console.error('[SimieBot Creator]', logPayload);
        return;
      }

      if (event.status === 'warning') {
        console.warn('[SimieBot Creator]', logPayload);
        return;
      }

      console.info('[SimieBot Creator]', logPayload);
    },
  };
};

const createGoogleAuth = (accessToken: string) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return auth;
};

const escapeDriveQuery = (value: string) => value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const sanitizeFileName = (value: string) => value.replace(/[^a-zA-Z0-9._-]/g, '-');

const getFileExtension = (value: string) => {
  const extension = path.extname(value).toLowerCase().replace('.', '');
  return extension || 'mp4';
};

const getVideoDimensions = (aspectRatio: z.infer<typeof aspectRatioSchema>) => {
  if (aspectRatio === '16:9') {
    return { width: 1920, height: 1080 };
  }

  if (aspectRatio === '1:1') {
    return { width: 1080, height: 1080 };
  }

  return { width: 1080, height: 1920 };
};

const parseJsonFromText = (text: string) => {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return JSON.parse(fencedMatch[1]);
  }

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return JSON.parse(text.slice(start, end + 1));
  }

  throw new Error('Nova did not return valid JSON for the edit plan.');
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const safeParseNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const normalizeCaptions = (
  captions: VideoEditPlan['captions'],
  totalDuration: number,
) =>
  captions
    .map((caption) => {
      const start = clamp(caption.start, 0, totalDuration);
      const end = clamp(caption.end, start + 0.1, totalDuration);
      return {
        ...caption,
        start,
        end,
      };
    })
    .filter((caption) => caption.end > caption.start);

export const normalizeVideoEditPlan = (
  plan: VideoEditPlan,
  maxClipDurationSeconds: number,
  sourceDurationSeconds?: number | null,
) => {
  let remaining = maxClipDurationSeconds;

  const normalizedSegments = plan.segments
    .map((segment) => {
      const clampedSourceDuration =
        typeof sourceDurationSeconds === 'number' && Number.isFinite(sourceDurationSeconds) && sourceDurationSeconds > 0
          ? sourceDurationSeconds
          : null;
      const start = clamp(segment.start, 0, clampedSourceDuration ?? Math.max(0, segment.start));
      const requestedEnd = Math.max(start + 0.25, segment.end);
      const boundedEnd = clampedSourceDuration ? Math.min(requestedEnd, clampedSourceDuration) : requestedEnd;
      const available = Math.max(0, remaining);
      const length = Math.min(boundedEnd - start, available || boundedEnd - start);
      const end = start + Math.max(0.25, length);
      remaining = Math.max(0, remaining - (end - start));
      return {
        ...segment,
        start,
        end,
      };
    })
    .filter((segment) => segment.end > segment.start)
    .slice(0, 4);

  const totalDuration = normalizedSegments.reduce((sum, segment) => sum + (segment.end - segment.start), 0);

  if (normalizedSegments.length === 0 || totalDuration <= 0) {
    throw new Error('The generated edit plan did not contain any valid segments.');
  }

  return {
    ...plan,
    segments: normalizedSegments,
    captions: normalizeCaptions(plan.captions, totalDuration).slice(0, 12),
  };
};

const clampPlanToSourceDuration = (plan: VideoEditPlan, sourceDurationSeconds?: number | null) => {
  if (!sourceDurationSeconds || !Number.isFinite(sourceDurationSeconds) || sourceDurationSeconds <= 0) {
    return plan;
  }

  const segments = plan.segments
    .map((segment) => {
      const start = clamp(segment.start, 0, sourceDurationSeconds);
      const end = clamp(segment.end, start + 0.01, sourceDurationSeconds);
      return {
        ...segment,
        start,
        end,
      };
    })
    .filter((segment) => segment.end > segment.start);

  if (segments.length === 0) {
    throw new Error('The edit plan does not fit within the source video duration.');
  }

  return {
    ...plan,
    segments,
  };
};

const inferVideoFormat = ({
  mimeType,
  fileName,
}: {
  mimeType?: string | null;
  fileName?: string | null;
}): VideoFormat => {
  const normalizedMime = (mimeType ?? '').toLowerCase();
  const extension = getFileExtension(fileName ?? '');

  if (normalizedMime.includes('quicktime') || extension === 'mov') {
    return 'mov';
  }

  if (normalizedMime.includes('webm') || extension === 'webm') {
    return 'webm';
  }

  if (normalizedMime.includes('matroska') || extension === 'mkv') {
    return 'mkv';
  }

  if (normalizedMime.includes('x-flv') || extension === 'flv') {
    return 'flv';
  }

  if (normalizedMime.includes('wmv') || extension === 'wmv') {
    return 'wmv';
  }

  if (normalizedMime.includes('3gpp') || extension === '3gp') {
    return 'three_gp';
  }

  if (normalizedMime.includes('mpeg') || extension === 'mpeg' || extension === 'mpg') {
    return extension === 'mpg' ? 'mpg' : 'mpeg';
  }

  return 'mp4';
};

const getDefaultTimeoutForCommand = (command: string) =>
  path.basename(command).includes('ffprobe')
    ? Number(process.env.SIMIEBOT_FFPROBE_TIMEOUT_MS ?? 30_000)
    : Number(process.env.SIMIEBOT_FFMPEG_TIMEOUT_MS ?? 900_000);

const runCommand = (
  command: string,
  args: string[],
  cwd?: string,
  timeoutMs = getDefaultTimeoutForCommand(command),
) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderr = '';
    let timedOut = false;
    const timer =
      timeoutMs > 0
        ? setTimeout(() => {
            timedOut = true;
            child.kill('SIGKILL');
          }, timeoutMs)
        : null;

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      if (timer) {
        clearTimeout(timer);
      }
      reject(error);
    });
    child.on('close', (code) => {
      if (timer) {
        clearTimeout(timer);
      }

      if (code === 0) {
        resolve();
        return;
      }

      if (timedOut) {
        reject(new Error(`${command} timed out after ${timeoutMs}ms.`));
        return;
      }

      reject(new Error(`${command} exited with code ${code}: ${stderr}`));
    });
  });

const runCommandCaptureOutput = (
  command: string,
  args: string[],
  cwd?: string,
  timeoutMs = getDefaultTimeoutForCommand(command),
) =>
  new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer =
      timeoutMs > 0
        ? setTimeout(() => {
            timedOut = true;
            child.kill('SIGKILL');
          }, timeoutMs)
        : null;

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      if (timer) {
        clearTimeout(timer);
      }
      reject(error);
    });
    child.on('close', (code) => {
      if (timer) {
        clearTimeout(timer);
      }

      if (code === 0) {
        resolve(stdout);
        return;
      }

      if (timedOut) {
        reject(new Error(`${command} timed out after ${timeoutMs}ms.`));
        return;
      }

      reject(new Error(`${command} exited with code ${code}: ${stderr}`));
    });
  });

const ensureFfmpegAvailable = async () => {
  try {
    await access(ffmpegPath);
    return;
  } catch {
    // ignore and fall back to PATH execution
  }

  try {
    await runCommand(ffmpegPath, ['-version']);
  } catch (error) {
    throw new Error(
      `FFmpeg is not available. Install FFmpeg or set FFMPEG_PATH. Original error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }
};

const ensureFfprobeAvailable = async () => {
  try {
    await access(ffprobePath);
    return;
  } catch {
    // ignore and fall back to PATH execution
  }

  try {
    await runCommandCaptureOutput(ffprobePath, ['-version']);
  } catch (error) {
    throw new Error(
      `ffprobe is not available. Install ffmpeg/ffprobe or set FFPROBE_PATH. Original error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }
};

const escapeDrawtextFilterValue = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/=/g, '\\=')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');

const buildDrawtextFilter = (
  captions: Array<VideoEditPlan['captions'][number] & { textFilePath: string }>,
  aspectRatio: z.infer<typeof aspectRatioSchema>,
) => {
  const target = getVideoDimensions(aspectRatio);
  const scaleCrop = `scale=${target.width}:${target.height}:force_original_aspect_ratio=increase,crop=${target.width}:${target.height}`;

  if (captions.length === 0) {
    return scaleCrop;
  }

  const captionFilters = captions.map((caption) => {
    const yExpression =
      caption.position === 'top'
        ? '120'
        : caption.position === 'center'
          ? '(h-text_h)/2'
          : 'h-text_h-140';

    return `drawtext=textfile='${escapeDrawtextFilterValue(caption.textFilePath)}':fontcolor=white:fontsize=48:box=1:boxcolor=black@0.45:boxborderw=18:x=(w-text_w)/2:y=${yExpression}:enable='between(t,${caption.start.toFixed(2)},${caption.end.toFixed(2)})'`;
  });

  return [scaleCrop, ...captionFilters].join(',');
};

const streamBodyToFile = async (body: unknown, outputPath: string) => {
  if (!body || typeof body !== 'object' || !('pipe' in body)) {
    throw new Error('Received an unexpected stream body.');
  }

  await pipeline(body as NodeJS.ReadableStream, createWriteStream(outputPath));
};

export const listDriveVideoAssets = async ({
  accessToken,
  query,
  mimeType,
  maxResults,
}: {
  accessToken: string;
  query?: string;
  mimeType?: string;
  maxResults?: number;
}): Promise<DriveAssetSummary[]> => {
  const auth = createGoogleAuth(accessToken);
  const drive = google.drive('v3');

  const qParts = ['trashed = false'];
  if (!mimeType || mimeType === 'video/*') {
    qParts.push(`mimeType contains 'video/'`);
  } else {
    qParts.push(`mimeType = '${escapeDriveQuery(mimeType)}'`);
  }

  if (query && query.trim() && query.trim() !== 'recent video files') {
    qParts.push(`name contains '${escapeDriveQuery(query.trim())}'`);
  }

  const response = await drive.files.list({
    auth,
    q: qParts.join(' and '),
    pageSize: maxResults ?? 10,
    orderBy: 'modifiedTime desc',
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    fields:
      'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,thumbnailLink,videoMediaMetadata(durationMillis,width,height))',
  });

  return (response.data.files ?? []).map((file) => ({
    id: file.id ?? '',
    name: file.name ?? 'Untitled video',
    mimeType: file.mimeType ?? 'video/mp4',
    sizeBytes: file.size ? Number(file.size) : null,
    createdTime: file.createdTime,
    modifiedTime: file.modifiedTime,
    webViewLink: file.webViewLink,
    thumbnailLink: file.thumbnailLink,
    durationSeconds: file.videoMediaMetadata?.durationMillis
      ? Number(file.videoMediaMetadata.durationMillis) / 1000
      : null,
    width: file.videoMediaMetadata?.width ? Number(file.videoMediaMetadata.width) : null,
    height: file.videoMediaMetadata?.height ? Number(file.videoMediaMetadata.height) : null,
  }));
};

export const stageDriveAssetToS3 = async ({
  accessToken,
  fileId,
}: {
  accessToken: string;
  fileId: string;
}): Promise<StagedVideoAsset> => {
  const reporter = createPipelineReporter('stageDriveAssetToS3');
  reporter.emit({
    stage: 'load_drive_metadata',
    status: 'started',
    message: 'Loading Google Drive metadata before staging the asset.',
    details: { fileId },
  });

  const auth = createGoogleAuth(accessToken);
  const drive = google.drive('v3');
  const bucket = getCreatorBucket();

  const metadataResponse = await drive.files.get({
    auth,
    fileId,
    fields:
      'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,thumbnailLink,videoMediaMetadata(durationMillis,width,height)',
    supportsAllDrives: true,
  });

  const metadata = metadataResponse.data;
  reporter.emit({
    stage: 'load_drive_metadata',
    status: 'completed',
    message: 'Loaded Google Drive metadata.',
    details: {
      fileId: metadata.id ?? fileId,
      name: metadata.name ?? fileId,
      mimeType: metadata.mimeType ?? 'video/mp4',
    },
  });

  reporter.emit({
    stage: 'stage_to_s3',
    status: 'started',
    message: 'Streaming the Drive asset into S3 staging.',
    details: { bucket },
  });
  const mediaResponse = await drive.files.get(
    {
      auth,
      fileId,
      alt: 'media',
      supportsAllDrives: true,
    },
    {
      responseType: 'stream',
    },
  );

  const key = `${getBucketPrefix()}/source/${Date.now()}-${sanitizeFileName(metadata.name ?? fileId)}`;

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucket,
      Key: key,
      Body: mediaResponse.data as any,
      ContentType: metadata.mimeType ?? 'video/mp4',
    },
  });

  await upload.done();
  reporter.emit({
    stage: 'stage_to_s3',
    status: 'completed',
    message: 'Drive asset staged into S3 successfully.',
    details: {
      bucket,
      key,
      s3Uri: `s3://${bucket}/${key}`,
    },
  });

  return {
    id: metadata.id ?? fileId,
    name: metadata.name ?? fileId,
    mimeType: metadata.mimeType ?? 'video/mp4',
    sizeBytes: metadata.size ? Number(metadata.size) : null,
    createdTime: metadata.createdTime,
    modifiedTime: metadata.modifiedTime,
    webViewLink: metadata.webViewLink,
    thumbnailLink: metadata.thumbnailLink,
    durationSeconds: metadata.videoMediaMetadata?.durationMillis
      ? Number(metadata.videoMediaMetadata.durationMillis) / 1000
      : null,
    width: metadata.videoMediaMetadata?.width ? Number(metadata.videoMediaMetadata.width) : null,
    height: metadata.videoMediaMetadata?.height ? Number(metadata.videoMediaMetadata.height) : null,
    bucket,
    key,
    s3Uri: `s3://${bucket}/${key}`,
  };
};

export const planVideoEditWithNova = async ({
  stagedAsset,
  creativeGoal,
  outputAspectRatio,
  maxClipDurationSeconds,
  additionalContext,
}: {
  stagedAsset: Pick<
    StagedVideoAsset,
    'id' | 'name' | 'mimeType' | 'sizeBytes' | 'durationSeconds' | 'width' | 'height' | 'bucket' | 'key' | 's3Uri'
  >;
  creativeGoal: string;
  outputAspectRatio: z.infer<typeof aspectRatioSchema>;
  maxClipDurationSeconds: number;
  additionalContext?: string;
}) => {
  const reporter = createPipelineReporter('planVideoEditWithNova');
  reporter.emit({
    stage: 'probe_source',
    status: 'started',
    message: 'Probing the staged source asset before asking Nova to plan edits.',
    details: {
      s3Uri: stagedAsset.s3Uri,
      creativeGoal,
    },
  });

  const bedrock = createBedrockRuntimeClient();
  const target = getVideoDimensions(outputAspectRatio);
  const schemaJson = JSON.stringify(zodToJsonSchema(videoEditPlanSchema), null, 2);
  const probedSource = await probeStagedVideoAsset({
    bucket: stagedAsset.bucket,
    key: stagedAsset.key,
    fileName: stagedAsset.name,
  });
  reporter.emit({
    stage: 'probe_source',
    status: 'completed',
    message: 'Probed the staged source asset successfully.',
    details: {
      durationSeconds: probedSource.durationSeconds,
      width: probedSource.width,
      height: probedSource.height,
      formatName: probedSource.formatName,
    },
  });

  const system: SystemContentBlock[] = [
    {
      text: `You are an AI video editor planner. You can inspect the supplied source video and must generate ONLY JSON matching the schema.
Use the actual video content plus the provided context to produce a concise edit plan.
Keep the plan practical for FFmpeg execution.
Use no more than 4 segments.
Keep the total final clip length under ${maxClipDurationSeconds} seconds.
Segment timestamps must refer to the source video timeline.
Caption timing must be relative to the final edited clip timeline, not the source timeline.
Set output to ${target.width}x${target.height} ${outputAspectRatio}, mp4, libx264, aac.
Do not wrap the JSON in markdown fences.

JSON schema:
${schemaJson}`,
    },
  ];

  const messages: Message[] = [
    {
      role: 'user',
      content: [
        {
          text: `Creative goal: ${creativeGoal}
Additional context: ${additionalContext ?? 'None provided'}

Source asset metadata:
- id: ${stagedAsset.id}
- name: ${stagedAsset.name}
- mime type: ${stagedAsset.mimeType}
- size bytes: ${stagedAsset.sizeBytes ?? 'unknown'}
- stored duration seconds: ${stagedAsset.durationSeconds ?? 'unknown'}
- stored width: ${stagedAsset.width ?? 'unknown'}
- stored height: ${stagedAsset.height ?? 'unknown'}
- probed duration seconds: ${probedSource.durationSeconds ?? 'unknown'}
- probed width: ${probedSource.width ?? 'unknown'}
- probed height: ${probedSource.height ?? 'unknown'}
- storage uri: ${stagedAsset.s3Uri}`,
        },
        {
          video: {
            format: inferVideoFormat({
              mimeType: stagedAsset.mimeType,
              fileName: stagedAsset.name,
            }),
            source: {
              s3Location: {
                uri: stagedAsset.s3Uri,
              },
            },
          },
        },
      ],
    },
  ];

  reporter.emit({
    stage: 'nova_plan',
    status: 'started',
    message: 'Sending the actual staged video to Nova for edit planning.',
    details: {
      modelId: NOVA_LITE_2_MODEL_ID,
      outputAspectRatio,
      maxClipDurationSeconds,
    },
  });

  const response = await bedrock.send(
    new ConverseCommand({
      modelId: NOVA_LITE_2_MODEL_ID,
      system,
      messages,
      inferenceConfig: {
        temperature: 0,
        maxTokens: 1400,
      },
    }),
  );
  reporter.emit({
    stage: 'nova_plan',
    status: 'completed',
    message: 'Nova returned a candidate edit plan.',
  });

  const parsed = parseJsonFromText(getConverseTextContent(response.output?.message?.content));
  const plan = videoEditPlanSchema.parse(parsed);
  reporter.emit({
    stage: 'normalize_plan',
    status: 'started',
    message: 'Normalizing the edit plan against clip duration and source limits.',
  });

  const normalizedPlan = normalizeVideoEditPlan(plan, maxClipDurationSeconds, probedSource.durationSeconds);
  reporter.emit({
    stage: 'normalize_plan',
    status: 'completed',
    message: 'Edit plan normalized successfully.',
    details: {
      segments: normalizedPlan.segments.length,
      captions: normalizedPlan.captions.length,
    },
  });

  return normalizedPlan;
};

const getS3ObjectBody = async ({ bucket, key }: { bucket: string; key: string }) => {
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error(`S3 object s3://${bucket}/${key} did not include a body.`);
  }

  return response.Body;
};

export const downloadS3ObjectToTempFile = async ({
  bucket,
  key,
  extension,
}: {
  bucket: string;
  key: string;
  extension: string;
}) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'simiebot-creator-'));
  const filePath = path.join(directory, `${randomUUID()}.${extension.replace(/^\./, '')}`);
  const body = await getS3ObjectBody({ bucket, key });
  await streamBodyToFile(body, filePath);
  return { directory, filePath };
};

const probeVideoFile = async (filePath: string) => {
  await ensureFfprobeAvailable();

  const rawOutput = await runCommandCaptureOutput(ffprobePath, [
    '-v',
    'error',
    '-print_format',
    'json',
    '-show_format',
    '-show_streams',
    filePath,
  ]);

  const parsed = JSON.parse(rawOutput) as {
    format?: { duration?: string | number; format_name?: string };
    streams?: Array<{
      codec_type?: string;
      width?: number | string;
      height?: number | string;
      duration?: string | number;
    }>;
  };

  const videoStream = parsed.streams?.find((stream) => stream.codec_type === 'video');
  const durationSeconds =
    safeParseNumber(videoStream?.duration) ?? safeParseNumber(parsed.format?.duration) ?? null;

  return {
    durationSeconds,
    width: safeParseNumber(videoStream?.width),
    height: safeParseNumber(videoStream?.height),
    formatName: parsed.format?.format_name ?? null,
  };
};

const probeStagedVideoAsset = async ({
  bucket,
  key,
  fileName,
}: {
  bucket: string;
  key: string;
  fileName?: string | null;
}) => {
  const { directory, filePath } = await downloadS3ObjectToTempFile({
    bucket,
    key,
    extension: getFileExtension(fileName ?? key),
  });

  try {
    return await probeVideoFile(filePath);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};

const writeCaptionFiles = async ({
  directory,
  captions,
}: {
  directory: string;
  captions: VideoEditPlan['captions'];
}) =>
  Promise.all(
    captions.map(async (caption, index) => {
      const captionPath = path.join(directory, `caption-${index}.txt`);
      const normalizedText = caption.text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      await writeFile(captionPath, normalizedText, 'utf8');
      return {
        ...caption,
        textFilePath: captionPath,
      };
    }),
  );

export const renderVideoWithFfmpeg = async ({
  bucket,
  sourceKey,
  plan,
}: {
  bucket: string;
  sourceKey: string;
  plan: VideoEditPlan;
}) => {
  const reporter = createPipelineReporter('renderVideoWithFfmpeg');
  reporter.emit({
    stage: 'prepare_ffmpeg',
    status: 'started',
    message: 'Checking FFmpeg availability before rendering.',
    details: {
      bucket,
      sourceKey,
      segmentCount: plan.segments.length,
    },
  });
  await ensureFfmpegAvailable();
  reporter.emit({
    stage: 'prepare_ffmpeg',
    status: 'completed',
    message: 'FFmpeg is available.',
  });

  reporter.emit({
    stage: 'download_source',
    status: 'started',
    message: 'Downloading the staged source video from S3 for local rendering.',
  });
  const { directory, filePath: inputPath } = await downloadS3ObjectToTempFile({
    bucket,
    key: sourceKey,
    extension: 'mp4',
  });
  reporter.emit({
    stage: 'download_source',
    status: 'completed',
    message: 'Downloaded the staged source video locally.',
    details: { inputPath },
  });

  try {
    reporter.emit({
      stage: 'probe_source',
      status: 'started',
      message: 'Probing the downloaded source file before FFmpeg execution.',
    });
    const sourceProbe = await probeVideoFile(inputPath);
    reporter.emit({
      stage: 'probe_source',
      status: 'completed',
      message: 'Source file probe completed.',
      details: sourceProbe,
    });

    const safePlan = clampPlanToSourceDuration(plan, sourceProbe.durationSeconds);
    reporter.emit({
      stage: 'sanitize_plan',
      status: 'completed',
      message: 'Validated and clamped the render plan against the source duration.',
      details: {
        sourceDurationSeconds: sourceProbe.durationSeconds,
        segments: safePlan.segments.length,
      },
    });

    const segmentPaths: string[] = [];
    for (const [index, segment] of safePlan.segments.entries()) {
      reporter.emit({
        stage: 'cut_segment',
        status: 'started',
        message: `Rendering segment ${index + 1} of ${safePlan.segments.length}.`,
        details: {
          index,
          start: segment.start,
          end: segment.end,
        },
      });
      const segmentPath = path.join(directory, `segment-${index}.mp4`);
      await runCommand(ffmpegPath, [
        '-y',
        '-ss',
        `${segment.start}`,
        '-to',
        `${segment.end}`,
        '-i',
        inputPath,
        '-c:v',
        'libx264',
        '-c:a',
        'aac',
        segmentPath,
      ]);
      segmentPaths.push(segmentPath);
      reporter.emit({
        stage: 'cut_segment',
        status: 'completed',
        message: `Finished segment ${index + 1} of ${safePlan.segments.length}.`,
        details: {
          index,
          segmentPath,
        },
      });
    }

    const concatFile = path.join(directory, 'segments.txt');
    await writeFile(
      concatFile,
      segmentPaths.map((segmentPath) => `file '${segmentPath.replace(/'/g, "'\\''")}'`).join('\n'),
      'utf8',
    );

    const mergedPath = path.join(directory, 'merged.mp4');
    reporter.emit({
      stage: 'merge_segments',
      status: 'started',
      message: 'Merging rendered segments into a single intermediate file.',
    });
    await runCommand(ffmpegPath, [
      '-y',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      concatFile,
      '-c:v',
      'libx264',
      '-c:a',
      'aac',
      mergedPath,
    ]);
    reporter.emit({
      stage: 'merge_segments',
      status: 'completed',
      message: 'Merged all rendered segments.',
      details: {
        mergedPath,
      },
    });

    const finalPath = path.join(directory, 'final.mp4');
    const captionFiles = await writeCaptionFiles({
      directory,
      captions: safePlan.captions,
    });
    const filter = buildDrawtextFilter(captionFiles, safePlan.output.aspectRatio);

    reporter.emit({
      stage: 'final_render',
      status: 'started',
      message: 'Applying captions, crop, and final output encoding.',
      details: {
        captions: safePlan.captions.length,
        aspectRatio: safePlan.output.aspectRatio,
      },
    });
    await runCommand(ffmpegPath, [
      '-y',
      '-i',
      mergedPath,
      '-vf',
      filter,
      '-c:v',
      safePlan.output.videoCodec,
      '-c:a',
      safePlan.output.audioCodec,
      finalPath,
    ]);
    reporter.emit({
      stage: 'final_render',
      status: 'completed',
      message: 'Final render completed successfully.',
      details: {
        finalPath,
      },
    });

    const outputKey = `${getBucketPrefix()}/renders/${Date.now()}-${randomUUID()}.mp4`;
    reporter.emit({
      stage: 'upload_output',
      status: 'started',
      message: 'Uploading the final rendered video back to S3.',
      details: {
        outputKey,
      },
    });
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucket,
        Key: outputKey,
        Body: createReadStream(finalPath),
        ContentType: 'video/mp4',
      },
    });

    await upload.done();
    const fileStats = await stat(finalPath);
    reporter.emit({
      stage: 'upload_output',
      status: 'completed',
      message: 'Uploaded the final rendered video to S3.',
      details: {
        outputKey,
        sizeBytes: fileStats.size,
      },
    });

    return {
      bucket,
      key: outputKey,
      s3Uri: `s3://${bucket}/${outputKey}`,
      sizeBytes: fileStats.size,
      title: safePlan.title,
      description: safePlan.description,
      summary: safePlan.summary,
      aspectRatio: safePlan.output.aspectRatio,
      segmentsUsed: safePlan.segments.length,
      captionsApplied: safePlan.captions.length,
      progress: reporter.events,
    };
  } catch (error) {
    reporter.emit({
      stage: 'render_failed',
      status: 'failed',
      message: 'The FFmpeg render pipeline failed.',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    throw error;
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};

export const uploadVideoToYouTube = async ({
  accessToken,
  bucket,
  key,
  title,
  description,
  visibility,
}: {
  accessToken: string;
  bucket: string;
  key: string;
  title: string;
  description: string;
  visibility: 'private' | 'unlisted' | 'public';
}) => {
  const reporter = createPipelineReporter('uploadVideoToYouTube');
  const auth = createGoogleAuth(accessToken);
  const youtube = google.youtube('v3');
  reporter.emit({
    stage: 'download_render',
    status: 'started',
    message: 'Downloading the rendered S3 output before YouTube upload.',
    details: {
      bucket,
      key,
      visibility,
    },
  });
  const { directory, filePath } = await downloadS3ObjectToTempFile({
    bucket,
    key,
    extension: 'mp4',
  });
  reporter.emit({
    stage: 'download_render',
    status: 'completed',
    message: 'Downloaded the rendered file for YouTube upload.',
    details: {
      filePath,
    },
  });

  try {
    reporter.emit({
      stage: 'youtube_upload',
      status: 'started',
      message: 'Uploading the rendered video to YouTube.',
      details: {
        title,
        visibility,
      },
    });
    const response = await youtube.videos.insert({
      auth,
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title,
          description,
          categoryId: process.env.SIMIEBOT_YOUTUBE_CATEGORY_ID ?? '22',
        },
        status: {
          privacyStatus: visibility,
        },
      },
      media: {
        body: createReadStream(filePath),
      },
    });

    const videoId = response.data.id;
    if (!videoId) {
      throw new Error('YouTube upload did not return a video ID.');
    }

    reporter.emit({
      stage: 'youtube_upload',
      status: 'completed',
      message: 'YouTube upload completed successfully.',
      details: {
        videoId,
      },
    });

    return {
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      visibility,
      title,
      progress: reporter.events,
    };
  } catch (error) {
    reporter.emit({
      stage: 'youtube_upload',
      status: 'failed',
      message: 'YouTube upload failed.',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    throw error;
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};

export const readPlanJson = (planJson: string) => {
  const parsed = JSON.parse(planJson);
  return normalizeVideoEditPlan(videoEditPlanSchema.parse(parsed), 90);
};
