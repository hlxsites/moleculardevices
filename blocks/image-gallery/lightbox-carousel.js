import { a, div, span } from '../../scripts/dom-helpers.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';

export default function createLightboxCarousel(galleryBlock) {
  const { body } = document;
  const images = [...galleryBlock.querySelectorAll('img')];
  if (!images.length) return;

  // Create overlay elements
  const lightboxOverlay = div({ class: 'lightbox-image-modal-overlay' });
  const lightboxModal = div({ class: 'lightbox-image-modal' });
  const modalWrapper = div({ class: 'lightbox-image-modal-wrapper' });
  const modalBody = div({ class: 'lightbox-image-modal-body' });
  const carouselContent = div({ class: 'lightbox-image-modal-carousel-content' });
  const carouselNav = div({ class: 'lightbox-image-modal-carousel-nav' });

  const closeBtn = a({ class: 'close' }, span({ class: 'icon icon-close-video' }));
  const prevBtn = a({ class: 'left' }, span({ class: 'icon icon-chevron-left' }));
  const nextBtn = a({ class: 'right' }, span({ class: 'icon icon-chevron-right' }));
  carouselNav.append(prevBtn, nextBtn);

  const itemsWrapper = div({ class: 'carousel-items lightbox-image-transition' });
  carouselContent.appendChild(itemsWrapper);
  modalBody.append(carouselContent, carouselNav);
  modalWrapper.append(closeBtn, modalBody);
  lightboxModal.appendChild(modalWrapper);

  // Append to body
  body.append(lightboxOverlay, lightboxModal);
  decorateIcons(lightboxModal);

  // Clone image cards into lightbox
  const cards = [...galleryBlock.children];
  cards.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.classList.add('lightbox-image-modal-carousel-item');
    itemsWrapper.appendChild(clone);
  });

  let currentIndex = 0;

  const updateCarousel = (index, animate = true) => {
    const items = [...itemsWrapper.children];
    const containerWidth = carouselContent.offsetWidth;

    currentIndex = (index + items.length) % items.length;

    itemsWrapper.style.transition = animate ? 'transform 0.5s ease' : 'none';
    itemsWrapper.style.transform = `translateX(-${containerWidth * currentIndex}px)`;

    // Ensure all items have correct width
    items.forEach((item) => {
      item.style.maxWidth = `${containerWidth}px`;
    });
  };

  // Click to open lightbox
  images.forEach((img, i) => {
    img.addEventListener('click', () => {
      lightboxOverlay.classList.add('show');
      lightboxModal.classList.add('show');
      body.classList.add('no-scroll');
      updateCarousel(i, false);
    });
  });

  // Controls
  prevBtn.addEventListener('click', () => updateCarousel(currentIndex - 1));
  nextBtn.addEventListener('click', () => updateCarousel(currentIndex + 1));
  closeBtn.addEventListener('click', () => {
    lightboxOverlay.classList.remove('show');
    lightboxModal.classList.remove('show');
    body.classList.remove('no-scroll');
  });
  lightboxOverlay.addEventListener('click', () => {
    lightboxOverlay.classList.remove('show');
    lightboxModal.classList.remove('show');
    body.classList.remove('no-scroll');
  });

  // Resize fix
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateCarousel(currentIndex, false);
    }, 150);
  });
}
