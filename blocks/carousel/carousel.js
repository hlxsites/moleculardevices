import { decorateIcons } from '../../scripts/lib-franklin.js';
import { loadCSS } from '../../scripts/lib-franklin.js';

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

  return clone;
}

/**
 * Creates the decorated icon for the nav button
 * @param {Element} button the nav button for which the icon needs to be cretated
 * @param string direction 'left' or 'right'
 */
function createNavButtonIcon(button, direction) {
  const icon = document.createElement('span');
  icon.classList.add('icon');
  icon.classList.add(`icon-chevron-${direction}`);
  button.appendChild(icon);
  decorateIcons(button);
}

class Carousel {
  constructor(block, data, config) {
    // Set defaults
    this.defaultStyling = true;
    this.dotButtons = true;
    this.navButtons = true;
    this.infiniteScroll = true;
    this.autoScroll = true; // only available with infinite scroll
    this.autoScrollInterval = AUTOSCROLL_INTERVAL,

    // Set information
    this.block = block;
    this.data = data || [...block.children];

    // Apply overwrites
    Object.assign(this, config);
  }

  /**
  * Scroll the carousel to the next item
  */
  nextItem() {
    const dotButtons = this.block.parentNode.querySelectorAll('.carousel-dot-button');
    const items = this.block.querySelectorAll('.carousel-item:not(.clone)');
    const selectedItem = this.block.querySelector('.carousel-item.selected');
  
    let index = [...items].indexOf(selectedItem);
    index = index != -1 ? index : 0;
  
    const newIndex = (index + 1) % items.length;
    const newSelectedItem = items[newIndex];
    if (newIndex === 0 && !this.infiniteScroll) {
      return;
    }
  
    if (newIndex === 0) {
      // create the ilusion of infinite scrolling
      newSelectedItem.parentNode.scrollTo({
        top: 0,
        left: (
          newSelectedItem.previousElementSibling.offsetLeft - newSelectedItem.parentNode.offsetLeft
        ),
      });
    }
  
    newSelectedItem.parentNode.scrollTo({
      top: 0,
      left: newSelectedItem.offsetLeft - newSelectedItem.parentNode.offsetLeft,
      behavior: 'smooth',
    });
  
    items.forEach((item) => item.classList.remove('selected'));
    dotButtons.forEach((item) => item.classList.remove('selected'));
    newSelectedItem.classList.add('selected');
    if (dotButtons && dotButtons.length !== 0) {
      dotButtons[newIndex].classList.add('selected');
    }
  }

  /**
  * Scroll the carousel to the previous item
  */
  prevItem() {
    const dotButtons = this.block.parentNode.querySelectorAll('.carousel-dot-button');
    const items = this.block.querySelectorAll('.carousel-item:not(.clone)');
    const selectedItem = this.block.querySelector('.carousel-item.selected');
  
    let index = [...items].indexOf(selectedItem);
    index = index != -1 ? index : 0;
    const newIndex = index - 1 < 0 ? items.length - 1 : index - 1;
    const newSelectedItem = items[newIndex];
  
    if (newIndex === items.length - 1 && !this.infiniteScroll) {
      return;
    }
  
    if (newIndex === items.length - 1) {
      // create the ilusion of infinite scrolling
      newSelectedItem.parentNode.scrollTo({
        top: 0,
        left: (
          newSelectedItem.nextElementSibling.offsetLeft - newSelectedItem.parentNode.offsetLeft
        ),
      });
    }
  
    newSelectedItem.parentNode.scrollTo({
      top: 0,
      left: newSelectedItem.offsetLeft - newSelectedItem.parentNode.offsetLeft,
      behavior: 'smooth',
    });
  
    items.forEach((item) => item.classList.remove('selected'));
    dotButtons.forEach((item) => item.classList.remove('selected'));
    newSelectedItem.classList.add('selected');
    if (dotButtons && dotButtons.length !== 0) {
      dotButtons[newIndex].classList.add('selected');
    }
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
  createNavButtons() {
    const buttonLeft = document.createElement('button');
    buttonLeft.classList.add('carousel-nav-left');
    buttonLeft.ariaLabel = 'Scroll to previous item';
    createNavButtonIcon(buttonLeft, 'left');
    buttonLeft.addEventListener('click', () => {
      clearInterval(this.intervalId);
      this.prevItem();
    });

    const buttonRight = document.createElement('button');
    buttonRight.classList.add('carousel-nav-right');
    buttonRight.ariaLabel = 'Scroll to next item';
    createNavButtonIcon(buttonRight, 'right');
    buttonRight.addEventListener('click', () => {
      clearInterval(this.intervalId);
      this.nextItem();
    });

    [buttonLeft, buttonRight].forEach((navButton) => {
      navButton.classList.add('carousel-nav-button');
      this.block.parentElement.append(navButton);
    });
  }

  /**
  * Adds event listeners for touch UI swiping
  */
  addSwipeCapability() {
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
  }

  setInitialScrollingPosition() {
    const scrollToSelectedItem = () => {
      const item = this.block.querySelector('.carousel-item.selected');
      item.parentNode.scrollTo({
        top: 0,
        left: item.offsetLeft - item.parentNode.offsetLeft,
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
      if (i === 0) {
        button.classList.add('selected');
      } 
  
      button.addEventListener('click', () => {
        clearInterval(this.intervalId);
        this.block.scrollTo({
          top: 0,
          left: item.offsetLeft - item.parentNode.offsetLeft,
          behavior: 'smooth',
        });
        [...buttons.children].forEach((r) => r.classList.remove('selected'));
        items.forEach((r) => r.classList.remove('selected'));
        button.classList.add('selected');
        item.classList.add('selected');
      });
      buttons.append(button);
    });
    this.block.parentElement.append(buttons);
  }

  /* 
  Changing the default rendering may break carousels that rely on it (e.g. CSS might not match anymore) 
  */
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
      ...[...this.block.classList].filter((item, idx) => idx !== 0 && item !== 'block')
    );

    let defaultCSSPromise;
    if (this.defaultStyling) {
      // add default carousel classes to apply default CSS
      defaultCSSPromise = new Promise((resolve) => {
        loadCSS('/blocks/carousel/carousel.css', (e) => resolve(e));
      });
      this.block.parentElement.classList.add('carousel-wrapper');
      this.block.classList.add('carousel');
    }

    this.block.innerHTML = '';
    this.data.forEach((item, i) => {
      const itemContainer = document.createElement('div');
      itemContainer.className = 'carousel-item';
      if (i === 0) {
        itemContainer.classList.add('selected');
      }

      let renderedItem = this.renderItem(item);
      renderedItem =  Array.isArray(renderedItem) ? renderedItem : [renderedItem];
      renderedItem.forEach((renderedItemElement) => {
        itemContainer.appendChild(renderedItemElement);
      });
      this.block.appendChild(itemContainer);
    });

    // create autoscrolling animation
    this.autoScroll && this.infiniteScroll && (this.intervalId = setInterval(() => { this.nextItem(); }, this.autoScrollInterval));
    this.dotButtons && this.createDotButtons();
    this.navButtons && this.createNavButtons();
    this.infiniteScroll && this.createClones();
    this.addSwipeCapability();
    this.infiniteScroll && this.setInitialScrollingPosition();
    this.defaultStyling && (await defaultCSSPromise);
  }
}

/**
 * Adds event listeners for touch UI swiping
 * @param {Element}  block        required - target block
 * @param {Array}    data         optional - a list of data elements. either a list of objects or a list of divs. 
 *  if not provided: the div children of the block are used
 * @param {Object}   config       optional - config object for customizing the rendering and behaviour
 */
export default async function createCarousel(block, data, config) {
  const carousel = new Carousel(block, data, config);
  await carousel.render();
  return carousel;
}
