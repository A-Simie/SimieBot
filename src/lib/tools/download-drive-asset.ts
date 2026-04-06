import { tool } from '@langchain/core/tools';
import { TokenVaultError } from '@auth0/ai/interrupts';
import { GaxiosError } from 'gaxios';
import { z } from 'zod';

import { getAccessToken } from '../auth0-ai';
import { stageDriveAssetToS3 } from '../creator-pipeline';
import { toTypedToolError } from './tool-errors';

export const downloadDriveAssetTool = tool(
  async ({ fileId }) => {
    try {
      const accessToken = await getAccessToken();
      const stagedAsset = await stageDriveAssetToS3({
        accessToken,
        fileId,
      });

      return {
        status: 'staged',
        stagedAsset,
      };
    } catch (error) {
      if (error instanceof GaxiosError && (error.status === 401 || error.status === 403)) {
        throw new TokenVaultError('Authorization required to download the Google Drive asset.');
      }

      return toTypedToolError('download_drive_asset', error);
    }
  },
  {
    name: 'download_drive_asset',
    description:
      'Download a selected Google Drive video and stage it into S3 for the creator pipeline.',
    schema: z.object({
      fileId: z.string().describe('The Google Drive file ID to stage for video processing.'),
    }),
  },
);
