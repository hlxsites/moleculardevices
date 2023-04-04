import ffetch from '../../scripts/ffetch.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import createCarousel from '../carousel/carousel.js';

function renderItem(item) {
  const newsItem = document.createElement('div');
  newsItem.classList.add('blog-carousel-item');

  const newsItemLink = document.createElement('a');
  newsItemLink.href = item.path;
  newsItem.append(newsItemLink);

  const newsThumb = document.createElement('div');
  newsThumb.classList.add('blog-carousel-thumb');
  newsThumb.append(createOptimizedPicture(item.image, item.title, 'lazy', [{ width: '800' }]));
  newsItemLink.appendChild(newsThumb);

  const newsCaption = document.createElement('div');
  newsCaption.classList.add('blog-carousel-caption');

  newsCaption.innerHTML = `
    <h3>${item.title}</h3>
    <p class="blog-description">${item.description}</p>
    <p class="button-container">
      <a href=${item.path} aria-label="Read More" class="button primary">Read More</a>
    </p>
  `;

  newsItemLink.appendChild(newsCaption);

  return newsItem;
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
