const chevronLeft = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><
  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" 
  stroke-width="20" d="M328 112L184 256l144 144"/>
</svg>
`;

const chevronRight = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><
  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" 
  stroke-width="20" d="M184 112l144 144-144 144"/>
</svg>
`;

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

function createNavButtons(block) {
  const buttonLeft = document.createElement("button");
  buttonLeft.innerHTML = chevronLeft;

  buttonLeft.addEventListener("click", () => {
    block.querySelector(".selected");

    block.scrollTo({
      top: 0,
      left: item.offsetLeft - item.parentNode.offsetLeft - 200,
      behavior: "smooth",
    });
    [...buttons.children].forEach((r) => r.classList.remove("selected"));
    button.classList.add("selected");
  });

  const buttonRight = document.createElement("button");
  buttonRight.innerHTML = chevronRight;

  [buttonLeft, buttonRight].forEach((navButton) => {
    navButton.classList.add("carousel-nav-button");
  });

  buttonLeft.classList.add("carousel-nav-left");
  buttonRight.classList.add("carousel-nav-right");
  block.parentElement.append(buttonLeft);
  block.parentElement.append(buttonRight);
}

export default function decorate(block) {
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
      block.scrollTo({
        top: 0,
        left: item.offsetLeft - item.parentNode.offsetLeft - 200,
        behavior: "smooth",
      });
      [...buttons.children].forEach((r) => r.classList.remove("selected"));
      button.classList.add("selected");
    });

    buttons.append(button);
  });

  block.parentElement.append(buttons);

  createNavButtons(block);
  createClones(block);

  // Executed too early
  // block.querySelectorAll(".carousel-item.selected").forEach((item) => {
  //   item.parentNode.scrollTo({
  //     top: 0,
  //     left: item.offsetLeft - item.parentNode.offsetLeft - 200,
  //   });
  // });
}
