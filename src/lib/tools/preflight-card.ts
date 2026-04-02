import { tool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * Preflight Card Tool (SimieBot Web Automation Node)
 */
export const preflightCardTool = tool(
  async ({ action, metadata }) => {
    // Generate data for HITL approval UI
    return `SimieBot preflight check for "${action}" with metadata: ${JSON.stringify(metadata)}...
[STUB] Preflight card initialized. Required for high-stakes actions.`;
  },
  {
    name: 'preflight_card',
    description: 'Generate high-fidelity approval data for form submissions or high-stakes web automation.',
    schema: z.object({
      action: z.string().describe('The web action or form name to approve.'),
      metadata: z.record(z.any()).describe('Key-value pairs to show in the approval card.'),
    }),
  }
);
