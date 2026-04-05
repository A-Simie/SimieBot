import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const getCoinbaseAccountSummaryTool = tool(
  async ({ goal }) => {
    return {
      status: 'planned',
      provider: 'Coinbase via Auth0 Connected Accounts',
      goal,
      current_scope: 'Architecture refactor only. Real Coinbase API calls are not implemented yet.',
      future_capabilities: [
        'Fetch balances and portfolio snapshots on behalf of the user',
        'Summarize recent account activity',
        'Support approval-aware actions once the Coinbase integration is wired',
      ],
    };
  },
  {
    name: 'get_coinbase_account_summary',
    description: 'Planned Coinbase account summary workflow for a user-connected Coinbase account.',
    schema: z.object({
      goal: z
        .string()
        .optional()
        .default('Summarize the connected Coinbase account at a high level.'),
    }),
  },
);
