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
  const searchForm = document.getElementById(searchQueryId);
  const searchInput = searchForm.querySelector('input');
  const encodedQuery = encodeURIComponent(searchInput.value);
  const searchUrl = `/search-results#q=${encodedQuery}&t=All&sort=relevancy`;
  window.location.href = searchUrl;
}

export function buildMobileSearch() {
  return div(
    { class: 'headersearch' },
    div(
      { class: 'search' },
      form(
        {
          id: 'mobileSearchForm', class: 'mobile-search-form', action: '/search-results', method: 'GET',
        },
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

export function buildSearchBar(formId) {
  const searchForm = form(
    {
      id: formId, class: 'search-form', action: '/search-results', method: 'GET',
    },
    input(
      {
        class: 'form-control', type: 'text', placeholder: 'moleculardevices.com',
      },
    ),
    button(
      { class: 'transparentBtn btn searchbutton', type: 'submit', 'aria-label': 'Search' },
      'Search',
    ),
  );

  return div(
    { class: 'menu-nav-search-bar' },
    h3(
      'Search',
    ),
    div(
      { class: 'search-form-group' },
      searchForm,
    ),
  );
}

export default function buildSearch(content) {
  // get div with class Robot Image with Speach from navContent
  const robotDiv = content.querySelector('.robot-image-with-speech');

  const closeButton = div({ class: 'menu-nav-submenu-close' });

  const searchBar = buildSearchBar('mainSearchForm');

  const search = li(
    { class: 'searchlink header-search', 'aria-expanded': 'false' },
    div(
      { class: 'menu-nav-search-flex' },
      div(
        { class: 'menu-nav-search-view' },
        robotDiv,
        searchBar,
      ),
      closeButton,
    ),
  );

  addCloseMenuButtonListener(closeButton);

  return search;
}
