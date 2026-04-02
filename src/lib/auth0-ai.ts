import { Auth0AI, getAccessTokenFromTokenVault } from '@auth0/ai-langchain';
import { SUBJECT_TOKEN_TYPES } from '@auth0/ai';

// Get the access token for a connection via Auth0
export const getAccessToken = async () => getAccessTokenFromTokenVault();

/**
 * Internal lazy-initialized Auth0 AI Client.
 * Prevents top-level blocking during LangGraph schema extraction discovery.
 */
let _auth0AICustomAPI: Auth0AI;

function getAuth0AICustomAPI() {
  if (!_auth0AICustomAPI) {
    _auth0AICustomAPI = new Auth0AI({
      auth0: {
        domain: process.env.AUTH0_DOMAIN!,
        // For token exchange with Token Vault, we want to provide the Custom API Client credentials
        clientId: process.env.AUTH0_CUSTOM_API_CLIENT_ID!, // Custom API Client ID for token exchange
        clientSecret: process.env.AUTH0_CUSTOM_API_CLIENT_SECRET!, // Custom API Client secret
      },
    });
  }
  return _auth0AICustomAPI;
}

// Connection helper for services (Lazy)
export const withConnection = (connection: string, scopes: string[]) => (tool: any) =>
  getAuth0AICustomAPI().withTokenVault({
    connection,
    scopes,
    accessToken: async (_, config) => {
      return config.configurable?.langgraph_auth_user?.getRawAccessToken();
    },
    subjectTokenType: SUBJECT_TOKEN_TYPES.SUBJECT_TYPE_ACCESS_TOKEN,
  })(tool);

export const withGmailRead = (tool: any) => withConnection('google-oauth2', [
  'openid',
  'https://www.googleapis.com/auth/gmail.readonly',
])(tool);

export const withGmailWrite = (tool: any) => withConnection('google-oauth2', [
  'openid',
  'https://www.googleapis.com/auth/gmail.compose',
])(tool);

export const withCalendar = (tool: any) => withConnection('google-oauth2', [
  'openid',
  'https://www.googleapis.com/auth/calendar.events',
])(tool);

