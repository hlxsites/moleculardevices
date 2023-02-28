const chevronLeft = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><
  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" 
  stroke-width="25" d="M328 112L184 256l144 144"/>
</svg>
`;

const chevronRight = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><
  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" 
  stroke-width="25" d="M184 112l144 144-144 144"/>
</svg>
`;

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

function createClone(item) {
  const clone = item.cloneNode(true);
  clone.classList.add('clone');
  clone.classList.remove('selected');

  return clone;
}

function createClones(block) {
  if (block.children.length < 2) return;

  const initialChildren = [...block.children];

  block.lastChild.after(createClone(initialChildren[0]));
  block.lastChild.after(createClone(initialChildren[1]));

  block.firstChild.before(createClone(initialChildren[initialChildren.length - 1]));
  block.firstChild.before(createClone(initialChildren[initialChildren.length - 2]));
}

function createNavButtons(block, intervalId) {
  const buttonLeft = document.createElement('button');
  buttonLeft.innerHTML = chevronLeft;
  buttonLeft.addEventListener('click', () => {
    clearInterval(intervalId);
    prevItem(block);
  });

  const buttonRight = document.createElement('button');
  buttonRight.innerHTML = chevronRight;
  buttonRight.addEventListener('click', () => {
    clearInterval(intervalId);
    nextItem(block);
  });

  [buttonLeft, buttonRight].forEach((navButton) => {
    navButton.classList.add('carousel-nav-button');
  });

  buttonLeft.classList.add('carousel-nav-left');
  buttonRight.classList.add('carousel-nav-right');
  block.parentElement.append(buttonLeft);
  block.parentElement.append(buttonRight);
}

function addSwipeCapability(block, intervalId) {
  let touchstartX = 0;
  let touchendX = 0;

  block.addEventListener('touchstart', (e) => {
    touchstartX = e.changedTouches[0].screenX;
  });

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
  });
}

export default function decorate(block) {
  // create autoscrolling animation
  const intervalId = setInterval(nextItem, 7000, block);

  // create dot buttons and add carousel classes
  const buttons = document.createElement('div');
  buttons.className = 'carousel-dot-buttons';
  [...block.children].forEach((item, i) => {
    item.className = 'carousel-item';

    // create the carousel content
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
      item.appendChild(column);
    });

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

  // Scroll to start element
  // FIXME - Can this be done without set timeout?
  window.setTimeout(() => {
    block.querySelectorAll('.carousel-item.selected').forEach((item) => {
      item.parentNode.scrollTo({
        top: 0,
        left: item.offsetLeft - item.parentNode.offsetLeft,
      });
    });
  }, 500);
}
