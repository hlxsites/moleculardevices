import { fetchFragment } from '../../scripts/scripts.js';

async function getFragmentFromFile(fragmentURL) {
  console.log(fragmentURL);
  const fragment = await fetchFragment(fragmentURL, false);
  return fragment;
}

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


async function decorateSnippet(block, fragmentURL) {
  const fragment = await getFragmentFromFile(fragmentURL);
  block.innerHTML = fragment;
  processScriptNodes(block.parentElement, block);
}

export default async function decorate(block) {
  const url = block.querySelector('a').href;

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