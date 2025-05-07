/* eslint-disable import/no-cycle */
import { button, div, span } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture, getMetadata, loadCSS } from '../../scripts/lib-franklin.js';
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
  const queryParams = new URLSearchParams(window.location.search);
  const urlParams = new URL(url, window.location.origin).searchParams;
  const cmpID = queryParams.get('cmp') || urlParams.get('cmp') || '';
  const productFamily = queryParams.get('product_family') || urlParams.get('product_family') || '';
  const productPrimary = queryParams.get('product_primary') || urlParams.get('product_primary') || '';
  const modal = document.querySelector(`.${modalParentClass}`);
  const iframeElement = modal.querySelector('iframe');

  urlParams.delete('cmp');
  urlParams.delete('product_family');
  urlParams.delete('product_primary');

  const baseUrl = new URL(url, window.location.origin);
  baseUrl.search = urlParams.toString();

  setTimeout(() => {
    const newParams = new URLSearchParams(baseUrl.search);
    if (cmpID) newParams.set('cmp', cmpID);
    if (productFamily) newParams.set('product_family__c', productFamily);
    if (productPrimary) newParams.set('product_primary_application__c', productPrimary);

    iframeElement.src = `${baseUrl.origin}${baseUrl.pathname}?${newParams.toString()}`;
  }, 200);

  timer = setTimeout(showModal, 500);
}

export function stopProp(event) {
  event.stopPropagation();
}

function triggerModalBtn(scrollThreshold) {
  const modalBtn = document.getElementById('show-modal');
  const scrollFromTop = window.scrollY;
  const midHeightOfViewport = Math.floor(
    document.body.getBoundingClientRect().height / scrollThreshold);
  if (scrollFromTop > midHeightOfViewport && modalBtn) {
    modalBtn.click();
    modalBtn.remove();
  }
}

export async function decorateModal(modalBody, modalClass, isFormModal) {
  loadCSS('/blocks/modal/modal.css');
  const modal = document.querySelector(`.${modalParentClass}`);

  if (!modal) {
    const formOverlay = div({ 'aria-hidden': true, class: modalParentClass, style: 'display:none;' });
    const closeBtn = span({ class: 'icon icon-close' }, createOptimizedPicture('/icons/close-video.svg', 'Close Video'));
    const innerWrapper = div({ class: ['modal-inner-wrapper', modalClass] }, modalBody, closeBtn);

    if (isFormModal) {
      const modalBtn = button({ id: 'show-modal', style: 'display: none;' }, 'Show Modal');
      modalBtn.addEventListener('click', showModal);
      document.body.append(modalBtn);
      window.addEventListener('scroll', () => triggerModalBtn(2.25, modalBtn));
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
  const formCMP = getMetadata('newsletter-form-cmp');

  if (isBlogModal) {
    await newsletterModal(formCMP);
    const modalBtn = document.getElementById('show-modal');
    window.addEventListener('scroll', () => triggerModalBtn(3.75, modalBtn));
  }

  block.closest('.section').remove();
}
