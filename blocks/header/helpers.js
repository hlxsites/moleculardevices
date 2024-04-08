import { getMetadata } from '../../scripts/lib-franklin.js';
import {
  a, div, i, li, span, ul,
} from '../../scripts/dom-helpers.js';

let elementsWithEventListener = [];

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

export function collapseAllSubmenus(menu) {
  menu.querySelectorAll('*[aria-expanded="true"]').forEach((el) => el.setAttribute('aria-expanded', 'false'));
}

export function expandMenu(element) {
  if (element.closest('.sticky') && element.querySelector('.menu-nav-submenu')) {
    window.scroll({ behavior: 'smooth', top: 0 });
  }

  collapseAllSubmenus(element.closest('ul'));
  element.setAttribute('aria-expanded', 'true');
}

export function buildBrandLogo(content) {
  const logoImg = content.querySelector('.nav-brand');

  const logoLink = a(
    { href: '/', 'aria-label': 'Home' },
  );

  const headerPhone = ul({ class: 'cn-header-phone-list' },
    li({ class: 'OneLinkShow_zh' },
      div({ class: 'cn-header-phone' },
        i({ class: 'fa fa-phone' }),
        a({ href: 'tel:400-821-3787', title: 'tel:400-821-3787' },
          span('美谷分子仪器（上海）有限公司'),
          span('咨询服务热线：400-821-3787'),
        ),
      )));

  logoLink.innerHTML = logoImg.outerHTML;
  logoImg.innerHTML = '';

  const logoWrapper = div(
    { id: 'header-logo', class: 'header-logo-wrapper' },
    logoLink,
    headerPhone,
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
  if (!languageTool) return;

  const languagesList = languageTool.querySelector('ul');
  languagesList.classList.add('languages-dropdown');

  const pathLocation = window.location.pathname;
  languagesList.querySelectorAll('a').forEach((link) => {
    link.href = `${link.href}${pathLocation.slice(1)}`;
  });

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
