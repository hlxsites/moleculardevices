import { getMetadata } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const isBlogPage = getMetadata('template') === 'Blog';
  const authorIntroWrapper = block.querySelector(':scope > div');
  const intro = block.querySelector(':scope > div > div:first-child');
  const authorImg = intro.querySelector('img');
  authorIntroWrapper.classList.add('author-intro-content-wrapper');
  intro.classList.add('author-intro-content');
  authorImg.classList.add('author-intro-image');

  /* remove extra margin */
  if (isBlogPage) {
    const prevEl = block.parentElement.previousElementSibling;
    const nextEl = block.parentElement.nextElementSibling;
    if (prevEl.lastChild.nodeName === 'H1' || prevEl.lastChild.nodeName === 'H2' || prevEl.lastChild.nodeName === 'H3' || prevEl.lastChild.nodeName === 'H4' || prevEl.lastChild.nodeName === 'H5' || prevEl.lastChild.nodeName === 'H6') {
      block.classList.add('no-margin-top');
    }
    if (nextEl.firstChild.nodeName === 'H1' || nextEl.firstChild.nodeName === 'H2' || nextEl.firstChild.nodeName === 'H3' || nextEl.firstChild.nodeName === 'H4' || nextEl.firstChild.nodeName === 'H5' || nextEl.firstChild.nodeName === 'H6') {
      block.classList.add('no-margin-bottom');
    }
  }
}
