import { div } from '../../scripts/dom-helpers.js';

function decorateBubbleWrapper(elem) {
  elem.classList.add('bubble-wrapper');

  elem.querySelector(':scope > div:first-child')
    .classList
    .add('text-over');

  const bubbleSrc = elem.querySelector(':scope > div:last-child img').src;
  elem.style = `background-image: url(${bubbleSrc})`;
  elem.querySelector(':scope > div:last-child')
    .remove();
}

export default function decorate(block) {
  if (block.classList.contains('softmax')) {
    const elem = block.querySelector('div:nth-child(1)');
    decorateBubbleWrapper(elem);

    const elem2 = block.querySelector('div:nth-child(2)');
    decorateBubbleWrapper(elem2);

    const bgImg = block.querySelector('div:nth-child(3)');
    bgImg.classList.add('background-img');
  } else {
    const textDiv = block.querySelector('div:nth-child(1) > div > div');
    textDiv.classList.add('text-over');

    const fgImg = block.querySelector('div:nth-child(2)');
    const bubbleSrc = fgImg.querySelector('img').src;

    const bgImg = block.querySelector('div:nth-child(3)');
    bgImg.classList.add('background-img');

    const bubbleWrapper = div({
      class: 'bubble-wrapper',
      style: `background-image: url(${bubbleSrc})`,
    }, textDiv);

    block.innerHTML = '';

    // Append the elements in the new order, adding new classes as necessary
    block.appendChild(bubbleWrapper);
    block.appendChild(bgImg);
  }
}
