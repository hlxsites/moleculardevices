import { embedVideo, fetchFragment } from '../../scripts/scripts.js';
import { div } from '../../scripts/dom-helpers.js';
import { decorateButtons } from '../../scripts/lib-franklin.js';
import { createCarousel } from '../carousel/carousel.js';
import { triggerModalWithUrl } from '../modal/modal.js';

async function renderFragment(fragment, block, className) {
  fragment.classList.add(className);
  decorateButtons(fragment);
  block.append(fragment);
}

// eslint-disable-next-line consistent-return
export default async function decorate(block) {
  block.closest('.section').classList.remove('carousel');
  const fragmentPaths = [...block.querySelectorAll('a')].map((a) => a.href);
  block.innerHTML = '';

  if (fragmentPaths.length === 0) {
    return '';
  }

  const fragments = await Promise.all(
    fragmentPaths.map(async (path) => {
      const fragmentHtml = await fetchFragment(path);
      if (fragmentHtml) {
        const fragmentElement = div();
        fragmentElement.innerHTML = fragmentHtml;

        const vidyardLinks = fragmentElement.querySelectorAll('a[href*="vids.moleculardevices.com"]');
        if (vidyardLinks) {
          vidyardLinks.forEach((link) => {
            const url = new URL(link.href);
            embedVideo(link, url, 'lightbox');
          });
        }

        const isFormModal = block.closest('.section').classList.contains('form-in-modal');
        if (isFormModal) {
          const showModalButtons = fragmentElement.querySelectorAll('a[href*="info.moleculardevices.com"]');
          showModalButtons.forEach(async (link) => {
            link.classList.add('modal-form-toggler');
            link.addEventListener('click', (event) => {
              event.preventDefault();
              triggerModalWithUrl(event.target.href);
            });
          });
        }

        return { html: fragmentElement };
      }
      return null;
    }),
  );

  fragments.forEach((fragment) => {
    renderFragment(fragment.html, block, 'fragments-carousel');
  });

  await createCarousel(block, fragments.html, {
    defaultStyling: true,
    navButtons: true,
    dotButtons: true,
    infiniteScroll: true,
    autoScroll: false,
  });
}
