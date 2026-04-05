import { ToolNode, createReactAgent } from '@langchain/langgraph/prebuilt';

import {
  withDriveRead,
  withSlackMediaRead,
  withYouTubeUpload,
} from '../auth0-ai';
import { createNovaLiteModel } from '../bedrock';
import { createShotstackRenderTool } from '../tools/create-shotstack-render';
import { listDriveAssetsTool } from '../tools/list-drive-assets';
import { listSlackAssetsTool } from '../tools/list-slack-assets';
import { publishYouTubeVideoTool } from '../tools/publish-youtube-video';

let _agent: any;

const CREATOR_SYSTEM_PROMPT = `You are the SimieBot Creator Node.
Your job is to orchestrate creator workflows that matter for the Auth0 hackathon:
- discover source media from user-owned accounts like Google Drive or Slack
- prepare a Shotstack render plan
- publish to the user's YouTube account on their behalf

Be explicit about what is implemented versus what is still planned.
Never claim that a render or upload completed unless a tool explicitly reports completion.`;

export async function creatorNode(state: any, config?: any) {
  if (!_agent) {
    const llm = createNovaLiteModel({ temperature: 0 });
    const tools = [
      withDriveRead(listDriveAssetsTool),
      withSlackMediaRead(listSlackAssetsTool),
      createShotstackRenderTool,
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
