import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const listSlackAssetsTool = tool(
  async ({ channelHint }) => {
    return {
      status: 'planned',
      provider: 'Slack via Auth0 Connected Accounts',
      channelHint,
      current_scope: 'Slack media discovery is planned but not implemented yet.',
      future_capabilities: [
        'Find recently shared videos in selected channels',
        'Capture source file URLs and metadata',
        'Hand off selected assets to the creator pipeline',
      ],
    };
  },
  {
    name: 'list_slack_assets',
    description: 'Planned Slack media discovery for creator workflows.',
    schema: z.object({
      channelHint: z.string().optional().default('recent creator uploads'),
    }),
  },
);
