/* eslint-disable import/no-cycle */
import { getEnv } from '../blocks/auth-callback/auth-callback.js';
import { deleteCookie } from './scripts.js';

let auth0Client = null;

/**
 * Dynamically load the Auth0 SDK script from CDN (only when needed).
 */
async function loadAuth0Script() {
  if (window.auth0) return; // already loaded

  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.auth0.com/js/auth0-spa-js/2.1/auth0-spa-js.production.js';
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Initialize Auth0 client, only once.
 */
export default async function initAuth0() {
  if (auth0Client) return auth0Client;

  const isStageEnv = window.location.hostname.includes('localhost') || document.location.hostname.includes('.aem.page');
  const authDomain = isStageEnv ? 'stage.login.lifesciences.danaher.com' : 'dev.login.lifesciences.danaher.com';
  const authCliendID = isStageEnv ? 'Uu8eX9EWpdXWtiQI5PiNGQ2Rcmus1qrn' : 'TfZziBqZ3MaoarFZSzl98YrbURqxWHBU';

  await loadAuth0Script();
  auth0Client = await window.auth0.createAuth0Client({
    domain: window.hlx.auth0Domain || authDomain,
    clientId: window.hlx.auth0ClientID || authCliendID,
    authorizationParams: {
      redirect_uri: `${window.location.origin}/callback`,
      scope: 'openid profile email',
    },
  });

  return auth0Client;
}

/**
 * Auth helper functions
 */
export async function getUser() {
  const client = await initAuth0();
  const isAuth = await client.isAuthenticated();
  return isAuth ? client.getUser() : null;
}

export async function login() {
  const client = await initAuth0();
  await client.loginWithRedirect({
    appState: { returnTo: window.location.pathname + window.location.search },
  });
}

export async function logout() {
  const client = await initAuth0();
  await client.logout({
    logoutParams: { returnTo: window.location.origin },
  });
}

export async function getIdToken() {
  const auth0 = await initAuth0();
  const claims = await auth0.getIdTokenClaims();
  // eslint-disable-next-line no-underscore-dangle
  return claims?.__raw;
}

export async function getExpiryTime() {
  const auth0 = await initAuth0();
  const claims = await auth0.getIdTokenClaims();
  return claims?.exp;
}

export async function userLogIn() {
  await login();
}

export async function userLogOut() {
  const env = getEnv();
  deleteCookie(`${env}_apiToken`);
  deleteCookie(`${env}_user_data`);
  deleteCookie('first_name');
  deleteCookie('last_name');
  deleteCookie('rationalized_id');
  deleteCookie('country_code');
  deleteCookie('organization');
  deleteCookie('jobtitle');

  sessionStorage.clear();
  await logout();
}
