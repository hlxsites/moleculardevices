import { fetchFragment } from '../../scripts/scripts.js';
import createCarousel, { summariseDescription } from '../carousel/carousel.js';
import { div, a, p, h3 } from '../../scripts/dom-helpers.js';

function renderItem(item) {
  // const itemImage = item.thumbnail && item.thumbnail !== '0' ? item.thumbnail : item.image;
  // const buttonText = item.cardC2A && item.cardC2A !== '0' ? item.cardC2A : 'Read More';

  return (
    div({ class: 'app-carousel-item' },
      div({ class: 'app-carousel-thumb' },
        a({ href: item.path },
          item.pictureBlock,
        ),
      ),
      div({ class: 'app-carousel-caption' },
        h3(
          a({ href: item.path }, item.title),
        ),
        p({ class: 'app-description' }, summariseDescription(item.description)),
      ),
    )
  );
}

// function renderItem(item) {
//   const appItem = document.createElement('div');
//   appItem.classList.add('app-carousel-item');

//   // const appThumb = document.createElement('div');
//   // appThumb.classList.add('app-carousel-item-thumb');
//   // appThumb.innerHTML = item.pictureBlock;
//   appItem.append(item.pictureBlock);

//   const appCaption = document.createElement('div');
//   appCaption.classList.add('app-carousel-caption');
//   appCaption.innerHTML = `<h3>${item.title}</h3>`;
//   console.log(item.description)
//   appCaption.append(item.description);
//   appItem.append(appCaption);

//   // const appCaptionText = document.createElement('div');
//   // appCaptionText.classList.add('app-carousel-caption-text');
//   // appCaptionText.innerHTML = item.description;

//   const appItemLink = document.createElement('div');
//   appItemLink.classList.add('app-carousel-link');
//   appItemLink.innerHTML = '<a href="#applications">Read More <i class="fa fa-chevron-circle-right"></i></a>';
//   appItem.append(appItemLink);

//   return appItem;
// }

export default async function decorate(block) {
  const fragmentPaths = [...block.querySelectorAll('a')].map((a) => a.textContent);
  console.log(fragmentPaths)
  const fragments = await Promise.all(fragmentPaths.map(async (path) => {
    const fragmentHtml = await fetchFragment(path);
    if (fragmentHtml) {
      const fragmentElement = document.createElement('div');
      fragmentElement.innerHTML = fragmentHtml;
      console.log(fragmentElement)
      const h3 = fragmentElement.querySelector('h3');
      const pictureBlock = fragmentElement.querySelector('picture');
      const description = fragmentElement.querySelector('div > p:not(:empty)');
      return { id: h3.id, title: h3.textContent, pictureBlock, description};
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

  await createCarousel(
    block,
    sortedFragments,
    {
      navButtons: true,
      dotButtons: false,
      infiniteScroll: true,
      autoScroll: false,
      visibleItems: [
        {
          items: 1,
          condition: () => window.screen.width < 768,
        },
        {
          items: 2,
          condition: () => window.screen.width < 1200,
        }, {
          items: 3,
        },
      ],
      renderItem,
    },
  );
}