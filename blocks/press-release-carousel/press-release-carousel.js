/* eslint-disable linebreak-style */
import {
  a, div, h3, h4, p,
} from '../../scripts/dom-helpers.js';
import ffetch from '../../scripts/ffetch.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { createCarousel } from '../carousel/carousel.js';

function renderItem(item) {
  const pressItem = div({ class: 'press-carousel-item' },
    h4('PRESS RELEASES'),
    h3(item.title),
    div({ class: 'columns-wrapper' },
      div({ class: 'columns columns-2-cols' },
        div(
          div(p(item.description), a({ href: item.path, class: 'button secondary' }, 'Read Press Release')),
          div(div({ class: 'press-carousel-item-thumb' }, createOptimizedPicture(item.image, item.title, 'lazy', [{ width: '800' }]))),
        ),
      ),
    ),
  );

  return pressItem;
}

export default async function decorate(block) {
  const pressItems = await ffetch('/query-index.json')
    .sheet('news')
    .chunks(5)
    .limit(5)
    .all();

  await createCarousel(
    block,
    pressItems,
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
