import { ToolNode, createReactAgent } from '@langchain/langgraph/prebuilt';

import { createNovaLiteModel } from '../bedrock';
import { getCoinbaseAccountSummaryTool } from '../tools/coinbase-account';

let _agent: any;

const FINANCE_SYSTEM_PROMPT = `You are the SimieBot Finance Node.
Focus on secure, on-behalf-of-user finance workflows that fit the Auth0 hackathon scope.
Today this node is limited to planning and explaining the future Coinbase connected-account workflow.
Never pretend a Coinbase action actually happened unless a tool explicitly returns a completed status.`;

export async function financeNode(state: any, config?: any) {
  if (!_agent) {
    const llm = createNovaLiteModel({ temperature: 0 });
    const tools = [getCoinbaseAccountSummaryTool];

    _agent = createReactAgent({
      llm,
      tools: new ToolNode(tools, {
        handleToolErrors: false,
      }),
      prompt: FINANCE_SYSTEM_PROMPT,
    });
  }

  return _agent.invoke(state, config);
}
