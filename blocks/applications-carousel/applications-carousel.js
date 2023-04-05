import createCarousel from '../carousel/carousel.js';

async function getFragmentHtml(path) {
  const response = await fetch(`${path}.plain.html`);
  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error('error loading fragment details', response);
    return null;
  }
  const text = await response.text();
  if (!text) {
    // eslint-disable-next-line no-console
    console.error('fragment details empty');
    return null;
  }
  return text;
}

function renderItem(item) {
  const appItem = document.createElement('div');
  appItem.classList.add('app-carousel-item');

  // const appThumb = document.createElement('div');
  // appThumb.classList.add('app-carousel-item-thumb');
  // appThumb.innerHTML = item.pictureBlock;
  appItem.append(item.pictureBlock);

  const appCaption = document.createElement('div');
  appCaption.classList.add('app-carousel-caption');
  appCaption.innerHTML = `<h3>${item.title}</h3>`;
  console.log(item.description)
  appCaption.append(item.description);
  appItem.append(appCaption);

  // const appCaptionText = document.createElement('div');
  // appCaptionText.classList.add('app-carousel-caption-text');
  // appCaptionText.innerHTML = item.description;

  const appItemLink = document.createElement('div');
  appItemLink.classList.add('app-carousel-link');
  appItemLink.innerHTML = '<a href="#applications">Read More <i class="fa fa-chevron-circle-right"></i></a>';
  appItem.append(appItemLink);

  return appItem;
}

export default async function decorate(block) {
  const fragmentPaths = [...block.querySelectorAll('a')].map((a) => a.href);
  const fragments = await Promise.all(fragmentPaths.map(async (path) => {
    const fragmentHtml = await getFragmentHtml(path);
    if (fragmentHtml) {
      const fragmentElement = document.createElement('div');
      fragmentElement.innerHTML = fragmentHtml;
      console.log(fragmentElement)
      const h1 = fragmentElement.querySelector('h1');
      const pictureBlock = fragmentElement.querySelector('picture');
      const description = fragmentElement.querySelector('div > p:not(:empty)');
      return { id: h1.id, title: h1.textContent, pictureBlock, description};
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

  createCarousel(
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