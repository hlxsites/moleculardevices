import { fetchFragment } from '../../scripts/scripts.js';
import { div } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const fragmentPaths = [...block.querySelectorAll('a')].map((a) => a.href);
  block.innerHTML = '';
  if (fragmentPaths.length === 0) {
    return '';
  }

  const fragments = {};
  await Promise.all(fragmentPaths.map(async (path) => {
    const fragmentHtml = await fetchFragment(path);
    if (fragmentHtml) {
      const fragmentElement = document.createElement('div');
      fragmentElement.innerHTML = fragmentHtml;
      const headerBlock = fragmentElement.querySelector('h3');
      const pictureBlock = fragmentElement.querySelector('picture');
      const otherChildren = fragmentElement.querySelectorAll('p:not(:has(picture))');
      fragments[path] = {
        headerBlock,
        pictureBlock,
        otherChildren,
      };
    }
  }));

  fragmentPaths.forEach((path) => {
    const fragment = fragments[path];
    if (fragment) {
      const { headerBlock, otherChildren, pictureBlock } = fragment;
      block.append(
        div({ class: 'assay' },
          div({ class: 'assay-content' },
            headerBlock,
            ...otherChildren,
          ),
          div({ class: 'assay-picture' },
            pictureBlock,
          ),
        ),
      );
    }
  });

  return block;
}
