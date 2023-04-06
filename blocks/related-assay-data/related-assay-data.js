import { fetchFragment } from '../../scripts/scripts.js';
import { div, h2 } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const fragmentPaths = [...block.querySelectorAll('a')].map((a) => a.href);
  block.innerHTML = '';
  if (fragmentPaths.length === 0) {
    return '';
  }

  let fragments = await Promise.all(fragmentPaths.map(async (path) => {
    const fragmentHtml = await fetchFragment(path);
    if (fragmentHtml) {
      const fragmentElement = document.createElement('div');
      fragmentElement.innerHTML = fragmentHtml;
      const h1 = fragmentElement.querySelector('h1');
      const { id } = h1;
      const title = h1.textContent;
      const pictureBlock = fragmentElement.querySelector('picture');
      const otherChildren = fragmentElement.querySelectorAll('p:not(:has(picture))');
      return {
        id, title, pictureBlock, otherChildren,
      };
    }
    return null;
  }));
  fragments = fragments.filter((item) => !!item);

  fragments.forEach((fragment) => {
    block.append(
      div({ class: 'assay' },
        div({ class: 'assay-content' },
          h2({ class: 'assay-title', id: fragment.id }, fragment.title),
          ...fragment.otherChildren,
        ),
        div({ class: 'assay-picture' },
          fragment.pictureBlock,
        ),
      ),
    );
  });

  return block;
}
