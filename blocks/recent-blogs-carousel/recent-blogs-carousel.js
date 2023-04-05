import ffetch from '../../scripts/ffetch.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { a, div, h3, p } from '../../scripts/dom-helpers.js';
import createCarousel from '../carousel/carousel.js';

function renderItem(item) {
  return (
    div({ class: 'blog-carousel-item' },
      div({ class: 'blog-carousel-thumb' },
        a({ href: item.path },
          createOptimizedPicture(item.image, item.title, 'lazy', [{ width: '800' }]),
        )
      ),
      div({ class: 'blog-carousel-caption' },
        a({ href: item.path },
          h3(item.title),
        ),
        p({ class: 'blog-description' }, item.description),
        p({ class: 'button-container' },
          a({ href: item.path, 'aria-label': 'Read More', class: 'button primary' }, 'Read More'),
        ),
      ),
    )
  );
}

export default async function decorate(block) {
  const blogs = await ffetch('/query-index.json')
    .sheet('blog')
    .limit(6)
    .all();

  console.log(blogs);

  createCarousel(
    block,
    blogs,
    {
      navButtons: true,
      dotButtons: false,
      infiniteScroll: true,
      autoScroll: false,
      visibleItems: [
        {
          items: 1,
          condition: () => window.screen.width < 768,
        },
        {
          items: 2,
          condition: () => window.screen.width < 1200,
        }, {
          items: 3,
        },
      ],
      renderItem,
    },
  );
}
