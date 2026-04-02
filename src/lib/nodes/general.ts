import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { Calculator } from '@langchain/community/tools/calculator';
import { SerpAPI } from '@langchain/community/tools/serpapi';
import { GmailCreateDraft, GmailSearch } from '@langchain/community/tools/gmail';
import {
  getAccessToken,
  withCalendar,
  withGmailRead,
  withGmailWrite,
} from '../auth0-ai';
import { getUserInfoTool } from '../tools/user-info';
import { getCalendarEventsTool } from '../tools/google-calendar';

let _agent: any;

/**
 * Lazy-initialized general agent node.
 * Prevents top-level blocking during LangGraph schema extraction.
 */
export async function generalNode(state: any, config?: any) {
  if (!_agent) {
    const llm = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0,
    });

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
      tools,
    });
  }
  return _agent.invoke(state, config);
}
