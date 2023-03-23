function breadcrumb() {
  const div = document.createElement('div');
  const ol = document.createElement('ol');

  div.classList.add('breadcrumb');
  div.appendChild(ol);

  ol.innerHTML = "<li><a>Home</a></li><li class='active'>Applications</li>";
  return div;
}

export default function decorate(block) {
  const container = document.createElement('div');
  container.classList.add('container');
  if (block.childElementCount > 1) {
    container.classList.add('two-column');
  }

  [...block.children].forEach((div) => {
    container.appendChild(div);
  });

  block.appendChild(breadcrumb());
  block.appendChild(container);

  const picture = block.querySelector('picture');
  block.prepend(picture.parentElement);
}
