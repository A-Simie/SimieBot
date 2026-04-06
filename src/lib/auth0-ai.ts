import {
  Auth0AI,
  getAccessTokenFromTokenVault,
  getAsyncAuthorizationCredentials,
} from '@auth0/ai-langchain';
import { SUBJECT_TOKEN_TYPES } from '@auth0/ai';
import {
  AccessDeniedInterrupt,
  AuthorizationRequestExpiredInterrupt,
  InvalidGrantInterrupt,
  UserDoesNotHavePushNotificationsInterrupt,
} from '@auth0/ai/interrupts';

// Get the access token for a connection via Auth0
export const getAccessToken = async () => getAccessTokenFromTokenVault();
export const getAsyncApprovalCredentials = () => getAsyncAuthorizationCredentials();

const tokenVaultEnvIsConfigured = () =>
  Boolean(
    process.env.AUTH0_DOMAIN &&
      process.env.AUTH0_CUSTOM_API_CLIENT_ID &&
      process.env.AUTH0_CUSTOM_API_CLIENT_SECRET,
  );

export const asyncAuthorizationEnvIsConfigured = () =>
  Boolean(
    process.env.AUTH0_DOMAIN &&
      process.env.AUTH0_CLIENT_ID &&
      process.env.AUTH0_CLIENT_SECRET &&
      (process.env.AUTH0_CIBA_AUDIENCE || process.env.AUTH0_AUDIENCE),
  );

const getAuth0AICustomAPI = () =>
  new Auth0AI({
    auth0: {
      domain: process.env.AUTH0_DOMAIN!,
      clientId: process.env.AUTH0_CUSTOM_API_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CUSTOM_API_CLIENT_SECRET!,
    },
  });

const getAuth0AIApplication = () =>
  new Auth0AI({
    auth0: {
      domain: process.env.AUTH0_DOMAIN!,
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    },
  });

const getDefaultCibaScopes = () =>
  (process.env.AUTH0_CIBA_SCOPES ?? 'openid')
    .split(/[,\s]+/)
    .map((scope) => scope.trim())
    .filter(Boolean);

const AUTH0_MAX_BINDING_MESSAGE_LENGTH = 64;
const AUTH0_ALLOWED_BINDING_MESSAGE_PATTERN = /[^A-Za-z0-9\s+\-_. ,:#]/g;

const toSafeBindingMessage = (value: string) => {
  const normalized =
    value
      .replace(AUTH0_ALLOWED_BINDING_MESSAGE_PATTERN, '')
      .replace(/\s+/g, ' ')
      .trim() || 'Approve SimieBot action';
  if (normalized.length <= AUTH0_MAX_BINDING_MESSAGE_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, AUTH0_MAX_BINDING_MESSAGE_LENGTH - 3).trimEnd()}...`;
};

export const withConnection = (connection: string, scopes: string[]) => {
  return <T>(tool: T): T => {
    if (!tokenVaultEnvIsConfigured()) {
      return tool;
    }

    return getAuth0AICustomAPI().withTokenVault(
      {
        connection,
        scopes,
        accessToken: async (_, config) => {
          return config.configurable?.langgraph_auth_user?.getRawAccessToken();
        },
        subjectTokenType: SUBJECT_TOKEN_TYPES.SUBJECT_TYPE_ACCESS_TOKEN,
      },
      tool as never,
    ) as T;
  };
};

type AsyncAuthorizationOptions<TArgs> = {
  audience?: string;
  scopes?: string[];
  requestedExpiry?: number;
  bindingMessage: (args: TArgs) => Promise<string> | string;
};

export const withAsyncAuthorization = <TArgs extends Record<string, unknown>>(
  options: AsyncAuthorizationOptions<TArgs>,
) => {
  return <T>(tool: T): T => {
    if (!asyncAuthorizationEnvIsConfigured()) {
      return tool;
    }

    const audience = options.audience ?? process.env.AUTH0_CIBA_AUDIENCE ?? process.env.AUTH0_AUDIENCE!;
    const scopes = options.scopes?.length ? options.scopes : getDefaultCibaScopes();

    return getAuth0AIApplication().withAsyncAuthorization(
      {
        audience,
        scopes,
        requestedExpiry:
          options.requestedExpiry ?? Number(process.env.AUTH0_CIBA_REQUESTED_EXPIRY ?? 300),
        userID: async (_params, config) => {
          return (
            config.configurable?.langgraph_auth_user?.sub ??
            config.configurable?.langgraph_auth_user?.identity
          );
        },
        bindingMessage: async (args) =>
          toSafeBindingMessage(await options.bindingMessage(args as TArgs)),
        onUnauthorized: async (err) => {
          if (err instanceof AccessDeniedInterrupt) {
            return {
              status: 'denied',
              message: 'The approval request was denied, so the action was not executed.',
            };
          }

          if (err instanceof UserDoesNotHavePushNotificationsInterrupt) {
            return {
              status: 'unavailable',
              message:
                'The signed-in user is not enrolled for Guardian push notifications yet.',
            };
          }

          if (err instanceof AuthorizationRequestExpiredInterrupt) {
            return {
              status: 'expired',
              message: 'The approval request expired before it was approved.',
            };
          }

          if (err instanceof InvalidGrantInterrupt) {
            return {
              status: 'invalid_grant',
              message: 'Auth0 rejected the async authorization request.',
            };
          }

          return {
            status: 'failed',
            message: err instanceof Error ? err.message : 'Async authorization failed.',
          };
        },
      },
      tool as never,
    ) as T;
  };
};

export const withGmailRead = withConnection('google-oauth2', [
  'openid',
  'https://www.googleapis.com/auth/gmail.readonly',
]);

export const withGmailWrite = withConnection('google-oauth2', [
  'openid',
  'https://www.googleapis.com/auth/gmail.compose',
]);

export const withGmailSend = withConnection('google-oauth2', [
  'openid',
  'https://www.googleapis.com/auth/gmail.send',
]);

export const withCalendar = withConnection('google-oauth2', [
  'openid',
  'https://www.googleapis.com/auth/calendar.events',
]);

export const withDriveRead = withConnection('google-oauth2', [
  'openid',
  'https://www.googleapis.com/auth/drive.readonly',
]);

export const withDriveWrite = withConnection('google-oauth2', [
  'openid',
  'https://www.googleapis.com/auth/drive.file',
]);

export const withGitHubConnection = withConnection(
  'github',
  [],
);

export const withGitHubWrite = withConnection(
  'github',
  [],
);

export const withYouTubeUpload = withConnection('google-oauth2', [
  'openid',
  'https://www.googleapis.com/auth/youtube.upload',
]);

export const withSlackMediaRead = withConnection('sign-in-with-slack', [
  'channels:read',
  'groups:read',
  'files:read',
]);

export const withSlack = withConnection('sign-in-with-slack', ['channels:read', 'groups:read']);

export const withSlackWrite = withConnection('sign-in-with-slack', ['chat:write']);
