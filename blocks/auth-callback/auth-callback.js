import initAuth0, { getIdToken, getUser } from '../../scripts/auth.js';

const hostName = window.location.hostname;

export function getEnv() {
  let env;
  if (hostName.includes('local')) {
    env = 'local';
  } else if (hostName.includes('dev')) {
    env = 'dev';
  } else if (hostName.includes('stage')) {
    env = 'stage';
  } else {
    env = 'prod';
  }
  return env;
}

export function hasAuth0LoggedIn() {
  const env = getEnv();
  const sessionKey = `${env}_apiToken`;
  return sessionStorage.getItem(sessionKey);
}

export default async function decorate(block) {
  setTimeout(async () => {
    const loginAnchor = document.querySelector('header a[href*="lifesciences.danaher.com"]');
    loginAnchor.textContent = 'Logout';

    block.innerHTML = '<p>Signing you in...</p>';
    const env = getEnv();

    try {
      const auth0Client = await initAuth0();
      const result = await auth0Client.handleRedirectCallback();
      const idToken = await getIdToken();
      const auth0User = await getUser();
      sessionStorage.setItem(
        `${env}_apiToken`,
        JSON.stringify({ access_token: idToken }),
      );
      if (auth0User) {
        sessionStorage.setItem(
          `${env}_auth0User`,
          auth0User?.sub,
        );
      }

      const target = result?.appState?.returnTo || '/';
      window.location.href = target;
    } catch (err) {
      loginAnchor.textContent = 'Login';
      block.innerHTML = '<p>Authentication failed. Please refresh or try again.</p>';
    }
  }, 500);
}
