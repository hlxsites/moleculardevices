import ffetch from '../../scripts/ffetch.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { 
  a, div, h3, p
} from '../../scripts/dom-helpers.js';

const BLOGS = new Map();

function summariseDescription(description) {
  let result = description;
  if (result.length > 75) {
    result = result.substring(0, 75);
    const lastSpaceIndex = result.lastIndexOf(' ');
    if (lastSpaceIndex !== -1) {
      result = result.substring(0, lastSpaceIndex);
    }
  }
  return `${result}…'`;
}

export default async function decorate(block) {
  const viewAllCategory = 'viewall';
  const currentCategory = viewAllCategory; // TODO

  let blogs = await ffetch('/query-index.json')
    .sheet('blog')
    .all();

  BLOGS.set(viewAllCategory, []);

  blogs.forEach(item => {
    const itemCategory = item.path.split('/')[1];

    if (!BLOGS.has(itemCategory)) {
      BLOGS.set(itemCategory, []);
    }

    const itemImage = item.thumbnail && item.thumbnail !== '0' ? item.thumbnail : item.image;
    const buttonText = item.cardC2A && item.cardC2A !== '0' ? item.cardC2A : 'Read More';
  
    const renderedItem = (
      div({ class: 'blog-card' },
        div({ class: 'blog-card-thumb' },
          a({ href: item.path },
            createOptimizedPicture(itemImage, item.title, 'lazy', [{ width: '800' }]),
          ),
        ),
        div({ class: 'blog-card-caption' },
          h3(
            a({ href: item.path }, item.title),
          ),
          p({ class: 'blog-card-description' }, summariseDescription(item.description)),
          p({ class: 'button-container' },
            a({ href: item.path, 'aria-label': buttonText, class: 'button primary' }, buttonText),
          ),
        ),
      )
    );

    BLOGS.get(itemCategory).push(renderedItem);
    BLOGS.get(viewAllCategory).push(renderedItem);

    if (currentCategory === viewAllCategory || itemCategory === currentCategory) {
      block.appendChild(renderedItem);
    }
  });
}