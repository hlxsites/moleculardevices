import { decorateIcons } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  // console.log('decorating image-gallery', block);

  block.classList.add('preview');
  [...block.children].forEach((row, i) => {
    const img = row.querySelector('img:first-of-type');
    img.addEventListener('click', () => {
      block.classList.add('overlay');
      block.classList.remove('preview');
    });
  });
  block.prepend(span({ class: 'icon icon-close-circle-outline gallery-button-close' }));
  block.prepend(span({ class: 'icon icon-icon_link gallery-button-right' }));
  block.prepend(span({ class: 'icon icon-icon_link gallery-button-left' }));

  const body = document.querySelector('body');

  // for burron event listener example see hero-advanced.js line 31 etc..

  block.querySelector('.gallery-button-left').addEventListener('click', () => {
    const visiblePicture = block.querySelector('.gallery > div:not([aria-hidden="true"])');
    const previousPicture = visiblePicture.previousElementSibling;

    visiblePicture.setAttribute('aria-hidden', true);
    if (previousPicture) {
      previousPicture.removeAttribute('aria-hidden');
    } else {
      visiblePicture.parentNode.lastElementChild.removeAttribute('aria-hidden');
    }
  });

  block.querySelector('.gallery-button-right').addEventListener('click', () => {
    const visiblePicture = block.querySelector('.gallery > div:not([aria-hidden="true"])');
    const nextPicture = visiblePicture.nextElementSibling;

    visiblePicture.setAttribute('aria-hidden', true);
    if (nextPicture) {
      nextPicture.removeAttribute('aria-hidden');
    } else {
      visiblePicture.parentNode.firstElementChild.removeAttribute('aria-hidden');
    }
  });

  block.querySelector('.gallery-button-close').addEventListener('click', () => {
    body.classList.remove('no-scroll');
    block.setAttribute('aria-hidden', true);
    const visiblePicture = block.querySelector('.gallery > div:not([aria-hidden="true"])');
    visiblePicture.setAttribute('aria-hidden', true);
  });

  await decorateIcons(block);
}
