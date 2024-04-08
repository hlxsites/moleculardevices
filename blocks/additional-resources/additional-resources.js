import { fetchFragment } from '../../scripts/scripts.js';
import { div } from '../../scripts/dom-helpers.js';
import { decorateButtons } from '../../scripts/lib-franklin.js';

async function renderFragment(fragment, block, className) {
  fragment.classList.add(className);
  decorateButtons(fragment);
  block.append(fragment);
}

export default async function decorate(block) {
  const fragmentPaths = [...block.querySelectorAll('a')].map((a) => a.href);
  block.innerHTML = '';

  if (fragmentPaths.length === 0) {
    return '';
  }

  const fragments = await Promise.all(
    fragmentPaths.map(async (path) => {
      const fragmentHtml = await fetchFragment(path);
      if (fragmentHtml) {
        const fragmentElement = div();
        fragmentElement.innerHTML = fragmentHtml;
        const img = fragmentElement.querySelector('picture');
        const imgAnchor = img.nextElementSibling;
        if (imgAnchor) {
          imgAnchor.innerHTML = '';
          imgAnchor.appendChild(img);
        }
        return { html: fragmentElement };
      }
      return null;
    }),
  );

  const apps = div({ class: 'additional-resources-container' });

  fragments.forEach((fragment) => {
    renderFragment(fragment.html, apps, 'additional-resource');
  });

  block.append(apps);

  return block;
}
