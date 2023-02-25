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
  const dotButtons = block.parentNode.querySelectorAll(".carousel-item-button");
  const items = block.querySelectorAll(".carousel-item:not(.clone)");
  const selectedItem = block.querySelector(".carousel-item.selected");

  const index = [...items].indexOf(selectedItem);
  const newIndex = (index + 1) % items.length;
  const newSelectedItem = items[newIndex];

  if (newIndex === 0) {
    // create the ilusion of infinite scrolling
    newSelectedItem.parentNode.scrollTo({
      top: 0,
      left: newSelectedItem.previousElementSibling.offsetLeft - newSelectedItem.parentNode.offsetLeft,
    });
  }

  newSelectedItem.parentNode.scrollTo({
    top: 0,
    left: newSelectedItem.offsetLeft - newSelectedItem.parentNode.offsetLeft,
    behavior: "smooth",
  });

  items.forEach((item) => item.classList.remove("selected"));
  dotButtons.forEach((item) => item.classList.remove("selected"));
  newSelectedItem.classList.add("selected");
  dotButtons[newIndex].classList.add("selected");
}

function prevItem(block) {
  const dotButtons = block.parentNode.querySelectorAll(".carousel-item-button");
  const items = block.querySelectorAll(".carousel-item:not(.clone)");
  const selectedItem = block.querySelector(".carousel-item.selected");

  const index = [...items].indexOf(selectedItem);
  const newIndex = index - 1 < 0 ? items.length - 1 : index - 1;
  const newSelectedItem = items[newIndex];

  if (newIndex == items.length - 1) {
    // create the ilusion of infinite scrolling
    newSelectedItem.parentNode.scrollTo({
      top: 0,
      left: newSelectedItem.nextElementSibling.offsetLeft - newSelectedItem.parentNode.offsetLeft,
    });
  }

  newSelectedItem.parentNode.scrollTo({
    top: 0,
    left: newSelectedItem.offsetLeft - newSelectedItem.parentNode.offsetLeft,
    behavior: "smooth",
  });

  items.forEach((item) => item.classList.remove("selected"));
  dotButtons.forEach((item) => item.classList.remove("selected"));
  newSelectedItem.classList.add("selected");
  dotButtons[newIndex].classList.add("selected");
}

function createClone(item) {
  const clone = item.cloneNode(true);
  clone.classList.add("clone");
  clone.classList.remove("selected");

  return clone;
}

function createClones(block) {
  const length = block.children.length;
  const firstChild = block.firstChild;

  [...block.children].forEach((item, i) => {
    if (i !== 0) {
      block.insertBefore(createClone(item), firstChild);
    }

    if (i !== length) {
      block.lastChild.after(createClone(item));
    }
  });
}

function createNavButtons(block, intervalId) {
  const buttonLeft = document.createElement("button");
  buttonLeft.innerHTML = chevronLeft;
  buttonLeft.addEventListener("click", () => {
    clearInterval(intervalId);
    prevItem(block);
  });

  const buttonRight = document.createElement("button");
  buttonRight.innerHTML = chevronRight;
  buttonRight.addEventListener("click", () => {
    clearInterval(intervalId);
    nextItem(block);
  });

  [buttonLeft, buttonRight].forEach((navButton) => {
    navButton.classList.add("carousel-nav-button");
  });

  buttonLeft.classList.add("carousel-nav-left");
  buttonRight.classList.add("carousel-nav-right");
  block.parentElement.append(buttonLeft);
  block.parentElement.append(buttonRight);
}

export default function decorate(block) {
   // create autoscrolling animation
  const intervalId = setInterval(nextItem, 10000, block);

  // create dot buttons and add carousel classes
  const buttons = document.createElement("div");
  buttons.className = "carousel-item-buttons";
  [...block.children].forEach((item, i) => {
    item.className = "carousel-item";

    const classes = ["image", "text"];
    classes.forEach((e, j) => {
      item.children[j].classList.add(`carousel-item-${e}`);
    });

    const button = document.createElement("button");
    button.classList.add("carousel-item-button");
    if (i === 0) {
      item.classList.add("selected");
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      clearInterval(intervalId)
      block.scrollTo({
        top: 0,
        left: item.offsetLeft - item.parentNode.offsetLeft,
        behavior: "smooth",
      });
      [...buttons.children].forEach((r) => r.classList.remove("selected"));
      button.classList.add("selected");
    });

    buttons.append(button);
  });
  block.parentElement.append(buttons);

  createNavButtons(block, intervalId);
  createClones(block);

  // Scroll to start element
  // FIXME - Can this be done without set timeout?
  window.setTimeout(() => {
    block.querySelectorAll(".carousel-item.selected").forEach((item) => {
      item.parentNode.scrollTo({
        top: 0,
        left: item.offsetLeft - item.parentNode.offsetLeft,
      });
    });
  }, 500);
}
