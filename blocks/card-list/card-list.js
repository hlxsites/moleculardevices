import ffetch from '../../scripts/ffetch.js';
import { createCarousel } from '../carousel/carousel.js';
import { createCard } from '../card/card.js';
import { div, h2 } from '../../scripts/dom-helpers.js';

const viewAllCategory = 'viewall';
const defaultCardRender = await createCard({
  defaultButtonText: 'Learn more',
});

const accessoriesAndConsumables = await createCard({
  defaultButtonText: 'Details',
  c2aLinkStyle: true,
  showImageThumbnail: false,
});

class FilterableCardList {
  constructor(block, config) {
    this.headings = false;
    this.clusterCategories = false;
    // this.sortCards = false;

    this.block = block;
    this.cardRenderer = defaultCardRender;

    Object.assign(this, config);
    this.dataIndex = new Map();
  }

  /** API */

  /**
   * Retrieve the data for the card list, already sorted in the correct order
   * @returns {Array} a list of items to be used for creating cards
   */
  async getData() {
    return [];
  }

  /**
   * Mandatory: Gives the category of an item that will be used for indexing as a filter
   * @param {Object} item
   * @returns {string} - Filterable category of the item
   */
  getCategory(item) {
    return '';
  }

  /**
   * Optional: Creates a custom View All Category list in the index
   * @returns {Array} - A custom built list of items for the view all category
   */
  createViewAllCategoryItems() {
    if (!this.headings && !this.clusterCategories) return null; // already done

    // Take the categories from the category filter component if present
    let categoryOrder = [...document.querySelectorAll('.card-list-filter a')]
      .filter((link) => !!link.href
        && link.href.includes('#')
        && !link.href.includes(`#${viewAllCategory}`),
      )
      .map((link) => link.href.split('#')[1]);

    // There is no card filter on the page,
    // take the ones that we can find in the index
    if (categoryOrder.length === 0) {
      categoryOrder = [...this.dataIndex.keys()].filter((item) => item !== viewAllCategory);
    }

    const viewAllCardList = [];
    categoryOrder.forEach((category) => {
      if (!this.dataIndex.has(category)) return;

      viewAllCardList.push(...this.dataIndex.get(category));
    });

    return viewAllCardList;
  }

  /**
   * Optional: If sortCards is requested, this function needs to be implemenented
   * to tell the rendering how to sort the cards
   * @param {Element} item1
   * @param {Element} item2
   * @returns {Number} see the return of compare functions for Array.sort(compareFunction)
   */
  // compareItems(item1, item2) {
  //   return null;
  // }

  /**
   * Get current filter based on the window hash
   * @returns {string} current filter
   */
  getCurrentCategory() {
    const activeHash = window.location.hash;
    const currentFilter = activeHash ? activeHash.substring(1) : viewAllCategory;
    return this.dataIndex.has(currentFilter) ? currentFilter : viewAllCategory;
  }

  /** Internal Implementation */
  filterChanged() {
    this.carousel.data = this.dataIndex.get(this.getCurrentCategory());
    this.carousel.render();
    this.carousel.block.querySelectorAll('.card-list-heading').forEach((heading) => {
      heading.parentElement.classList.add('carousel-heading-item');
      // heading.parentElement.classList.remove('carousel-item'); TODO
    });
  }

  buildDataIndex() {
    const initialViewAllCategoryItems = [];
    this.dataIndex.set(viewAllCategory, initialViewAllCategoryItems);

    this.data.forEach((item) => {
      const itemCategory = this.getCategory(item);
      if (!itemCategory || itemCategory === '0') return;
      const itemCategoryText = itemCategory;
      const itemCategoryKey = itemCategory.replaceAll(' ', '-');

      if (!this.dataIndex.has(itemCategoryKey)) {
        if (this.headings) {
          const heading = div({ class: 'card-list-heading' },
            h2(itemCategoryText),
          );

          this.dataIndex.set(itemCategoryKey, [heading]);
        } else {
          this.dataIndex.set(itemCategoryKey, []);
        }
      }

      const renderedItem = this.cardRenderer.renderItem(item);
      this.dataIndex.get(itemCategoryKey).push(renderedItem);
      !this.headings && initialViewAllCategoryItems.push(renderedItem);
    });
  }

  async render() {
    // retrieve data
    this.data = await this.getData();

    // Build Data Index
    this.buildDataIndex();

    // Sort the cards within each category
    // if (this.sortCards) {
    //   [...this.dataIndex.values()].forEach((categoryCards) => {
    //     categoryCards.sort(this.compareItems);
    //   });
    // }

    // Create view all category (either for headings or there is a custom implementation override)
    const viewAllCategoryItems = this.createViewAllCategoryItems();
    if (viewAllCategoryItems) {
      this.dataIndex.set(viewAllCategory, viewAllCategoryItems);
    }

    console.log(this.dataIndex);

    // Render the carousel
    this.carousel = await createCarousel(
      this.block,
      this.dataIndex.get(this.getCurrentCategory()),
      {
        infiniteScroll: true,
        navButtons: false,
        dotButtons: false,
        autoScroll: false,
        renderItem: (item) => item,
      },
    );

    // adjust carousel for headings
    // kind of hackish, but otherwise we'd need to refactor all the carousels
    // todo: figure out how to skip
    this.carousel.block.querySelectorAll('.card-list-heading').forEach((heading) => {
      heading.parentElement.classList.add('carousel-heading-item');
      // heading.parentElement.classList.remove('carousel-item'); TODO
    });

    window.addEventListener('hashchange', () => { this.filterChanged(); });
    window.matchMedia('only screen and (max-width: 767px)').onchange = (e) => {
      if (e.matches) {
        this.carousel.setInitialScrollingPosition();
      }
    };
  }
}

function compareByDate(item1, item2) {
  const date1 = item1.date && item1.date !== '0'
    ? item1.date
    : item1.lastModified;

  const date2 = item2.date && item2.date !== '0'
    ? item2.date
    : item2.lastModified;

  return (+date1) - (+date2);
}

const VARIANTS = {
  applications: {
    headings: true,
    // sortCards: true,

    async getData() {
      const applications = await ffetch('/query-index.json')
        .sheet('applications')
        .all();

      applications.sort((application1, application2) => {
        return application1.h1.localeCompare(application2.h1);
      });  

      return applications;
    },

    getCategory(item) {
      return item.applicationCategory && item.applicationCategory !== '0'
        ? item.applicationCategory
        : item.category;
    },

    // compareItems(card1, card2) {
    //   if (card1.querySelector('h2')) return -1;
    //   if (card2.querySelector('h2')) return 1;

    //   return card1.querySelector('h3').textContent
    //     .localeCompare(card2.querySelector('h3').textContent);
    // },
  },

  blog: {
    // TODO
  },

  technology: {
    headings: false,
    sortCards: false,

    async getData() {
      const technologies = await ffetch('/query-index.json')
        .sheet('technologies')
        .all();
      
      technologies.sort(compareByDate);

      return technologies;
    },

    getCategory(item) {
      return item.technologyType;
    },
  },

  products: {
    headings: true,
    sortCards: false,

    async getData() {
      let products = await ffetch('/query-index.json')
        .sheet('products')
        .all();

      products = products.filter(
        (product) => !!product.productLandingPageOrder && product.productLandingPageOrder !== '0',
      );

      products.sort((product1, product2) => {
        return (+product1.productLandingPageOrder) - (+product2.productLandingPageOrder);
      });

      return products;
    },

    getCategory(item) {
      /*
       * Just for the purpose of `/products` landing page service and support items are included
       * with the Category: Lab Automation
       */ 
      return item.path.startsWith('/service-support') ? 'Lab Automation' : item.category;
    },
  },

  'accessories-and-consumables': {
    cardRenderer: accessoriesAndConsumables,
    // clusterCategories: true,

    async getData() {
      let products = await ffetch('/query-index.json')
        .sheet('products')
        .all();

      products = products.filter(
        (product) => product.subCategory === 'Accessories and Consumables',
      );

      products.sort((product1, product2) => { 
        return product1.h1.localeCompare(product2.h1);
      });

      return products;
    },

    getCategory(item) {
      return item.category;
    },
  },

  'assay-kits': {
    cardRenderer: accessoriesAndConsumables,

    async getData() {
      let products = await ffetch('/query-index.json')
        .sheet('products')
        .all();

      products = products.filter(
        (product) => product.category === 'Assay Kits',
      );

      products.sort((product1, product2) => { 
        return product1.h1.localeCompare(product2.h1);
      });

      return products;
    },

    getCategory(item) {
      return item.subCategory;
    },
  },

};

export default async function decorate(block) {
  const cardList = new FilterableCardList(
    block,
    VARIANTS[block.classList[1]],
  );
  await cardList.render();
}
