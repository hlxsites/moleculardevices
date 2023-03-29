let elementsWithEventListener = [];
const mediaQueryList = window.matchMedia('only screen and (min-width: 1024px)');

function collapseAllSubmenus(menu) {
  menu.querySelectorAll('*[aria-expanded="true"]').forEach((el) => el.setAttribute('aria-expanded', 'false'));
}

function removeAllEventListeners() {
  elementsWithEventListener.forEach((el) => {
    el.replaceWith(el.cloneNode(true));
  });
  elementsWithEventListener = [];
}

function addEventListenersDesktop() {
  function expandMenu(element) {
    collapseAllSubmenus(element.closest('ul'));
    element.setAttribute('aria-expanded', 'true');
  }

  document.querySelectorAll('.menu-expandable').forEach((linkElement) => {
    elementsWithEventListener.push(linkElement);

    // Add click event listener for desktop devices
    linkElement.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      expandMenu(linkElement);
    });
  });

  document.querySelectorAll('.menu-nav-submenu-close').forEach((linkElement) => {
    elementsWithEventListener.push(linkElement);

    // Add click event listener for desktop devices
    linkElement.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      collapseAllSubmenus(linkElement.closest('ul'));
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
