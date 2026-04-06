import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getAccessToken } from '../auth0-ai';

export const renameGithubRepoTool = tool(
  async ({ fullName, newName }) => {
    try {
      const accessToken = await getAccessToken();
      const response = await fetch(`https://api.github.com/repos/${fullName}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `GitHub API error: ${response.statusText}`,
        };
      }

      const repo = await response.json();
      return {
        success: true,
        message: `Repository renamed from ${fullName} to ${repo.full_name}`,
        url: repo.html_url,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to rename GitHub repository',
      };
    }
  },
  {
    name: 'rename_github_repo',
    description: 'Rename an existing GitHub repository.',
    schema: z.object({
      fullName: z.string().describe('The full name of the repository (e.g., "owner/repo").'),
      newName: z.string().describe('The new name for the repository.'),
    }),
  },
);

export const deleteGithubRepoTool = tool(
  async ({ fullName }) => {
    try {
      const accessToken = await getAccessToken();
      const response = await fetch(`https://api.github.com/repos/${fullName}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (response.status === 204) {
        return {
          success: true,
          message: `Repository ${fullName} successfully deleted.`,
        };
      }

      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `GitHub API error: ${response.statusText}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to delete GitHub repository',
      };
    }
  },
  {
    name: 'delete_github_repo',
    description: 'Permanently delete a GitHub repository. Use with extreme caution.',
    schema: z.object({
      fullName: z.string().describe('The full name of the repository to delete (e.g., "owner/repo").'),
    }),
  },
);
