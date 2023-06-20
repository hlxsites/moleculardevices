// eslint-disable-next-line object-curly-newline
import { div, ul, li, span } from '../../scripts/dom-helpers.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';

function activeItem(slider, item, diff) {
  const carousel = slider.closest('.block').querySelector('.carousel');
  // eslint-disable-next-line no-param-reassign
  if (!item) item = slider.querySelector('li.active');
  const itemsArray = Array.from(item.parentElement.children);
  let index = itemsArray.indexOf(item);
  if (diff) index += diff;
  if (index > (itemsArray.length - 1)) index = 0;
  if (index < 0) index = (itemsArray.length - 1);
  [...item.closest('ul').querySelectorAll('li')].forEach((sliderItem, i) => {
    sliderItem.classList.remove('active');
    if (i === index) sliderItem.classList.add('active');
  });
  const scroll = (leftScroll) => carousel.scrollTo({ top: 0, left: leftScroll, behavior: 'smooth' });
  scroll(500 * index);
}

export default async function decorate(block) {
  const heroSection = block.closest('main').querySelector('.section.hero-container, .section.hero-advanced-container');
  heroSection.appendChild(block.parentElement);
  const carousel = div({ class: 'carousel' });
  const slider = div({ class: 'slider' }, div('Featured Highlights'));
  const sliderInner = slider.querySelector('div');
  const left = span({ class: 'icon icon-icon_link icon-flip' });
  const right = span({ class: 'icon icon-icon_link' });
  sliderInner.prepend(left);
  sliderInner.append(right, ul());
  [...block.children].forEach((row, i) => {
    carousel.appendChild(row);
    const sliderDot = li();
    if (i === 0) sliderDot.classList.add('active');
    slider.querySelector('ul').append(sliderDot);
    sliderDot.addEventListener('click', (e) => {
      activeItem(slider, e.target, null);
    });
  });
  block.appendChild(slider);
  block.appendChild(carousel);
  decorateIcons(block);

  left.addEventListener('click', () => { activeItem(slider, null, -1); });
  right.addEventListener('click', () => { activeItem(slider, null, +1); });
}
