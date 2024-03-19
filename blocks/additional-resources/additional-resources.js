import { fetchFragment } from '../../scripts/scripts.js';
import { div } from '../../scripts/dom-helpers.js';

async function renderFragment(fragment, block, className) {
  fragment.classList.add(className);
  const primaryButton = fragment.querySelector('div > p strong > a:only-child');
  const secondaryButton = fragment.querySelector('div > p em > a:only-child');

  if (primaryButton && secondaryButton) {
    primaryButton.closest('p').classList.add('button-container');
    secondaryButton.closest('p').classList.add('button-container');
  }

  if (primaryButton) {
    primaryButton.classList.add('button', 'primary');
  }
  if (secondaryButton) {
    secondaryButton.classList.add('button', 'secondary');
  }
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
