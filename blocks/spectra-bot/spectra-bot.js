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
    decorateBubbleWrapper(block.querySelector('div:nth-child(1)'));
    decorateBubbleWrapper(block.querySelector('div:nth-child(2)'));
    const bgImg = block.querySelector('div:nth-child(3)');
    bgImg.classList.add('background-img');
  } else {
    decorateBubbleWrapper(block.querySelector('div:nth-child(1)'));
    const bgImg = block.querySelector('div:nth-child(2)');
    bgImg.classList.add('background-img');
  }
}
