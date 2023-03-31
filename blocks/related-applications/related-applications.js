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
  const element = document.createElement('div');
  element.classList.add(className);
  element.innerHTML = fragment;
  // decorateLinkedPictures(element);
  // await customDecorateIcons(element);
  block.append(element);
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
      const h1 = fragmentHtml.querySelector('h1');
      return { id: h1.id, title: h1.textContent, html: fragmentHtml }
    }
  }));

  // fragments.sort((a, b) => a.title > b.title);
  console.log(fragments)

  const apps = document.createElement('div');
  apps.classList.add('related-applications-fragments');
  const links = document.createElement('ul');

  fragments.forEach(fragment => {
    const linkFragment = `<li><a href="#${fragment.id}">${fragment.title}</a></li>
    `
    renderFragment(linkFragment, links, 'related-application-link')
    renderFragment(fragment, apps, 'related-application')
  });

  const linksSection = document.createElement('div');
  linksSection.classList.add('related-applications-links');
  linksSection.appendChild(links);
  block.appendChild(linksSection);
  block.appendChild(apps);

  console.log(block)
  return block;
}