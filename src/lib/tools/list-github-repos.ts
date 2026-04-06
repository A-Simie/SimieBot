import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getAccessToken } from '../auth0-ai';

export const listGithubReposTool = tool(
  async ({ limit = 10, sort = 'updated' }) => {
    try {
      const accessToken = await getAccessToken();
      const response = await fetch(`https://api.github.com/user/repos?per_page=${limit}&sort=${sort}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `GitHub API error: ${response.statusText}`,
        };
      }

      const repos = await response.json();
      return {
        success: true,
        count: repos.length,
        repositories: repos.map((r: any) => ({
          name: r.name,
          full_name: r.full_name,
          description: r.description,
          url: r.html_url,
          private: r.private,
          updated_at: r.updated_at,
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to list GitHub repositories',
      };
    }
  },
  {
    name: 'list_github_repos',
    description: 'List your GitHub repositories, both public and private.',
    schema: z.object({
      limit: z.number().optional().describe('Number of repositories to return (default 10)'),
      sort: z.enum(['created', 'updated', 'pushed', 'full_name']).optional().describe('Property to sort by'),
    }),
  },
);
