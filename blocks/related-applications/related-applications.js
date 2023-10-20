import { addLinkIcon, fetchFragment, detectAnchor } from '../../scripts/scripts.js';

async function renderFragment(fragment, block, className) {
  fragment.classList.add(className);
  const actionLink = fragment.querySelector('div > p:last-child:last-of-type a:only-child');
  if (actionLink) {
    addLinkIcon(actionLink);
  }
  block.append(fragment);
}

function alignTitles() {
  // eslint-disable-next-line consistent-return
  const observer = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      const cards = entry.target.querySelectorAll('.related-app');
      // cleanup heights
      cards.forEach((card) => {
        const title = card.querySelector('h3');
        if (title) title.style.removeProperty('height');
      });
      // set heights for 2-column layout
      if (window.matchMedia('only screen and (min-width: 992px)').matches) {
        for (let i = 0; i < cards.length; i += 2) {
          const leftEl = cards[i].querySelector('h3');
          const rightEl = ((i + 1) < cards.length) ? cards[i + 1].querySelector('h3') : '';
          if (leftEl && rightEl) {
            const calcHeight = Math.max(leftEl.clientHeight, rightEl.clientHeight);
            leftEl.style.height = `${calcHeight}px`;
            rightEl.style.height = `${calcHeight}px`;
          }
        }
      }
    });
  });

  const relApps = document.querySelectorAll('.related-apps-container');
  relApps.forEach((relApp) => {
    observer.observe(relApp);
  });
}

export default async function decorate(block) {
  const fragmentPaths = [...block.querySelectorAll('a')].map((a) => a.href);
  const hasTOC = block.classList.contains('toc');
  block.innerHTML = '';

  if (fragmentPaths.length === 0) {
    return '';
  }

  const fragments = await Promise.all(fragmentPaths.map(async (path) => {
    const fragmentHtml = await fetchFragment(path);
    if (fragmentHtml) {
      const fragmentElement = document.createElement('div');
      fragmentElement.innerHTML = fragmentHtml;
      const h3 = fragmentElement.querySelector('h3');
      return { id: h3.id, title: h3.textContent, html: fragmentElement };
    }
    return null;
  }));

  const sortedFragments = fragments.filter((item) => !!item).sort((a, b) => {
    if (a.title < b.title) {
      return -1;
    }
    if (a.title > b.title) {
      return 1;
    }
    return 0;
  });

  const apps = document.createElement('div');
  apps.classList.add('related-apps-container');
  const links = document.createElement('ul');
  links.classList.add('related-links-container');

  sortedFragments.forEach((fragment) => {
    if (hasTOC) {
      const linkFragment = document.createElement('li');
      linkFragment.innerHTML = `<a href="#${fragment.id}">${fragment.title}</a>`;
      renderFragment(linkFragment, links, 'related-link');
    }
    renderFragment(fragment.html, apps, 'related-app');
  });

  if (hasTOC) {
    block.append(links);
  }
  block.append(apps);

  alignTitles();

  detectAnchor(block);

  return block;
}
