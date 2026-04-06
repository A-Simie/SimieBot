import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { google } from 'googleapis';
import { getAccessToken } from '../auth0-ai';

export const createDriveFileTool = tool(
  async ({ name, content, mimeType }) => {
    const accessToken = await getAccessToken();
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: 'v3', auth });

    try {
      const response = await drive.files.create({
        requestBody: {
          name,
          mimeType: mimeType || 'text/plain',
        },
        media: {
          mimeType: mimeType || 'text/plain',
          body: content,
        },
      });

      return {
        success: true,
        fileId: response.data.id,
        name: response.data.name,
        link: `https://drive.google.com/file/d/${response.data.id}/view`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to create file in Google Drive',
      };
    }
  },
  {
    name: 'create_drive_file',
    description: 'Create a new file in Google Drive with the specified name and content. Useful for saving summaries, reports, or thesis drafts.',
    schema: z.object({
      name: z.string().describe('The name of the file to create (e.g., "thesis_draft.txt").'),
      content: z.string().describe('The text content to save in the file.'),
      mimeType: z.string().optional().describe('The MIME type of the file. Defaults to text/plain.'),
    }),
  },
);
