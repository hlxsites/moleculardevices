import { getQueryParameter } from '../../scripts/scripts.js';

function setCookie(cname, cvalue, exdays) {
  let d = new Date();
  let cHostName = '';
  let nDomain = '';
  let expires = '';
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  if (exdays !== 0) {
    expires = 'expires=' + d.toUTCString();
  }

  nDomain = window.location.hostname.endsWith('.moleculardevices.com');
  if (nDomain == true) {
    cHostName = 'domain=.moleculardevices.com;';
  }
  //document.cookie = cname + "=" + cvalue + ";secure;" + cHostName + expires + ";path=/";
  document.cookie = cname + '=' + cvalue + ';secure;' + expires + ';path=/';
}

const paramName = 'STYXKEY_PortalUserRole';
const readQuery = getQueryParameter();
const queryStringParam = readQuery[paramName] ? readQuery[paramName] : '';

if (queryStringParam == 'cplogout') {
  setCookie('STYXKEY_PortalUserRole', '', -1);
} else {
  setCookie('STYXKEY_PortalUserRole', queryStringParam, 0);
}
