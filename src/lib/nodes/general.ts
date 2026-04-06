import { ToolNode, createReactAgent } from '@langchain/langgraph/prebuilt';
import { Calculator } from '@langchain/community/tools/calculator';
import { webSearchTool } from '../tools/web-search';
import { GmailCreateDraft, GmailSearch } from '@langchain/community/tools/gmail';

import { getCalendarEventsTool } from '../tools/google-calendar';
import { createDriveFileTool } from '../tools/create-drive-file';
import {
  getAccessToken,
  withCalendar,
  withDriveWrite,
  withGithubRead,
  withGithubWrite,
  withGmailRead,
  withGmailWrite,
  withSlackMediaRead,
} from '../auth0-ai';
import { createNovaLiteModel } from '../bedrock';
import { getUserInfoTool } from '../tools/user-info';
import { listGithubReposTool } from '../tools/list-github-repos';
import { listSlackAssetsTool } from '../tools/list-slack-assets';
import { deleteGithubRepoTool, renameGithubRepoTool } from '../tools/manage-github-repo';

const GENERAL_SYSTEM_PROMPT = `You are SimieBot. 
Your tone is "Neo-Tactile": premium, direct, and zero-filler.

RULES:
1. If no results are found, say "No [emails/events] found." and STOP.
2. Never apologize. Never explain why results might be missing.
3. Never ask for clarification on terms like "last email." Just find the most recent one.
4. No conversational filler (e.g., "I understand," "Let me help").

Go straight to the data or the failure.`;

export async function generalNode(state: any, config?: any) {
  const llm = createNovaLiteModel({ temperature: 0 });

  const gmailParams = {
    credentials: {
      accessToken: getAccessToken,
    },
  };

  const wrapTool = (t: any) => {
    const originalCall = t._call.bind(t);
    t._call = async (args: any) => {
      try {
        const result = await originalCall(args);
        // GmailSearch often returns an empty array even on success if no matches, 
        // but can throw in some versions. We normalize it.
        if (Array.isArray(result) && result.length === 0) {
          throw new Error('No messages returned from Gmail');
        }
        return result;
      } catch (error: any) {
        const msg = error?.message || String(error);
        if (msg.includes('No messages returned from Gmail')) {
          // If a filtered search fails, try a global search for the absolute last email
          if (args.query && args.query !== '') {
            try {
              return await originalCall({ ...args, query: '' });
            } catch {
              return 'No emails found.';
            }
          }
          return 'No emails found.';
        }
        throw error;
      }
    };
    return t;
  };

  const tools = [
    new Calculator(),
    wrapTool(withGmailRead(new GmailSearch(gmailParams))),
    withGmailWrite(new GmailCreateDraft(gmailParams)),
    withCalendar(getCalendarEventsTool),
    withDriveWrite(createDriveFileTool),
    withGithubRead(listGithubReposTool),
    withGithubWrite(renameGithubRepoTool),
    withGithubWrite(deleteGithubRepoTool),
    withSlackMediaRead(listSlackAssetsTool),
    getUserInfoTool,
    webSearchTool,
  ];

  const agent = createReactAgent({
    llm,
    tools: new ToolNode(tools, {
      handleToolErrors: true,
    }),
    prompt: GENERAL_SYSTEM_PROMPT,
  });

  return agent.invoke(state, config);
}
