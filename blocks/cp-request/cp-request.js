import { getQueryParameter, setCookie } from '../../scripts/scripts.js';

const paramName = 'STYXKEY_PortalUserRole';
const readQuery = getQueryParameter();
const queryStringParam = readQuery[paramName] ? readQuery[paramName] : '';

if (queryStringParam && (document.referrer.includes('.moleculardevices.com') || document.referrer.includes('.aem.page') || document.referrer.includes('.aem.live') || document.referrer.includes('localhost:3000'))) {
  if (queryStringParam === 'cplogout') {
    setCookie('STYXKEY_PortalUserRole', '', -1);
  } else {
    setCookie('STYXKEY_PortalUserRole', queryStringParam, 0);
  }
}
