import { getMetadata, toClassName } from '../../scripts/lib-franklin.js';
import {
  a,
  div,
  li,
} from '../../scripts/dom-helpers.js';

let elementsWithEventListener = [];

export function getSubmenus() {
  return ['Products', 'Applications', 'Resources', 'Service & Support', 'Company', 'Contact Us'];
}

export function getSubmenuIds() {
  return getSubmenus().map((submenu) => toClassName(submenu));
}

export function getSubmenuIdFromTitle(title) {
  return getSubmenuIds()[getSubmenus().indexOf(title)];
}

export function getElementsWithEventListener() {
  return elementsWithEventListener;
}

export function addListeners(selector, eventType, callback) {
  const elements = document.querySelectorAll(selector);

  elements.forEach((element) => {
    elementsWithEventListener.push(element);
    element.addEventListener(eventType, callback);
  });
}

export function addCloseMenuButtonListener(button) {
  button.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.closest('ul').querySelectorAll(
      '*[aria-expanded="true"]',
    ).forEach(
      (el) => el.setAttribute('aria-expanded', 'false'),
    );
  });
}

export function removeAllEventListeners() {
  elementsWithEventListener.forEach((el) => {
    el.replaceWith(el.cloneNode(true));
  });
  elementsWithEventListener = [];
}

export function buildBrandLogo(content) {
  const logoImg = content.querySelector('.nav-brand > div > div > picture');

  const logoLink = a(
    { href: '/', 'aria-label': 'Home' },
  );
  logoLink.innerHTML = logoImg.outerHTML;

  const logoWrapper = div(
    { id: 'header-logo' },
    logoLink,
  );
  return logoWrapper;
}

export async function fetchHeaderContent() {
  const navPath = getMetadata('nav') || '/nav';
  const resp = await fetch(`${navPath}.plain.html`, window.location.pathname.endsWith('/nav') ? { cache: 'reload' } : {});
  if (!resp.ok) return {};

  const html = await resp.text();

  const content = document.createElement('div');
  content.innerHTML = html;
  return content;
}

export function reverseElementLinkTagRelation(element) {
  const linkElement = element.querySelector('a');
  if (linkElement) {
    element.removeChild(linkElement);

    const newLinkElement = a({ href: linkElement.href });

    element.innerHTML = linkElement.innerHTML;
    element.parentNode.replaceChild(newLinkElement, element);

    newLinkElement.appendChild(element);
    return newLinkElement;
  }

  return element;
}

export function buildRequestQuote(classes) {
  const familyId = getMetadata('family-id');
  const link = familyId ? `/quote-request?pid=${familyId}` : '/quote-request';
  return li(
    { class: classes },
    a(
      { href: link, 'aria-label': 'Request Quote' },
      'Request Quote',
    ),
  );
}

export function decorateLanguagesTool(tools) {
  const languageTool = tools.querySelector('li:nth-child(2)');
  const languagesList = languageTool.querySelector('ul');
  languagesList.classList.add('languages-dropdown');

  languageTool.addEventListener('click', () => {
    languagesList.classList.toggle('show');
  });

  const body = document.querySelector('body');
  body.addEventListener('click', (e) => {
    if (e.target !== languageTool) {
      languagesList.classList.remove('show');
    }
  });
}
