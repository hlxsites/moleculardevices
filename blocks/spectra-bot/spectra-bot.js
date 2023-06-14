import { div } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const textDiv = block.querySelector('div:nth-child(1) > div > div');
  textDiv.classList.add('text-over');

  const fgImg = block.querySelector('div:nth-child(2)');
  const bubbleSrc = fgImg.querySelector('img').src;

  const bgImg = block.querySelector('div:nth-child(3)');
  bgImg.classList.add('background-img');

  const bubbleWrapper = div({ class: 'bubble-wrapper', style: `background-image: url(${bubbleSrc})` }, textDiv);

  block.classList.forEach((className) => {
    if (className.startsWith('width-')) {
      const width = className.substring(6);
      bgImg.style.width = `${width}px`;
    }

    if (className.startsWith('bubble-height-')) {
      const height = className.substring(14);
      bubbleWrapper.style.height = `${height}px`;
    }

    // TODO discriminate mobile vs desktop
    if (className.startsWith('desktop-font-size-')) {
      const fontSize = className.substring(18);
      textDiv.style.fontSize = `${fontSize}px`;
    }
  });

  block.innerHTML = '';

  // Append the elements in the new order, adding new classes as necessary
  block.appendChild(bubbleWrapper);
  block.appendChild(bgImg);
}
