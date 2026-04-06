import { ToolNode, createReactAgent } from '@langchain/langgraph/prebuilt';
import { Calculator } from '@langchain/community/tools/calculator';
import { webSearchTool } from '../tools/web-search';
import { GmailCreateDraft, GmailSearch } from '@langchain/community/tools/gmail';

import { getCalendarEventsTool } from '../tools/google-calendar';
import {
  getAccessToken,
  withAsyncAuthorization,
  withCalendar,
  withDriveWrite,
  withGitHubConnection,
  withGitHubWrite,
  withGmailRead,
  withGmailSend,
  withGmailWrite,
  withSlack,
  withSlackWrite,
} from '../auth0-ai';
import { createNovaLiteModel } from '../bedrock';
import { createDriveFileTool } from '../tools/create-drive-file';
import { listGitHubEventsTool } from '../tools/list-gh-events';
import { listRepositoriesTool } from '../tools/list-gh-repos';
import { listSlackChannelsTool } from '../tools/list-slack-channels';
import { postSlackMessageTool } from '../tools/post-slack-message';
import { sendGmailMessageTool } from '../tools/send-gmail-message';
import { upsertGitHubFileTool } from '../tools/upsert-github-file';
import { getUserInfoTool } from '../tools/user-info';

let _agent: any;

const GENERAL_SYSTEM_PROMPT = `You are SimieBot. 
Your tone is "Neo-Tactile": premium, direct, and zero-filler.

RULES:
1. If no results are found, say "No [emails/events] found." and STOP.
2. Never apologize. Never explain why results might be missing.
3. Never ask for clarification on terms like "last email." Just find the most recent one.
4. No conversational filler (e.g., "I understand," "Let me help").
5. Treat write actions as sensitive. Only report success after the tool confirms completion.

Go straight to the data or the failure.`;

export async function generalNode(state: any, config?: any) {
  if (!_agent) {
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
          if (Array.isArray(result) && result.length === 0) {
            throw new Error('No messages returned from Gmail');
          }
          return result;
        } catch (error: any) {
          const msg = error?.message || String(error);
          if (msg.includes('No messages returned from Gmail')) {
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

    const protectWriteAction = <TArgs extends Record<string, unknown>>(
      tool: any,
      bindingMessage: (args: TArgs) => string,
      scopes: string[],
    ) =>
      withAsyncAuthorization<TArgs>({
        scopes,
        bindingMessage,
      })(tool);

    const tools = [
      new Calculator(),
      wrapTool(withGmailRead(new GmailSearch(gmailParams))),
      withGmailWrite(new GmailCreateDraft(gmailParams)),
      protectWriteAction<{ to: string[]; subject: string }>(
        withGmailSend(sendGmailMessageTool),
        ({ to, subject }) => `Send Gmail message to ${to.join(', ')} with subject "${subject}"`,
        ['simiebot:send_email'],
      ),
      withCalendar(getCalendarEventsTool),
      withGitHubConnection(listRepositoriesTool),
      withGitHubConnection(listGitHubEventsTool),
      withSlack(listSlackChannelsTool),
      protectWriteAction<{ channelId: string; text: string }>(
        withSlackWrite(postSlackMessageTool),
        ({ channelId, text }) =>
          `Post Slack message to ${channelId}: "${text.slice(0, 80)}${text.length > 80 ? '...' : ''}"`,
        ['simiebot:post_slack_message'],
      ),
      protectWriteAction<{ owner: string; repo: string; path: string; branch?: string; commitMessage: string }>(
        withGitHubWrite(upsertGitHubFileTool),
        ({ owner, repo, path, branch, commitMessage }) =>
          `Modify GitHub file ${owner}/${repo}/${path}${branch ? ` on ${branch}` : ''} with commit "${commitMessage}"`,
        ['simiebot:modify_github_file'],
      ),
      protectWriteAction<{ fileId?: string; name?: string }>(
        withDriveWrite(createDriveFileTool),
        ({ fileId, name }) =>
          fileId
            ? `Update Google Drive file ${fileId}${name ? ` and rename to ${name}` : ''}`
            : `Create Google Drive file ${name ?? 'untitled file'}`,
        ['simiebot:write_drive_file'],
      ),
      getUserInfoTool,
      webSearchTool,
    ];

    _agent = createReactAgent({
      llm,
      tools: new ToolNode(tools, {
        handleToolErrors: false,
      }),
      prompt: GENERAL_SYSTEM_PROMPT,
    });
  }

  return _agent.invoke(state, config);
}
