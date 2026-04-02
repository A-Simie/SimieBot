import { tool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * arXiv Search Tool (SimieBot Research Node)
 */
export const arxivSearchTool = tool(
  async ({ query, maxResults = 5 }) => {
    // arXiv API endpoint
    const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${maxResults}`;
    
    try {
      const response = await fetch(url);
      const text = await response.text();
      
      // Simple XML parsing (returning the raw text for the LLM to parse or as a structured stub for now)
      // In a production app, we'd use a real XML parser like 'fast-xml-parser'
      return `arXiv search results for "${query}":\n${text.substring(0, 5000)}...`;
    } catch (error: any) {
      return `Error searching arXiv: ${error.message}`;
    }
  },
  {
    name: 'arxiv_search',
    description: 'Search for academic papers on arXiv. Use this for high-integrity research.',
    schema: z.object({
      query: z.string().describe('The research topic or keyword to search for.'),
      maxResults: z.number().optional().default(5).describe('Maximum number of results to return.'),
    }),
  }
);
