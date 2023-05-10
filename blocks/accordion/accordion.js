import { loadCSS } from '../../scripts/lib-franklin.js';
import {
  div, i, p,
} from '../../scripts/dom-helpers.js';

class Accordion {
  constructor(block, data) {
    // Set defaults
    this.cssFiles = ['/blocks/accordion/accordion.css'];
    this.closeContentOnClick = true;
    this.iconInactive = 'fa-chevron-right';
    this.iconActive = 'fa-chevron-down';
    this.iconPosition = 'right';

    // Set information
    this.block = block;
    this.data = data || [...block.children];
  }

  // eslint-disable-next-line class-methods-use-this
  renderItem(item, isActive) {
    return (
      div({ class: `item${(isActive) ? ' active' : ''}` },
        div({ class: 'header' },
          i({ class: `fa ${(isActive) ? this.iconActive : this.iconInactive} ${this.iconPosition}`, 'aria-hidden': true }),
          item.header),
        div({ class: 'content' },
          p({}, item.content),
        ),
      )
    );
  }

  // eslint-disable-next-line class-methods-use-this
  deactivateItem(block) {
    const activeItem = block.querySelector('.item.active');
    if (activeItem) activeItem.classList.remove('active');
  }

  // eslint-disable-next-line class-methods-use-this
  hideContent(block) {
    const activeItem = block.querySelector('.item.active .content');
    if (activeItem) activeItem.classList.remove('active');
  }

  // eslint-disable-next-line class-methods-use-this
  async handleClick(block, closeContentOnClick) {
    const items = block.querySelectorAll('.item');
    items.forEach((item) => {
      const header = item.querySelector('.header');
      header.addEventListener('click', (event) => {
        this.deactivateItem(block);
        if (closeContentOnClick) this.hideContent(block);
        event.target.parentNode.classList.add('active');
      });
    });
  }

  async render() {
    let defaultCSSPromise;
    if (Array.isArray(this.cssFiles) && this.cssFiles.length > 0) {
      defaultCSSPromise = new Promise((resolve) => {
        this.cssFiles.forEach((cssFile) => {
          loadCSS(cssFile, (e) => resolve(e));
        });
      });
    }

    const accordion = div({ class: 'accordion' });
    this.block.innerHTML = '';
    this.data.forEach((item, idx) => {
      accordion.append(this.renderItem(item, idx === 0));
    });
    this.block.append(accordion);

    this.handleClick(this.block, this.closeContentOnClick);

    await defaultCSSPromise;
  }
}

export async function createAccordion(block, data) {
  const accordion = new Accordion(block, data);
  await accordion.render();
  return accordion;
}

export default async function decorate(block) {
  const items = [];
  [...block.children].forEach((entry) => {
    const item = {
      header: entry.querySelector('h3').innerHTML,
      content: entry.querySelector('p').innerHTML,
    };
    items.push(item);
  });
  await createAccordion(block, items);
}
