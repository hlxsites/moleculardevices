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
  if (!isBlogPage) return;

  const isHeading = (el) => el?.nodeType === Node.ELEMENT_NODE && /^H[1-6]$/.test(el.tagName);

  const parent = block?.parentElement;
  const prevEl = parent?.previousElementSibling;
  const nextEl = parent?.nextElementSibling;

  if (isHeading(prevEl?.lastElementChild)) {
    block.classList.add('no-margin-top');
  }

  if (isHeading(nextEl?.firstElementChild)) {
    block.classList.add('no-margin-bottom');
  }
}
