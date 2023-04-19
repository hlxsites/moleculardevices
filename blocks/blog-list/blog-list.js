import ffetch from '../../scripts/ffetch.js';
import { renderBlogCard } from '../../templates/blog/blog.js';
import { div } from '../../scripts/dom-helpers.js'

const BLOGS = new Map();
const viewAllCategory = 'viewall';

function filterChanged(block) {
  block.innerHTML = '';
  BLOGS.get(getCurrentCategory()).forEach(item => {
    block.appendChild(item);
  });
}

function getCurrentCategory() {
  const activeHash = window.location.hash;
  return activeHash ? activeHash.substring(1).toLowerCase() : viewAllCategory;
}

export default async function decorate(block) {
  let blogs = await ffetch('/query-index.json')
    .sheet('blog')
    .all();

  BLOGS.set(viewAllCategory, []);
  const currentCategory = getCurrentCategory();

  blogs.forEach(item => {
    const itemCategory = item.path.split('/')[2];

    if (!BLOGS.has(itemCategory)) {
      BLOGS.set(itemCategory, []);
    }

    const renderedItem = div({class: 'blog-card-wrapper'}, renderBlogCard(item));

    BLOGS.get(itemCategory).push(renderedItem);
    BLOGS.get(viewAllCategory).push(renderedItem);

    if (currentCategory === viewAllCategory || itemCategory === currentCategory) {
      block.appendChild(renderedItem);
    }
  });

  window.addEventListener('hashchange', () => { filterChanged(block) });
}