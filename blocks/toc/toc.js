import { li, a } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  let toc = block.querySelector('ul, ol') || document.createElement('ul');
  const section = block.parentElement.parentElement;
  const tocPosition = Array.from(section.children).indexOf(block.parentElement);
  let hTagNames = ['H2', 'H3', 'H4', 'H5', 'H6'];
  const headings = section.querySelectorAll(hTagNames.map(i => `div:nth-child(n+${tocPosition + 1}) ` + i).join(','));
  let firstHTagName = headings[0].tagName;
  
  toc.innerHTML = '';
  [...headings].forEach((title, i) => {
    if (hTagNames.indexOf(title.tagName) >= hTagNames.indexOf(firstHTagName)) {
      toc.append(li({ class: title.tagName }, a({ href: `#${title.id}` }, title.textContent)));  
    }
  });
  block.appendChild(toc);
}
