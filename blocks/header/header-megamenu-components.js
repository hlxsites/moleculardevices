function wrapLinkAroundComponent(link, component, removeLink = false) {
  const linkCopy = document.createElement('a');
  linkCopy.href = link.href;
  // Insert the new div before the existing div
  component.parentNode.insertBefore(linkCopy, component);
  // Move the existing div inside the new div
  linkCopy.appendChild(component);

  if (removeLink) {
    link.remove();
  }

  return linkCopy;
}

function buildLargeCardsMenu(cardContent) {
  const link = cardContent.querySelector('a');
  const img = cardContent.querySelector('picture');
  wrapLinkAroundComponent(link, img);
  return cardContent;
}

function buildCardsMenu(cardContent) {
  // remove all <div><ul><li></li></ul></div> from cardContent
  // sharepoint is generating empty lists in some elements, so we need to remove them
  const lists = [...cardContent.querySelectorAll('div > ul > li')];
  // check if each list is empty
  lists.forEach((list) => {
    if (list.innerHTML.trim() === '') {
      list.parentElement.parentElement.remove();
    }
  });

  // for each row div inside card
  const rows = [...cardContent.querySelectorAll('div')];
  rows.forEach((row) => {
    // for each card inside the row
    const cards = [...row.querySelectorAll('div')];
    cards.forEach((card) => {
      // if card div is not empty
      if (card.innerHTML.trim() !== '') {
        const link = card.querySelector('a');
        const picture = card.querySelector('picture');

        wrapLinkAroundComponent(link, picture);

        // if the second paragraph of the card contains the string (expand-image),
        // we style the image. We need this because some images fill the card, others dont
        const secondParagraph = card.querySelector('p:nth-child(2)');
        if (secondParagraph.textContent.includes('(expand-image)')) {
          picture.classList.add('expanded-image');
          // delete the second paragraph
          secondParagraph.remove();
        }
      }
    });
  });

  return cardContent;
}

function buildTextSubmenu(textContent) {
  return textContent;
}

function buildActionableCardSubmenu(actionableCardContent) {
  const link = actionableCardContent.querySelector('div:nth-child(2) > div:nth-child(2) > p > a');
  const picture = actionableCardContent.querySelector('div:nth-child(2) > div:nth-child(2) > p > picture');
  wrapLinkAroundComponent(link, picture, true);
  return actionableCardContent;
}

function buildImageWithTextSubmenu(imageWithTextContent) {
  return imageWithTextContent;
}

function getRightSubmenuBuilder(className) {
  const map = new Map();
  map.set('cards-submenu', buildCardsMenu);
  map.set('text-submenu', buildTextSubmenu);
  map.set('large-card-submenu', buildLargeCardsMenu);
  map.set('actionable-card-submenu', buildActionableCardSubmenu);
  map.set('image-with-text-submenu', buildImageWithTextSubmenu);
  return map.get(className);
}

export default function buildRightSubmenu(contentHeader) {
  // get products-megamenu-head-wrapper located in the parent div of the div containing h1
  const rightSubmenuWrapper = document.createElement('div');
  rightSubmenuWrapper.classList.add('right-submenu');

  // insert a div inside products-megamenu-head containing all its content
  const rightSubmenuRow = document.createElement('div');
  rightSubmenuRow.classList.add('right-submenu-row', 'flex-space-between');

  // get div in the parent of the H2/H1 header
  const headerParentDiv = contentHeader.parentElement;
  // get all divs with a class right-submenu
  const rightSubmenus = [...headerParentDiv.querySelectorAll('.right-submenu-content')];

  // add all right-submenu divs to the H2
  rightSubmenus.forEach((rightSubmenu) => {
    // get the class name that has a suffix -submenu
    const rightSubmenuClass = rightSubmenu.classList.value.split(' ').find((className) => className.endsWith('-submenu'));
    const rightSubmenuBuilder = getRightSubmenuBuilder(rightSubmenuClass);
    if (rightSubmenuBuilder) {
      rightSubmenuBuilder(rightSubmenu);
      rightSubmenuRow.appendChild(rightSubmenu);
    }
  });

  rightSubmenuWrapper.innerHTML = rightSubmenuRow.outerHTML;
  return rightSubmenuWrapper;
}
