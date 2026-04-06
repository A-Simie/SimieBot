import { Auth0AI, getAccessTokenFromTokenVault } from '@auth0/ai-langchain';
import { SUBJECT_TOKEN_TYPES } from '@auth0/ai';

// Get the access token for a connection via Auth0
export const getAccessToken = async () => getAccessTokenFromTokenVault();

const tokenVaultEnvIsConfigured = () =>
  Boolean(
    process.env.AUTH0_DOMAIN &&
      process.env.AUTH0_CUSTOM_API_CLIENT_ID &&
      process.env.AUTH0_CUSTOM_API_CLIENT_SECRET,
  );

const getAuth0AICustomAPI = () =>
  new Auth0AI({
    auth0: {
      domain: process.env.AUTH0_DOMAIN!,
      clientId: process.env.AUTH0_CUSTOM_API_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CUSTOM_API_CLIENT_SECRET!,
    },
  });

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

export const withGmailRead = withConnection('google-oauth2', [
  'openid',
  'https://www.googleapis.com/auth/gmail.readonly',
]);

export const withGmailWrite = withConnection('google-oauth2', [
  'openid',
  'https://www.googleapis.com/auth/gmail.compose',
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

export const withYouTubeUpload = withConnection('google-oauth2', [
  'openid',
  'https://www.googleapis.com/auth/youtube.upload',
]);

export const withSlackMediaRead = withConnection('sign-in-with-slack', [
  'channels:read',
  'groups:read',
  'files:read',
]);
