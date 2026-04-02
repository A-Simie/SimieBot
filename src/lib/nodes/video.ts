import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';

import { videoProcessorTool } from '../tools/video-processor';
import { semanticVideoSearchTool } from '../tools/semantic-video-search';

// Specialized media tools
const tools = [videoProcessorTool, semanticVideoSearchTool];

const VIDEO_SYSTEM_PROMPT = `You are the SimieBot Video Engine sub-agent.
Use the available tools for video processing, semantic search, and media operations.
Maintain the context of playback and user media preferences.`;

let _agent: any;

/**
 * Lazy-initialized video agent node.
 * Prevents top-level blocking during LangGraph schema extraction.
 */
export async function videoNode(state: any, config?: any) {
  if (!_agent) {
    const llm = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0,
    });

    _agent = createReactAgent({
      llm,
      tools,
      prompt: VIDEO_SYSTEM_PROMPT,
    });
  }
  return _agent.invoke(state, config);
}
