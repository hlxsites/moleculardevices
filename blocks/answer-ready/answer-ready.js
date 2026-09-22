import { decorateIcons } from '../../scripts/lib-franklin.min.js';
import { div, i } from '../../scripts/dom-helpers.js';

async function renderContent(container, content) {
  // prepare content
  const rows = [];
  content.forEach((elem) => {
    if (rows.length - 1 < 0) rows.push([]);
    rows[rows.length - 1].push(elem);
  });

  // render content
  if (rows.length > 0) {
    const contentDiv = div({ class: 'answer-ready-wrappert' });
    const icon = i({ class: 'fa-solid fa-check' });
    const innerContent = div({ class: 'answer-ready-content' });
    rows.forEach((row) => {
      row.forEach((elem) => {
        innerContent.append(elem);
      });
    });
    contentDiv.append(icon);
    contentDiv.append(innerContent);
    container.append(contentDiv);
  }
}

export default async function decorate(block) {
  const accordionItems = block.querySelectorAll(':scope > div > div');
  accordionItems.forEach((accordionItem) => {
    const nodes = accordionItem.children;
    const titleText = nodes[0];
    const rest = Array.prototype.slice.call(nodes, 1);

    if (nodes.length !== 1) {
      const header = div({ class: 'answer-ready-heading' }, titleText);
      const item = div({ class: 'answer-ready-item' });

      item.appendChild(header);
      renderContent(item, rest);
      decorateIcons(item);
      accordionItem.parentElement.replaceWith(item);
    }
  });
}
