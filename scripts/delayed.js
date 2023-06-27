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

/*
IPStack Integration to get specific user information
Stores dedicated user data in a cookie.
*/
async function loadUserData() {
  const attrCountryCode = 'country_code';
  if (getCookie(attrCountryCode)) return;

  try {
    const response = await fetch('https://api.ipstack.com/check?access_key=7d5a41f8a619751e2548545f56b29dbc', {
      mode: 'cors',
    });

    if (response.ok) {
      const data = await response.json();
      if (data[attrCountryCode]) {
        setCookie(attrCountryCode, data[attrCountryCode], 1);
        const event = new CustomEvent('countryCodeUpdated', { detail: data[attrCountryCode] });
        document.dispatchEvent(event);
      }
    } else {
      throw new Error('Response not okay');
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Could not load user information.', err);
  }
}

loadUserData();

if (!document.location.hostname.match('www.moleculardevices.com.cn') && !document.location.hostname.match('.hlx.page')) {
  LoadDriftWidget();
}
