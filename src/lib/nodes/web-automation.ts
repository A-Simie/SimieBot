import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';

import { formFillerTool } from '../tools/form-filler';
import { preflightCardTool } from '../tools/preflight-card';

// Specialized web automation tools
const tools = [formFillerTool, preflightCardTool];

const WEB_AUTO_SYSTEM_PROMPT = `You are the SimieBot Web Automation sub-agent specialized in form filling and preflight card generation.
Always emphasize HITL before any form submission or high-stakes web action.
Use the available tools for web navigation and data capture.`;

let _agent: any;

/**
 * Lazy-initialized web automation agent node.
 * Prevents top-level blocking during LangGraph schema extraction.
 */
export async function webAutoNode(state: any, config?: any) {
  if (!_agent) {
    const llm = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0,
    });

    _agent = createReactAgent({
      llm,
      tools,
      prompt: WEB_AUTO_SYSTEM_PROMPT,
    });
  }
  return _agent.invoke(state, config);
}
