export default function decorate(block) {
  const container = document.createElement('div');
  container.classList.add('container');

  [...block.children].forEach((div) => {
    container.appendChild(div);
  });

  block.appendChild(container);

  const picture = block.querySelector('picture');
  block.prepend(picture.parentElement);
}
