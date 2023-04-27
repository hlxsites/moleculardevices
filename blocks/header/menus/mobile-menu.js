import {
  div,
  form,
  fieldset,
  input,
  ul,
  li,
  nav,
  span,
  button,
} from '../../../scripts/dom-helpers.js';

// TODO: styling
function buildSearchForm() {
  return div(
    { class: 'headersearch' },
    div(
      { class: 'search' },
      form(
        fieldset(
          input(
            {
              class: 'form-control', id: 'search_keyword_search21', name: 'search', placeholder: 'Search moleculardevices.com', type: 'text',
            },
          ),
          button(
            { class: 'searchbutton', type: 'submit', 'aria-label': 'Search' },
          ),
        ),
      ),
    ),
  );
}

// TODO: add nav menu items
export function buildMobileMenu() {
  return nav(
    { class: 'mobile-menu' },
    ul(
      { class: 'nav-menu' },
      li(
        { class: 'headersearch-item' },
        buildSearchForm(),
      ),
      li(
        { class: 'mobile-menu-item' },
      ),
    ),
  );
}

export function buildHamburger() {
  const hamburger = button(
    { class: 'hamburger hamburger-open' },
    span(
      { class: 'sr-only' },
      'Toggle navigation',
    ),
    span(
      { class: 'icon-bar' },
    ),
    span(
      { class: 'icon-bar' },
    ),
    span(
      { class: 'icon-bar' },
    ),
  );

  // add listener to toggle hamburger
  hamburger.addEventListener('click', () => {
    if (hamburger.classList.contains('hamburger-open')) {
      // if hamburger is open, close it
      hamburger.classList.remove('hamburger-open');
      hamburger.classList.add('hamburger-close');
    } else {
      // if hamburger is closed, open it
      hamburger.classList.remove('hamburger-close');
      hamburger.classList.add('hamburger-open');
    }
  });

  return hamburger;
}
