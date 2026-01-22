// eslint-disable-next-line import/no-cycle
import { submitSearchForm } from './menus/search.js';
import {
  addListeners,
  expandMenu,
  collapseAllSubmenus,
  removeAllEventListeners,
  getElementsWithEventListener,
  fetchMenuId,
} from './helpers.js';
import {
  showRightSubmenu,
  buildLazyMegaMenus,
} from './header-megamenu.js';
import { toggleMobileMenu } from './menus/mobile-menu.js';

const mediaQueryList = window.matchMedia('only screen and (min-width: 991px)');

function attachSearchFormListeners(ids, onSubmitExtra = () => { }) {
  ids.forEach((id) => {
    const form = document.getElementById(id);
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      submitSearchForm(e, id);
      onSubmitExtra();
    });
  });
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

    const menuId = e.currentTarget.getAttribute('menu-id');
    if (!menuId) return;

    const cleanedMenuId = fetchMenuId(menuId);
    const submenuClass = `${cleanedMenuId}-right-submenu`;
    const menu = document.querySelector(`[menu-id="${menuId}"]`);
    if (!menu) return;

    expandMenu(menu.parentElement);

    const rightMenu = document.querySelector(`.${submenuClass}`).parentElement.parentElement;
    if (rightMenu) showRightSubmenu(rightMenu);
  });

  addListeners('.searchlink', 'mousedown', (e) => {
    if (e.target === e.currentTarget) {
      // get the tag of the parent element
      e.preventDefault();
      e.stopPropagation();
      expandMenu(e.currentTarget);
    }
  });

  attachSearchFormListeners(
    ['resourcesSearchForm', 'mainSearchForm'],
    () => collapseAllSubmenus(document),
  );
}

function addEventListenersMobile() {
  function toggleMenu(element) {
    const expanded = element.getAttribute('aria-expanded') === 'true';
    const container = element.closest('ul');
    if (container) collapseAllSubmenus(container);
    element.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  }

  const registeredElements = getElementsWithEventListener();

  document.querySelectorAll('.menu-expandable').forEach((linkElement) => {
    registeredElements.push(linkElement);

    linkElement.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu(linkElement);
    });
  });

  attachSearchFormListeners(
    ['mobileSearchForm'],
    () => toggleMobileMenu(),
  );
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
