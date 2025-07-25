import { div } from '../../scripts/dom-helpers.js';
import { fetchFragment, loadScript } from '../../scripts/scripts.js';
import { createCarousel } from '../carousel/carousel.js';
import { createFeaturedArticlePost } from '../featured-posts/featured-posts.js';
import { renderFragment } from '../fragments-carousel/fragments-carousel.js';

function renderItem(item) {
  // createFeaturedArticlePost(div, index, querySheet);
  console.log(item);
  return item;
}

export default async function decorateArticles(block) {
  loadScript('/blocks/featured-posts/featured-posts.js');
  const fragmentPaths = [...block.querySelectorAll('a')].map((a) => new URL(a.href).pathname);
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
        return { html: fragmentElement };
      }
      return null;
    }),
  );

  fragments.forEach((fragment) => {
    renderFragment(fragment.html, block, 'news-article-carousel');
  });

  return createCarousel(
    block,
    fragments.html,
    {
      cssFiles: ['/blocks/featured-posts/featured-posts.css'],
      defaultStyling: true,
      cardStyling: true,
      navButtons: true,
      dotButtons: true,
      infiniteScroll: true,
      autoScroll: false,
      items: 1,
      renderItem,
    },
  );
}
