import { div, span } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture, loadScript } from '../../scripts/lib-franklin.js';

const modalParentClass = 'modal-overlay';

export function hideModal() {
  const modal = document.querySelector(`.${modalParentClass}`);
  modal.setAttribute('aria-hidden', true);
  document.body.classList.remove('no-scroll');
}

export function showModal() {
  const newsletterModalOverlay = document.querySelector('.modal-overlay');
  newsletterModalOverlay.removeAttribute('aria-hidden');
  document.body.classList.add('no-scroll');
}

export function showModalWithUrl(url) {
  const modal = document.querySelector(`.${modalParentClass}`);
  modal.querySelector('iframe').setAttribute('src', url);
  setTimeout(() => {
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

export async function decorateModal(formURL, iframeID, modalBody, modalClass) {
  loadScript('/scripts/iframeResizer.min.js');
  const body = document.querySelector('body');

  const slasFormOverlay = div({ class: modalParentClass, 'aria-hidden': true });
  slasFormOverlay.addEventListener('click', hideModal);
  body.append(slasFormOverlay);

  const closeBtn = span(
    { class: 'icon icon-close' },
    createOptimizedPicture('/icons/close-video.svg', 'Close Video'),
  );
  closeBtn.addEventListener('click', hideModal);
  const innerWrapper = div({ class: ['modal-inner-wrapper', modalClass] }, modalBody, closeBtn);
  innerWrapper.addEventListener('click', stopProp);
  slasFormOverlay.append(innerWrapper);
  iframeResizeHandler(formURL, iframeID, modalBody);
}

// export default async function decorate(block) {
//   console.log(block);
// }
