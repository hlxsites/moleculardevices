/* eslint-disable no-undef */
import { div } from '../../scripts/dom-helpers.js';

async function onetrsutInitializationHandler(ontrustID) {
  const privacyNoticesUrl = `https://privacyportalde-cdn.onetrust.com/c579c0d0-360f-49c0-bccc-f7b7cded31cd/privacy-notices/draft/${ontrustID}.json`;

  setTimeout(async () => {
    await OneTrust.NoticeApi.Initialized.then(async () => {
      await OneTrust.NoticeApi.LoadNotices([privacyNoticesUrl], false);
    });

    const opcoName = document.getElementsByClassName('OpCoName');
    for (let i = 0; i < opcoName.length; i += 1) {
      opcoName[i].innerHTML = 'Molecular Devices, LLC';
    }
    const opcoAddr = document.getElementsByClassName('OpCoAddressMultiLine');
    for (let i = 0; i < opcoAddr.length; i += 1) {
      opcoAddr[i].innerHTML = 'Molecular Devices, LLC</br>Attn: Legal Department</br>3860 N. First St.</br>San Jose, CA 95134, USA';
    }
    const opcoEmail = document.getElementsByClassName('OpCoEmail');
    for (let i = 0; i < opcoEmail.length; i += 1) {
      opcoEmail[i].innerHTML = 'privacy@moldev.com';
      opcoEmail[i].href = 'mailto:privacy@moldev.com';
    }
    const opcoCookiePolicy = document.getElementsByClassName('OpCoCookiePolicy');
    for (let i = 0; i < opcoCookiePolicy.length; i += 1) {
      opcoCookiePolicy[i].href = 'https://www.moleculardevices.com/cookie-notice';
    }
    const opcoCcpaPolicy = document.getElementsByClassName('OpCoCCPAPolicy');
    for (let i = 0; i < opcoCcpaPolicy.length; i += 1) {
      opcoCcpaPolicy[i].href = 'https://www.moleculardevices.com/california-consumer-rights-notice';
    }
    const opcoPrivacyPolicy = document.getElementsByClassName('OpCoPrivacyPolicy');
    for (let i = 0; i < opcoPrivacyPolicy.length; i += 1) {
      opcoPrivacyPolicy[i].href = 'https://www.moleculardevices.com/privacy-policy';
    }
    const versionNumber = document.getElementsByClassName('otnotice-public-version')[0].innerHTML;
    const versionNum = document.getElementsByClassName('VersionNumber');
    for (let i = 0; i < versionNum.length; i += 1) {
      versionNum[i].innerHTML = versionNumber;
    }
    const element = document.getElementsByClassName('otnotice-version');
    for (let i = 0; i < element.length; i += 1) {
      element[i].remove();
    }
  }, 500);
}

export default async function decorate(block) {
  const ontrustID = block.querySelector(':scope > div > div').textContent;
  const scriptID = 'otprivacy-notice-script';
  const scriprSrc = 'https://privacyportal-uatde-cdn.onetrust.com/privacy-notice-scripts/otnotice-1.0.min.js';

  /* SCRIPT ADDED */
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.id = scriptID;
  script.src = scriprSrc;
  document.head.appendChild(script);

  /* ONETRUST HTML PARSED */
  const oneTrustContainer = div(
    { class: 'container' },
    div({
      id: `otnotice-${ontrustID}`,
      class: 'otnotice',
    }),
  );
  block.querySelector(':scope > div').replaceWith(oneTrustContainer);

  /* ONETRUST INITIALIZATION */
  await onetrsutInitializationHandler(ontrustID);
}
