import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';

import { arxivSearchTool } from '../tools/arxiv-search';
import { ragRetrievalTool } from '../tools/rag-retrieval';
import { bibliographyTool } from '../tools/bibliography';

// Specialized research tools
const tools = [arxivSearchTool, ragRetrievalTool, bibliographyTool];

const RESEARCH_SYSTEM_PROMPT = `You are the SimieBot Research Node specialized in academic rigor, citation tracking, and synthesis. 
Use the available tools to search for papers, retrieve relevant information from the library, and manage bibliography entries. 
Always prioritize high-integrity sources and provide structured synthesis of results.`;

let _agent: any;

/**
 * Lazy-initialized research agent node.
 * Prevents top-level blocking during LangGraph schema extraction.
 */
export async function researchNode(state: any, config?: any) {
  if (!_agent) {
    const llm = new ChatOpenAI({
      model: 'gpt-4o', // stronger reasoning for research
      temperature: 0,
    });

    _agent = createReactAgent({
      llm,
      tools,
      prompt: RESEARCH_SYSTEM_PROMPT,
    });
  }
  return _agent.invoke(state, config);
}
