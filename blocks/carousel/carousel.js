import { decorateIcons } from '../../scripts/lib-franklin.js';
import { loadCSS } from '../../scripts/lib-franklin.js';

const AUTOSCROLL_INTERVAL = 7000;

/**
 * Scroll the carousel to the next item
 * @param {Element} block
 */
function nextItem(block, config) {
  const dotButtons = block.parentNode.querySelectorAll('.carousel-dot-button');
  const items = block.querySelectorAll('.carousel-item:not(.clone)');
  const selectedItem = block.querySelector('.carousel-item.selected');

  let index = [...items].indexOf(selectedItem);
  index = index != -1 ? index : 0;

  const newIndex = (index + 1) % items.length;
  const newSelectedItem = items[newIndex];

  if (newIndex === 0 && !config.infiniteScroll) {
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
 * @param {Element} block
 */
function prevItem(block, config) {
  const dotButtons = block.parentNode.querySelectorAll('.carousel-dot-button');
  const items = block.querySelectorAll('.carousel-item:not(.clone)');
  const selectedItem = block.querySelector('.carousel-item.selected');

  let index = [...items].indexOf(selectedItem);
  index = index != -1 ? index : 0;
  const newIndex = index - 1 < 0 ? items.length - 1 : index - 1;
  const newSelectedItem = items[newIndex];

  if (newIndex === items.length - 1 && !config.infiniteScroll) {
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
 * Create clone items at the beginning and end of the carousel
 * to give the appearance of infinite scrolling
 * @param {Element} block
 */
function createClones(block) {
  if (block.children.length < 2) return;

  const initialChildren = [...block.children];

  block.lastChild.after(createClone(initialChildren[0]));
  block.lastChild.after(createClone(initialChildren[1]));

  block.firstChild.before(createClone(initialChildren[initialChildren.length - 1]));
  block.firstChild.before(createClone(initialChildren[initialChildren.length - 2]));
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

/**
 * Create left and right arrow navigation buttons
 * @param {Element} block
 * @param {ReturnType<typeof setInterval>} intervalId ID of the interval that autoscrolls
 */
function createNavButtons(block, config, intervalId) {
  const buttonLeft = document.createElement('button');
  buttonLeft.classList.add('carousel-nav-left');
  buttonLeft.ariaLabel = 'Scroll to previous item';
  createNavButtonIcon(buttonLeft, 'left');
  buttonLeft.addEventListener('click', () => {
    clearInterval(intervalId);
    prevItem(block, config);
  });

  const buttonRight = document.createElement('button');
  buttonRight.classList.add('carousel-nav-right');
  buttonRight.ariaLabel = 'Scroll to next item';
  createNavButtonIcon(buttonRight, 'right');
  buttonRight.addEventListener('click', () => {
    clearInterval(intervalId);
    nextItem(block, config);
  });

  [buttonLeft, buttonRight].forEach((navButton) => {
    navButton.classList.add('carousel-nav-button');
    block.parentElement.append(navButton);
  });
}

/**
 * Adds event listeners for touch UI swiping
 * @param {Element} block
 * @param {ReturnType<typeof setInterval>} intervalId ID of the interval that autoscrolls
 */
function addSwipeCapability(block, config, intervalId) {
  let touchstartX = 0;
  let touchendX = 0;

  block.addEventListener('touchstart', (e) => {
    touchstartX = e.changedTouches[0].screenX;
  }, { passive: true });

  block.addEventListener('touchend', (e) => {
    touchendX = e.changedTouches[0].screenX;
    if (Math.abs(touchendX - touchstartX) < 10) {
      return;
    }

    if (touchendX < touchstartX) {
      clearInterval(intervalId);
      nextItem(block, config);
    }
    if (touchendX > touchstartX) {
      clearInterval(intervalId);
      prevItem(block, config);
    }
  }, { passive: true });
}

function setInitialScrollingPosition(block) {
  const scrollToSelectedItem = () => {
    const item = block.querySelector('.carousel-item.selected');
    item.parentNode.scrollTo({
      top: 0,
      left: item.offsetLeft - item.parentNode.offsetLeft,
    });
  };

  const section = block.closest('.section');

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

function createDotButtons(block, intervalId) {
  const buttons = document.createElement('div');
  buttons.className = 'carousel-dot-buttons';
  const items = [...block.children];

  items.forEach((item, i) => {
    const button = document.createElement('button');
    button.ariaLabel = `Scroll to item ${i + 1}`;
    button.classList.add('carousel-dot-button');
    if (i === 0) {
      button.classList.add('selected');
    } 

    button.addEventListener('click', () => {
      clearInterval(intervalId);
      block.scrollTo({
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
  block.parentElement.append(buttons);
}

/* 
  Changing the default rendering may break carousels that rely on it (e.g. CSS might not match anymore) 
*/
function defaultRenderItem(item) {
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

/* 
  Changing these defaults may break carousels that rely on them 
*/
const defaultConfig = {
  defaultStyling:     true,
  dotButtons:         true,
  navButtons:         true,
  infiniteScroll:     true,
  autoScroll:         true, // only available with infinite scroll
  autoScrollInterval: AUTOSCROLL_INTERVAL,
}

/**
 * Adds event listeners for touch UI swiping
 * @param {Element}  block        required - target block
 * @param {Array}    data         optional - a list of data elements. either a list of objects or a list of divs. 
 *  if not provided: the div children of the block are used
 * @param {function} renderedItem optional - rendering function for each data item.
 *  if not provided: the default knows how to render the Franklin default div structure 
 *  for a 2 column table with separated text and image
 * @param {Object}   config       optional - config object for customizing the rendering
 * if not provided: the default values from @defaultConfig are used.
 */
export default async function createCarousel({ block, data, renderItem = defaultRenderItem, config = defaultConfig}) {
  data = data || [...block.children];
  renderItem = renderItem || defaultRenderItem;
  config = Object.assign({}, defaultConfig, config);
  
  // copy carousel styles to the wrapper too  
  block.parentElement.classList.add(
    ...[...block.classList].filter((item, idx) => idx !== 0 && item !== 'block')
  );

  let defaultCSSPromise;
  if (config.defaultStyling) {
    // add default carousel classes to apply default CSS
    defaultCSSPromise = new Promise((resolve) => {
      loadCSS('/blocks/carousel/carousel.css', (e) => resolve(e));
    });
    config.defaultStyling && block.parentElement.classList.add('carousel-wrapper');
    config.defaultStyling && block.classList.add('carousel');
  }


  block.innerHTML = '';
  data.forEach((item, i) => {
    const itemContainer = document.createElement('div');
    itemContainer.className = 'carousel-item';
    // if (i === 0) {
    //   itemContainer.classList.add('selected');
    // }

    let renderedItem = renderItem(item);
    renderedItem =  Array.isArray(renderedItem) ? renderedItem : [renderedItem];
    renderedItem.forEach((renderedItemElement) => {
      itemContainer.appendChild(renderedItemElement);
    });
    block.appendChild(itemContainer);
  });

  // create autoscrolling animation
  let intervalId;
  config.autoScroll && config.infiniteScroll && (intervalId = setInterval(nextItem, config.autoScrollInterval, block, config));
  config.dotButtons && createDotButtons(block, intervalId);
  config.navButtons && createNavButtons(block, config, intervalId);
  config.infiniteScroll && createClones(block);
  addSwipeCapability(block, config, intervalId);
  // setInitialScrollingPosition(block);
  config.defaultStyling && (await defaultCSSPromise);
}
