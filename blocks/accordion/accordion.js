import { decorateIcons } from '../../scripts/lib-franklin.js';
import {
  div, span,
} from '../../scripts/dom-helpers.js';

const openAttribute = 'aria-expanded';

function applyColumnLayout(contentNodes) {
  let applyLayout = false;
  contentNodes.forEach((elem) => {
    if (applyLayout) return;
    if (elem.querySelector('picture')) {
      applyLayout = true;
    }
  });
  return applyLayout;
}

function renderColumnLayout(row) {
  const picture = row[0];
  const textArr = row.slice(1, -1);
  const link = row[row.length - 1];
  const text = div();
  textArr.forEach((t) => text.appendChild(t));
  if (link) link.querySelector('a').append(span({ class: 'icon icon-fa-arrow-circle-right' }));

  const leftCol = div({ class: 'accordion-content-col-left' }, picture);
  const rightCol = div({ class: 'accordion-content-col-right' }, text, link);
  const rowContent = div({ class: 'accordion-content-row' }, leftCol, rightCol);
  return rowContent;
}

async function renderContent(container, content) {
  // prepare content
  const rows = [];
  content.forEach((elem) => {
    if (elem.querySelector('picture')) {
      rows.push([]);
    }
    if (rows.length - 1 < 0) rows.push([]);
    rows[rows.length - 1].push(elem);
  });

  // render content
  const contentDiv = div({ class: 'accordion-content' });
  rows.forEach((row) => {
    const hasColumnLayout = applyColumnLayout(row);
    if (hasColumnLayout) {
      const rowContent = renderColumnLayout(row);
      contentDiv.appendChild(rowContent);
    } else {
      row.forEach((elem) => {
        contentDiv.append(elem);
      });
    }
  });
  container.append(contentDiv);
}

export default async function decorate(block) {
  const isTypeNumbers = block.classList.contains('numbers');
  const accordionItems = block.querySelectorAll(':scope > div > div');
  accordionItems.forEach((accordionItem, idx) => {
    const nodes = accordionItem.children;
    const titleText = nodes[0];
    const rest = Array.prototype.slice.call(nodes, 1);

    const header = div({ class: 'accordion-trigger' },
      (isTypeNumbers) ? span({ class: 'number' }, (idx + 1)) : '',
      titleText,
      span({ class: 'icon icon-fa-chevron-right' }),
    );

    const item = div({ class: 'accordion-item' });
    item.appendChild(header);
    renderContent(item, rest);

    if (idx === 0) item.setAttribute(openAttribute, '');

    decorateIcons(item);

    accordionItem.replaceWith(item);
  });

  const triggers = block.querySelectorAll('.accordion-trigger');
  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const wasOpen = trigger.parentElement.hasAttribute(openAttribute);

      triggers.forEach((_trigger) => {
        _trigger.parentElement.removeAttribute(openAttribute);
      });

      if (!wasOpen) {
        trigger.parentElement.setAttribute(openAttribute, '');
      }
    });
  });
}
