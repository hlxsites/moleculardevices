import handleViewportChanges from './header-events.js';
import { fetchHeaderContent } from './header.js';
import buildRightSubmenu from './header-megamenu-components.js';
import { getMetadata } from '../../scripts/lib-franklin.js';

function buildMegaMenu(navContent, submenuContent) {
  const productsSubmenu = document.createElement('div');
  const title = submenuContent.querySelector('h1');
  productsSubmenu.append(title.cloneNode(true));

  // get div after h1
  const divAfterH1 = submenuContent.querySelector('h1').nextElementSibling;
  productsSubmenu.append(buildRightSubmenu(divAfterH1));

  // get all H2s and create a list of them
  const h2s = [...submenuContent.querySelectorAll('h2')];
  const h2List = document.createElement('ul');
  h2List.classList.add('menu-nav-submenu-sections');

  // add H2s to list
  h2s.forEach((h2) => {
    const h2ListItem = document.createElement('li');
    h2ListItem.classList.add('menu-nav-submenu-section');
    h2ListItem.innerHTML = h2.outerHTML;

    h2ListItem.append(buildRightSubmenu(h2));

    h2List.append(h2ListItem);
  });

  productsSubmenu.append(h2List);

  submenuContent.innerHTML = productsSubmenu.outerHTML;
  const backgroundImg = navContent.querySelector('.submenu-background img');
  submenuContent.style.backgroundImage = `url(${backgroundImg.src})`;
}

function getSubmenus() {
  return ['products', 'applications', 'resources', 'service-support', 'company', 'contact-us'];
}

export default async function fetchAndStyleMegamenus(headerBlock) {
  // fetch the header content, we need it to be able to get the background image
  const headerContent = await fetchHeaderContent();

  // ------ Submenus ------
  const submenusList = getSubmenus();

  // Fetch all submenu content concurrently
  const submenuProcessingPromises = [];
  for (let i = 0; i < submenusList.length - 1; i += 1) {
    const submenuId = submenusList[i];
    const submenuPath = getMetadata(`${submenuId}-submenu`) || `/fragments/menu/${submenuId}`;

    const processingPromise = fetch(`${submenuPath}.plain.html`, window.location.pathname.endsWith(`/${submenuId}`) ? { cache: 'reload' } : {})
      .then(async (submenuResponse) => {
        if (submenuResponse.ok) {
          const closeButton = document.createElement('div');
          closeButton.classList.add('menu-nav-submenu-close');

          const submenuHtml = await submenuResponse.text();
          const submenuContent = document.createElement('div');
          submenuContent.classList.add('menu-nav-submenu');
          submenuContent.innerHTML = submenuHtml;

          // Get submenu builder, and build submenu
          buildMegaMenu(headerContent, submenuContent);

          // Get the list item in the header block that contains a div with attribute menu-id
          // that matches the submenuId
          const li = headerBlock.querySelector(`div[menu-id="${submenuId}"]`).closest('li');
          li.append(closeButton);
          li.append(submenuContent);
        }
      });

    submenuProcessingPromises.push(processingPromise);
  }

  // Process all submenu responses
  await Promise.all(submenuProcessingPromises);

  handleViewportChanges(headerBlock);
}
