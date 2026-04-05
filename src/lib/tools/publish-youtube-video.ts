import { tool } from '@langchain/core/tools';
import { TokenVaultError } from '@auth0/ai/interrupts';
import { GaxiosError } from 'gaxios';
import { z } from 'zod';

import { getAccessToken } from '../auth0-ai';
import { uploadVideoToYouTube } from '../creator-pipeline';

export const publishYouTubeVideoTool = tool(
  async ({ bucket, key, title, description, visibility }) => {
    try {
      const accessToken = await getAccessToken();
      const result = await uploadVideoToYouTube({
        accessToken,
        bucket,
        key,
        title,
        description,
        visibility,
      });

      return {
        status: 'published',
        provider: 'YouTube via Google Connected Account',
        result,
      };
    } catch (error) {
      if (error instanceof GaxiosError && (error.status === 401 || error.status === 403)) {
        throw new TokenVaultError('Authorization required to publish to YouTube.');
      }

      throw error;
    }
  },
  {
    name: 'publish_youtube_video',
    description: 'Upload a rendered video from S3 to the user’s YouTube account.',
    schema: z.object({
      bucket: z.string().describe('The S3 bucket containing the rendered video.'),
      key: z.string().describe('The S3 key of the rendered video ready for upload.'),
      title: z.string().describe('The YouTube title to use.'),
      description: z.string().describe('The YouTube description to use.'),
      visibility: z.enum(['private', 'unlisted', 'public']).optional().default('private'),
    }),
  },
);
