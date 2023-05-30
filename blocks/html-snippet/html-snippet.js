import { calcEnvironment } from '../../scripts/configs.js';
import { getFragmentFromFile } from '../../scripts/scripts.js';

function loadScript(parentElem, originalElem) {
  const script = document.createElement('script');
  const attributes = originalElem.getAttributeNames();

  for (let i = 0; i < attributes.length; i += 1) {
    const attribute = attributes[i];
    const value = originalElem.getAttribute(attribute);
    script.setAttribute(attribute, value);
  }

  script.setAttribute('type', 'text/javascript'); // force JS

  script.innerHTML = originalElem.innerHTML;

  document.body.appendChild(script);
}

function processScriptNodes(parent, node) {
  const isScriptNode = (node && node.tagName === 'SCRIPT');
  if (isScriptNode) {
    loadScript(parent, node);
  } else {
    const children = [...node.children];
    for (let i = 0; i < children.length; i += 1) {
      processScriptNodes(parent, children[i]);
    }
  }
  return node;
}

const parseUrl = (u) => {
  try {
    const url = new URL(u);
    // only allow https
    if (url.protocol !== 'https:') {
      url.protocol = 'https:';
    }
    return url.href;
  } catch (e) { // fallback in case of malformed URL
    return u;
  }
};

const getSnippetParams = (block, now, timezone) => {
  let fragment = null;
  let fallback = null;

  // Read every row
  block.querySelectorAll(':scope>div').forEach((row) => {
    const cols = [...row.children];
    if (cols.length === 2) {
      const date = cols[0].textContent.trim();
      const url = parseUrl(cols[1].textContent.trim());

      const split = date.split('-');
      // Date is a range
      if (split.length === 2) {
        const from = Date.parse(`${split[0].trim()} ${timezone}`);
        const to = Date.parse(`${split[1].trim()} ${timezone}`);
        if (now >= from && now <= to) {
          fragment = url;
        }

        // Single date
      } else if (date !== '') {
        const from = Date.parse(`${date.trim()} ${timezone}`);
        if (now >= from) {
          fragment = url;
        }

        // No date, use as fallback
      } else {
        fallback = url;
      }
    }

    // No date, this will be the fallback
    if (cols.length === 1) {
      const url = parseUrl(cols[0].textContent);
      fallback = url;
    }
  });

  if (fragment) {
    return fragment;
  }
  return fallback;
};

async function decorateSnippet(block, fragmentURL) {
  const fragment = await getFragmentFromFile(fragmentURL);
  block.innerHTML = fragment.innerHTML;
  processScriptNodes(block, fragment);
}

export default async function decorate(block) {
  // Time zone the dates are in
  const timezone = 'EDT';

  // Current date
  let now = Date.now();

  const environment = calcEnvironment();
  if (environment === 'dev' || environment === 'stage') {
    // Check query parameter override
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('date')) {
      now = urlParams.get('date');
    }
  }

  const url = getSnippetParams(block, now, timezone);

  if (!url) {
    block.textContent = '';
    console.warn('no snippet found');
    return;
  }

  try {
    await decorateSnippet(block, url);
  } catch (e) {
    block.textContent = '';
    console.warn(`cannot load snippet at ${url}: ${e}`);
  }
}