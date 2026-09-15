/* eslint-disable import/no-cycle */
import { button, div, span } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture, getMetadata, loadCSS } from '../../scripts/lib-franklin.min.js';
import { newsletterModal } from '../../templates/blog/blog.js';

let timer;
const MODAL_PARENT_CLASS = 'modal-overlay';
const MODAL_CONTENT_CLASS = 'modal-inner-wrapper';

/**
 * Stop click event propagation.
 */
export function stopProp(event) {
  event.stopPropagation();
}

/**
 * Get the global modal.
 */
export function getModal() {
  return document.querySelector(`.${MODAL_PARENT_CLASS}`);
}

/**
 * Show the global modal.
 */
export function showModal() {
  const modal = getModal();

  if (!modal) return;

  modal.removeAttribute('aria-hidden');
  modal.style.removeProperty('display');
  document.body.classList.add('no-scroll');
}

/**
 * Hide the global modal.
 */
export function hideModal() {
  const modal = getModal();

  if (!modal) return;

  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');

  clearTimeout(timer);
}

/**
 * Update the content of the global modal.
 *
 * @param {HTMLElement|HTMLElement[]} content
 * @param {string} modalClass
 */
export function setModalContent(content, modalClass = '') {
  const modal = getModal();

  if (!modal) return;

  const innerWrapper = modal.querySelector(`.${MODAL_CONTENT_CLASS}`);

  if (!innerWrapper) return;

  // Remove existing modal-specific classes.
  innerWrapper.className = MODAL_CONTENT_CLASS;

  if (modalClass) {
    innerWrapper.classList.add(modalClass);
  }

  // Keep the close button.
  const closeBtn = innerWrapper.querySelector('.icon-close');

  innerWrapper.replaceChildren();

  if (Array.isArray(content)) {
    innerWrapper.append(...content);
  } else {
    innerWrapper.append(content);
  }

  if (closeBtn) {
    innerWrapper.append(closeBtn);
  }
}

/**
 * Create the global modal if it doesn't already exist.
 *
 * @returns {HTMLElement}
 */
export function createGlobalModal() {
  let modal = getModal();

  if (modal) return modal;

  const formOverlay = div({ 'aria-hidden': 'true', class: MODAL_PARENT_CLASS });

  const closeBtn = span({
    class: 'icon icon-close',
    role: 'button',
    tabindex: '0',
    'aria-label': 'Close modal',
  }, createOptimizedPicture('/icons/close-video.svg', 'Close'),
  );

  const innerWrapper = div({ class: MODAL_CONTENT_CLASS });

  innerWrapper.append(closeBtn);
  formOverlay.append(innerWrapper);
  document.body.append(formOverlay);

  formOverlay.addEventListener('click', hideModal);
  closeBtn.addEventListener('click', hideModal);
  innerWrapper.addEventListener('click', stopProp);

  // Allow keyboard users to close the modal.
  closeBtn.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      hideModal();
    }
  });

  modal = formOverlay;

  return modal;
}

/**
 * Initialize the global modal.
 */
export async function initGlobalModal() {
  await loadCSS('/blocks/modal/modal.css');

  createGlobalModal();
}

/**
 * Trigger modal with an iframe URL.
 */
export function triggerModalWithUrl(url) {
  const modal = getModal();
  if (!modal) return;

  const queryParams = new URLSearchParams(window.location.search);
  const urlParams = new URL(url, window.location.origin).searchParams;
  const cmpID = queryParams.get('cmp') || urlParams.get('cmp') || '';
  const productFamily = queryParams.get('product_family') || urlParams.get('product_family') || '';
  const productPrimary = queryParams.get('product_primary') || urlParams.get('product_primary') || '';
  const iframeElement = modal.querySelector('iframe');

  urlParams.delete('cmp');
  urlParams.delete('product_family');
  urlParams.delete('product_primary');

  const baseUrl = new URL(url, window.location.origin);
  baseUrl.search = urlParams.toString();

  setTimeout(() => {
    const newParams = new URLSearchParams(baseUrl.search);
    newParams.set('source_url', window.location.href);
    if (cmpID) newParams.set('cmp', cmpID);
    if (productFamily) newParams.set('product_family__c', productFamily);
    if (productPrimary) newParams.set('product_primary_application__c', productPrimary);

    iframeElement.src = `${baseUrl.origin}${baseUrl.pathname}?${newParams.toString()}`;
  }, 200);

  timer = setTimeout(showModal, 500);
}

/**
 * Trigger hidden modal button based on scroll.
 */
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

/**
 * Modal decorator.
 */
export async function decorateModal(modalBody, modalClass, isFormModal) {
  await initGlobalModal();

  const modal = getModal();

  setModalContent(modalBody, modalClass);

  if (isFormModal) {
    const modalBtn = button({ id: 'show-modal', style: 'display: none;' }, 'Show Modal');
    modalBtn.addEventListener('click', showModal);
    document.body.append(modalBtn);
    window.addEventListener('scroll', () => triggerModalBtn(2.25, modalBtn));
  }

  return modal;
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
