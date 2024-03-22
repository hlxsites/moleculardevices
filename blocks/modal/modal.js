/* eslint-disable import/no-cycle */
import {
  button, div, iframe, span,
} from '../../scripts/dom-helpers.js';
import { createOptimizedPicture, loadCSS, loadScript } from '../../scripts/lib-franklin.js';
import { iframeResizeHandler } from '../../scripts/scripts.js';
import { newsletterModal } from '../../templates/blog/blog.js';

let timer;
const modalParentClass = 'modal-overlay';

export function hideModal() {
  const modal = document.querySelector(`.${modalParentClass}`);
  modal.setAttribute('aria-hidden', true);
  document.body.classList.remove('no-scroll');
  clearTimeout(timer);
}

export function showModal() {
  const modal = document.querySelector(`.${modalParentClass}`);
  modal.removeAttribute('aria-hidden');
  document.body.classList.add('no-scroll');
}

export function triggerModalWithUrl(url) {
  const modal = document.querySelector(`.${modalParentClass}`);
  const iframeElement = modal.querySelector('iframe');
  iframeElement.src = url;
  timer = setTimeout(() => {
    modal.setAttribute('aria-hidden', false);
    document.body.classList.add('no-scroll');
  }, 500);
}

export function stopProp(event) {
  event.stopPropagation();
}

function triggerModalBtn() {
  const scrollFromTop = window.scrollY;
  const midHeightOfViewport = Math.floor(document.body.getBoundingClientRect().height / 2.25);
  const modalBtn = document.getElementById('show-modal');

  if (scrollFromTop > midHeightOfViewport && modalBtn) {
    modalBtn.click();
    modalBtn.remove();
  }
}

export async function decorateModal(formURL, iframeID, modalBody, modalClass, isFormModal) {
  const modal = document.querySelector(`.${modalParentClass}`);

  if (!modal) {
    const formOverlay = div({ 'aria-hidden': true, class: modalParentClass, style: 'display:none;' });
    const closeBtn = span({ class: 'icon icon-close' }, createOptimizedPicture('/icons/close-video.svg', 'Close Video'));
    const innerWrapper = div({ class: ['modal-inner-wrapper', modalClass] }, modalBody, closeBtn);

    iframeResizeHandler(formURL, iframeID, modalBody);

    loadScript('/scripts/iframeResizer.min.js');
    loadCSS('/blocks/modal/modal.css');

    if (isFormModal) {
      const modalBtn = button({ id: 'show-modal', style: 'display: none;' }, 'Show Modal');
      modalBtn.addEventListener('click', showModal);
      document.body.append(modalBtn);
      window.addEventListener('scroll', triggerModalBtn);
    }

    formOverlay.addEventListener('click', hideModal);
    closeBtn.addEventListener('click', hideModal);
    innerWrapper.addEventListener('click', stopProp);

    formOverlay.append(innerWrapper);
    document.body.append(formOverlay);

    timer = setTimeout(() => {
      formOverlay.removeAttribute('style');
    }, 500);
  }
}

export default async function decorate(block) {
  const isBlogModal = block.classList.contains('blog-popup');
  const isFormModal = block.classList.contains('form-modal');

  if (isBlogModal) {
    const modalContent = block.querySelector(':scope > div > div');
    const link = modalContent.querySelector('p > a:only-child, a:only-child');
    const formURL = link.href;
    await newsletterModal(formURL, 'form-modal');
  }

  if (isFormModal) {
    const elementsToMove = block.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
    const modalContent = block.querySelector(':scope > div > div');
    const link = modalContent.querySelector('p > a:only-child');
    const formURL = link.href;
    const iframeID = 'form-modal';
    const modalBody = div({ class: 'modal-form-col' });
    const iframeWrapper = div({ class: 'modal-iframe-wrapper' },
      iframe({
        src: formURL,
        id: iframeID,
        loading: 'lazy',
        title: 'Modal',
      }),
    );

    link.closest('p').remove();
    elementsToMove.forEach((element) => modalBody.append(element));

    modalBody.appendChild(iframeWrapper);
    await decorateModal(formURL, iframeID, modalBody, '', isFormModal);
  }
}
