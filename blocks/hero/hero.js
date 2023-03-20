export default function decorate(block) {
  const container = document.createElement('div');
  container.classList.add('container');
  if (block.childElementCount > 1) {
    container.classList.add('two-column');
  }

  [...block.children].forEach((div) => {
    container.appendChild(div);
  });

  block.appendChild(container);

  const picture = block.querySelector('picture');
  block.prepend(picture.parentElement);
}
