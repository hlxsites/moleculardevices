import { li, a } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const levelsFromClass = /levels-(\d+)/.exec(block.className);
  const levels = levelsFromClass ? Number(levelsFromClass[1]) : 5;
  const itemsStartFromClass = /items-(\d+)/.exec(block.className);
  const itemsEndFromClass = /items-\d+-(\d+)/.exec(block.className);
  const itemsStart = itemsStartFromClass ? Number(itemsStartFromClass[1]) : 1;
  const itemsEnd = itemsEndFromClass ? Number(itemsEndFromClass[1]) : 100;
  const toc = block.classList.contains('numbers') ? document.createElement('ol') : document.createElement('ul');
  const section = block.closest('.section');
  const tocPosition = Array.from(section.children).indexOf(block.parentElement);
  const hTagNames = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
  const headings = section.querySelectorAll(hTagNames.map((i) => `div:nth-child(n+${tocPosition + 1}) ${i}`).join(','));
  const firstHTagName = headings[0].tagName;
  const firstHTagNameIndex = hTagNames.indexOf(firstHTagName);
  let previousHTagNameIndex = firstHTagNameIndex;
  let currentList = toc;
  [...headings].forEach((title, i) => {
    const hTagNameIndex = hTagNames.indexOf(title.tagName);
    if (hTagNameIndex >= firstHTagNameIndex
        && hTagNameIndex < (firstHTagNameIndex + levels)
        && i >= (itemsStart - 1)
        && i < itemsEnd) {
      if (hTagNameIndex > previousHTagNameIndex) {
        currentList.append(block.classList.contains('numbers') ? document.createElement('ol') : document.createElement('ul'));
        currentList = currentList.querySelector('ul:last-of-type, ol:last-of-type');
      } else if (hTagNameIndex < previousHTagNameIndex) currentList = currentList.parentElement;
      currentList.append(li(a({ href: `#${title.id}` }, title.textContent.replace(/^\d*[0-9].\s/g, ''))));
    }
    previousHTagNameIndex = hTagNameIndex;
  });
  block.appendChild(toc);
}
