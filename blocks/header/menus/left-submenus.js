import buildRightSubmenu from './right-submenus.js';

export default function buildMegaMenuLeftMenus(submenuContent) {
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

  return h2List;
}
