// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';
// eslint-disable-next-line import/no-cycle
import { getCookie, setCookie } from './scripts.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

/* eslint-disable */
function LoadDriftWidget() {
    var t = window.driftt = window.drift = window.driftt || [];
    if (!t.init) {
        if (t.invoked) return void (window.console && console.error && console.error("Drift snippet included twice."));
        t.invoked = !0, t.methods = [ "identify", "config", "track", "reset", "debug", "show", "ping", "page", "hide", "off", "on" ], 
        t.factory = function(e) {
        return function() {
            var n = Array.prototype.slice.call(arguments);
            return n.unshift(e), t.push(n), t;
        };
        }, t.methods.forEach(function(e) {
        t[e] = t.factory(e);
        }), t.load = function(t) {
        var e = 3e5, n = Math.ceil(new Date() / e) * e, o = document.createElement("script");
        o.type = "text/javascript", o.async = !0, o.crossorigin = "anonymous", o.src = "https://js.driftt.com/include/" + n + "/" + t + ".js";
        var i = document.getElementsByTagName("script")[0];
        i.parentNode.insertBefore(o, i);
    };
    }
    drift.SNIPPET_VERSION = '0.3.1';
    drift.load('pyupvvckemp9');
};
/* eslint-enable */

// IPStack Integration to get specific user information
async function loadUserData() {
  const countryCodeInfo = 'country_code';
  if (getCookie(countryCodeInfo)) return;
  fetch('http://api.ipstack.com/check?access_key=fa0c43f899d86d91bf5aa529a5774566', {
    /* Referrer Policy is set to strict-origin-when-cross-origin by default
       to avoid data leaking of private information.
       See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy#directives
       Set explicitely policy 'no-referrer-when-downgrade'.
    */
    referrerPolicy: 'no-referrer-when-downgrade',
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  }).then((data) => {
    if (data[countryCodeInfo]) {
      setCookie(countryCodeInfo, data[countryCodeInfo], 30);
    }
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.warn('Could not load user information.', err);
  });
}

loadUserData();

if (!document.location.hostname.match('www.moleculardevices.com.cn') && !document.location.hostname.match('.hlx.page')) {
  LoadDriftWidget();
}
