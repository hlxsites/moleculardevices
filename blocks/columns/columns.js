import { embedCerosFrame } from '../embed/embed.js';

function decorateEmbed(elems) {
  elems.forEach((elem) => {
    const embedHTML = embedCerosFrame(elem);
    const parentEl = elem.parentElement;
    parentEl.classList.add('embed', 'embed-ceros');
    parentEl.innerHTML = embedHTML;
    elem.remove();
  });
}

export default function decorate(block) {
  const embedUrls = block.querySelectorAll('a[href*="ceros.com"]');
  decorateEmbed(embedUrls);

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  const element = block.querySelector(':scope > div');
  if (element.querySelector(':scope > div:first-child picture') !== null) {
    element.classList.add('image-left');
  }

  if (element.querySelector(':scope > div:last-child picture') !== null) {
    element.classList.add('image-right');
  }
}
