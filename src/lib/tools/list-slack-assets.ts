import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getAccessToken } from '../auth0-ai';

export const listSlackAssetsTool = tool(
  async ({ limit = 5 }) => {
    try {
      const accessToken = await getAccessToken();
      const response = await fetch(`https://slack.com/api/conversations.list?types=public_channel,private_channel&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (!data.ok) {
        return {
          success: false,
          error: data.error || 'Failed to list Slack channels',
        };
      }

      return {
        success: true,
        channels: data.channels.map((c: any) => ({
          id: c.id,
          name: c.name,
          is_channel: c.is_channel,
          is_private: c.is_private,
        })),
        provider: 'Slack via Auth0 Connected Accounts',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to connect to Slack',
      };
    }
  },
  {
    name: 'list_slack_assets',
    description: 'List your Slack channels to discover content for your assistant.',
    schema: z.object({
      limit: z.number().optional().describe('Number of channels to return (default 5)'),
    }),
  },
);
