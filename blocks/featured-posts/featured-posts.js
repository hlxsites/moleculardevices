import ffetch from '../../scripts/ffetch.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { a, h3, span } from '../../scripts/dom-helpers.js';

async function getPostList(type, postUrls) {
  return ffetch('/query-index.json')
    .sheet(type)
    .filter(({ path }) => postUrls.find((postUrl) => postUrl.indexOf(path) >= 0))
    .limit(4)
    .all();
}

export function createFeaturedArticlePost(wrapper, index, type, querySheet) {
  const link = wrapper?.querySelector('a');
  const postItem = querySheet
    .find((post) => new URL(link.href).pathname === post.path);

  if (!postItem) return;

  link.textContent = postItem.title;
  if (postItem.publisher && postItem.publisher !== '0') {
    link.setAttribute('data-publisher', postItem.publisher);
  }

  wrapper.classList.add('post', `post-${index + 1}`);
  wrapper.firstElementChild.classList.add('zoom-effect-wrapper');
  if (postItem && !wrapper.querySelector('img')) {
    wrapper.prepend(a({ href: link.getAttribute('href') },
      createOptimizedPicture(postItem.featuredThumb || postItem.thumbnail, postItem.title, false)));
  } else {
    wrapper.firstElementChild.append(
      a({ href: link.getAttribute('href') }, ...wrapper.firstElementChild.children),
    );
  }

  const textDiv = wrapper.lastElementChild;
  const hasDataPublisher = link.getAttribute('data-publisher');
  const para = hasDataPublisher ? h3(textDiv.firstChild, span(` | ${textDiv.firstChild.getAttribute('data-publisher')}`)) : h3(textDiv.firstChild);
  textDiv.replaceWith(para);
}

export default async function decoratePost(block, postType = '') {
  const anchorList = block.html ? [...block.html.querySelectorAll('a')] : [...block.querySelectorAll('a')];
  const postUrls = anchorList.map((link) => link.href);
  const postUrlsList = await getPostList(postType, postUrls);
  const blockSelector = block.html || block;

  [...blockSelector.children].forEach((wrapper, idx) => {
    createFeaturedArticlePost(wrapper, idx, postType, postUrlsList);
  });
}
