import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';

import { walletScannerTool } from '../tools/wallet-scanner';
import { deadManSwitchTool } from '../tools/dead-man-switch';

// Specialized crypto security tools
const tools = [walletScannerTool, deadManSwitchTool];

const CRYPTO_SYSTEM_PROMPT = `You are the SimieBot Crypto Node specialized in wallet scanning, contract security, and transaction monitoring.
Always emphasize security, caution, and human-in-the-loop (HITL) for high-stakes actions.
Identify malicious contracts or infinite approvals before they become a threat.`;

let _agent: any;

/**
 * Lazy-initialized crypto agent node.
 * Prevents top-level blocking during LangGraph schema extraction.
 */
export async function cryptoNode(state: any, config?: any) {
  if (!_agent) {
    const llm = new ChatOpenAI({
      model: 'gpt-4o', // stronger reasoning for crypto
      temperature: 0,
    });

    _agent = createReactAgent({
      llm,
      tools,
      prompt: CRYPTO_SYSTEM_PROMPT,
    });
  }
  return _agent.invoke(state, config);
}
