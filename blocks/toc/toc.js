import { li, a, h3 } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  let toc = block.querySelector('ul, ol');
  toc.innerHTML = '';
  if (!toc) toc = document.createElement('ul');
  const section = block.parentElement.parentElement;
  const headings = ['h2', 'h3', 'h4', 'h5', 'h6'];
  [...section.querySelectorAll('h2, h3, h4, h5, h6')].forEach((title) => {
    toc.append(li({ class: title.tagName }, a({ href: `#${title.id}` }, title.textContent)));
  });
  block.appendChild(toc);
}
