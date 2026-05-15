/* eslint-disable import/no-cycle */
import initAuth0, { getExpiryTime, getIdToken, getUser } from '../../scripts/auth.js';
import { div, p } from '../../scripts/dom-helpers.js';
import { getCookie, setCookie } from '../../scripts/scripts.js';
import { createHubSpotForm, loadHubSpotScript } from '../forms/forms.js';

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
  return !!getCookie(sessionKey);
}

export default async function decorate(block) {
  setTimeout(async () => {
    const loginAnchor = document.querySelector('header a[href*="lifesciences.danaher.com"]');
    if (loginAnchor) loginAnchor.textContent = 'Logout';

    block.appendChild(div(
      p('Signing you in...'),
      div({ id: 'auth0-form', style: 'display: none;' }),
    ));

    const env = getEnv();

    try {
      const auth0Client = await initAuth0();
      const result = await auth0Client.handleRedirectCallback();
      const idToken = await getIdToken();
      const auth0User = await getUser();
      const exp = await getExpiryTime();

      sessionStorage.setItem(`${env}_apiToken`, JSON.stringify({ access_token: idToken }), exp);

      const firstName = auth0User?.given_name;
      const lastName = auth0User?.family_name;
      const emailID = auth0User?.rationalized_id;
      const countyCode = auth0User?.country;
      const organization = auth0User?.org;
      const jobtitle = auth0User?.title;
      const phone = auth0User?.phone;
      const subscribe = !!auth0User?.marketing_consented;

      setCookie(`${env}_apiToken`, JSON.stringify({ access_token: idToken }), exp);
      setCookie(`${env}_user_data`, JSON.stringify(auth0User), exp);
      setCookie('first_name', firstName, exp);
      setCookie('last_name', lastName, exp);
      setCookie('rationalized_id', emailID, exp);
      setCookie('country_code', countyCode, exp);
      setCookie('organization', organization, exp);

      if (auth0User) {
        sessionStorage.setItem(`${env}_auth0User`, auth0User?.sub, exp);
      }

      const createdTime = new Date(auth0User?.created_at).getTime();
      const updatedTime = new Date(auth0User?.updated_at).getTime();
      const diffTime = updatedTime - createdTime;
      const welcomeStorageKey = `welcome_email_sent_${emailID}`;
      const hasWelcomeStorageKey = localStorage.getItem(welcomeStorageKey);

      if (diffTime < 5000 && !hasWelcomeStorageKey) {
        const formConfig = {
          formType: 'auth0',
          firstname: firstName,
          lastname: lastName,
          email: emailID,
          country_code: countyCode,
          qdc: 'Call',
          organization,
          jobtitle,
          phone,
          subscribe,
        };

        /* embed hubspot form */
        loadHubSpotScript(() => createHubSpotForm(formConfig));

        localStorage.setItem(welcomeStorageKey, 'true');

        setTimeout(() => {
          const submitButtom = document.getElementById('auth0-form').querySelector('[type=submit]');
          if (submitButtom) submitButtom?.click();

          setTimeout(() => {
            const target = result?.appState?.returnTo || '/';
            window.location.href = target;
          }, 1500);
        }, 1000);
      } else {
        const target = result?.appState?.returnTo || '/';
        window.location.href = target;
      }
    } catch (err) {
      if (loginAnchor) loginAnchor.textContent = 'Login';
      block.innerHTML = '<p>Authentication failed. Please refresh or try again.</p>';
    }
  }, 500);
}
