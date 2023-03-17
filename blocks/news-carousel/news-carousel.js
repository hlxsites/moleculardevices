import ffetch from '../../scripts/ffetch.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import createCarousel from '../carousel/carousel.js';


/* 
{
  "path": "/newsroom/news/mds-analytical-technologies-launches-molecular-devices-spectramax-m3-and-m4-multi-mode",
  "title": "MDS Analytical Technologies launches Molecular Devices SpectraMax M3 and M4 multi-mode microplate readers",
  "image": "/default-meta-image.png?width=1200&format=pjpg&optimize=medium",
  "description": "SUNNYVALE, CA, December 16, 2009 - MDS Analytical Technologies, a leader in innovative solutions for drug discovery and life-sciences research, today announced the launch of ...",
  "type": "News",
  "relatedProducts": "0",
  "relatedTechnologies": "0",
  "relatedApplications": "0",
  "gated": "0",
  "gatedURL": "0",
  "date": "1260921600",
  "lastModified": "1679044315",
  "robots": "0"
}
*/

function formatDate(newsDate) {
  newsDate += '000'; //TODO
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
    'Dec'
  ];

  const dateObj = new Date(+newsDate);
  return `${months[dateObj.getMonth()]} ${dateObj.getDay()}, ${dateObj.getFullYear()}`
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
  `

  const newsCaptionCTA = document.createElement('div');
  newsCaptionCTA.classList.add('news-carousel-caption-cta');

  const newsCaptionButton = document.createElement('a');
  newsCaptionButton.href = item.path;
  newsCaptionButton.innerHTML = '&nbsp;'
  newsCaptionCTA.appendChild(newsCaptionButton);

  newsCaption.appendChild(newsCaptionText);
  newsCaption.appendChild(newsCaptionButton);
  newsItem.appendChild(newsCaption);

  return newsItem;
}

export default async function decorate(block) {
  const newsItems = await ffetch('/query-index.json')
    .withFetch(fetch)
    .sheet('resource-news')
    .limit(5)
    .all();


  createCarousel({ block, data: newsItems, renderItem, 
    config: {
      navButtons: true,
      dotButtons: false,
      infiniteScroll: false,
      autoScroll: false
    }
  });
}
