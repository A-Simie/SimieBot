import { SerpAPI } from '@langchain/community/tools/serpapi';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const webSearchTool = tool(
  async ({ query }) => {
    if (!process.env.SERPAPI_API_KEY) {
      return {
        error: 'SerpAPI is not configured. Please add SERPAPI_API_KEY to your environment.',
      };
    }

    const search = new SerpAPI();
    try {
      const result = await search.invoke(query);
      return {
        query,
        result,
        source: 'SerpAPI',
      };
    } catch (error) {
      return {
        query,
        error: error instanceof Error ? error.message : 'Unknown search error',
      };
    }
  },
  {
    name: 'web_search',
    description: 'Search the web for real-time information, facts, and verification.',
    schema: z.object({
      query: z.string().describe('The search query to look up online.'),
    }),
  },
);
