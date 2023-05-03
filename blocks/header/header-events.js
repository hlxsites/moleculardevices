import { toClassName } from '../../scripts/lib-franklin.js';
import { submitSearchForm } from './menus/search.js';

let elementsWithEventListener = [];
const mediaQueryList = window.matchMedia('only screen and (min-width: 991px)');

function collapseAllSubmenus(menu) {
  menu.querySelectorAll('*[aria-expanded="true"]').forEach((el) => el.setAttribute('aria-expanded', 'false'));
}

function removeAllEventListeners() {
  elementsWithEventListener.forEach((el) => {
    el.replaceWith(el.cloneNode(true));
  });
  elementsWithEventListener = [];
}

function addListeners(selector, eventType, callback) {
  const elements = document.querySelectorAll(selector);

  elements.forEach((element) => {
    elementsWithEventListener.push(element);
    element.addEventListener(eventType, callback);
  });
}

function addEventListenersDesktop() {
  function expandMenu(element) {
    collapseAllSubmenus(element.closest('ul'));
    element.setAttribute('aria-expanded', 'true');
  }

  function showRightSubmenu(element) {
    document.querySelectorAll('header .right-submenu').forEach((el) => el.setAttribute('aria-expanded', 'false'));
    element.setAttribute('aria-expanded', 'true');
  }

  addListeners('.menu-nav-category', 'mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    expandMenu(e.currentTarget.parentElement);
    const rightMenuClass = `${toClassName(e.currentTarget.textContent)}-right-submenu`;
    const rightMenu = document.querySelector(`.${rightMenuClass}`).parentElement.parentElement;
    showRightSubmenu(rightMenu);
  });

  addListeners('.menu-nav-submenu-close', 'mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    collapseAllSubmenus(e.currentTarget.closest('ul'));
  });

  addListeners('.menu-nav-submenu h1', 'mouseover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rightMenu = e.currentTarget.parentElement.querySelector('.right-submenu');
    showRightSubmenu(rightMenu);
  });

  addListeners('.menu-nav-submenu-sections .menu-nav-submenu-section', 'mouseover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rightMenu = e.currentTarget.querySelector('.right-submenu');
    showRightSubmenu(rightMenu);
  });

  addListeners('.searchlink', 'mousedown', (e) => {
    if (e.target === e.currentTarget) {
      // get the tag of the parent element
      e.preventDefault();
      e.stopPropagation();
      expandMenu(e.currentTarget);
    }
  });

  addListeners('.search-form', 'submit', (e) => {
    e.preventDefault();
    e.stopPropagation();
    submitSearchForm(e, 'searchQuery');
  });

  addListeners('.mobile-search-form', 'submit', (e) => {
    e.preventDefault();
    e.stopPropagation();
    submitSearchForm(e, 'mobileSearchQuery');
  });
}

function addEventListenersMobile() {
  function toggleMenu(element) {
    const expanded = element.getAttribute('aria-expanded') === 'true';
    collapseAllSubmenus(element.closest('ul'));
    element.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  }

  document.querySelectorAll('.menu-expandable').forEach((linkElement) => {
    elementsWithEventListener.push(linkElement);

    linkElement.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu(linkElement);
    });
  });
}

function reAttachEventListeners() {
  if (mediaQueryList.matches) {
    addEventListenersDesktop();
  } else {
    addEventListenersMobile();
  }
}

export default function handleViewportChanges(block) {
  mediaQueryList.onchange = () => {
    document.querySelector('main').style.visibility = '';
    removeAllEventListeners();
    collapseAllSubmenus(block);
    reAttachEventListeners();
  };
  reAttachEventListeners();
}
