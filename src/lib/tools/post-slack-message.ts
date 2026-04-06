import { ErrorCode, WebClient } from '@slack/web-api';
import { TokenVaultError } from '@auth0/ai/interrupts';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

import { getAccessToken } from '../auth0-ai';
import { toTypedToolError } from './tool-errors';

export const postSlackMessageTool = tool(
  async ({ channelId, text, threadTs }) => {
    try {
      const accessToken = await getAccessToken();
      const web = new WebClient(accessToken);

      const response = await web.chat.postMessage({
        channel: channelId,
        text,
        ...(threadTs ? { thread_ts: threadTs } : {}),
      });

      return {
        status: 'posted',
        channelId,
        ts: response.ts ?? null,
        threadTs: response.message?.thread_ts ?? threadTs ?? null,
        text,
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === ErrorCode.HTTPError) {
        throw new TokenVaultError('Authorization required to post a Slack message.');
      }

      return toTypedToolError('post_slack_message', error);
    }
  },
  {
    name: 'post_slack_message',
    description: 'Post a real message to a Slack channel or thread.',
    schema: z.object({
      channelId: z.string().min(1).describe('Slack channel ID to post into.'),
      text: z.string().min(1).describe('Message text to post.'),
      threadTs: z.string().optional().describe('Optional Slack thread timestamp to reply inside a thread.'),
    }),
  },
);
