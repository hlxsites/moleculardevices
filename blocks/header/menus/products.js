import buildMegaMenuLeftMenus from './left-submenus.js';

function buildProductsMegamenuHead(submenuContent) {
  // get products-megamenu-head-wrapper located in the parent div of the div containing h1
  const productsMegaMenuHeadWrapper = document.createElement('div');
  productsMegaMenuHeadWrapper.classList.add('right-submenu');

  // insert a div inside products-megamenu-head containing all its content
  const productsMegaMenuHead = document.createElement('div');
  productsMegaMenuHead.classList.add('right-submenu-row', 'flex-space-between');

  // get all large-card divs
  const largeCards = [...submenuContent.querySelectorAll('.large-card')];
  largeCards.forEach((card) => {
    productsMegaMenuHead.appendChild(card);
  });

  productsMegaMenuHeadWrapper.innerHTML = productsMegaMenuHead.outerHTML;
  return productsMegaMenuHeadWrapper;
}

export default function buildProductsMegaMenu(navContent, submenuContent) {
  const productsSubmenu = document.createElement('div');
  productsSubmenu.append(submenuContent.querySelector('h1'));

  // get products-megamenu-head-wrapper located in the parent div of the div containing h1
  productsSubmenu.append(buildProductsMegamenuHead(submenuContent));

  productsSubmenu.append(buildMegaMenuLeftMenus(submenuContent));

  submenuContent.innerHTML = productsSubmenu.outerHTML;
  const backgroundImg = navContent.querySelector('.submenu-background img');
  submenuContent.style.backgroundImage = `url(${backgroundImg.src})`;
}
