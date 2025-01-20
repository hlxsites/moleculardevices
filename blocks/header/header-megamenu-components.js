import { buildSearchBar, submitSearchForm } from './menus/search.js';
import {
  img, div, a, p, h3, strong,
} from '../../scripts/dom-helpers.js';
import ffetch from '../../scripts/ffetch.js';
import { createOptimizedPicture, toClassName } from '../../scripts/lib-franklin.js';
import { formatEventDates } from '../latest-events/latest-events.js';
import {
  formatDate, sortDataByDate, summariseDescription, unixDateToString,
} from '../../scripts/scripts.js';

function wrapLinkAroundComponent(link, component, removeLink = false) {
  let linkCopy;

  if (component.nextElementSibling && component.nextElementSibling.tagName === 'A') {
    linkCopy = a({ href: component.nextElementSibling.href });
    component.nextElementSibling.remove();
  } else {
    linkCopy = a({ href: link.href });
  }

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
  const links = cardContent.querySelectorAll('a');
  const pictures = cardContent.querySelectorAll('picture');

  if (links && pictures) {
    wrapLinkAroundComponent(links[0], pictures[0]);
    pictures.forEach((picture) => {
      if (picture.nextElementSibling && picture.nextElementSibling.tagName === 'A') {
        wrapLinkAroundComponent(picture.nextElementSibling.href, picture);
      }
    });
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

/* RECENT BLOGS */
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

  let recentPostLinks = [];
  const blogs = await getRecentBlogPosts(featuredPostUrl, false);
  const publications = await ffetch('/query-index.json')
    .sheet('publications')
    .filter((resource) => resource.publicationType === 'Full Article')
    .limit(4)
    .all();
  recentPostLinks = sortDataByDate([...publications, ...blogs]).slice(0, 4);
  const featuredPostLink = await getRecentBlogPosts(featuredPostUrl, true);

  document.querySelector('.blog-lab-notes-right-submenu').appendChild(blogPostMenu);

  setTimeout(() => {
    recentPostLinks.forEach((post) => {
      const postTitle = post.h1 || post.title;
      const link = p(a({ href: post.path }, createOptimizedPicture(post.thumbnail, post.header)));
      const title = p(a({ href: post.path }, `${postTitle.trim().substring(0, 40)}...`));
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

/* RECENT EVENTS */
async function recentEventHandler(block) {
  const featuredEventUrl = block.querySelectorAll('a');
  const eventsMenu = div({ class: ['flex-space-between'] });
  document.querySelector('.events-right-submenu').replaceChildren(eventsMenu);

  let events = await ffetch('/query-index.json')
    .sheet('events')
    .filter((item) => item.eventEnd * 1000 > Date.now())
    .all();

  const featuredEvents = [];

  if (featuredEventUrl.length > 0) {
    featuredEventUrl.forEach(async (event) => {
      const eventUrl = new URL(event).pathname;
      const fe = events.filter((ev) => ev.path === eventUrl)[0];
      featuredEvents.push(fe);
    });
    events = featuredEvents;
  }

  const sortedEvents = events.sort((first, second) => first.eventStart - second.eventStart)
    .slice(0, 2);

  sortedEvents.forEach((event) => {
    let description;
    if (event.cardDescription && event.cardDescription !== '0') {
      description = event.cardDescription;
    } else {
      description = event.description;
    }
    const title = div(h3({ id: toClassName(event.title) }, event.title));
    const eventContent = div(
      div(
        p(
          strong(
            `${event.eventType} | ${event.eventRegion} | ${event.eventAddress
            } — ${formatEventDates(event.eventStart, event.eventEnd)}`,
          ),
        ),
        p(summariseDescription(description, 120)),
        p(a({ href: event.path }, 'Read more')),
      ),
    );

    const eventsBlock = div(
      {
        class: [
          'actionable-card-submenu',
          'col-1',
          'events-right-submenu',
          'right-submenu-content',
          'text-only',
        ],
      },
      title,
      eventContent,
    );
    eventsMenu.appendChild(eventsBlock);
  });
}

function buildEventCardSubmenu(block) {
  setTimeout(async () => {
    await recentEventHandler(block);
  }, 300);
}

/* RECENT NEWS */
async function recentNewsHandler() {
  const newsMenu = div({ class: ['flex-space-between'] });
  document.querySelector('.news-cards-submenu').replaceChildren(newsMenu);

  let news = await ffetch('/query-index.json')
    .sheet('news')
    .all();

  news = sortDataByDate(news).slice(0, 1);

  news.forEach((item) => {
    const newsDate = formatDate(unixDateToString(item.date));
    const title = div(h3({ id: toClassName(item.title) }, item.title));
    let description;
    if (item.cardDescription && item.cardDescription !== '0') {
      description = item.cardDescription;
    } else {
      description = item.description;
    }
    const newsContent = div(
      div(
        p(strong(newsDate)),
        p(summariseDescription(description, 120)),
        p(a({ href: item.path }, 'Read more')),
      ),
    );

    const newsBlock = div(
      {
        class: [
          'actionable-card-submenu',
          'col-1',
          'news-right-submenu',
          'right-submenu-content',
          'text-only',
        ],
      },
      title,
      newsContent,
    );
    newsMenu.replaceWith(newsBlock);
  });
}

function buildNewsCardSubmenu(block) {
  setTimeout(async () => {
    await recentNewsHandler(block);
  }, 300);
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
  map.set('event-cards-submenu', buildEventCardSubmenu);
  map.set('news-cards-submenu', buildNewsCardSubmenu);
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
