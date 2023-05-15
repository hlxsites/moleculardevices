import { toClassName } from '../../scripts/lib-franklin.js';
import { submitSearchForm } from './menus/search.js';
import {
  fetchHeaderContent,
  addListeners,
  removeAllEventListeners,
  getElementsWithEventListener,
  getSubmenuIds,
} from './helpers.js';
import {
  fetchAndStyleMegamenus,
  fetchAndStyleMegamenu,
  showRightSubmenu,
} from './header-megamenu.js';

const mediaQueryList = window.matchMedia('only screen and (min-width: 991px)');

function collapseAllSubmenus(menu) {
  menu.querySelectorAll('*[aria-expanded="true"]').forEach((el) => el.setAttribute('aria-expanded', 'false'));
}

function expandMenu(element) {
  collapseAllSubmenus(element.closest('ul'));
  element.setAttribute('aria-expanded', 'true');
}

async function fetchAndOpenMegaMenu(event) {
  const menuId = toClassName(event.currentTarget.textContent);
  const submenuClass = `${menuId}-right-submenu`;

  // fetch and style the megamenus if they haven't been fetched yet
  if (!document.querySelector('.menu-nav-submenu')) {
    const headerBlock = document.querySelector('.header');
    const headerContent = await fetchHeaderContent();

    // first we load the menu that the user clicked, to improve responsiveness
    // only after, we start loading the others in the background
    await fetchAndStyleMegamenu(headerBlock, headerContent, menuId);

    const submenusList = getSubmenuIds();
    submenusList.splice(submenusList.indexOf(menuId), 1);
    fetchAndStyleMegamenus(headerBlock, headerContent, submenusList);
  }

  const menu = document.querySelector(`[menu-id="${menuId}"]`);
  expandMenu(menu.parentElement);
  const rightMenu = document.querySelector(`.${submenuClass}`).parentElement.parentElement;
  showRightSubmenu(rightMenu);
}

function addEventListenersDesktop() {
  addListeners('.menu-nav-category', 'mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    fetchAndOpenMegaMenu(e);
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
    getElementsWithEventListener().push(linkElement);

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
