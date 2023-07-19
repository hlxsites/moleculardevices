import { addLinkIcon, fetchFragment } from '../../scripts/scripts.js';

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
      const currHeights = [];
      const alignedHeights = [];
      const cards = entry.target.querySelectorAll('.related-app');

      // get current heights
      cards.forEach((card, idx) => {
        const title = card.querySelector('h3');
        // define the new ones
        currHeights[idx] = 0;
        if (title) {
          // cleanup existing heights before setting them
          title.style.removeProperty('height');
          currHeights[idx] = title.clientHeight;
        }
      });

      // calculate new heights
      if (window.innerWidth > 991) {
        // 2 cols per row
        for (let i = 0; i < currHeights.length; i += 2) {
          const curr = currHeights[i];
          const next = (i + 1 < currHeights.length) ? currHeights[i + 1] : 0;
          alignedHeights[i] = Math.max(curr, next);
          alignedHeights[i + 1] = Math.max(curr, next);
        }
      }

      // set heights
      cards.forEach((card, idx) => {
        const title = card.querySelector('h3');
        if (title) {
          if (window.innerWidth < 992) {
            // 1 col per row - reset heights
            title.style.removeProperty('height');
          } else {
            // 2 cols per row - set new heights
            title.style.height = `${alignedHeights[idx]}px`;
          }
        }
      });
    });
  });

  observer.observe(document.body);
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
  if (sortedFragments.length > 10) {
    links.classList.add('cols-3');
  }

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

  return block;
}
