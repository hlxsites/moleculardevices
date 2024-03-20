import {
  button, div, iframe, span,
} from '../../scripts/dom-helpers.js';
import { createOptimizedPicture, loadCSS, loadScript } from '../../scripts/lib-franklin.js';

const modalParentClass = 'modal-overlay';
let timer;

export function hideModal() {
  clearTimeout(timer);
  const modal = document.querySelector(`.${modalParentClass}`);
  modal.setAttribute('aria-hidden', true);
  document.body.classList.remove('no-scroll');
}

export function showModal() {
  const newsletterModalOverlay = document.querySelector('.modal-overlay');
  newsletterModalOverlay.removeAttribute('aria-hidden');
  document.body.classList.add('no-scroll');
}

export function triggerModalWithUrl(url) {
  const modal = document.querySelector(`.${modalParentClass}`);
  modal.querySelector('iframe').setAttribute('src', url);
  timer = setTimeout(() => {
    modal.setAttribute('aria-hidden', false);
    document.body.classList.add('no-scroll');
  }, 200);
}

export function iframeResizeHandler(formUrl, id, container) {
  container.querySelector('iframe').addEventListener('load', async () => {
    if (formUrl) {
      /* global iFrameResize */
      iFrameResize({ log: false }, `#${id}`);
    }
  });
}

export function stopProp(e) {
  e.stopPropagation();
}

function triggerModalBtn() {
  const scrollFromTop = window.scrollY;
  const midHeightOfViewport = Math.floor(document.body.getBoundingClientRect().height / 2.25);

  const modalBtn = document.getElementById('show-modal');

  if (scrollFromTop > midHeightOfViewport) {
    if (modalBtn) {
      modalBtn.click();
      modalBtn.remove();
    }
  }
}

export async function decorateModal(formURL, iframeID, modalBody, modalClass, isFormModal) {
  loadScript('/scripts/iframeResizer.min.js');
  loadCSS('/blocks/modal/modal.css');
  const body = document.querySelector('body');

  if (isFormModal) {
    const modalBtn = button({ id: 'show-modal', style: 'display: none;' }, 'Show Modal');
    modalBtn.addEventListener('click', showModal);
    body.append(modalBtn);
    window.addEventListener('scroll', triggerModalBtn);
  }

  const formOverlay = div({ 'aria-hidden': true, class: modalParentClass, style: 'display:none;' });
  formOverlay.addEventListener('click', hideModal);
  const closeBtn = span(
    { class: 'icon icon-close' },
    createOptimizedPicture('/icons/close-video.svg', 'Close Video'),
  );
  closeBtn.addEventListener('click', hideModal);
  const innerWrapper = div({ class: ['modal-inner-wrapper', modalClass] }, modalBody, closeBtn);
  innerWrapper.addEventListener('click', stopProp);
  formOverlay.append(innerWrapper);

  body.append(formOverlay);
  timer = setTimeout(() => {
    formOverlay.removeAttribute('style');
  }, 500);
  iframeResizeHandler(formURL, iframeID, modalBody);
}

export default function decorate(block) {
  const isFormModal = block.classList.contains('form-modal');
  if (isFormModal) {
    const modalContent = block.querySelector(':scope > div > div');
    const link = modalContent.querySelector('p > a:only-child');
    const formURL = link.href;
    const iframeID = 'form-modal';
    const modalBody = div({ class: 'modal-form-col' });
    link.closest('p').remove();

    const iframeWrapper = div({ class: 'modal-iframe-wrapper' },
      iframe({
        src: formURL,
        id: iframeID,
        loading: 'lazy',
        title: 'Modal',
      }),
    );

    const headings = block.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const paragraphs = block.querySelectorAll('p');
    [...headings].forEach((heading) => {
      modalBody.append(heading);
    });
    [...paragraphs].forEach((para) => {
      modalBody.append(para);
    });

    modalBody.appendChild(iframeWrapper);

    decorateModal(formURL, iframeID, modalBody, '', isFormModal);
  }
}
