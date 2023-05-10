import { createIcon, decorateIcons } from '../../scripts/lib-franklin.js';

const openAttribute = 'aria-expanded';

export default async function decorate(block) {
  const isTypeNumbers = block.classList.contains('numbers');
  const accordionItems = block.querySelectorAll(':scope > div > div');
  accordionItems.forEach((accordionItem, idx) => {
    const nodes = accordionItem.children;

    let number = '';
    if (isTypeNumbers) {
      number = document.createElement('span');
      number.classList.add('number');
      number.innerHTML = (idx + 1);
    }

    const titleText = nodes[0];
    const rest = Array.prototype.slice.call(nodes, 1);

    const titleDiv = document.createElement('div');
    if (number) titleDiv.append(number);
    titleDiv.appendChild(titleText);
    titleDiv.appendChild(createIcon('fa-chevron-right'));

    titleDiv.classList.add('accordion-trigger');

    const content = document.createElement('div');
    content.classList.add('accordion-content');
    rest.forEach((elem) => {
      content.appendChild(elem);
    });

    const newItem = document.createElement('div');
    newItem.appendChild(titleDiv);
    newItem.appendChild(content);

    newItem.classList.add('accordion-item');
    if (idx === 0) newItem.setAttribute(openAttribute, '');
    decorateIcons(newItem);

    accordionItem.replaceWith(newItem);
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
