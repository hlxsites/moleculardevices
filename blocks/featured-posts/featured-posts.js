/* eslint-disable no-console */
import ffetch from '../../scripts/ffetch.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { a, div, span } from '../../scripts/dom-helpers.js';

async function getPostList(type, postUrls) {
  return ffetch('/query-index.json')
    .sheet(type)
    .filter(({ path }) => postUrls.find((postUrl) => postUrl.indexOf(path) >= 0))
    .limit(4)
    .all();
}

function isParamExist(property) {
  if (property && property !== '0') return property;
  return false;
}

export function createFeaturedArticlePost(wrapper, index, querySheet) {
  const link = wrapper?.querySelector('a');
  const postWrapper = wrapper.parentElement;
  const postItem = querySheet.find((post) => new URL(link.href).pathname === post.path);

  if (!postItem) {
    console.warn('No matching post found for link:', link.href);
    return;
  }

  const {
    h1, title, publisher, path, image, thumbnail,
  } = postItem;

  link.textContent = h1 || title;
  postWrapper.classList.add('post', `post-${index + 1}`);

  const existingPicture = postWrapper.querySelector('picture');
  const imgSrc = existingPicture?.querySelector('img')?.src || thumbnail || image;
  if (existingPicture) existingPicture.parentElement.remove();

  if (imgSrc) {
    const imgAnchor = a({ href: path }, createOptimizedPicture(imgSrc, title));
    const zoomWrapper = div({ class: 'zoom-effect-wrapper' }, imgAnchor);
    postWrapper.prepend(zoomWrapper);
  }

  if (isParamExist(publisher)) link.setAttribute('data-publisher', publisher);

  const dataPublisher = link.getAttribute('data-publisher');
  if (dataPublisher) wrapper.appendChild(span(` | ${dataPublisher}`));
}

export default async function decoratePost(block, postType = '') {
  const anchorList = block.querySelectorAll('a');
  const postUrls = [...anchorList].map((link) => link.href);
  const postUrlsList = await getPostList(postType, postUrls);

  anchorList.forEach((link, idx) => {
    const wrapper = link.closest('div') || link.parentElement;
    createFeaturedArticlePost(wrapper, idx, postUrlsList);
  });
}
