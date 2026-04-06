import { TokenVaultError } from '@auth0/ai/interrupts';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

import { getAccessToken } from '../auth0-ai';
import { toTypedToolError } from './tool-errors';

export const listRepositoriesTool = tool(
  async () => {
    try {
      const accessToken = await getAccessToken();
      const { Octokit } = await import('octokit');
      const octokit = new Octokit({
        auth: accessToken,
      });

      const { data } = await octokit.rest.repos.listForAuthenticatedUser({ visibility: 'all' });
      const repositories = data.map((repo) => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        private: repo.private,
        html_url: repo.html_url,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        open_issues_count: repo.open_issues_count,
        updated_at: repo.updated_at,
      }));

      return {
        status: 'ok',
        total_repositories: repositories.length,
        repositories,
      };
    } catch (error) {
      const { RequestError } = await import('octokit');
      if (error instanceof RequestError && error.status === 401) {
        throw new TokenVaultError(
          'Authorization required to access GitHub repositories. Please connect your GitHub account.',
        );
      }

      return toTypedToolError('list_repositories', error);
    }
  },
  {
    name: 'list_repositories',
    description: 'List repositories for the currently connected GitHub user.',
    schema: z.object({}),
  },
);
