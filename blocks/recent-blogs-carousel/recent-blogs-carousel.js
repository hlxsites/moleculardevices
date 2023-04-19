import ffetch from '../../scripts/ffetch.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
// eslint-disable-next-line object-curly-newline
import { a, div, h3, p } from '../../scripts/dom-helpers.js';
import createCarousel from '../carousel/carousel.js';

function summariseDescription(description) {
  let result = description;
  if (result.length > 75) {
    result = result.substring(0, 75);
    const lastSpaceIndex = result.lastIndexOf(' ');
    if (lastSpaceIndex !== -1) {
      result = result.substring(0, lastSpaceIndex);
    }
  }
  return `${result}…'`;
}

function renderItem(item) {
  const itemImage = item.thumbnail && item.thumbnail !== '0' ? item.thumbnail : item.image;
  const buttonText = item.cardC2A && item.cardC2A !== '0' ? item.cardC2A : 'Read More';

  return (
    div({ class: 'blog-card' },
      div({ class: 'blog-card-thumb' },
        a({ href: item.path },
          createOptimizedPicture(itemImage, item.title, 'lazy', [{ width: '800' }]),
        ),
      ),
      div({ class: 'blog-card-caption' },
        h3(
          a({ href: item.path }, item.title),
        ),
        p({ class: 'blog-card-description' }, summariseDescription(item.description)),
        p({ class: 'button-container' },
          a({ href: item.path, 'aria-label': buttonText, class: 'button primary' }, buttonText),
        ),
      ),
    )
  );
}

export default async function decorate(block) {
  let blogs = await ffetch('/query-index.json')
    .sheet('blog')
    .limit(6)
    .all();
  blogs = blogs.filter((blog) => blog.path !== window.location.pathname).slice(0, 5);

  await createCarousel(
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
