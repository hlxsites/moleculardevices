import ffetch from '../../scripts/ffetch.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { formatDateUTCSeconds } from '../../scripts/scripts.js';
import { createCarousel } from '../carousel/carousel.js';

function renderItem(item) {
  const newsItem = document.createElement('div');
  newsItem.classList.add('news-carousel-item');

  const newsItemLink = document.createElement('a');
  newsItemLink.href = item.path;
  newsItem.append(newsItemLink);

  const newsThumb = document.createElement('div');
  newsThumb.classList.add('news-carousel-item-thumb');
  newsThumb.append(createOptimizedPicture(item.image, item.title, 'lazy', [{ width: '800' }]));
  newsItemLink.appendChild(newsThumb);

  const newsCaption = document.createElement('div');
  newsCaption.classList.add('news-carousel-caption');

  const newsCaptionText = document.createElement('div');
  newsCaptionText.classList.add('news-carousel-caption-text');
  newsCaptionText.innerHTML = `
    <p>${formatDateUTCSeconds(item.date)}</p>
    <p>${item.title}</p>
  `;

  newsCaption.appendChild(newsCaptionText);
  newsItemLink.appendChild(newsCaption);

  return newsItem;
}

export default async function decorate(block) {
  const newsItems = await ffetch('/query-index.json')
    .sheet('news')
    .chunks(5)
    .limit(5)
    .all();

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
