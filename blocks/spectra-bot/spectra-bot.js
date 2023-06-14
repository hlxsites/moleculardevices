import { div } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const textDiv = block.querySelector('div:nth-child(1)');
  textDiv.classList.add('text-over');

  const fgImg = block.querySelector('div:nth-child(2)');
  fgImg.classList.add('foreground-img');

  const bgImg = block.querySelector('div:nth-child(3)');
  bgImg.classList.add('background-img');

  const bubbleWrapper = div({ class: 'bubble-wrapper' }, textDiv, fgImg);

  block.innerHTML = '';

  // Append the elements in the new order, adding new classes as necessary
  block.appendChild(bubbleWrapper);
  block.appendChild(bgImg);
}
