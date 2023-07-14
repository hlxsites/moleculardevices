import { addLinkIcon, fetchFragment } from '../../scripts/scripts.js';

async function renderFragment(fragment, block, className) {
  fragment.classList.add(className);
  const actionLink = fragment.querySelector('div > p:last-child:last-of-type a:only-child');
  if (actionLink) {
    addLinkIcon(actionLink);
  }
  block.append(fragment);
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

  return block;
}
