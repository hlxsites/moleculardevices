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

export default async function decorate(block) {
  block.innerHTML = '<p>Signing you in...</p>';
  const env = getEnv();

  try {
    console.log('TRY');
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
    // await userLogin('customer', idToken);
    const target = result?.appState?.returnTo || '/';
    window.location.href = target;
  } catch (err) {
    console.log('CATCH');
    block.innerHTML = '<p>Authentication failed. Please refresh or try again.</p>';
  }
}
