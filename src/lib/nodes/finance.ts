import { ToolNode, createReactAgent } from '@langchain/langgraph/prebuilt';

import { createNovaLiteModel } from '../bedrock';

let _agent: any;

const FINANCE_SYSTEM_PROMPT = `You are the SimieBot Finance Node.
Focus on secure, on-behalf-of-user finance workflows that fit the Auth0 hackathon scope.
Currently, this node is in the planning phase for secure financial integrations.`;

export async function financeNode(state: any, config?: any) {
  if (!_agent) {
    const llm = createNovaLiteModel({ temperature: 0 });
    const tools: any[] = [];

    _agent = createReactAgent({
      llm,
      tools: new ToolNode(tools, {
        handleToolErrors: true,
      }),
      prompt: FINANCE_SYSTEM_PROMPT,
    });
  }

  return _agent.invoke(state, config);
}
