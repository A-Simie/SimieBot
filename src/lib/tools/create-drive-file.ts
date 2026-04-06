import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { GaxiosError } from 'gaxios';
import { google } from 'googleapis';
import { TokenVaultError } from '@auth0/ai/interrupts';

import { getAccessToken } from '../auth0-ai';
import { toTypedToolError } from './tool-errors';

export const createDriveFileTool = tool(
  async ({ fileId, name, content, folderId, mimeType }) => {
    try {
      const accessToken = await getAccessToken();
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });
      const drive = google.drive({ version: 'v3', auth });
      const resolvedMimeType = mimeType || 'text/plain';

      const response = fileId
        ? await drive.files.update({
            fileId,
            requestBody: {
              ...(name ? { name } : {}),
            },
            media: {
              mimeType: resolvedMimeType,
              body: content,
            },
          })
        : await drive.files.create({
            requestBody: {
              name,
              mimeType: resolvedMimeType,
              ...(folderId ? { parents: [folderId] } : {}),
            },
            media: {
              mimeType: resolvedMimeType,
              body: content,
            },
          });

      return {
        status: fileId ? 'updated' : 'created',
        fileId: response.data.id,
        name: response.data.name ?? name,
        link: response.data.id ? `https://drive.google.com/file/d/${response.data.id}/view` : null,
        mimeType: resolvedMimeType,
      };
    } catch (error) {
      if (error instanceof GaxiosError && (error.status === 401 || error.status === 403)) {
        throw new TokenVaultError('Authorization required to create or update a Google Drive file.');
      }

      return {
        ...toTypedToolError('create_drive_file', error),
      };
    }
  },
  {
    name: 'create_drive_file',
    description: 'Create a new file in Google Drive or update an existing one with new content.',
    schema: z.object({
      fileId: z.string().optional().describe('Optional existing Google Drive file ID to update.'),
      name: z.string().optional().describe('The file name to create or rename to.'),
      content: z.string().describe('The text content to save in the file.'),
      folderId: z.string().optional().describe('Optional Google Drive folder ID for newly created files.'),
      mimeType: z.string().optional().describe('The MIME type of the file. Defaults to text/plain.'),
    }).refine((value) => Boolean(value.fileId || value.name), {
      message: 'Either fileId or name is required.',
    }),
  },
);
