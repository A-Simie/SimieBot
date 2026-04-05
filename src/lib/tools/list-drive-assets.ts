import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const listDriveAssetsTool = tool(
  async ({ query, mimeType }) => {
    return {
      status: 'planned',
      provider: 'Google Drive via Auth0 Token Vault',
      query,
      mimeType,
      current_scope: 'Source discovery for creator workflows is planned but not implemented yet.',
      future_capabilities: [
        'List recent drive videos',
        'Filter files by folder, type, and owner',
        'Hand off selected assets to the Shotstack render pipeline',
      ],
    };
  },
  {
    name: 'list_drive_assets',
    description: 'Planned Google Drive asset discovery for creator workflows.',
    schema: z.object({
      query: z.string().optional().default('recent video files'),
      mimeType: z.string().optional().default('video/*'),
    }),
  },
);
