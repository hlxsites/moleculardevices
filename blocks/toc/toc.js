import { li, a } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const toc = block.classList.contains('numbers') ? document.createElement('ol') : document.createElement('ul');
  const section = block.closest('.section');
  const tocPosition = Array.from(section.children).indexOf(block.parentElement);
  const hTagNames = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
  const headings = section.querySelectorAll(hTagNames.map((i) => `div:nth-child(n+${tocPosition + 1}) ${i}`).join(','));
  const firstHTagName = headings[0].tagName;
  [...headings].forEach((title) => {
    if (hTagNames.indexOf(title.tagName) >= hTagNames.indexOf(firstHTagName)) {
      toc.append(li({ class: title.tagName.toLowerCase() }, a({ href: `#${title.id}` }, title.textContent.replace(/^\d*[0-9].\s/g, ''))));
    }
  });
  block.appendChild(toc);
}
