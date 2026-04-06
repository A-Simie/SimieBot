import { Annotation, MessagesAnnotation, StateGraph, START, END, MemorySaver, InMemoryStore } from '@langchain/langgraph';
import { routerNode } from './nodes/router';
import { generalNode } from './nodes/general';
import { creatorNode } from './nodes/creator';
import { responseFormatterNode } from './nodes/response-formatter';

export const SimieBotAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  activeNode: Annotation<string>({
    reducer: (prev, next) => next,
    default: () => 'general',
  }),
});

const routeByIntent = (state: typeof SimieBotAnnotation.State) => {
  return state.activeNode;
};

const workflow = new StateGraph(SimieBotAnnotation)
  .addNode('router', routerNode)
  .addNode('general', generalNode)
  .addNode('creator', creatorNode)
  .addNode('response_formatter', responseFormatterNode)
  .addEdge(START, 'router')

  .addConditionalEdges('router', routeByIntent, {
    general: 'general',
    creator: 'creator',
  })

  .addEdge('general', 'response_formatter')
  .addEdge('creator', 'response_formatter')
  .addEdge('response_formatter', END);

const checkpointer = new MemorySaver();
const store = new InMemoryStore();

export const agent = workflow.compile({
  checkpointer,
  store,
});
