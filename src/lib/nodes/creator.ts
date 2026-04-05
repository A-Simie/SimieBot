import { ToolNode, createReactAgent } from '@langchain/langgraph/prebuilt';

import {
  withDriveRead,
  withSlackMediaRead,
  withYouTubeUpload,
} from '../auth0-ai';
import { createNovaLiteModel } from '../bedrock';
import { analyzeVideoWithNovaTool } from '../tools/analyze-video-with-nova';
import { downloadDriveAssetTool } from '../tools/download-drive-asset';
import { listDriveAssetsTool } from '../tools/list-drive-assets';
import { listSlackAssetsTool } from '../tools/list-slack-assets';
import { publishYouTubeVideoTool } from '../tools/publish-youtube-video';
import { renderVideoWithFfmpegTool } from '../tools/render-video-ffmpeg';

let _agent: any;

const CREATOR_SYSTEM_PROMPT = `You are the SimieBot Creator Node.
Your job is to orchestrate creator workflows that matter for the Auth0 hackathon:
- discover source media from user-owned accounts like Google Drive or Slack
- stage source media into S3
- use Amazon Nova to create a structured edit plan
- execute the plan with FFmpeg
- publish to the user's YouTube account on their behalf

For the current implementation, prefer Google Drive as the source system when possible.
Slack discovery can still be acknowledged as not-yet-implemented if the user asks for it.
When you have the data you need, use the tools in this order:
1. list_drive_assets
2. download_drive_asset
3. analyze_video_with_nova
4. render_video_ffmpeg
5. publish_youtube_video only when the user explicitly asks to publish or clearly approves it

Be explicit about what is implemented versus what is still planned.
Never claim that a render or upload completed unless a tool explicitly reports completion.`;

export async function creatorNode(state: any, config?: any) {
  if (!_agent) {
    const llm = createNovaLiteModel({ temperature: 0 });
    const tools = [
      withDriveRead(listDriveAssetsTool),
      withDriveRead(downloadDriveAssetTool),
      withSlackMediaRead(listSlackAssetsTool),
      analyzeVideoWithNovaTool,
      renderVideoWithFfmpegTool,
      withYouTubeUpload(publishYouTubeVideoTool),
    ];

    _agent = createReactAgent({
      llm,
      tools: new ToolNode(tools, {
        handleToolErrors: false,
      }),
      prompt: CREATOR_SYSTEM_PROMPT,
    });
  }

  return _agent.invoke(state, config);
}
