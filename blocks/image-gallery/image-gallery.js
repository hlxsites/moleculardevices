import { decorateIcons } from '../../scripts/lib-franklin.js';
import { div, span } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const wrapper = block.parentElement;
  wrapper.classList.add('preview');
  const overlayContent = div({ class: 'overlay-content'});
  wrapper.appendChild(overlayContent);
  overlayContent.appendChild(block);

  const scroll = (leftScroll) => block.scrollTo({ top: 0, left: leftScroll, behavior: 'smooth' });
  const right = span({ class: 'icon icon-icon_link gallery-button-right' });
  const left = span({ class: 'icon icon-icon_link gallery-button-left' });
  right.addEventListener('click', () => { scroll(block.scrollLeft + overlayContent.offsetWidth); });
  left.addEventListener('click', () => { scroll(block.scrollLeft - overlayContent.offsetWidth); });

  [...block.children].forEach((row, i) => {
    const img = row.querySelector('img:first-of-type');
    img.addEventListener('click', (e) => {
      wrapper.classList.add('overlay');
      wrapper.classList.remove('preview');
      scroll((overlayContent.offsetWidth * (i)));
    });
  });

  const close = span({ class: 'icon icon-close-circle-outline gallery-button-close' });
  close.addEventListener('click', () => {
    wrapper.classList.remove('overlay');
    wrapper.classList.add('preview');
  });
  overlayContent.append(close, right, left);
  await decorateIcons(block.parentElement);
}
