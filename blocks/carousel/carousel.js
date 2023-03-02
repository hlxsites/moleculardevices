import { decorateIcons } from '../../scripts/lib-franklin.js';

const AUTOSCROLL_INTERVAL = 7000;

/**
 * Scroll the carousel to the next item
 * @param {Element} block
 */
function nextItem(block) {
  const dotButtons = block.parentNode.querySelectorAll('.carousel-dot-button');
  const items = block.querySelectorAll('.carousel-item:not(.clone)');
  const selectedItem = block.querySelector('.carousel-item.selected');

  const index = [...items].indexOf(selectedItem);
  const newIndex = (index + 1) % items.length;
  const newSelectedItem = items[newIndex];

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
  dotButtons[newIndex].classList.add('selected');
}

/**
 * Scroll the carousel to the previous item
 * @param {Element} block
 */
function prevItem(block) {
  const dotButtons = block.parentNode.querySelectorAll('.carousel-dot-button');
  const items = block.querySelectorAll('.carousel-item:not(.clone)');
  const selectedItem = block.querySelector('.carousel-item.selected');

  const index = [...items].indexOf(selectedItem);
  const newIndex = index - 1 < 0 ? items.length - 1 : index - 1;
  const newSelectedItem = items[newIndex];

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
  dotButtons[newIndex].classList.add('selected');
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
function createNavButtons(block, intervalId) {
  const buttonLeft = document.createElement('button');
  buttonLeft.classList.add('carousel-nav-left');
  buttonLeft.ariaLabel = 'Scroll to previous item';
  createNavButtonIcon(buttonLeft, 'left');
  buttonLeft.addEventListener('click', () => {
    clearInterval(intervalId);
    prevItem(block);
  });

  const buttonRight = document.createElement('button');
  buttonRight.classList.add('carousel-nav-right');
  buttonRight.ariaLabel = 'Scroll to next item';
  createNavButtonIcon(buttonRight, 'right');
  buttonRight.addEventListener('click', () => {
    clearInterval(intervalId);
    nextItem(block);
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
function addSwipeCapability(block, intervalId) {
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
      nextItem(block);
    }
    if (touchendX > touchstartX) {
      clearInterval(intervalId);
      prevItem(block);
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

export default function decorate(block) {
  // create autoscrolling animation
  const intervalId = setInterval(nextItem, AUTOSCROLL_INTERVAL, block);

  // create dot buttons and add carousel classes
  const buttons = document.createElement('div');
  buttons.className = 'carousel-dot-buttons';
  [...block.children].forEach((item, i) => {
    item.className = 'carousel-item';

    // create the carousel content
    const columnContainer = document.createElement('div');
    columnContainer.classList.add('carousel-item-columns-container');

    const columns = [document.createElement('div'), document.createElement('div')];

    const itemChildren = [...item.children];
    const classes = ['image', 'text'];
    classes.forEach((e, j) => {
      itemChildren[j].classList.add(`carousel-item-${e}`);
      item.removeChild(itemChildren[j]);
      columns[j].appendChild(itemChildren[j]);
    });

    columns.forEach((column) => {
      column.classList.add('carousel-item-column');
      columnContainer.appendChild(column);
    });
    item.appendChild(columnContainer);

    // ensure that links inside the carousel are correctly marked as buttons
    // first link -> primary button
    // all the other links -> secondary buttons
    item.querySelectorAll('.button-container a').forEach((button, j) => {
      button.classList.add('button');
      if (j === 0) {
        button.classList.add('primary');
      } else {
        button.classList.add('secondary');
      }
    });

    const button = document.createElement('button');
    button.ariaLabel = `Scroll to item ${i + 1}`;
    button.classList.add('carousel-dot-button');
    if (i === 0) {
      item.classList.add('selected');
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
      button.classList.add('selected');
    });

    buttons.append(button);
  });
  block.parentElement.append(buttons);

  createNavButtons(block, intervalId);
  createClones(block);
  addSwipeCapability(block, intervalId);
  setInitialScrollingPosition(block);
}
