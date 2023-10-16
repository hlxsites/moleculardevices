import { buildSearchBar, submitSearchForm } from './menus/search.js';
import {
  img, div, a, p,
} from '../../scripts/dom-helpers.js';
import ffetch from '../../scripts/ffetch.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

function wrapLinkAroundComponent(link, component, removeLink = false) {
  const linkCopy = a({ href: link.href });
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
  const picture = cardContent.querySelector('picture');

  if (link && picture) {
    wrapLinkAroundComponent(link, picture);
  }

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
  const picture = actionableCardContent.querySelector(
    'div:nth-child(2) > div:nth-child(2) > p > picture',
  );
  if (link && picture) {
    wrapLinkAroundComponent(link, picture, true);
  }

  // if card has class btn-new-tab
  if (actionableCardContent.classList.contains('btn-new-tab')) {
    const btns = actionableCardContent.querySelectorAll('div:nth-child(2) > div:nth-child(2) a');
    btns.forEach((btn) => {
      btn.target = '_blank';
      btn.rel = 'noopener';
    });
  }

  return actionableCardContent;
}

function buildImageCardSubmenu(content) {
  const link = content.querySelector('div a');
  const picture = content.querySelector('div picture');
  if (link && picture) {
    wrapLinkAroundComponent(link, picture, false);
  }
}

function buildImageWithTextSubmenu(imageWithTextContent) {
  return imageWithTextContent;
}

function buildImageWithoutTextSubmenu(imageWithoutTextContent) {
  return imageWithoutTextContent;
}

function getRecentBlogPosts(featuredPostUrl, isFeaturedPost) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (isFeaturedPost) {
        resolve(
          ffetch('/query-index.json')
            .sheet('blog')
            .filter((post) => featuredPostUrl.indexOf(post.path) > -1)
            .chunks(5)
            .limit(1)
            .all(),
        );
      } else {
        resolve(
          ffetch('/query-index.json')
            .sheet('blog')
            .filter((post) => featuredPostUrl.indexOf(post.path) === -1)
            .chunks(5)
            .limit(4)
            .all(),
        );
      }
    }, 100);
  });
}

async function getRecentBlogPostsHandler(featuredPostUrl) {
  const recentPosts = div({ class: 'recent-blog-posts-block' });
  const featuredpost = div({ class: 'featured-blog-posts-block' });
  const blogPostMenu = div({ class: 'blog-posts-block' }, recentPosts, featuredpost);

  const recentPostLinks = await getRecentBlogPosts(featuredPostUrl, false);
  const featuredPostLink = await getRecentBlogPosts(featuredPostUrl, true);

  document.querySelector('.blog-lab-notes-right-submenu').appendChild(blogPostMenu);

  setTimeout(() => {
    recentPostLinks.forEach((post) => {
      const link = p(a({ href: post.path }, createOptimizedPicture(post.thumbnail, post.header)));
      const title = p(a({ href: post.path }, `${post.h1.trim().substring(0, 22)}...`));
      const postWrapper = div(link, title);
      recentPosts.appendChild(postWrapper);
    });
    featuredPostLink.forEach((post) => {
      const postTitle = post.title.length > 200
        ? `${post.h1.trim().substring(0, 200)}...`
        : post.h1;
      const link = p(a({ href: post.path }, createOptimizedPicture(post.thumbnail, post.header)));
      const title = p(a({ href: post.path }, postTitle));
      const postWrapper = div(link, title);
      featuredpost.appendChild(postWrapper);
    });
  }, 300);
}

function buildBlogCardSubmenu(block) {
  const featuredPostUrl = block.querySelector('a').getAttribute('href');
  block.querySelector('a').remove();
  getRecentBlogPostsHandler(featuredPostUrl);
}

function getRightSubmenuBuilder(className) {
  const map = new Map();
  map.set('cards-submenu', buildCardsMenu);
  map.set('text-submenu', buildTextSubmenu);
  map.set('large-card-submenu', buildLargeCardsMenu);
  map.set('actionable-card-submenu', buildActionableCardSubmenu);
  map.set('image-with-text-submenu', buildImageWithTextSubmenu);
  map.set('image-without-text-submenu', buildImageWithoutTextSubmenu);
  map.set('image-card-submenu', buildImageCardSubmenu);
  map.set('blog-cards-submenu', buildBlogCardSubmenu);
  return map.get(className);
}

function addIndividualComponents(rightSubMenu, submenuId) {
  if (submenuId === 'resource-hub') {
    const searchBar = buildSearchBar('resourceHubSearchForm');
    searchBar.classList.add('resources-submenu-search');
    rightSubMenu.parentElement.appendChild(searchBar);
    searchBar.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      submitSearchForm(e, 'resourceHubSearchForm');
    });
    return;
  }

  if (submenuId === 'accessories--consumables') {
    rightSubMenu.parentElement.appendChild(
      img({
        class: 'spectra-accessories',
        src: '/images/header-menus/spectra-accessories.png',
        alt: 'Spectra Accessories',
      }),
    );
  }
}

export default function buildRightSubmenu(contentHeader, subMenuId) {
  // get products-megamenu-head-wrapper located in the parent div of the div containing h1
  const rightSubmenuWrapper = div({ class: 'right-submenu' });

  // insert a div inside products-megamenu-head containing all its content
  const rightSubmenuRow = div({ class: 'right-submenu-row flex-space-between' });

  // get div in the parent of the H2/H1 header
  const headerParentDiv = contentHeader.parentElement;
  // get all divs with a class right-submenu
  const rightSubmenus = [...headerParentDiv.querySelectorAll('.right-submenu-content')];

  // add all right-submenu divs to the H2
  rightSubmenus.forEach((rightSubmenu) => {
    // get the class name that has a suffix -submenu
    const rightSubmenuClass = rightSubmenu.classList.value
      .split(' ')
      .find((className) => className.endsWith('-submenu'));
    const rightSubmenuBuilder = getRightSubmenuBuilder(rightSubmenuClass);
    if (rightSubmenuBuilder) {
      rightSubmenuBuilder(rightSubmenu);
      rightSubmenuRow.appendChild(rightSubmenu);
    }

    // add individual components
    addIndividualComponents(rightSubmenu, subMenuId);
  });

  rightSubmenuWrapper.innerHTML = rightSubmenuRow.outerHTML;
  return rightSubmenuWrapper;
}
