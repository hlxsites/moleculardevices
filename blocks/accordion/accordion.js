import { decorateIcons } from '../../scripts/lib-franklin.js';
import {
  div, span,
} from '../../scripts/dom-helpers.js';

const openAttribute = 'aria-expanded';

function isFaq(block) {
  return block.classList.contains('faq');
}

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
  link.children[0].setAttribute('target', '_blank');
  link.children[0].setAttribute('rel', 'noopener noreferrer');

  const text = div();
  textArr.forEach((t) => text.appendChild(t));
  if (link) link.querySelector('a').append(span({ class: 'icon icon-fa-arrow-circle-right' }));

  const leftCol = div({ class: 'accordion-content-col-left' }, picture);
  const rightCol = div({ class: 'accordion-content-col-right' }, text, link);
  const rowContent = div({ class: 'accordion-content-row' }, leftCol, rightCol);
  return rowContent;
}

async function renderContent(container, content, isBlockFaq) {
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
  if (isBlockFaq) {
    const answerDiv = div({ class: 'answer' });
    answerDiv.setAttribute('itemprop', 'acceptedAnswer');
    answerDiv.setAttribute('itemscope', '');
    answerDiv.setAttribute('itemtype', 'https://schema.org/Answer');
    contentDiv.append(answerDiv);

    const textDiv = div({ class: 'text' });
    textDiv.setAttribute('itemprop', 'text');
    answerDiv.append(textDiv);

    const accordionChild = contentDiv.firstChild;
    textDiv.append(accordionChild);
  }
  container.append(contentDiv);
}

export default async function decorate(block) {
  const isBlockFaq = isFaq(block);
  const htmlEl = document.querySelector('html');
  const hasItemTypeAttr = htmlEl.getAttribute('itemtype');
  const isTypeNumbers = block.classList.contains('numbers');
  if (isBlockFaq) {
    if (!hasItemTypeAttr) {
      htmlEl.setAttribute('itemscope', '');
      htmlEl.setAttribute('itemtype', 'https://schema.org/FAQPage');
    }
    block.setAttribute('itemscope', '');
  }
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
    if (isBlockFaq) {
      item.setAttribute('itemprop', 'mainEntity');
      item.setAttribute('itemscope', '');
      item.setAttribute('itemtype', 'https://schema.org/Question');
      header.setAttribute('itemProp', 'name');
      decorateIcons(header);
    }

    item.appendChild(header);
    renderContent(item, rest, isBlockFaq);

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
