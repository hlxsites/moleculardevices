import { div } from '../../scripts/dom-helpers.js';
import { fetchFragment } from '../../scripts/scripts.js';
import decoratePost from '../featured-posts/featured-posts.js';
import { createCarousel } from '../carousel/carousel.js';
import { decorateButtons } from '../../scripts/lib-franklin.min.js';

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

// eslint-disable-next-line consistent-return
export default async function decorateArticles(block) {
  const fragmentPaths = [...block.querySelectorAll('a')].map((a) => new URL(a.href).pathname);
  if (fragmentPaths.length === 0) return '';

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting) {
        observer.disconnect();

        block.innerHTML = '';
        const fragments = await Promise.all(
          fragmentPaths.map(async (path) => {
            const fragmentHtml = await fetchFragment(path);
            if (!fragmentHtml) return null;

            const fragmentElement = div();
            fragmentElement.innerHTML = fragmentHtml;

            const fragmentWrapper = div({ class: 'post-wrapper' });
            fragmentWrapper.append(...fragmentElement.children);
            decorateButtons(fragmentWrapper);
            return fragmentWrapper;
          }),
        );

        const validFragments = fragments.filter((f) => f !== null);
        block.append(...validFragments);

        await Promise.all(validFragments.map((wrapper, i) => {
          const postType = i === 0 ? 'publications' : 'blog';
          return decoratePost(wrapper, postType);
        }));

        createCarousel(block, [...block.children], styleConfig);
      }
    });
  }, { rootMargin: '200px' });

  observer.observe(block);
}
