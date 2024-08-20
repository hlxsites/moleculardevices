// eslint-disable-next-line import/no-cycle
import { sampleRUM, loadScript } from './lib-franklin.js';

const isSidekickLibrary = (window.location.href === 'about:srcdoc');

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
    // dreamdata script
    drift.on("emailCapture", function(payload) {
  if (payload.data && payload.data.email && window.analytics) {
      window.analytics.identify(null, {
          email: payload.data.email,
      });
      window.analytics.track("chat_converted");
  }
});
};
/* eslint-enable */

/*
IPStack Integration to get specific user information
Stores dedicated user data in a cookie.
*/
// eslint-disable-next-line import/prefer-default-export
export async function loadUserData() {
  const geolocationData = localStorage.getItem('ipstack:geolocation')
    ? JSON.parse(localStorage.getItem('ipstack:geolocation'))
    : null;

  if (geolocationData && geolocationData.expiry && geolocationData.expiry > new Date().getTime()) {
    return;
  }

  try {
    const response = await fetch('https://api.ipstack.com/check?access_key=7d5a41f8a619751e2548545f56b29dbc', {
      mode: 'cors',
    });

    if (response.ok) {
      const data = await response.json();
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 1); // 1 day TTL
      data.expiry = expiry.getTime();
      localStorage.setItem('ipstack:geolocation', JSON.stringify(data));
      document.dispatchEvent(new CustomEvent('geolocationUpdated'));
    } else {
      throw new Error('Response not okay');
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Could not load user information.', err);
  }
}

// google tag manager
function loadGTM() {
  const scriptTag = document.createElement('script');
  scriptTag.innerHTML = `
  // googleTagManager
  (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({
          'gtm.start':
              new Date().getTime(), event: 'gtm.js'
      });
      var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src =
          'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', 'GTM-MTQV2H');
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('set', {
      'cookie_flags': 'SameSite=None;Secure'
  });
  `;
  document.head.prepend(scriptTag);
}

// Fathom Analytics Code
const attrsFa = JSON.parse('{"data-site": "ZLJXKMGA"}');
loadScript('https://cdn.usefathom.com/script.js', attrsFa);

if (!isSidekickLibrary) {
  sampleRUM('cwv');
  loadUserData();
  if (!window.location.hostname.includes('localhost') && !document.location.hostname.includes('.aem.page')) {
    loadGTM();
  }
  if (!window.location.hostname.includes('localhost') && !document.location.hostname.match('.aem.page') && !document.location.hostname.match('www.moleculardevices.com.cn')) {
    LoadDriftWidget();
  }
}
