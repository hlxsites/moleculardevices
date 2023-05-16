import { decorateIcons } from '../../scripts/lib-franklin.js';
import { div, span } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const wrapper = block.parentElement;
  const scroll = (leftScroll) => block.scrollTo({ top: 0, left: leftScroll, behavior: 'smooth' });
  const right = span({ class: 'icon icon-icon_link gallery-button-right' });
  const left = span({ class: 'icon icon-icon_link gallery-button-left' });
  const close = span({ class: 'icon icon-close-circle-outline gallery-button-close' });
  right.addEventListener('click', () => { scroll(block.scrollLeft + wrapper.offsetWidth); });
  left.addEventListener('click', () => { scroll(block.scrollLeft - wrapper.offsetWidth); });
  close.addEventListener('click', () => { 
    wrapper.parentElement.classList.remove('overlay');
    block.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  wrapper.append(close, right, left);
  [...block.children].forEach((row, i) => {
    row.querySelector('img:first-of-type').addEventListener('click', (e) => {
      wrapper.parentElement.classList.add('overlay');
      scroll((wrapper.offsetWidth * (i)));
    });
  });
  await decorateIcons(wrapper);
}
