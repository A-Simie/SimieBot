export type IdentityProviderKey = 'google' | 'github' | 'slack' | 'auth0';

export function getIdentityProviderKey(sub?: string | null): IdentityProviderKey {
  const provider = sub?.split('|')[0];

  switch (provider) {
    case 'google-oauth2':
      return 'google';
    case 'github':
      return 'github';
    case 'sign-in-with-slack':
      return 'slack';
    default:
      return 'auth0';
  }
}

export function getIdentityProviderName(sub?: string | null) {
  const provider = getIdentityProviderKey(sub);

  switch (provider) {
    case 'google':
      return 'Google';
    case 'github':
      return 'GitHub';
    case 'slack':
      return 'Slack';
    default:
      return 'Auth0';
  }
}
