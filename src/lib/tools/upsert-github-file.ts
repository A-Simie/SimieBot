import { TokenVaultError } from '@auth0/ai/interrupts';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

import { getAccessToken } from '../auth0-ai';
import { toTypedToolError } from './tool-errors';

const encodeContent = (value: string) => Buffer.from(value, 'utf8').toString('base64');

export const upsertGitHubFileTool = tool(
  async ({ owner, repo, path, content, commitMessage, branch }) => {
    try {
      const accessToken = await getAccessToken();
      const { Octokit, RequestError } = await import('octokit');
      const octokit = new Octokit({
        auth: accessToken,
      });

      let existingSha: string | undefined;
      try {
        const currentFile = await octokit.rest.repos.getContent({
          owner,
          repo,
          path,
          ...(branch ? { ref: branch } : {}),
        });

        if (!Array.isArray(currentFile.data) && 'sha' in currentFile.data) {
          existingSha = currentFile.data.sha;
        }
      } catch (error) {
        if (!(error instanceof RequestError && error.status === 404)) {
          throw error;
        }
      }

      const response = await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: commitMessage,
        content: encodeContent(content),
        ...(existingSha ? { sha: existingSha } : {}),
        ...(branch ? { branch } : {}),
      });

      return {
        status: existingSha ? 'updated' : 'created',
        owner,
        repo,
        path,
        branch: response.data.commit?.sha ? branch ?? null : branch ?? null,
        commitSha: response.data.commit?.sha ?? null,
        commitUrl: response.data.commit?.html_url ?? null,
        contentUrl:
          'content' in response.data && response.data.content?.html_url ? response.data.content.html_url : null,
      };
    } catch (error) {
      const { RequestError } = await import('octokit');
      if (error instanceof RequestError) {
        if (error.status === 401) {
          throw new TokenVaultError(
            'Authorization required to modify files in the connected GitHub account.',
          );
        }
        if (error.status === 403) {
          throw new TokenVaultError(
            'GitHub rejected the file modification. Check the app permissions for repository write access.',
          );
        }
      }

      return toTypedToolError('upsert_github_file', error);
    }
  },
  {
    name: 'upsert_github_file',
    description: 'Create a new file or update an existing file in a GitHub repository.',
    schema: z.object({
      owner: z.string().min(1).describe('GitHub repository owner or organization.'),
      repo: z.string().min(1).describe('GitHub repository name.'),
      path: z.string().min(1).describe('Path to the file inside the repository.'),
      content: z.string().describe('UTF-8 content to write into the file.'),
      commitMessage: z.string().min(1).describe('Commit message for the file change.'),
      branch: z.string().optional().describe('Optional target branch.'),
    }),
  },
);
