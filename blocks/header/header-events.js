import { toClassName } from '../../scripts/lib-franklin.js';
import { submitSearchForm } from './menus/search.js';
import {
  addListeners,
  removeAllEventListeners,
  getElementsWithEventListener,
} from './helpers.js';
import {
  showRightSubmenu,
  buildLazyMegaMenus,
} from './header-megamenu.js';

const mediaQueryList = window.matchMedia('only screen and (min-width: 991px)');

function collapseAllSubmenus(menu) {
  menu.querySelectorAll('*[aria-expanded="true"]').forEach((el) => el.setAttribute('aria-expanded', 'false'));
}

function expandMenu(element) {
  collapseAllSubmenus(element.closest('ul'));
  element.setAttribute('aria-expanded', 'true');
}

function addEventListenersDesktop() {
  addListeners('.menu-nav-category', 'mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const body = document.querySelector('body');
    const lazyMegaMenuExists = body.getAttribute('built-lazy-megamenus');
    if (lazyMegaMenuExists !== 'true' || lazyMegaMenuExists === null) {
      buildLazyMegaMenus();
    }

    const menuId = toClassName(e.currentTarget.textContent);
    const submenuClass = `${menuId}-right-submenu`;
    const menu = document.querySelector(`[menu-id="${menuId}"]`);
    expandMenu(menu.parentElement);
    const rightMenu = document.querySelector(`.${submenuClass}`).parentElement.parentElement;
    showRightSubmenu(rightMenu);
  });

  addListeners('.searchlink', 'mousedown', (e) => {
    if (e.target === e.currentTarget) {
      // get the tag of the parent element
      console.log(e.target);
      e.preventDefault();
      e.stopPropagation();
      expandMenu(e.currentTarget);
    }
  });

  const searchFormsIds = [
    'resourcesSearchForm',
    'mainSearchForm',
  ];
  searchFormsIds.forEach((id) => {
    const element = document.getElementById(id);
    element.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      submitSearchForm(e, id);
    });
  });
}

function addEventListenersMobile() {
  function toggleMenu(element) {
    const expanded = element.getAttribute('aria-expanded') === 'true';
    collapseAllSubmenus(element.closest('ul'));
    element.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  }

  document.querySelectorAll('.menu-expandable').forEach((linkElement) => {
    getElementsWithEventListener().push(linkElement);

    linkElement.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu(linkElement);
    });
  });

  const searchFormsIds = [
    'mobileSearchForm',
  ];
  searchFormsIds.forEach((id) => {
    const element = document.getElementById(id);
    element.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      submitSearchForm(e, id);
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
