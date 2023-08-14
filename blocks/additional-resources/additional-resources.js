import { fetchFragment } from '../../scripts/scripts.js';

async function renderFragment(fragment, block, className) {
  fragment.classList.add(className);
  const actionLink = fragment.querySelector('div > p:last-child:last-of-type a:only-child');
  if (actionLink) {
    actionLink.classList.add('button', 'primary');
  }
  block.append(fragment);
}

export default async function decorate(block) {
  const fragmentPaths = [...block.querySelectorAll('a')].map((a) => a.href);
  block.innerHTML = '';

  if (fragmentPaths.length === 0) {
    return '';
  }

  const fragments = await Promise.all(
    fragmentPaths.map(async (path) => {
      const fragmentHtml = await fetchFragment(path);
      if (fragmentHtml) {
        const fragmentElement = document.createElement('div');
        fragmentElement.innerHTML = fragmentHtml;
        const img = fragmentElement.querySelector('picture');
        const imgAnchor = img.nextElementSibling;
        if (imgAnchor) {
          imgAnchor.innerHTML = '';
          imgAnchor.appendChild(img);
        }
        const h3 = fragmentElement.querySelector('h3');
        return { id: h3.id, title: h3.textContent, html: fragmentElement };
      }
      return null;
    }),
  );

  const apps = document.createElement('div');
  apps.classList.add('additional-resources-container');

  fragments.forEach((fragment) => {
    renderFragment(fragment.html, apps, 'additional-resource');
  });

  block.append(apps);

  return block;
}
