/* eslint-disable import/no-cycle */
import initAuth0, { getExpiryTime, getIdToken, getUser } from '../../scripts/auth.js';
import { getCookie, setCookie } from '../../scripts/scripts.js';

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
  return getCookie(sessionKey);
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
      const exp = await getExpiryTime();

      sessionStorage.setItem(`${env}_apiToken`, JSON.stringify({ access_token: idToken }), exp);

      setCookie(`${env}_apiToken`, JSON.stringify({ access_token: idToken }), exp);
      setCookie(`${env}_user_data`, JSON.stringify(auth0User), exp);
      setCookie('first_name', auth0User?.given_name, exp);
      setCookie('last_name', auth0User?.family_name, exp);
      setCookie('rationalized_id', auth0User?.email, exp);

      if (auth0User) {
        sessionStorage.setItem(`${env}_auth0User`, auth0User?.sub, exp);
      }

      const target = result?.appState?.returnTo || '/';
      window.location.href = target;
    } catch (err) {
      loginAnchor.textContent = 'Login';
      block.innerHTML = '<p>Authentication failed. Please refresh or try again.</p>';
    }
  }, 500);
}
