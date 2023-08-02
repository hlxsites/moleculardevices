import ffetch from '../../scripts/ffetch.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { a } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const newsUrls = [...block.querySelectorAll('a')].map((link) => link.href);
  const newsItems = await ffetch('/query-index.json')
    .chunks(500)
    .filter(({ path }) => newsUrls.find((newsUrl) => newsUrl.indexOf(path) >= 0))
    .all();

  [...block.children].forEach((div, index) => {
    const link = div.querySelector('a');
    const newsItem = newsItems.find((news) => link.href.indexOf(news.path) >= 0);
    if (newsItem) {
      link.textContent = newsItem.title;
    }

    div.classList.add(`post-${index + 1}`);
    div.firstElementChild.classList.add('zoom-effect-wrapper');
    if (newsItem && !div.firstElementChild.querySelector('img')) {
      div.firstElementChild.append(
        a({ href: link.getAttribute('href') },
          createOptimizedPicture(newsItem.image, newsItem.title, false),
        ),
      );
    } else {
      div.firstElementChild.append(
        a({ href: link.getAttribute('href') }, ...div.firstElementChild.children),
      );
    }

    const textDiv = div.lastElementChild;
    const p = document.createElement('p');
    p.innerHTML = textDiv.innerHTML;
    textDiv.replaceWith(p);
  });
}
