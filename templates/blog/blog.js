import {
  div, img, span, iframe, h3, p, button,
} from '../../scripts/dom-helpers.js';
import { loadScript } from '../../scripts/scripts.js';
import ffetch from '../../scripts/ffetch.js';

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
  const midHeightOfViewport = Math.floor(document.body.getBoundingClientRect().height / 2.25);

  const modalBtn = document.getElementById('show-newsletter-modal');

  if (scrollFromTop > midHeightOfViewport) {
    if (modalBtn) {
      modalBtn.click(showNewsletterModal);
      modalBtn.remove();
    }
  }
}

function newsletterModal(latestNewsletter) {
  const iframeSrc = `https://info.moleculardevices.com/lab-notes-popup?latest_newsletter=${latestNewsletter[0].gatedURL}`;
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
    p(
      "Each month, we'll share trends our customers are setting in science and breakthroughs we're enabling together with promises of a brighter, healthier future.",
    ),
  );
  const rightColumn = div(
    { class: 'newsletter-right-col newsletter-col' },
    div(
      { class: 'modal-iframe-wrapper' },
      div(
        h3('Join our journey'),
        h3('of scientific discovery'),
        iframe({ src: iframeSrc }),
      ),
    ),
  );
  const columnsWrapper = div({ class: 'columns columns-2-cols' }, leftColumn, rightColumn);
  const closeIconSvg = `<svg viewBox="0 0 20.71 20.71" class="close-video-icon">
  <polygon
    fill="#fff"
    points="20.71 0.71 20 0 10.35 9.65 0.71 0 0 0.71 9.65 10.35 0 20 0.71 20.71 10.35 11.06 20 20.71 20.71 20 11.06 10.35 20.71 0.71"
  ></polygon>
</svg>`;
  const closeBtn = span({ class: 'icon icon-close newsletter-button-close' });
  closeBtn.innerHTML = closeIconSvg;
  closeBtn.addEventListener('click', hideNewsletterModal);
  const innerWrapper = div({ class: 'newsletter-inner-wrapper' }, columnsWrapper, closeBtn);
  innerWrapper.addEventListener('click', stopProp);
  newsletterOverlay.append(innerWrapper);
}

window.addEventListener('scroll', triggerModalBtn);

async function getLatestNewsletter() {
  return ffetch('/query-index.json')
    .sheet('resources')
    .filter((resource) => resource.type === 'Newsletter')
    .limit(1)
    .all();
}

export default async function decorate() {
  const latestNewsletter = await getLatestNewsletter();

  loadScript('../../scripts/iframeResizer.min.js');
  setTimeout(() => {
    newsletterModal(latestNewsletter);
  }, 500);

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
