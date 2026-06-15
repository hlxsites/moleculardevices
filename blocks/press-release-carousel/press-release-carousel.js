/* eslint-disable linebreak-style */
import {
  a, article, div, domEl, h3, h4, p,
} from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.min.js';
import { getData } from '../../scripts/scripts.js';
import { createCarousel } from '../carousel/carousel.js';

function renderItem(item) {
  const pressItem = div({ class: 'press-carousel-item' },
    h4('PRESS RELEASES'),
    h3(item.title),
    div({ class: 'columns-wrapper' },
      div({ class: 'columns columns-2-cols' },
        div({ class: 'columns-row' },
          article({ class: 'columns-col columns-text-col' }, p(item.description), a({ href: item.path, class: 'button secondary' }, 'Read Press Release')),
          domEl('figure', { class: 'columns-col columns-img-col' }, createOptimizedPicture(item.image, item.title, 'lazy', [{ width: '800' }])),
        ),
      ),
    ),
  );

  return pressItem;
}

export default async function decorate(block) {
  const data = await getData();
  const news = data.news.slice(0, 5);

  await createCarousel(
    block,
    news,
    {
      navButtons: true,
      dotButtons: true,
      infiniteScroll: true,
      autoScroll: false,
      defaultStyling: true,
      hasImageInDots: true,
      renderItem,
    },
  );
}
