import { div } from '../../scripts/dom-helpers.js';
import { fetchFragment } from '../../scripts/scripts.js';
import decoratePost from '../featured-posts/featured-posts.js';
import { createCarousel } from '../carousel/carousel.js';
import { decorateButtons } from '../../scripts/lib-franklin.js';

const styleConfig = {
  cssFiles: ['/blocks/featured-posts/featured-posts.css'],
  defaultStyling: true,
  navButtons: true,
  dotButtons: true,
  infiniteScroll: true,
  autoScroll: false,
  visibleItems: [
    { items: 1 },
  ],
};

async function renderFragment(fragment, block, postType) {
  const fragmentWrapper = div({ class: 'post-wrapper' });
  fragmentWrapper.append(...fragment.html.children);
  decorateButtons(fragmentWrapper);
  block.append(fragmentWrapper);
  await decoratePost(fragmentWrapper, postType);
}

export default async function decorateArticles(block) {
  const fragmentPaths = [...block.querySelectorAll('a')].map((a) => new URL(a.href).pathname);
  if (fragmentPaths.length === 0) return '';

  block.innerHTML = '';
  const fragments = await Promise.all(
    fragmentPaths.map(async (path) => {
      const fragmentHtml = await fetchFragment(path);
      if (!fragmentHtml) return null;

      const fragmentElement = div();
      fragmentElement.innerHTML = fragmentHtml;
      return { html: fragmentElement };
    }),
  );

  for (let i = 0; i < fragments.length; i += 1) {
    const fragment = fragments[i];
    const postType = i === 0 ? 'publications' : 'blog';
    // eslint-disable-next-line no-await-in-loop
    await renderFragment(fragment, block, postType);
  }

  return createCarousel(block, [...block.children], styleConfig);
}
