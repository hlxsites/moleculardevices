/*
 * Fragment Block
 * Include content from one Helix page in another.
 * https://www.aem.live/developer/block-collection/fragment
 */

import { decorateMain } from '../../scripts/scripts.js';

import { loadBlocks } from '../../scripts/lib-franklin.js';

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} The root element of the fragment
 */
export async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.classList.add('fragment');
      main.innerHTML = await resp.text();
      await decorateMain(main);
      await loadBlocks(main);
      return main;
    }
  }
  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (fragment) {
    const fragmentSection = fragment.querySelector(':scope .section');
    if (fragmentSection) {
      const section = block.closest('.section');
      section.classList.add(...fragmentSection.classList);

      section.style.background = fragmentSection.style.background
        ? fragmentSection.style.background
        : section.style.background;

      section.style.backgroundImage = fragmentSection.style.backgroundImage
        ? fragmentSection.style.backgroundImage
        : section.style.background;

      block.closest('.fragment-wrapper').replaceWith(...fragmentSection.childNodes);
    }
  }
}
