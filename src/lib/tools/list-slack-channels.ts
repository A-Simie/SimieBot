import { ErrorCode, WebClient } from '@slack/web-api';
import { TokenVaultError } from '@auth0/ai/interrupts';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

import { getAccessToken } from '../auth0-ai';
import { toTypedToolError } from './tool-errors';

export const listSlackChannelsTool = tool(
  async () => {
    try {
      const accessToken = await getAccessToken();
      const web = new WebClient(accessToken);

      const result = await web.conversations.list({
        exclude_archived: true,
        types: 'public_channel,private_channel',
        limit: 25,
      });

      const channels =
        result.channels?.map((channel) => ({
          id: channel.id,
          name: channel.name,
          is_private: channel.is_private ?? false,
          is_member: channel.is_member ?? false,
          num_members: channel.num_members ?? null,
        })) ?? [];

      return {
        status: 'ok',
        total_channels: channels.length,
        channels,
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === ErrorCode.HTTPError) {
        throw new TokenVaultError('Authorization required to access Slack channels.');
      }

      return toTypedToolError('list_slack_channels', error);
    }
  },
  {
    name: 'list_slack_channels',
    description: 'List the Slack channels available to the connected user.',
    schema: z.object({}),
  },
);
