export interface TypedToolError {
  status: 'error';
  tool: string;
  reason: string;
  errorType: string;
  retryable: boolean;
}

export const toTypedToolError = (tool: string, error: unknown): TypedToolError => {
  const reason = error instanceof Error ? error.message : 'Unknown error';
  const errorType =
    error instanceof Error && error.name ? error.name : typeof error === 'object' && error ? 'Error' : 'UnknownError';

  return {
    status: 'error',
    tool,
    reason,
    errorType,
    retryable: !/validation|schema|parse/i.test(reason),
  };
};
