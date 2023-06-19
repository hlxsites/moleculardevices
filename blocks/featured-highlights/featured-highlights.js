// eslint-disable-next-line object-curly-newline
import { div, ul, li, span } from '../../scripts/dom-helpers.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';

function activeItem(slider, item, diff) {
  const carousel = slider.closest('.block').querySelector('.carousel');
  // eslint-disable-next-line no-param-reassign
  if (!item) item = slider.querySelector('li.active');
  [...item.closest('ul').querySelectorAll('li')].forEach((sliderItem) => {
    sliderItem.classList.remove('active');
    item.classList.add('active');
  });
  let index = Array.from(item.parentElement.children).indexOf(item);
  if (diff) index += diff;
  const scroll = (leftScroll) => carousel.scrollTo({ top: 0, left: leftScroll, behavior: 'smooth' });
  scroll(450 * index);
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
  decorateIcons(slider);
  block.appendChild(slider);
  block.appendChild(carousel);

  left.addEventListener('click', () => { activeItem(slider, null, -1); });
  right.addEventListener('click', () => { activeItem(slider, null, +1); });
}
