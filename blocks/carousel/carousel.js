/* eslint-disable no-unused-expressions */
import { decorateIcons, loadCSS } from '../../scripts/lib-franklin.js';
import { div, p, span } from '../../scripts/dom-helpers.js';
import { handleCompareProducts } from '../card/card.js';

const AUTOSCROLL_INTERVAL = 7000;

/**
 * Clone a carousel item
 * @param {Element} item carousel item to be cloned
 * @returns the clone of the carousel item
 */
function createClone(item) {
  const clone = item.cloneNode(true);
  clone.classList.add('clone');
  clone.classList.remove('selected');

  // if clone has compare box, add event handler
  const compareCheckbox = clone.querySelector('.compare-checkbox');
  if (compareCheckbox) {
    compareCheckbox.addEventListener('click', handleCompareProducts);
  }

  return clone;
}

class Carousel {
  constructor(block, data, config) {
    // Set defaults
    this.cssFiles = [];
    this.defaultStyling = false;
    this.dotButtons = true;
    this.navButtons = true;
    this.counter = false;
    this.infiniteScroll = true;
    this.autoScroll = true; // only available with infinite scroll
    this.autoScrollInterval = AUTOSCROLL_INTERVAL;
    this.currentIndex = 0;
    this.counterText = '';
    this.counterNavButtons = true;
    this.cardRenderer = this;
    // this is primarily controlled by CSS,
    // but we need to know then intention for scrolling pourposes
    this.visibleItems = [
      {
        items: 1,
        condition: () => true,
      },
    ];

    // Set information
    this.block = block;
    this.data = data || [...block.children];

    // Will be replaced after rendering, if available
    this.navButtonLeft = null;
    this.navButtonRight = null;

    // Apply overwrites
    Object.assign(this, config);

    if (this.getCurrentVisibleItems() >= this.data.length) {
      this.infiniteScroll = false;
      this.navButtons = false;
      this.block.classList.add('fully-visible');
    }

    if (this.defaultStyling) {
      this.cssFiles.push('/blocks/carousel/carousel.css');
    }
  }

  getBlockPadding() {
    if (!this.blockStyle) {
      this.blockStyle = window.getComputedStyle(this.block);
    }
    return +(this.blockStyle.getPropertyValue('padding-left').replace('px', ''));
  }

  updateCounterText(newIndex = this.currentIndex) {
    this.currentIndex = newIndex;
    if (this.counter) {
      const items = this.block.querySelectorAll('.carousel-item:not(.clone,.skip)');
      const counterTextBlock = this.block.parentElement.querySelector('.carousel-counter .carousel-counter-text p');
      const pageCounter = `${this.currentIndex + 1} / ${items.length}`;
      counterTextBlock.innerHTML = this.counterText ? `${this.counterText} ${pageCounter}` : pageCounter;
    }
  }

  /**
  * Scroll the carousel to the next item
  */
  nextItem() {
    !this.infiniteScroll && this.navButtonRight && this.navButtonRight.classList.remove('disabled');
    !this.infiniteScroll && this.navButtonLeft && this.navButtonLeft.classList.remove('disabled');

    const dotButtons = this.block.parentNode.querySelectorAll('.carousel-dot-button');
    const items = this.block.querySelectorAll('.carousel-item:not(.clone,.skip)');
    const selectedItem = this.block.querySelector('.carousel-item.selected');

    let index = [...items].indexOf(selectedItem);
    index = index !== -1 ? index : 0;

    const newIndex = (index + 1) % items.length;
    const newSelectedItem = items[newIndex];
    if (newIndex === 0 && !this.infiniteScroll) {
      return;
    }

    if (newIndex === items.length - this.getCurrentVisibleItems() && !this.infiniteScroll) {
      this.navButtonRight.classList.add('disabled');
    }

    if (newIndex === 0) {
      // create the ilusion of infinite scrolling
      newSelectedItem.parentNode.scrollTo({
        top: 0,
        left: (
          newSelectedItem.previousElementSibling.offsetLeft
          - this.getBlockPadding()
          - this.block.offsetLeft
        ),
      });
    }

    newSelectedItem.parentNode.scrollTo({
      top: 0,
      left: newSelectedItem.offsetLeft - this.getBlockPadding() - this.block.offsetLeft,
      behavior: 'smooth',
    });

    items.forEach((item) => item.classList.remove('selected'));
    dotButtons.forEach((item) => item.classList.remove('selected'));
    newSelectedItem.classList.add('selected');
    if (dotButtons && dotButtons.length !== 0) {
      dotButtons[newIndex].classList.add('selected');
    }

    this.updateCounterText(newIndex);
  }

  getCurrentVisibleItems() {
    return this.visibleItems
      .filter((e) => !e.condition || e.condition())[0].items;
  }

  /**
  * Scroll the carousel to the previous item
  */
  prevItem() {
    !this.infiniteScroll && this.navButtonRight && this.navButtonRight.classList.remove('disabled');
    !this.infiniteScroll && this.navButtonLeft && this.navButtonLeft.classList.remove('disabled');

    const dotButtons = this.block.parentNode.querySelectorAll('.carousel-dot-button');
    const items = this.block.querySelectorAll('.carousel-item:not(.clone,.skip)');
    const selectedItem = this.block.querySelector('.carousel-item.selected');

    let index = [...items].indexOf(selectedItem);
    index = index !== -1 ? index : 0;
    const newIndex = index - 1 < 0 ? items.length - 1 : index - 1;
    const newSelectedItem = items[newIndex];

    if (newIndex === items.length - 1 && !this.infiniteScroll) {
      return;
    }

    if (newIndex === 0 && !this.infiniteScroll) {
      this.navButtonLeft.classList.add('disabled');
    }

    if (newIndex === items.length - 1) {
      // create the ilusion of infinite scrolling
      newSelectedItem.parentNode.scrollTo({
        top: 0,
        left: (
          newSelectedItem.nextElementSibling.offsetLeft
          - this.getBlockPadding()
          - this.block.offsetLeft
        ),
      });
    }

    newSelectedItem.parentNode.scrollTo({
      top: 0,
      left: newSelectedItem.offsetLeft - this.getBlockPadding() - this.block.offsetLeft,
      behavior: 'smooth',
    });

    items.forEach((item) => item.classList.remove('selected'));
    dotButtons.forEach((item) => item.classList.remove('selected'));
    newSelectedItem.classList.add('selected');
    if (dotButtons && dotButtons.length !== 0) {
      dotButtons[newIndex].classList.add('selected');
    }

    this.updateCounterText(newIndex);
  }

  /**
  * Create clone items at the beginning and end of the carousel
  * to give the appearance of infinite scrolling
  */
  createClones() {
    if (this.block.children.length < 2) return;

    const initialChildren = [...this.block.children];

    this.block.lastChild.after(createClone(initialChildren[0]));
    this.block.lastChild.after(createClone(initialChildren[1]));

    this.block.firstChild.before(createClone(initialChildren[initialChildren.length - 1]));
    this.block.firstChild.before(createClone(initialChildren[initialChildren.length - 2]));
  }

  /**
  * Create left and right arrow navigation buttons
  */
  createNavButtons(parentElement) {
    const buttonLeft = document.createElement('button');
    buttonLeft.classList.add('carousel-nav-left');
    buttonLeft.ariaLabel = 'Scroll to previous item';
    buttonLeft.append(span({ class: 'icon icon-chevron-left' }));
    buttonLeft.addEventListener('click', () => {
      clearInterval(this.intervalId);
      this.prevItem();
    });

    if (!this.infiniteScroll) {
      buttonLeft.classList.add('disabled');
    }

    const buttonRight = document.createElement('button');
    buttonRight.classList.add('carousel-nav-right');
    buttonRight.ariaLabel = 'Scroll to next item';
    buttonRight.append(span({ class: 'icon icon-chevron-right' }));
    buttonRight.addEventListener('click', () => {
      clearInterval(this.intervalId);
      this.nextItem();
    });

    [buttonLeft, buttonRight].forEach((navButton) => {
      navButton.classList.add('carousel-nav-button');
      parentElement.append(navButton);
    });

    decorateIcons(buttonLeft);
    decorateIcons(buttonRight);
    this.navButtonLeft = buttonLeft;
    this.navButtonRight = buttonRight;
  }

  /**
  * Adds event listeners for touch UI swiping
  */
  addSwipeCapability() {
    if (this.block.swipeCapabilityAdded) {
      return;
    }

    let touchstartX = 0;
    let touchendX = 0;

    this.block.addEventListener('touchstart', (e) => {
      touchstartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.block.addEventListener('touchend', (e) => {
      touchendX = e.changedTouches[0].screenX;
      if (Math.abs(touchendX - touchstartX) < 10) {
        return;
      }

      if (touchendX < touchstartX) {
        clearInterval(this.intervalId);
        this.nextItem();
      }

      if (touchendX > touchstartX) {
        clearInterval(this.intervalId);
        this.prevItem();
      }
    }, { passive: true });
    this.block.swipeCapabilityAdded = true;
  }

  setInitialScrollingPosition() {
    const scrollToSelectedItem = () => {
      const item = this.block.querySelector('.carousel-item.selected');
      item.parentNode.scrollTo({
        top: 0,
        left: item.offsetLeft - this.getBlockPadding() - this.block.offsetLeft,
      });
    };

    const section = this.block.closest('.section');

    const observer = new MutationObserver((mutationList) => {
      mutationList.forEach((mutation) => {
        if (mutation.type === 'attributes'
          && mutation.attributeName === 'data-section-status'
          && section.attributes.getNamedItem('data-section-status').value === 'loaded') {
          scrollToSelectedItem();
          observer.disconnect();
        }
      });
    });

    observer.observe(section, { attributes: true });

    // just in case the mutation observer didn't work
    setTimeout(scrollToSelectedItem, 700);

    // ensure that we disconnect the observer
    // if the animation has kicked in, we for sure no longer need it
    setTimeout(() => { observer.disconnect(); }, AUTOSCROLL_INTERVAL);
  }

  createDotButtons() {
    const buttons = document.createElement('div');
    buttons.className = 'carousel-dot-buttons';
    const items = [...this.block.children];

    items.forEach((item, i) => {
      const button = document.createElement('button');
      button.ariaLabel = `Scroll to item ${i + 1}`;
      button.classList.add('carousel-dot-button');
      if (i === this.currentIndex) {
        button.classList.add('selected');
      }

      button.addEventListener('click', () => {
        clearInterval(this.intervalId);
        this.block.scrollTo({
          top: 0,
          left: item.offsetLeft - this.getBlockPadding(),
          behavior: 'smooth',
        });
        [...buttons.children].forEach((r) => r.classList.remove('selected'));
        items.forEach((r) => r.classList.remove('selected'));
        button.classList.add('selected');
        item.classList.add('selected');
        this.updateCounterText(i);
      });
      buttons.append(button);
    });
    this.block.parentElement.append(buttons);
  }

  createCounter() {
    const counter = div({ class: 'carousel-counter' },
      div({ class: 'carousel-counter-text' },
        p(''),
      ),
    );
    if (this.counterNavButtons) {
      this.createNavButtons(counter);
    }
    this.block.parentElement.append(counter);
    this.updateCounterText();
  }

  /*
  * Changing the default rendering may break carousels that rely on it
  * (e.g. CSS might not match anymore)
  */
  // eslint-disable-next-line class-methods-use-this
  renderItem(item) {
    // create the carousel content
    const columnContainer = document.createElement('div');
    columnContainer.classList.add('carousel-item-columns-container');

    const columns = [document.createElement('div'), document.createElement('div')];

    const itemChildren = [...item.children];
    itemChildren.forEach((itemChild, idx) => {
      if (itemChild.querySelector('img')) {
        itemChild.classList.add('carousel-item-image');
      } else {
        itemChild.classList.add('carousel-item-text');
      }
      columns[idx].appendChild(itemChild);
    });

    columns.forEach((column) => {
      column.classList.add('carousel-item-column');
      columnContainer.appendChild(column);
    });
    return columnContainer;
  }

  async render() {
    // copy carousel styles to the wrapper too
    this.block.parentElement.classList.add(
      ...[...this.block.classList].filter((item, idx) => idx !== 0 && item !== 'block'),
    );

    let defaultCSSPromise;
    if (Array.isArray(this.cssFiles) && this.cssFiles.length > 0) {
      // add default carousel classes to apply default CSS
      defaultCSSPromise = Promise.all(this.cssFiles.map(loadCSS));
      this.block.parentElement.classList.add('carousel-wrapper');
      this.block.classList.add('carousel');
    }

    this.block.innerHTML = '';
    this.data.forEach((item, index) => {
      const itemContainer = document.createElement('div');
      itemContainer.classList.add('carousel-item', `carousel-item-${index + 1}`);

      let renderedItem = this.cardRenderer.renderItem(item);
      renderedItem = Array.isArray(renderedItem) ? renderedItem : [renderedItem];
      renderedItem.forEach((renderedItemElement) => {
        // There may be items in the carousel that are skipped from scrolling
        if (renderedItemElement.classList.contains('carousel-skip-item')) {
          itemContainer.classList.add('skip');
        }
        itemContainer.appendChild(renderedItemElement);
      });
      this.block.appendChild(itemContainer);
    });

    // set initial selected carousel item
    const activeItems = this.block.querySelectorAll('.carousel-item:not(.clone,.skip)');
    activeItems[this.currentIndex].classList.add('selected');

    // create autoscrolling animation
    this.autoScroll && this.infiniteScroll
      && (this.intervalId = setInterval(() => { this.nextItem(); }, this.autoScrollInterval));
    this.dotButtons && this.createDotButtons();
    this.counter && this.createCounter();
    this.navButtons && this.createNavButtons(this.block.parentElement);
    this.infiniteScroll && this.createClones();
    this.addSwipeCapability();
    this.infiniteScroll && this.setInitialScrollingPosition();
    this.cssFiles && (await defaultCSSPromise);
  }
}

/**
 * Create and render default carousel.
 * Best practice: Create a new block and call the function, instead using or modifying this.
 * @param {Element}  block        required - target block
 * @param {Array}    data         optional - a list of data elements.
 *  either a list of objects or a list of divs.
 *  if not provided: the div children of the block are used
 * @param {Object}   config       optional - config object for
 * customizing the rendering and behaviour
 */
export async function createCarousel(block, data, config) {
  const carousel = new Carousel(block, data, config);
  await carousel.render();
  return carousel;
}

/**
 * Custom card style config and rendering of carousel items.
 */
export function renderCardItem(item) {
  item.classList.add('card');
  item
    .querySelectorAll('.button-container a')
    .forEach((a) => a.append(span({ class: 'icon icon-chevron-right-outline', 'aria-hidden': true })));
  decorateIcons(item);
  return item;
}

const cardStyleConfig = {
  cssFiles: ['/blocks/carousel/carousel-cards.css'],
  navButtons: true,
  dotButtons: false,
  infiniteScroll: true,
  autoScroll: false,
  visibleItems: [
    {
      items: 1,
      condition: () => window.innerWidth < 768,
    },
    {
      items: 2,
      condition: () => window.innerWidth < 1200,
    }, {
      items: 3,
    },
  ],
  renderItem: renderCardItem,
};

export default async function decorate(block) {
  // cards style carousel
  const useCardsStyle = block.classList.contains('cards');
  if (useCardsStyle) {
    await createCarousel(block, [...block.children], cardStyleConfig);
    return;
  }

  // use the default carousel
  await createCarousel(block);
}
