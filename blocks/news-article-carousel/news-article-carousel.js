import { div } from '../../scripts/dom-helpers.js';
import { fetchFragment } from '../../scripts/scripts.js';
import { createCarousel } from '../carousel/carousel.js';
import decoratePost from '../featured-posts/featured-posts.js';

const styleConfig = {
  defaultStyling: true,
  navButtons: true,
  dotButtons: true,
  infiniteScroll: true,
  autoScroll: false,
  counter: true,
  counterText: 'Product',
  visibleItems: [
    {
      items: 1,
    },
  ],
};

export default async function decorateArticles(block) {
  const fragmentPaths = [...block.querySelectorAll('a')].map((a) => new URL(a.href).pathname);
  block.innerHTML = '';
  if (fragmentPaths.length === 0) return '';

  const fragments = await Promise.all(
    fragmentPaths.map(async (path) => {
      const fragmentHtml = await fetchFragment(path);
      if (!fragmentHtml) return '';

      if (fragmentHtml) {
        const fragmentElement = div();
        fragmentElement.innerHTML = fragmentHtml;
        return { html: fragmentElement };
      }
      return null;
    }),
  );

  fragments.forEach((fragment, index = 0) => {
    const postType = index === 0 ? 'publications' : 'blog';
    decoratePost(fragment, postType);
  });

  // setInterval(async () => {
  //   if (block.getAttribute('[data-block-status="loaded"]')) {
  //     clearInterval(setInterval);
  //     setTimeout(async () => {
  //       await createCarousel(block, [...block.children], styleConfig);
  //       console.log(block);
  //     }, 1000);
  //   }
  // }, 50);

  return '';
}
