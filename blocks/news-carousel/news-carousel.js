import ffetch from '../../scripts/ffetch.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import createCarousel from '../carousel/carousel.js';

function formatDate(newsDate) {
  newsDate += '000'; // TODO
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const dateObj = new Date(+newsDate);
  return `${months[dateObj.getMonth()]} ${dateObj.getDay()}, ${dateObj.getFullYear()}`;
}

function renderItem(item) {
  const newsItem = document.createElement('div');
  newsItem.classList.add('news-carousel-item');

  const newsThumb = document.createElement('div');
  newsThumb.classList.add('news-carousel-item-thumb');
  // TODO optimise image sizes
  newsThumb.append(createOptimizedPicture(item.image, item.title, 'lazy'));
  newsItem.appendChild(newsThumb);

  const newsCaption = document.createElement('div');
  newsCaption.classList.add('news-carousel-caption');

  const newsCaptionText = document.createElement('div');
  newsCaptionText.classList.add('news-carousel-caption-text');
  newsCaptionText.innerHTML = `
    <p>${formatDate(item.date)}</p>
    <p>${item.title}</p>
  `;

  const newsCaptionCTA = document.createElement('div');
  newsCaptionCTA.classList.add('news-carousel-caption-cta');

  const newsCaptionButton = document.createElement('a');
  newsCaptionButton.href = item.path;
  newsCaptionButton.innerHTML = '&nbsp;';
  newsCaptionCTA.appendChild(newsCaptionButton);

  newsCaption.appendChild(newsCaptionText);
  newsCaption.appendChild(newsCaptionCTA);
  newsItem.appendChild(newsCaption);

  return newsItem;
}

export default async function decorate(block) {
  const newsItems = await ffetch('/query-index.json')
    .withFetch(fetch)
    .sheet('resource-news')
    .limit(5)
    .all();

  createCarousel(
    block,
    newsItems,
    {
      navButtons: true,
      dotButtons: false,
      infiniteScroll: false,
      autoScroll: false,
      visibleItems: 3,
      renderItem,
    }
  );
}
