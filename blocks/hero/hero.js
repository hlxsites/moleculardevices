import { getMetadata } from '../../scripts/lib-franklin.js';
import createBreadcrumbs from '../breadcrumbs/breadcrumbs-create.js';

function addMetadata(container) {
  const metadataContainer = document.createElement('div');
  metadataContainer.classList.add('metadata');

  const publishDate = new Date(getMetadata('publication-date')).toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });

  const publishDateContainer = document.createElement('div');
  publishDateContainer.innerHTML = `
    <i class="fa fa-calendar"></i>
    <span class="blog-publish-date">${publishDate}</span>
  `;
  metadataContainer.appendChild(publishDateContainer);

  const author = getMetadata('author');
  if (author) {
    const authorContainer = document.createElement('div');
    authorContainer.innerHTML = `
      <i class="fa fa-user"></i>
      <span class="blog-author">${author}</span>
    `;
    metadataContainer.appendChild(authorContainer);
  }

  container.appendChild(metadataContainer);
}

function addBlockSticker(container) {
  const stickerContainer = document.createElement('div');
  stickerContainer.classList.add('sticker');
  const sticker = document.createElement('a');
  sticker.href = '/lab-notes';

  const stickerPicture = document.createElement('picture');
  stickerPicture.innerHTML = `
    <source type="image/webp" srcset="/images/lab-notes-hero-sticker.webp">
    <img loading="lazy" alt="Molecular Devices Lab Notes" type="image/png" src="/images/lab-notes-hero-sticker.png">
  `;
  sticker.appendChild(stickerPicture);
  stickerContainer.appendChild(sticker);
  container.appendChild(stickerContainer);
}

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
  picture.classList.add('hero-background');
  block.prepend(picture.parentElement);

  if (block.classList.contains('blog')) {
    addBlockSticker(block);
    addMetadata(container);
    block.parentElement.appendChild(container);
  }
}
