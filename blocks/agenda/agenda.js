/* eslint-disable linebreak-style */
import {
  ul, li, a, span,
} from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const bookmarks = block.querySelectorAll(':scope > div > div > p');
  const list = ul({ class: 'agenda-list' });
  bookmarks.forEach((bookmark) => {
    const link = bookmark.children[0];
    const term = span(a({ href: link.href }, link.querySelector('em')));
    const heading = span(a({ href: link.href }, link.textContent.trim()));
    const listItem = li({ class: 'agenda-list-item' }, term, heading);
    list.appendChild(listItem);
  });
  block.querySelector(':scope > div').replaceWith(list);
}
