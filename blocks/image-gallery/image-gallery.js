import { decorateIcons } from '../../scripts/lib-franklin.js';
import { div, span } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const wrapper = block.parentElement;
  const body = document.querySelector('body');

  const lightboxOverlay = div({ class: 'image-gallery-lightbox-overlay', 'aria-hidden': true });
  body.append(lightboxOverlay);
  const lightboxWrapper = div(block.cloneNode(true));
  lightboxOverlay.append(lightboxWrapper);
  const innerBlock = lightboxOverlay.querySelector('.block');

  const childrenLength = block.children.length;
  const scroll = (leftScroll) => {
    let resultingLeftScroll = leftScroll;
    if (leftScroll < 0) {
      resultingLeftScroll = leftScroll + lightboxOverlay.offsetWidth * childrenLength;
    } else if (leftScroll + lightboxOverlay.offsetWidth > lightboxOverlay.offsetWidth * childrenLength) {
      resultingLeftScroll = 0;
    }
    lightboxOverlay.scrollTo({ top: 0, left: resultingLeftScroll, behavior: 'smooth' });
  };
  const right = span({ class: 'icon icon-icon_link gallery-button-right' });
  const left = span({ class: 'icon icon-icon_link gallery-button-left' });
  const close = span({ class: 'icon icon-close-circle-outline gallery-button-close' });

  right.addEventListener('click', () => { scroll(lightboxOverlay.scrollLeft + lightboxOverlay.offsetWidth); });
  left.addEventListener('click', () => { scroll(lightboxOverlay.scrollLeft - lightboxOverlay.offsetWidth); });
  close.addEventListener('click', () => {
    lightboxOverlay.setAttribute('aria-hidden', true);
    body.classList.remove('no-scroll');
    // block.scrollIntoView({ behavior: 'instant', block: 'center' });
  });

  [...block.children].forEach((row, i) => {
    row.classList.add(`potato-${i}`);
  });

  lightboxWrapper.append(close, right, left);

  lightboxOverlay.querySelectorAll(':scope > div > div > p.picture:nth-of-type(2)').forEach((element) => {
    element.remove();
  });
  [...block.children].slice(5).forEach((row) => {
    block.removeChild(row);
  });

  [...block.children].forEach((row, i) => {
    row.querySelector('img:first-of-type').addEventListener('click', () => {
      body.classList.add('no-scroll');
      lightboxOverlay.removeAttribute('aria-hidden');


      console.log('overlay offset width', lightboxOverlay.offsetWidth);
      console.log('actual overlay offset width', innerBlock.offsetWidth);
      console.log('i', i);
      innerBlock.scrollTo({ top: 0, left: innerBlock.offsetWidth * i, behavior: 'instant' });
      console.log('clicked');
    });
  });
  await decorateIcons(wrapper);
}
