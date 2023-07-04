import { createOptimizedPicture, getMetadata } from '../../scripts/lib-franklin.js';
import {
  formatDate, isVideo, videoButton,
} from '../../scripts/scripts.js';
import { div, img } from '../../scripts/dom-helpers.js';

function addMetadata(container) {
  const metadataContainer = document.createElement('div');
  metadataContainer.classList.add('metadata');

  const publishDate = formatDate(getMetadata('publication-date'), { month: 'long' });

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

async function addBlockSticker(container) {
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

async function loadBreadcrumbs(breadcrumbsContainer) {
  const breadCrumbsModule = await import('../breadcrumbs/breadcrumbs-create.js');
  breadCrumbsModule.default(breadcrumbsContainer);
}

function detectPricingRequestAvailable() {
  if (!localStorage.getItem('ipstack:geolocation')) {
    return false;
  }

  try {
    const contient = JSON.parse(localStorage.getItem('ipstack:geolocation')).continent_code;
    return contient === 'EU' || contient === 'NA';
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Could not load user information.', err);
    return false;
  }
}

function showHidePricingRequestButton(block) {
  const pricingRequestButton = block.querySelector('a[href*="/quote-request"]');
  if (!pricingRequestButton) return;

  const pricintRequestButtonContainer = pricingRequestButton.closest('.button-container');
  if (!pricintRequestButtonContainer) return;

  if (!detectPricingRequestAvailable()) {
    pricintRequestButtonContainer.style.display = 'none';
  } else {
    pricintRequestButtonContainer.style.display = '';
  }
}

export function buildHero(block) {
  const inner = document.createElement('div');
  inner.classList.add('hero-inner');
  const container = document.createElement('div');
  container.classList.add('container');

  let picture = block.querySelector('picture');
  if (picture) {
    const originalHeroBg = picture.lastElementChild;
    const optimizedHeroBg = createOptimizedPicture(
      originalHeroBg.src,
      originalHeroBg.getAttribute('alt'),
      true,
      [
        { media: '(min-width: 600px)', width: '2000' },
        { width: '1200' },
      ],
    );

    picture.replaceWith(optimizedHeroBg);
    picture = optimizedHeroBg;
    picture.classList.add('hero-background');
    inner.prepend(picture.parentElement);
  } else {
    inner.classList.add('white-bg');
  }

  const rows = block.children.length;
  [...block.children].forEach((row, i) => {
    if (i === (rows - 1)) {
      if (row.childElementCount > 1) {
        container.classList.add('two-column');
        [...row.children].forEach((column, y) => {
          const image = column.querySelector('img');
          if (y === 1 && image && block.classList.contains('hero')) {
            container.classList.add('right-image');
            image.addEventListener('click', () => {
              const downloadForm = document.querySelector('.download-form');
              if (downloadForm) downloadForm.scrollIntoView(true);
            });
          }
          [...column.querySelectorAll('a')].forEach((link) => {
            const url = new URL(link);
            if (isVideo(url)) {
              const videoContainer = link.closest('div');
              videoContainer.classList.add('video-column');
              const videoIcon = div({ class: 'video-icon' }, img({ src: '/images/play_icon.png' }));
              videoContainer.appendChild(videoIcon);
              videoButton(videoContainer, videoContainer.querySelector('img'), url);
              link.remove();
            }
          });
          container.appendChild(column);
        });
      } else {
        if (row.querySelector('h1:last-child')) inner.classList.add('short');
        container.appendChild(row);
      }
    } else {
      row.remove();
    }
  });

  const breadcrumbs = document.createElement('div');
  breadcrumbs.classList.add('breadcrumbs');

  block.appendChild(inner);
  inner.appendChild(breadcrumbs);
  inner.appendChild(container);

  if (block.classList.contains('blog')) {
    addMetadata(container);
    addBlockSticker(breadcrumbs);
    block.parentElement.appendChild(container);
  }

  showHidePricingRequestButton(block);
  document.addEventListener('geolocationUpdated', () => {
    showHidePricingRequestButton(block);
  });

  loadBreadcrumbs(breadcrumbs);
}

export default async function decorate(block) {
  buildHero(block);
}
