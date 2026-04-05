import { randomUUID } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { access, mkdtemp, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { spawn } from 'node:child_process';

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { google } from 'googleapis';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { createNovaLiteModel, getTextContent } from './bedrock';

const region = process.env.BEDROCK_AWS_REGION ?? process.env.AWS_REGION ?? 'us-east-1';
const accessKeyId = process.env.BEDROCK_AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.BEDROCK_AWS_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY;
const sessionToken = process.env.BEDROCK_AWS_SESSION_TOKEN ?? process.env.AWS_SESSION_TOKEN;

const ffmpegPath = process.env.FFMPEG_PATH ?? 'ffmpeg';
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

const createGoogleAuth = (accessToken: string) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return auth;
};

const escapeDriveQuery = (value: string) => value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const sanitizeFileName = (value: string) => value.replace(/[^a-zA-Z0-9._-]/g, '-');

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
) => {
  let remaining = maxClipDurationSeconds;

  const normalizedSegments = plan.segments
    .map((segment) => {
      const start = Math.max(0, segment.start);
      const requestedEnd = Math.max(start + 0.25, segment.end);
      const available = Math.max(0, remaining);
      const length = Math.min(requestedEnd - start, available || requestedEnd - start);
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

const runCommand = (command: string, args: string[], cwd?: string) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderr = '';

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
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

const escapeDrawtext = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
    .replace(/,/g, '\\,')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');

const buildDrawtextFilter = (
  captions: VideoEditPlan['captions'],
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

    return `drawtext=text='${escapeDrawtext(caption.text)}':fontcolor=white:fontsize=48:box=1:boxcolor=black@0.45:boxborderw=18:x=(w-text_w)/2:y=${yExpression}:enable='between(t,${caption.start.toFixed(2)},${caption.end.toFixed(2)})'`;
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
    'id' | 'name' | 'mimeType' | 'sizeBytes' | 'durationSeconds' | 'width' | 'height' | 's3Uri'
  >;
  creativeGoal: string;
  outputAspectRatio: z.infer<typeof aspectRatioSchema>;
  maxClipDurationSeconds: number;
  additionalContext?: string;
}) => {
  const llm = createNovaLiteModel({
    temperature: 0,
    maxTokens: 1400,
  });

  const target = getVideoDimensions(outputAspectRatio);
  const schemaJson = JSON.stringify(zodToJsonSchema(videoEditPlanSchema), null, 2);

  const response = await llm.invoke([
    {
      role: 'system',
      content: `You are an AI video editor planner. Generate ONLY JSON matching the schema.
Use the video metadata and creative goal to produce a concise edit plan.
Keep the plan practical for FFmpeg execution.
Use no more than 4 segments.
Keep the total final clip length under ${maxClipDurationSeconds} seconds.
Caption timing should be relative to the final edited clip timeline, not the source timeline.
Set output to ${target.width}x${target.height} ${outputAspectRatio}, mp4, libx264, aac.

JSON schema:
${schemaJson}`,
    },
    {
      role: 'user',
      content: `Creative goal: ${creativeGoal}
Additional context: ${additionalContext ?? 'None provided'}

Source asset:
- id: ${stagedAsset.id}
- name: ${stagedAsset.name}
- mime type: ${stagedAsset.mimeType}
- size bytes: ${stagedAsset.sizeBytes ?? 'unknown'}
- duration seconds: ${stagedAsset.durationSeconds ?? 'unknown'}
- width: ${stagedAsset.width ?? 'unknown'}
- height: ${stagedAsset.height ?? 'unknown'}
- storage uri: ${stagedAsset.s3Uri}`,
    },
  ]);

  const parsed = parseJsonFromText(getTextContent(response.content));
  const plan = videoEditPlanSchema.parse(parsed);

  return normalizeVideoEditPlan(plan, maxClipDurationSeconds);
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

export const renderVideoWithFfmpeg = async ({
  bucket,
  sourceKey,
  plan,
}: {
  bucket: string;
  sourceKey: string;
  plan: VideoEditPlan;
}) => {
  await ensureFfmpegAvailable();

  const { directory, filePath: inputPath } = await downloadS3ObjectToTempFile({
    bucket,
    key: sourceKey,
    extension: 'mp4',
  });

  try {
    const segmentPaths: string[] = [];
    for (const [index, segment] of plan.segments.entries()) {
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
    }

    const concatFile = path.join(directory, 'segments.txt');
    await writeFile(
      concatFile,
      segmentPaths.map((segmentPath) => `file '${segmentPath.replace(/'/g, "'\\''")}'`).join('\n'),
      'utf8',
    );

    const mergedPath = path.join(directory, 'merged.mp4');
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

    const finalPath = path.join(directory, 'final.mp4');
    const filter = buildDrawtextFilter(plan.captions, plan.output.aspectRatio);

    await runCommand(ffmpegPath, [
      '-y',
      '-i',
      mergedPath,
      '-vf',
      filter,
      '-c:v',
      plan.output.videoCodec,
      '-c:a',
      plan.output.audioCodec,
      finalPath,
    ]);

    const outputKey = `${getBucketPrefix()}/renders/${Date.now()}-${randomUUID()}.mp4`;
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucket,
        Key: outputKey,
        Body: createReadStream(finalPath),
      },
    });

    await upload.done();
    const fileStats = await stat(finalPath);

    return {
      bucket,
      key: outputKey,
      s3Uri: `s3://${bucket}/${outputKey}`,
      sizeBytes: fileStats.size,
      title: plan.title,
      description: plan.description,
      summary: plan.summary,
      aspectRatio: plan.output.aspectRatio,
      segmentsUsed: plan.segments.length,
      captionsApplied: plan.captions.length,
    };
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
  const auth = createGoogleAuth(accessToken);
  const youtube = google.youtube('v3');
  const { directory, filePath } = await downloadS3ObjectToTempFile({
    bucket,
    key,
    extension: 'mp4',
  });

  try {
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

    return {
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      visibility,
      title,
    };
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};

export const readPlanJson = (planJson: string) => {
  const parsed = JSON.parse(planJson);
  return normalizeVideoEditPlan(videoEditPlanSchema.parse(parsed), 90);
};
