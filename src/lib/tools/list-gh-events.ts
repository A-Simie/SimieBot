import { TokenVaultError } from '@auth0/ai/interrupts';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

import { getAccessToken } from '../auth0-ai';
import { toTypedToolError } from './tool-errors';

function getPayloadSummary(eventType: string, payload: any): string {
  switch (eventType) {
    case 'PushEvent':
      return `Pushed ${payload.commits?.length || 0} commit(s)`;
    case 'PullRequestEvent':
      return `${payload.action} pull request: ${payload.pull_request?.title}`;
    case 'IssuesEvent':
      return `${payload.action} issue: ${payload.issue?.title}`;
    case 'CreateEvent':
      return `Created ${payload.ref_type}: ${payload.ref || ''}`;
    case 'WatchEvent':
      return 'Starred repository';
    case 'ForkEvent':
      return 'Forked repository';
    default:
      return eventType;
  }
}

export const listGitHubEventsTool = tool(
  async ({ per_page = 30, page = 1 }) => {
    try {
      const accessToken = await getAccessToken();
      const { Octokit } = await import('octokit');
      const octokit = new Octokit({
        auth: accessToken,
      });

      const { data: user } = await octokit.rest.users.getAuthenticated();
      const { data } = await octokit.rest.activity.listEventsForAuthenticatedUser({
        username: user.login,
        per_page,
        page,
      });

      const events = data.map((event: any) => ({
        id: event.id,
        type: event.type,
        created_at: event.created_at,
        repo: {
          name: event.repo?.name || 'Unknown',
          url: event.repo?.url || '',
        },
        actor: {
          login: event.actor?.login || 'Unknown',
          avatar_url: event.actor?.avatar_url || '',
        },
        payload_summary: getPayloadSummary(event.type, event.payload),
        public: event.public,
      }));

      return {
        status: 'ok',
        events,
        total_events: events.length,
        page,
        per_page,
      };
    } catch (error) {
      const { RequestError } = await import('octokit');
      if (error instanceof RequestError) {
        if (error.status === 401) {
          throw new TokenVaultError(
            'Authorization required to access GitHub events. Please connect your GitHub account.',
          );
        }
        if (error.status === 403) {
          throw new TokenVaultError(
            'Access forbidden. The GitHub token may not have the required permissions to access events.',
          );
        }
      }

      return toTypedToolError('list_github_events', error);
    }
  },
  {
    name: 'list_github_events',
    description:
      'List recent GitHub events for the connected user such as pushes, pull requests, and issues.',
    schema: z.object({
      per_page: z.number().min(1).max(100).default(30).optional(),
      page: z.number().min(1).default(1).optional(),
    }),
  },
);
