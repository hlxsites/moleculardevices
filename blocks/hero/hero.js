import { createBreadcrumbs } from '../breadcrumbs/breadcrumbs-create.js';

export default async function decorate(block) {
  const container = document.createElement('div');
  container.classList.add('container');
  if (block.childElementCount > 1) {
    container.classList.add('two-column');
  }

  [...block.children].forEach((div) => {
    container.appendChild(div);
  });

  const breadcrumbs = document.createElement('div');
  breadcrumbs.classList.add('breadcrumbs');
  await createBreadcrumbs(breadcrumbs);
  block.appendChild(breadcrumbs);
  block.appendChild(container);

  const picture = block.querySelector('picture');
  block.prepend(picture.parentElement);
}
