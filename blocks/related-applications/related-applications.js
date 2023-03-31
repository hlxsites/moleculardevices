// import { customDecorateIcons, decorateLinkedPictures } from '../../scripts/scripts.js';

async function getFragmentHtml(path) {
  const response = await fetch(`${path}.plain.html`);
  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error('error loading fragment details', response);
    return '';
  }
  const text = await response.text();
  if (!text) {
    // eslint-disable-next-line no-console
    console.error('fragment details empty');
  }
  return text;
}

async function renderFragment(fragment, block, className) {
  fragment.classList.add(className);
  // decorateLinkedPictures(element);
  // await customDecorateIcons(element);
  block.append(fragment);
}

export default async function decorate(block) {
  const fragmentPaths = [...block.querySelectorAll('ul li a')].map((a) => a.href);
  block.innerHTML = '';

  if (fragmentPaths.length === 0) {
    return '';
  }

  const fragments = await Promise.all(fragmentPaths.map(async (path) => {
    if (path) {
      const fragmentHtml = await getFragmentHtml(path);
      const fragmentElement = document.createElement('div');
      fragmentElement.innerHTML = fragmentHtml;
      console.log(fragmentElement)
      const h1 = fragmentElement.querySelector('h1');
      console.log(h1)
      return { id: h1.id, title: h1.textContent, html: fragmentElement }
    }
  }));

  fragments.sort((a, b) => a.title > b.title);
  console.log(fragments)

  const apps = document.createElement('div');
  apps.classList.add('related-applications-container');
  const links = document.createElement('ul');
  links.classList.add('related-links-container');

  fragments.forEach(fragment => {
    const linkFragment = document.createElement('li');
    linkFragment.innerHTML = `<a href="#${fragment.id}">${fragment.title}</a>`;
    renderFragment(linkFragment, links, 'related-link');
    renderFragment(fragment.html, apps, 'related-application');
  });

  block.append(links);
  block.append(apps);

  console.log(block)
  return block;
}