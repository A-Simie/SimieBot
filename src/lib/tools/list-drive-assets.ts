import { tool } from '@langchain/core/tools';
import { TokenVaultError } from '@auth0/ai/interrupts';
import { GaxiosError } from 'gaxios';
import { z } from 'zod';

import { getAccessToken } from '../auth0-ai';
import { listDriveVideoAssets } from '../creator-pipeline';
import { toTypedToolError } from './tool-errors';

export const listDriveAssetsTool = tool(
  async ({ query, mimeType, maxResults }) => {
    try {
      const accessToken = await getAccessToken();
      const assets = await listDriveVideoAssets({
        accessToken,
        query,
        mimeType,
        maxResults,
      });

      return {
        provider: 'Google Drive via Auth0 Token Vault',
        query,
        mimeType,
        count: assets.length,
        assets,
      };
    } catch (error) {
      if (error instanceof GaxiosError && (error.status === 401 || error.status === 403)) {
        throw new TokenVaultError('Authorization required to access the Google Drive connection.');
      }

      return toTypedToolError('list_drive_assets', error);
    }
  },
  {
    name: 'list_drive_assets',
    description: 'List recent Google Drive video assets that can be used in the creator workflow.',
    schema: z.object({
      query: z.string().optional().default('recent video files'),
      mimeType: z.string().optional().default('video/*'),
      maxResults: z.number().int().min(1).max(20).optional().default(8),
    }),
  },
);
