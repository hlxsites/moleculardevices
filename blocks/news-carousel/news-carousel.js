import { a, div, p } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { formatDate, unixDateToString } from '../../scripts/scripts.js';
import { createCarousel } from '../carousel/carousel.js';
import { getNewsData } from '../news/news.js';

function renderItem(item) {
  const newsItem = div({ class: 'news-carousel-item' },
    a({ href: item.path },
      div({ class: 'news-carousel-item-thumb' },
        createOptimizedPicture(item.image, item.title, 'lazy', [{ width: '800' }]),
      ),
      div({ class: 'news-carousel-caption' },
        div({ class: 'news-carousel-caption-text' },
          p(formatDate(unixDateToString(item.date))),
          p(item.title),
        ),
      ),
    ),
  );

  return newsItem;
}

export default async function decorate(block) {
  const newsItems = await getNewsData(5);

  await createCarousel(
    block,
    newsItems,
    {
      defaultStyling: true,
      navButtons: true,
      dotButtons: false,
      infiniteScroll: false,
      autoScroll: false,
      visibleItems: [
        { items: 1, condition: (width) => width < 768 },
        { items: 2, condition: (width) => width < 1200 },
        { items: 3 },
      ],
      renderItem,
    },
  );
}
