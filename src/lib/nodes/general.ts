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
import { prepareGmailMessageTool } from '../tools/prepare-gmail-message';
import { sendGmailMessageTool } from '../tools/send-gmail-message';
import { upsertGitHubFileTool } from '../tools/upsert-github-file';
import { getUserInfoTool } from '../tools/user-info';

const generalAgentCache = new Map<string, any>();

const GENERAL_SYSTEM_PROMPT = `You are SimieBot, a secure connected-account assistant.
Your tone is calm, clear, and capable. Sound natural, helpful, and concise.

RULES:
1. If no results are found, say "No [emails/events] found." and STOP.
2. Be warm on simple greetings. If the user says "hi" or similar, respond like a normal assistant instead of barking for requirements.
3. Never explain missing results at length. Just state the result cleanly.
4. Treat write actions as sensitive. Only report success after the tool confirms completion.
5. For send_gmail_message, do not jump straight to delivery from messy natural language. If the user is asking to send an email in plain English, first call prepare_gmail_message to turn the request into a real subject and body.
6. Never call send_gmail_message with a blank, placeholder, or summary-only bodyText.
7. If the user has not actually given enough information to send, ask a short follow-up question instead of guessing.

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

  const toolCatalog = {
    calculator: new Calculator(),
    gmailSearch: wrapTool(withGmailRead(new GmailSearch(gmailParams))),
    gmailDraft: withGmailWrite(new GmailCreateDraft(gmailParams)),
    gmailPrepare: prepareGmailMessageTool,
    gmailSend: protectWriteAction<{ to: string[]; subject: string }>(
      withGmailSend(sendGmailMessageTool),
      ({ to, subject }) => `Send Gmail message to ${to.join(', ')} with subject "${subject}"`,
      ['simiebot:send_email'],
    ),
    calendar: withCalendar(getCalendarEventsTool),
    githubRepos: withGitHubConnection(listRepositoriesTool),
    githubEvents: withGitHubConnection(listGitHubEventsTool),
    githubWrite: protectWriteAction<{ owner: string; repo: string; path: string; branch?: string; commitMessage: string }>(
      withGitHubWrite(upsertGitHubFileTool),
      ({ owner, repo, path, branch, commitMessage }) =>
        `Modify GitHub file ${owner}/${repo}/${path}${branch ? ` on ${branch}` : ''} with commit "${commitMessage}"`,
      ['simiebot:modify_github_file'],
    ),
    slackRead: withSlack(listSlackChannelsTool),
    slackWrite: protectWriteAction<{ channelId: string; text: string }>(
      withSlackWrite(postSlackMessageTool),
      ({ channelId, text }) =>
        `Post Slack message to ${channelId}: "${text.slice(0, 80)}${text.length > 80 ? '...' : ''}"`,
      ['simiebot:post_slack_message'],
    ),
    driveWrite: protectWriteAction<{ fileId?: string; name?: string }>(
      withDriveWrite(createDriveFileTool),
      ({ fileId, name }) =>
        fileId
          ? `Update Google Drive file ${fileId}${name ? ` and rename to ${name}` : ''}`
          : `Create Google Drive file ${name ?? 'untitled file'}`,
      ['simiebot:write_drive_file'],
    ),
    userInfo: getUserInfoTool,
    webSearch: webSearchTool,
  };

  const toolHint = typeof state.toolHint === 'string' ? state.toolHint : null;
  const toolSetByHint: Record<string, any[]> = {
    gmail: [toolCatalog.gmailSearch, toolCatalog.gmailDraft, toolCatalog.gmailPrepare, toolCatalog.gmailSend],
    calendar: [toolCatalog.calendar],
    github: [toolCatalog.githubRepos, toolCatalog.githubEvents, toolCatalog.githubWrite],
    slack: [toolCatalog.slackRead, toolCatalog.slackWrite],
    drive: [toolCatalog.driveWrite],
    search: [toolCatalog.webSearch],
    calculator: [toolCatalog.calculator],
    profile: [toolCatalog.userInfo],
  };

  const tools =
    (toolHint && toolSetByHint[toolHint]) ||
    [
      toolCatalog.calculator,
      toolCatalog.gmailSearch,
      toolCatalog.gmailDraft,
      toolCatalog.gmailPrepare,
      toolCatalog.gmailSend,
      toolCatalog.calendar,
      toolCatalog.githubRepos,
      toolCatalog.githubEvents,
      toolCatalog.slackRead,
      toolCatalog.slackWrite,
      toolCatalog.githubWrite,
      toolCatalog.driveWrite,
      toolCatalog.userInfo,
      toolCatalog.webSearch,
    ];

  const cacheKey = toolHint ?? 'all';
  let agent = generalAgentCache.get(cacheKey);

  if (!agent) {
    const toolGuidance = toolHint
      ? `The user explicitly selected @${toolHint}. Treat that as a strict backend tool preference for this turn. Only use the tools relevant to @${toolHint}.`
      : '';

    agent = createReactAgent({
      llm,
      tools: new ToolNode(tools, {
        handleToolErrors: false,
      }),
      prompt: [GENERAL_SYSTEM_PROMPT, toolGuidance].filter(Boolean).join('\n\n'),
    });
    generalAgentCache.set(cacheKey, agent);
  }

  return agent.invoke(state, config);
}
