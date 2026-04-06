import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { ChatBedrockConverse } from '@langchain/aws';

const region = process.env.BEDROCK_AWS_REGION ?? process.env.AWS_REGION ?? 'us-east-1';
const accessKeyId = process.env.BEDROCK_AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.BEDROCK_AWS_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY;
const sessionToken = process.env.BEDROCK_AWS_SESSION_TOKEN ?? process.env.AWS_SESSION_TOKEN;

export const NOVA_LITE_2_MODEL_ID = process.env.BEDROCK_MODEL_ID ?? 'us.amazon.nova-2-lite-v1:0';

const sharedClientConfig = {
  region,
  ...(accessKeyId && secretAccessKey
    ? {
        credentials: {
          accessKeyId,
          secretAccessKey,
          ...(sessionToken ? { sessionToken } : {}),
        },
      }
    : {}),
};

export function createNovaLiteModel(options?: { temperature?: number; maxTokens?: number }) {
  return new ChatBedrockConverse({
    model: NOVA_LITE_2_MODEL_ID,
    ...sharedClientConfig,
    temperature: options?.temperature ?? 0,
    ...(options?.maxTokens ? { maxTokens: options.maxTokens } : {}),
  });
}

export function createBedrockRuntimeClient() {
  return new BedrockRuntimeClient(sharedClientConfig);
}

export function getTextContent(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }

        if (part && typeof part === 'object' && 'text' in part && typeof part.text === 'string') {
          return part.text;
        }

        return '';
      })
      .join('');
  }

  return '';
}

export function getConverseTextContent(content: Array<{ text?: string } | undefined> | undefined): string {
  if (!content) {
    return '';
  }

  return content
    .map((block) => {
      if (!block || typeof block !== 'object') {
        return '';
      }

      return typeof block.text === 'string' ? block.text : '';
    })
    .join('');
}
