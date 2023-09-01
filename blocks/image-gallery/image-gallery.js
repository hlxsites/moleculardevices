import { decorateIcons } from '../../scripts/lib-franklin.js';
import { div, span } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const body = document.querySelector('body');

  const lightboxOverlay = div({ class: 'image-gallery-lightbox-overlay', 'aria-hidden': true });
  body.append(lightboxOverlay);
  const innerBlock = block.cloneNode(true);

  const right = span({ class: 'icon icon-icon_link gallery-button-right' });
  const left = span({ class: 'icon icon-icon_link gallery-button-left' });
  const close = span({ class: 'icon icon-close-circle-outline gallery-button-close' });
  const lightboxWrapper = div(innerBlock, close, right, left);
  lightboxOverlay.append(lightboxWrapper);

  const childrenLength = block.children.length;
  const scroll = (leftScroll) => {
    let resultingLeftScroll = leftScroll;
    if (leftScroll < 0) {
      resultingLeftScroll = leftScroll + innerBlock.offsetWidth * childrenLength;
    } else if (leftScroll + innerBlock.offsetWidth > innerBlock.offsetWidth * childrenLength) {
      resultingLeftScroll = 0;
    }
    innerBlock.scrollTo({ top: 0, left: resultingLeftScroll, behavior: 'smooth' });
  };

  right.addEventListener('click', () => {
    scroll(innerBlock.scrollLeft + innerBlock.offsetWidth);
  });
  left.addEventListener('click', () => {
    scroll(innerBlock.scrollLeft - innerBlock.offsetWidth);
  });
  close.addEventListener('click', () => {
    lightboxOverlay.setAttribute('aria-hidden', true);
    body.classList.remove('no-scroll');
  });

  innerBlock.querySelectorAll('p.picture:nth-of-type(2)').forEach((element) => {
    element.previousElementSibling.remove();
  });
  [...block.children].slice(5).forEach((row) => {
    block.removeChild(row);
  });

  [...block.children].forEach((row, i) => {
    row.querySelector('img:first-of-type').addEventListener('click', () => {
      body.classList.add('no-scroll');
      lightboxOverlay.removeAttribute('aria-hidden');
      innerBlock.scrollTo({ top: 0, left: innerBlock.offsetWidth * i, behavior: 'instant' });
    });

    row.querySelectorAll('p:not(:first-of-type)').forEach((element) => {
      element.parentElement.removeChild(element);
    });
  });
  await decorateIcons(lightboxOverlay);
}
