import { ToolNode, createReactAgent } from '@langchain/langgraph/prebuilt';

import {
  withAsyncAuthorization,
  withDriveRead,
  withYouTubeUpload,
} from '../auth0-ai';
import { createNovaLiteModel } from '../bedrock';
import { analyzeVideoWithNovaTool } from '../tools/analyze-video-with-nova';
import { downloadDriveAssetTool } from '../tools/download-drive-asset';
import { listDriveAssetsTool } from '../tools/list-drive-assets';
import { publishYouTubeVideoTool } from '../tools/publish-youtube-video';
import { renderVideoWithFfmpegTool } from '../tools/render-video-ffmpeg';

const creatorAgentCache = new Map<string, any>();

const CREATOR_SYSTEM_PROMPT = `You are the SimieBot Creator Node.
Your job is to orchestrate creator workflows that matter for the Auth0 hackathon:
- discover source media from the user's Google Drive
- stage source media into S3
- use Amazon Nova to create a structured edit plan
- execute the plan with FFmpeg
- publish to the user's YouTube account on their behalf

When you have the data you need, use the tools in this order:
1. list_drive_assets
2. download_drive_asset
3. analyze_video_with_nova
4. render_video_ffmpeg
5. publish_youtube_video only when the user explicitly asks to publish or clearly approves it

Be explicit about what is implemented versus what is still planned.
Never claim that a render or upload completed unless a tool explicitly reports completion.`;

export async function creatorNode(state: any, config?: any) {
  const llm = createNovaLiteModel({ temperature: 0 });
  const toolCatalog = {
    listDrive: withDriveRead(listDriveAssetsTool),
    downloadDrive: withDriveRead(downloadDriveAssetTool),
    analyzeVideo: analyzeVideoWithNovaTool,
    renderVideo: renderVideoWithFfmpegTool,
    publishYouTube: withAsyncAuthorization<{
      title: string;
      visibility?: 'private' | 'unlisted' | 'public';
    }>({
      scopes: ['simiebot:publish_youtube_video'],
      bindingMessage: ({ title, visibility }) =>
        `Publish YouTube video "${title}" with visibility ${visibility ?? 'private'}`,
    })(withYouTubeUpload(publishYouTubeVideoTool)),
  };

  const toolHint = typeof state.toolHint === 'string' ? state.toolHint : null;
  const toolSetByHint: Record<string, any[]> = {
    drive: [toolCatalog.listDrive, toolCatalog.downloadDrive, toolCatalog.analyzeVideo, toolCatalog.renderVideo],
    youtube: [
      toolCatalog.listDrive,
      toolCatalog.downloadDrive,
      toolCatalog.analyzeVideo,
      toolCatalog.renderVideo,
      toolCatalog.publishYouTube,
    ],
    creator: [
      toolCatalog.listDrive,
      toolCatalog.downloadDrive,
      toolCatalog.analyzeVideo,
      toolCatalog.renderVideo,
      toolCatalog.publishYouTube,
    ],
  };

  const tools =
    (toolHint && toolSetByHint[toolHint]) ||
    [
      toolCatalog.listDrive,
      toolCatalog.downloadDrive,
      toolCatalog.analyzeVideo,
      toolCatalog.renderVideo,
      toolCatalog.publishYouTube,
    ];

  const cacheKey = toolHint ?? 'all';
  let agent = creatorAgentCache.get(cacheKey);

  if (!agent) {
    const toolGuidance = toolHint
      ? `The user explicitly selected @${toolHint}. Treat that as a strict backend tool preference for this turn. Only use the tools relevant to @${toolHint}.`
      : '';

    agent = createReactAgent({
      llm,
      tools: new ToolNode(tools, {
        handleToolErrors: false,
      }),
      prompt: [CREATOR_SYSTEM_PROMPT, toolGuidance].filter(Boolean).join('\n\n'),
    });
    creatorAgentCache.set(cacheKey, agent);
  }

  return agent.invoke(state, config);
}
