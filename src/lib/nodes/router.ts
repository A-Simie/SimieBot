import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const IntentSchema = z.object({
  intent: z.enum(['research', 'crypto', 'video', 'web_automation', 'general'])
    .describe('The specialized node to route the message to based on the user intent.'),
});

const intentTool = {
  name: 'classify_intent',
  description: 'Classify the users intent into one of the specialized categories.',
  parameters: zodToJsonSchema(IntentSchema),
};

export async function routerNode(state: any) {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];

  const llm = new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0,
  }).bind({
    tools: [intentTool],
    tool_choice: { type: 'function', function: { name: 'classify_intent' } },
  });

  const response = await llm.invoke([
    { role: 'system', content: 'You are an intent classifier for SimieBot OS. Route the user request to the most appropriate node.' },
    lastMessage,
  ]);

  const toolCall = response.tool_calls?.[0];
  const intent = (toolCall?.args as any)?.intent || 'general';

  return { activeNode: intent };
}
