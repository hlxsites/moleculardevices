import { decorateIcons } from '../../scripts/lib-franklin.js';
import { span } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const wrapper = block.parentElement;
  const body = document.querySelector('body');

  block.querySelectorAll(':scope > div > div > p:nth-of-type(2) > picture').forEach((picture) => {
    picture.parentElement.previousElementSibling.classList.add('thumbnail');
  });

  const scroll = (leftScroll) => {
    let resultingLeftScroll = leftScroll;
    if (leftScroll < 0) {
      resultingLeftScroll = leftScroll + wrapper.offsetWidth * block.children.length;
    } else if (leftScroll + wrapper.offsetWidth > wrapper.offsetWidth * block.children.length) {
      resultingLeftScroll = 0;
    }
    block.scrollTo({ top: 0, left: resultingLeftScroll, behavior: 'smooth' });
  };
  const right = span({ class: 'icon icon-icon_link gallery-button-right' });
  const left = span({ class: 'icon icon-icon_link gallery-button-left' });
  const close = span({ class: 'icon icon-close-circle-outline gallery-button-close' });

  right.addEventListener('click', () => { scroll(block.scrollLeft + wrapper.offsetWidth); });
  left.addEventListener('click', () => { scroll(block.scrollLeft - wrapper.offsetWidth); });
  close.addEventListener('click', () => {
    wrapper.parentElement.classList.remove('overlay');
    body.classList.remove('no-scroll');
    block.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  wrapper.append(close, right, left);
  [...block.children].forEach((row, i) => {
    row.querySelector('img:first-of-type').addEventListener('click', () => {
      wrapper.parentElement.classList.add('overlay');
      body.classList.add('no-scroll');

      block.scrollTo({ top: 0, left: wrapper.offsetWidth * i, behavior: 'instant' });
    });
  });
  await decorateIcons(wrapper);
}
