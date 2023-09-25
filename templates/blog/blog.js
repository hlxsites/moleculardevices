import { div, img, span, iframe, h3, p, button } from '../../scripts/dom-helpers.js';
import { loadScript } from '../../scripts/scripts.js';

function showNewsletterModal() {
  const newsletterModalOverlay = document.querySelector('.newsletter-modal-overlay');
  newsletterModalOverlay.removeAttribute('aria-hidden');
  document.body.classList.add('no-scroll');
}

function hideNewsletterModal() {
  const newsletterModalOverlay = document.querySelector('.newsletter-modal-overlay');
  newsletterModalOverlay.setAttribute('aria-hidden', true);
  document.body.classList.remove('no-scroll');
}

function stopProp(e) {
  e.stopPropagation();
}

function triggerModalBtn() {
  const scrollFromTop = window.scrollY;
  const midHeightOfViewport = Math.floor(document.body.getBoundingClientRect().height / 2);

  const modalBtn = document.getElementById('show-newsletter-modal');

  if (scrollFromTop > midHeightOfViewport) {
    if (modalBtn) {
      modalBtn.click(showNewsletterModal);
      modalBtn.remove();
    }
  }
}

function newsletterModal() {
  const iframeSrc = 'https://info.moleculardevices.com/lab-notes-popup';
  const body = document.querySelector('body');

  const modalBtn = button({ id: 'show-newsletter-modal' }, 'Show Modal');
  modalBtn.addEventListener('click', showNewsletterModal);
  body.append(modalBtn);

  const newsletterOverlay = div({ class: 'newsletter-modal-overlay', 'aria-hidden': true });
  newsletterOverlay.addEventListener('click', hideNewsletterModal);
  body.append(newsletterOverlay);

  const leftColumn = div(
    { class: 'newsletter-left-col newsletter-col' },
    img({ src: '/images/spectra-lab-notes.png', alt: 'Spectra' }),
  );
  const rightColumn = div(
    { class: 'newsletter-right-col newsletter-col' },
    div(
      { class: 'modal-iframe-wrapper' },
      div(
        h3('Join our journey of scientific discovery'),
        p(
          "Each month, we'll share trends our customers are setting in science and breakthroughs we're enabling together with promises of a brighter, healthier future.",
        ),
        iframe({ src: iframeSrc }),
      ),
    ),
  );
  const columnsWrapper = div({ class: 'columns columns-2-cols' }, leftColumn, rightColumn);
  const closeBtn = span({ class: 'icon icon-close-circle-outline newsletter-button-close' });
  closeBtn.addEventListener('click', hideNewsletterModal);
  const innerWrapper = div({ class: 'newsletter-inner-wrapper' }, columnsWrapper, closeBtn);
  innerWrapper.addEventListener('click', stopProp);
  newsletterOverlay.append(innerWrapper);
}

window.addEventListener('scroll', triggerModalBtn);

export default function buildAutoBlocks() {
  loadScript('../../scripts/iframeResizer.min.js');
  newsletterModal();

  // add social share block
  const blogCarousel = document.querySelector('.recent-blogs-carousel');
  if (blogCarousel) {
    const blogCarouselSection = blogCarousel.parentElement;
    const socialShareSection = div(div({ class: 'social-share' }));

    blogCarouselSection.parentElement.insertBefore(socialShareSection, blogCarouselSection);
  }
  // add wave
  const main = document.querySelector('main');
  main.appendChild(
    div(div({ class: 'section-metadata' }, div(div('style'), div('wave, no padding top')))),
  );
}
