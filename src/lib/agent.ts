import { Annotation, MessagesAnnotation, StateGraph, START, END, MemorySaver, InMemoryStore } from '@langchain/langgraph';
import { routerNode } from './nodes/router';
import { generalNode } from './nodes/general';
import { researchNode } from './nodes/research';
import { cryptoNode } from './nodes/crypto';
import { videoNode } from './nodes/video';
import { webAutoNode } from './nodes/web-automation';
import { responseFormatterNode } from './nodes/response-formatter';
import { auditLogger, type AuditEntry } from './audit-log';

/**
 * SimieBot State Definition
 */
export const SimieBotAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  activeNode: Annotation<string>({ 
    reducer: (prev, next) => next,
    default: () => 'general' 
  }),
  hitlRequired: Annotation<boolean>({ 
    reducer: (prev, next) => next,
    default: () => false 
  }),
  auditLog: Annotation<AuditEntry[]>({ 
    reducer: (prev, next) => prev.concat(next),
    default: () => [] 
  }),
  memoryContext: Annotation<string>({ 
    reducer: (prev, next) => next,
    default: () => '' 
  }),
});

/**
 * Route Logic
 */
const routeByIntent = (state: typeof SimieBotAnnotation.State) => {
  return state.activeNode;
};

/**
 * SimieBot LangGraph Workflow
 */
const workflow = new StateGraph(SimieBotAnnotation)
  .addNode('router', routerNode)
  .addNode('general', generalNode)
  .addNode('research', researchNode)
  .addNode('crypto', cryptoNode)
  .addNode('video', videoNode)
  .addNode('web_automation', webAutoNode)
  .addNode('response_formatter', responseFormatterNode)
  
  .addEdge(START, 'router')
  
  .addConditionalEdges('router', routeByIntent, {
    general: 'general',
    research: 'research',
    crypto: 'crypto',
    video: 'video',
    web_automation: 'web_automation',
  })
  
  .addEdge('general', 'response_formatter')
  .addEdge('research', 'response_formatter')
  .addEdge('crypto', 'response_formatter')
  .addEdge('video', 'response_formatter')
  .addEdge('web_automation', 'response_formatter')
  
  .addEdge('response_formatter', END);

// Local memory stores
const checkpointer = new MemorySaver();
const store = new InMemoryStore();

// Export the compiled agent
export const agent = workflow.compile({
  checkpointer,
  store,
});
