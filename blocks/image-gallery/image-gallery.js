import { decorateIcons } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  console.log('decorating image-gallery', block);

  block.setAttribute('aria-hidden', true);
  const oldBlockHtml = block.innerHTML;
  block.innerHTML = `
<span class="icon icon-icon_link gallery-button-left"></span>
<span class="icon icon-icon_link gallery-button-right"></span>
<span class="icon icon-close-circle-outline gallery-button-close"></span>
<div class="gallery">
  ${oldBlockHtml}
</div>
`;

  const body = document.querySelector('body');

  const visibleGallery = document.createElement('div');
  visibleGallery.classList.add('visible-gallery');

  const pictures = block.querySelectorAll('.gallery > div > div > p > picture:first-of-type');
  for (let i = 0; i < pictures.length; i += 1) {
    const picture = pictures[i];
    const pictureDiv = picture.parentNode.parentNode.parentNode;

    if (i < 5) {
      const clonedPicture = picture.cloneNode(true);

      clonedPicture.addEventListener('click', () => {
        body.classList.add('no-scroll');
        pictureDiv.removeAttribute('aria-hidden');
        block.removeAttribute('aria-hidden');
      });

      visibleGallery.appendChild(clonedPicture);
    }

    pictureDiv.setAttribute('aria-hidden', true);
    pictureDiv.addEventListener('click', () => {
      body.classList.remove('no-scroll');
      pictureDiv.setAttribute('aria-hidden', true);
      block.setAttribute('aria-hidden', true);
    });
  }

  block.parentNode.prepend(visibleGallery);

  const picturesWithThumbnails = block.querySelectorAll('.gallery > div > div > p > picture:nth-of-type(2)');
  for (let i = 0; i < picturesWithThumbnails.length; i += 1) {
    picturesWithThumbnails[i].previousElementSibling.remove();
  }

  block.querySelector('.gallery-button-left').addEventListener('click', () => {
    const visiblePicture = block.querySelector('.gallery > div:not([aria-hidden="true"])');
    const previousPicture = visiblePicture.previousElementSibling;

    visiblePicture.setAttribute('aria-hidden', true);
    if (previousPicture) {
      previousPicture.removeAttribute('aria-hidden');
    } else {
      visiblePicture.parentNode.lastElementChild.removeAttribute('aria-hidden');
    }
  });

  block.querySelector('.gallery-button-right').addEventListener('click', () => {
    const visiblePicture = block.querySelector('.gallery > div:not([aria-hidden="true"])');
    const nextPicture = visiblePicture.nextElementSibling;

    visiblePicture.setAttribute('aria-hidden', true);
    if (nextPicture) {
      nextPicture.removeAttribute('aria-hidden');
    } else {
      visiblePicture.parentNode.firstElementChild.removeAttribute('aria-hidden');
    }
  });

  block.querySelector('.gallery-button-close').addEventListener('click', () => {
    body.classList.remove('no-scroll');
    block.setAttribute('aria-hidden', true);
    const visiblePicture = block.querySelector('.gallery > div:not([aria-hidden="true"])');
    visiblePicture.setAttribute('aria-hidden', true);
  });

  await decorateIcons(block);
}
