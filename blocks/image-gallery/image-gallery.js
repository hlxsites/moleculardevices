import { decorateIcons } from '../../scripts/lib-franklin.js';
import { div, span } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  block.parentElement.classList.add('preview');
  const overlayContent = div({ class: 'overlay-content'});
  block.parentElement.appendChild(overlayContent);
  overlayContent.appendChild(block);

  [...block.children].forEach((row, i) => {
    const img = row.querySelector('img:first-of-type');
    img.addEventListener('click', () => {
      block.parentElement.parentElement.classList.add('overlay');
      block.parentElement.parentElement.classList.remove('preview');
    });
  });

  const close = span({ class: 'icon icon-close-circle-outline gallery-button-close' });
  close.addEventListener('click', () => {
    block.parentElement.parentElement.classList.remove('overlay');
    block.parentElement.parentElement.classList.add('preview');
  });

  const right = span({ class: 'icon icon-icon_link gallery-button-right' });
  const left = span({ class: 'icon icon-icon_link gallery-button-left' });
  const scroll = (leftScroll) => block.scrollTo({ top: 0, left: leftScroll, behavior: 'smooth' });
  right.addEventListener('click', () => { scroll(block.scrollLeft + block.parentElement.offsetWidth); });
  left.addEventListener('click', () => { scroll(block.scrollLeft - block.parentElement.offsetWidth); });

  block.parentElement.append(close, right, left);

  await decorateIcons(block.parentElement);
}
