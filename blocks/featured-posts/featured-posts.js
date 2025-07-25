import ffetch from '../../scripts/ffetch.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { a, h3, span } from '../../scripts/dom-helpers.js';

export function createFeaturedArticlePost(div, index, querySheet) {
  const link = div.querySelector('a');
  const postItem = querySheet.find((post) => link.href.indexOf(post.path) >= 0);
  if (postItem) {
    link.textContent = postItem.title;
    link.setAttribute('data-publisher', postItem.publisher);
  }

  div.classList.add('post', `post-${index + 1}`);
  div.firstElementChild.classList.add('zoom-effect-wrapper');
  if (postItem && !div.firstElementChild.querySelector('img')) {
    div.firstElementChild.append(
      a({ href: link.getAttribute('href') },
        createOptimizedPicture(postItem.image, postItem.title, false),
      ),
    );
  } else {
    div.firstElementChild.append(
      a({ href: link.getAttribute('href') }, ...div.firstElementChild.children),
    );
  }

  const textDiv = div.lastElementChild;
  const para = h3(textDiv.firstChild, span(` | ${textDiv.firstChild.getAttribute('data-publisher')}`));
  textDiv.replaceWith(para);
}

export default async function decorate(block) {
  const newsUrls = [...block.querySelectorAll('a')].map((link) => link.href);
  const newsItems = await ffetch('/query-index.json')
    .sheet('publications')
    .chunks(500)
    .filter(({ path }) => newsUrls.find((newsUrl) => newsUrl.indexOf(path) >= 0))
    .all();

  [...block.children].forEach((div, index) => {
    createFeaturedArticlePost(div, index, newsItems);
  });
}
