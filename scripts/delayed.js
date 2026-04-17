// eslint-disable-next-line import/no-cycle
import { sampleRUM, loadScript } from './lib-franklin.js';

const isSidekickLibrary = (window.location.href === 'about:srcdoc');
// start of intercom script for the chatbot
window.intercomSettings = {
    app_id: "kahrndo3"
  };

(function(){
  var w=window;
  var ic=w.Intercom;
  if(typeof ic==="function"){
    ic('reattach_activator');
    ic('update',w.intercomSettings);
  } else {
    var d=document;
    var i=function(){i.c(arguments);};
    i.q=[];
    i.c=function(args){i.q.push(args);};
    w.Intercom=i;
    var l=function(){
      var s=d.createElement('script');
      s.type='text/javascript';
      s.async=true;
      s.src='https://widget.intercom.io/widget/kahrndo3';
      var x=d.getElementsByTagName('script')[0];
      x.parentNode.insertBefore(s,x);
    };
    if(document.readyState==='complete'){l();}
    else if(w.attachEvent){w.attachEvent('onload',l);}
    else{w.addEventListener('load',l,false);}
  }
})();
// end of intercom script for the chatbot
/*
IPStack Integration to get specific user information
Stores dedicated user data in a cookie.
*/
// eslint-disable-next-line import/prefer-default-export
export function loadUserData() {
  requestIdleCallback(async () => {
    const stored = localStorage.getItem('ipstack:geolocation');
    const geolocationData = stored ? JSON.parse(stored) : null;

    if (geolocationData?.expiry > Date.now()) return;

    try {
      const response = await fetch('https://api.ipstack.com/check?access_key=7d5a41f8a619751e2548545f56b29dbc', {
        mode: 'cors',
      });

      if (!response.ok) throw new Error('Response not okay');

      const data = await response.json();
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 1); // 1 day TTL
      data.expiry = expiry.getTime();
      localStorage.setItem('ipstack:geolocation', JSON.stringify(data));
      document.dispatchEvent(new CustomEvent('geolocationUpdated'));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Could not load user information.', err);
    }
  });
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

// SalesForce MCP - start ...

function loadEvergageScript() {
  const script = document.createElement('script');
  if (window.location.host.includes('www.moleculardevices.com')) {
    script.src = 'https://cdn.evgnet.com/beacon/v55685555553mx3rf3h3n3n3i091550196/moldev_prod/scripts/evergage.min.js';
  } else {
    script.src = 'https://cdn.evgnet.com/beacon/v55685555553mx3rf3h3n3n3i091550196/moldev_staging/scripts/evergage.min.js';
  }
  script.onload = function onEvergageLoad() {
  };
  script.onerror = function onEvergageError() {
  };
  document.head.appendChild(script);
}

setTimeout(() => {
  /* eslint-disable */
  if (typeof OnetrustActiveGroups !== 'undefined' && OnetrustActiveGroups.includes('C0004')) {
    loadEvergageScript();
  }
}, 500);

// SalesForce MCP - end

// Fathom Analytics Code
const attrsFa = JSON.parse('{"data-site": "ZLJXKMGA"}');
loadScript('https://cdn.usefathom.com/script.js', attrsFa);

if (!isSidekickLibrary) {
  sampleRUM('cwv');
  loadUserData();
  if (!window.location.hostname.includes('localhost') && !document.location.hostname.includes('.aem.page')) {
    loadGTM();
  }
  /* if (!window.location.hostname.includes('localhost') && !document.location.hostname.match('.aem.page') && !document.location.hostname.match('www.moleculardevices.com.cn')) {
    LoadDriftWidget();
  } */
}
