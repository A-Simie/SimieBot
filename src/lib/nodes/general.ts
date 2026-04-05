import { ToolNode, createReactAgent } from '@langchain/langgraph/prebuilt';
import { Calculator } from '@langchain/community/tools/calculator';
import { SerpAPI } from '@langchain/community/tools/serpapi';
import { GmailCreateDraft, GmailSearch } from '@langchain/community/tools/gmail';

import {
  getAccessToken,
  withCalendar,
  withGmailRead,
  withGmailWrite,
} from '../auth0-ai';
import { createNovaLiteModel } from '../bedrock';
import { getUserInfoTool } from '../tools/user-info';
import { getCalendarEventsTool } from '../tools/google-calendar';

let _agent: any;

const GENERAL_SYSTEM_PROMPT = `You are the SimieBot General Node.
Handle general assistant work plus the hackathon-critical connected-account flows:
- Gmail search and drafting
- Google Calendar lookups
- user identity context
- lightweight web search when SerpAPI is configured

Answer clearly and keep the focus on secure, on-behalf-of-user actions.`;

export async function generalNode(state: any, config?: any) {
  if (!_agent) {
    const llm = createNovaLiteModel({ temperature: 0 });

    const gmailParams = {
      credentials: {
        accessToken: getAccessToken,
      },
    };

    const tools = [
      new Calculator(),
      withGmailRead(new GmailSearch(gmailParams)),
      withGmailWrite(new GmailCreateDraft(gmailParams)),
      withCalendar(getCalendarEventsTool),
      getUserInfoTool,
    ];

    if (process.env.SERPAPI_API_KEY) {
      tools.push(new SerpAPI());
    }

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
