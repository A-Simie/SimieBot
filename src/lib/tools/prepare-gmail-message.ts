import { tool } from '@langchain/core/tools';
import { z } from 'zod';

import { createNovaLiteModel, getTextContent } from '../bedrock';
import { toTypedToolError } from './tool-errors';

const preparedEmailSchema = z.object({
  to: z.array(z.string().email()).optional(),
  subject: z.string().trim().min(1),
  bodyText: z.string().trim().min(1),
});

const extractJsonObject = (raw: string) => {
  const fencedMatch = raw.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return JSON.parse(fencedMatch[1]);
  }

  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return JSON.parse(raw.slice(start, end + 1));
  }

  throw new Error('prepare_gmail_message did not return valid JSON.');
};

export const prepareGmailMessageTool = tool(
  async ({ request, to, subject, bodyText }) => {
    try {
      const llm = createNovaLiteModel({ temperature: 0 });
      const response = await llm.invoke([
        {
          role: 'system',
          content: `You prepare send-ready Gmail content from a user's natural-language request.

Return JSON only with this shape:
{"subject":"...","bodyText":"...","to":["person@example.com"]}

Rules:
1. If the user says "tell him/her/them ..." or gives message content in plain English, turn that into the actual email body.
2. Preserve any explicit recipient, subject, or body values that are already provided unless they are clearly incomplete.
3. bodyText must be a real email body, never blank, never placeholder text, never a summary label.
4. Keep the message concise but complete.
5. Do not include markdown or explanations outside the JSON.`,
        },
        {
          role: 'user',
          content: [
            `Original request: ${request}`,
            to?.length ? `Existing recipients: ${to.join(', ')}` : null,
            subject ? `Existing subject: ${subject}` : null,
            bodyText ? `Existing body draft: ${bodyText}` : null,
          ]
            .filter(Boolean)
            .join('\n'),
        },
      ]);

      const parsed = preparedEmailSchema.parse(extractJsonObject(getTextContent(response.content)));

      return {
        status: 'prepared',
        ...parsed,
      };
    } catch (error) {
      return toTypedToolError('prepare_gmail_message', error);
    }
  },
  {
    name: 'prepare_gmail_message',
    description:
      'Turn a natural-language email request into send-ready Gmail fields like subject and body text before sending.',
    schema: z.object({
      request: z.string().min(1).describe('The original natural-language email request from the user.'),
      to: z.array(z.string().email()).optional().describe('Known recipients if already extracted.'),
      subject: z.string().optional().describe('Existing subject if already extracted.'),
      bodyText: z.string().optional().describe('Existing body draft if already extracted.'),
    }),
  },
);
