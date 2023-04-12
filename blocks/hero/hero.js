import createBreadcrumbs from '../breadcrumbs/breadcrumbs-create.js';
import { getVideoId, buildVideo } from '../vidyard/video-create.js';

export default async function decorate(block) {
  const container = document.createElement('div');
  container.classList.add('container');

  [...block.children].forEach((row, i) => {
    if (i == 0 && row.childElementCount > 1) {
      container.classList.add('two-column');
      [...row.children].forEach((column, y) => {
        if (getVideoId(column.textContent)) {
          column.classList.add('video-column');
          buildVideo(block, column, getVideoId(column.textContent));
        }
        container.appendChild(column);
      })
    } else {
      container.appendChild(row);
    }
  });

  const breadcrumbs = document.createElement('div');
  breadcrumbs.classList.add('breadcrumbs');
  await createBreadcrumbs(breadcrumbs);
  block.appendChild(breadcrumbs);
  block.appendChild(container);

  const picture = block.querySelector('picture');
  block.prepend(picture.parentElement);
}
