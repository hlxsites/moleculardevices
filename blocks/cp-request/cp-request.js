import { getQueryParameter } from '../../scripts/scripts.js';

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  var c_host_name = '';
  var n_domain = '';
  var expires = '';
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  if (exdays != 0) {
    expires = "expires=" + d.toUTCString();
  }

  n_domain = window.location.hostname.endsWith(".moleculardevices.com");
  if (n_domain == true) {
    c_host_name = 'domain=.moleculardevices.com;';
  }
  //document.cookie = cname + "=" + cvalue + ";secure;" + c_host_name + expires + ";path=/";
  document.cookie = cname + "=" + cvalue + ";secure;" + expires + ";path=/";
}

const paramName = 'STYXKEY_PortalUserRole';
const readQuery = getQueryParameter();
const queryStringParam = readQuery[paramName] ? readQuery[paramName] : '';

if (queryStringParam == 'cplogout') {
  setCookie("STYXKEY_PortalUserRole", '', -1);
} else {
  setCookie("STYXKEY_PortalUserRole", queryStringParam, 0);
}