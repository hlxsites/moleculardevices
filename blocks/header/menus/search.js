import {
  div,
  li,
  h3,
  form,
  input,
  button,
  i,
} from '../../../scripts/dom-helpers.js';
import { addCloseMenuButtonListener } from '../helpers.js';

export function submitSearchForm(event, searchQueryId) {
  event.preventDefault();
  const searchQuery = document.getElementById(searchQueryId).value;
  const encodedQuery = encodeURIComponent(searchQuery);
  const searchUrl = `/search-results#q=${encodedQuery}&t=All&sort=relevancy`;
  window.location.href = searchUrl;
}

export function buildMobileSearch() {
  return div(
    { class: 'headersearch' },
    div(
      { class: 'search' },
      form(
        { class: 'mobile-search-form', action: '/search-results', method: 'GET' },
        input(
          {
            id: 'mobileSearchQuery', class: 'form-control', placeholder: 'Search moleculardevices.com', type: 'text',
          },
        ),
        button(
          { class: 'searchbutton', type: 'submit', 'aria-label': 'Search' },
          i({ class: 'fa fa-search' }),
        ),
      ),
    ),
  );
}

export default function buildSearch(content) {
  // get div with class Robot Image with Speach from navContent
  const robotDiv = content.querySelector('.robot-image-with-speech');

  const searchForm = form(
    { class: 'search-form', action: '/search-results', method: 'GET' },
    input(
      {
        id: 'searchQuery', class: 'form-control', type: 'text', placeholder: 'moleculardevices.com',
      },
    ),
    button(
      { class: 'transparentBtn btn searchbutton', type: 'submit', 'aria-label': 'Search' },
      'Search',
    ),
  );

  const closeButton = div({ class: 'menu-nav-submenu-close' });

  const search = li(
    { class: 'searchlink header-search fa fa-search', 'aria-expanded': 'false' },
    div(
      { class: 'menu-nav-search-flex' },
      div(
        { class: 'menu-nav-search-view' },
        robotDiv,
        div(
          { class: 'menu-nav-search-bar' },
          h3(
            'Search',
          ),
          div(
            { class: 'search-form-group' },
            searchForm,
          ),
        ),
      ),
      closeButton,
    ),
  );

  addCloseMenuButtonListener(closeButton);

  return search;
}
