/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */

const TABS_MAPPING = [
  { id: 'overview', sectionName: 'Overview' },
  { id: 'Resources', fragment: '/fragments/relatated-resources' },
  { id: 'Orderingoptions', sectionName: 'Ordering Options', blockName: 'Product Ordering Options' },
  { id: 'Order', blockName: 'Product Order' },
  { id: 'options', sectionName: 'Options' },
  { id: 'workflow', sectionName: 'Workflow' },
  {
    id: 'CompatibleProducts',
    sectionName: 'Compatible Products & Services',
    fragment: '/fragments/compatible-products',
  },
  { id: 'Citations', blockName: 'Product Citations' },
  {
    id: 'RelatedProducts',
    sectionName: 'Related Products & Services',
    fragment: '/fragments/products-related',
  },
  {
    id: 'relatedproducts',
    sectionName: 'Related Products & Services',
    fragment: '/fragments/products-related',
  },
  {
    id: 'specs',
    sectionName: 'Specifications & Options',
    fragment: '/fragments/product-specifications',
  },
];

/**
 * Special handling for resource document meta data.
 */
const loadResourceMetaAttributes = (url, params, document, meta) => {
  let resourceMetadata = {};
  // we use old XMLHttpRequest as fetch seams to have problems in bulk import
  const request = new XMLHttpRequest();
  let sheet = 'resources';
  if (params.originalURL.indexOf('/newsroom/in-the-news/') > 0) {
    sheet = 'publications';
  }
  if (params.originalURL.indexOf('/products/') > 0) {
    sheet = 'products-applications';
  }
  if (params.originalURL.indexOf('/events/') > 0) {
    sheet = 'events';
  }
  if (params.originalURL.indexOf('/resources/citations/') > 0) {
    sheet = 'citations';
  }
  request.open(
    'GET',
    `http://localhost:3001/export/moldev-resources-sheet-041720223.json?host=https%3A%2F%2Fmain--moleculardevices--hlxsites.hlx.page&limit=10000&sheet=${sheet}`,
    false
  );
  request.overrideMimeType('text/json; UTF-8');
  request.send(null);
  if (request.status === 200) {
    resourceMetadata = JSON.parse(request.responseText).data;
  }

  const resource = resourceMetadata.find((n) => n.URL === params.originalURL);
  if (resource) {
    // meta.Type = resource['Asset Type'];
    if (resource['Tagged to Products']) {
      meta['Related Products'] = resource['Tagged to Products'];
    }
    if (resource['Tagged to Technology']) {
      meta['Related Technologies'] = resource['Tagged to Technology'];
    }
    if (resource['Tagged to Applications']) {
      meta['Related Applications'] = resource['Tagged to Applications'];
    }
    if (resource['Gated/Ungated'] === 'Yes') {
      meta.Gated = 'Yes';
      const gatedUrl = resource['Gated URL'];
      meta['Gated URL'] = gatedUrl.startsWith('http') ? gatedUrl : `https://www.moleculardevices.com${gatedUrl}`;
    }
    if (resource.Publisher) {
      meta.Publisher = resource.Publisher;
    }
    if (resource['Resource Author']) {
      meta.Author = resource['Resource Author'];
    }
    if (resource['Card CTA']) {
      meta['Card C2A'] = resource['Card CTA'];
    }
    if (resource['Citation Number']) {
      meta['Citation Number'] = resource['Citation Number'];
    }
    if (resource['Event Type']) {
      meta['Event Type'] = resource['Event Type'];
    }
    if (resource.Region) {
      meta['Event Region'] = resource.Region;
    }
    if (resource.Thumbnail) {
      const el = document.createElement('img');
      el.src = resource.Thumbnail;
      if (params.originalURL.indexOf('/events/') > 0) {
        if (!meta.Image) {
          meta.Image = el;
        }
      } else {
        meta.Thumbnail = el;
      }
    }

    const publishDate = new Date(resource['Created On']);
    if (publishDate) {
      meta['Publication Date'] = publishDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    }
  } else {
    console.warn('Resource item for %s not found', params.originalURL);
  }
};

const loadFragmentIndex = (type, ref) => {
  const request = new XMLHttpRequest();
  request.open(
    'GET',
    'http://localhost:3001/fragments/query-index.json?host=https%3A%2F%2Fmain--moleculardevices--hlxsites.hlx.page&limit=1000',
    false,
  );
  request.overrideMimeType('text/json; UTF-8');
  request.send(null);
  let fragments = {};
  if (request.status === 200) {
    fragments = JSON.parse(request.responseText).data;
  }

  // eslint-disable-next-line max-len
  const fragment = fragments.find((n) => n.title.trim().toLowerCase() === ref.trim().toLowerCase() && n.type === type);
  if (fragment && fragment.path.startsWith('/')) {
    fragment.path = `https://main--moleculardevices--hlxsites.hlx.page${fragment.path}`;
  }
  return fragment;
};

const createFragmentList = (document, type, fragmentNames) => {
  const linkList = [];
  fragmentNames.forEach((fragmentName) => {
    const fragment = loadFragmentIndex(type, fragmentName);
    if (fragment) {
      const link = document.createElement('a');
      link.href = fragment.path;
      link.textContent = fragment.path;
      linkList.push(link);
    }
  });
  return linkList;
};

const createMetadata = (url, document) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML
      .replace(/[\n\t]/gm, '')
      .replace(/\|.*/, '')
      .trim();
  }

  const desc = document.querySelector('[property="og:description"]');
  if (desc) {
    meta.Description = desc.content;
  }

  const img = document.querySelector('[property="og:image"]');
  if (img && img.content) {
    const el = document.createElement('img');
    let imgUrl = img.content;
    if (imgUrl.startsWith('/')) {
      imgUrl = `https://www.moleculardevices.com${imgUrl}`;
    }
    el.src = imgUrl;
    meta.Image = el;
  }

  return meta;
};

/**
 * Sanitizes a name for use as class name.
 * @param {string} name The unsanitized name
 * @returns {string} The class name
 */
export function toClassName(name) {
  return typeof name === 'string'
    ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    : '';
}

const cleanUp = (document) => {
  document.querySelectorAll('table').forEach((table) => {
    table.innerHTML = table.innerHTML.replace(/\\~/gm, '~');
  });
  document
    .querySelectorAll('.row > [class*="col-"][class*="-12"]')
    .forEach((col) => col.classList.remove('col-xs-12', 'col-sm-12', 'col-md-12', 'col-lg-12'));
  document.querySelectorAll('.content-section .listing-image.ico-list').forEach((div) => {
    if (div.textContent.trim() === '') {
      div.remove();
    }
  });
};

const extractBackgroundImage = (content) => {
  const { backgroundImage } = content.style;
  if (backgroundImage) {
    return backgroundImage.match(/url\((.*?)\)/)[1].trim();
  }

  // fallback and check on attributes
  if (content.hasAttribute('style')) {
    const backgroundUrl = content.getAttribute('style').match(/background-image: url(?:\(['"]?)(.*?)(?:['"]?\))/)[1];
    return backgroundUrl ? backgroundUrl.trim() : null;
  }
  return null;
};

const transformHero = (document) => {
  // detect the default hero styles
  document.querySelectorAll('.section-image.cover-bg, .section-image.cover-bg-new').forEach((hero) => {
    hero.querySelectorAll('.row').forEach((row) => row.removeAttribute('class'));
    const cells = [['Hero']];

    const isBlog = hero.classList.contains('blog-details');
    if (isBlog) {
      cells[0] = ['Hero (Blog)'];
    }
    const isOrangeStyle = hero.querySelector('a.orangeBlueBtn');
    if (isOrangeStyle) {
      cells[0] = ['Hero (Orange Buttons)'];
    }

    const heroContent = isBlog ? hero.querySelector('.hero-desc') : hero.querySelector('.row, .bannerInnerPages');

    // setup the background image
    const backgroundUrl = extractBackgroundImage(hero);
    if (backgroundUrl) {
      const img = document.createElement('img');
      img.src = backgroundUrl;
      heroContent.insertBefore(img, heroContent.firstChild);
    }
    const videoOverlay = heroContent.querySelector('.video-container');
    const customerStoryHeader = hero.parentElement.querySelector('.customer-story-section');
    if (videoOverlay) {
      const videoLink = videoOverlay.querySelector('a[onclick]').getAttribute('onclick');

      const regex = /launchLightbox\('(.*)'\)|fn_vidyard_(.*)\(\)/;
      let m;
      // eslint-disable-next-line no-cond-assign
      if ((m = regex.exec(videoLink)) !== null) {
        const videoId = m[1] || m[2];
        if (videoId) {
          cells.push([heroContent, `https://share.vidyard.com/watch/${videoId}`]);
        }
      }
      videoOverlay.remove();
    } else if (customerStoryHeader) {
      customerStoryHeader.querySelectorAll('.customer-info > label').forEach((label) => {
        const h6 = document.createElement('h6');
        h6.innerHTML = label.innerHTML;
        label.replaceWith(h6);
      });
      cells[0] = ['Hero (Customer Story)'];
      cells.push([heroContent, customerStoryHeader]);
    } else {
      cells.push([heroContent]);
    }

    const table = WebImporter.DOMUtils.createTable(cells, document);
    hero.replaceWith(table);
  });

  // detect the waved "ebook" style hero used on most gates pages plus some others
  document.querySelectorAll('.ebook-banner.wave').forEach((hero) => {
    const cells = [['Hero wave']];
    const heroContent = hero.querySelector('.mol-content');
    const backgroundUrl = extractBackgroundImage(hero);
    if (backgroundUrl) {
      const img = document.createElement('img');
      img.src = backgroundUrl;
      heroContent.insertBefore(img, heroContent.firstChild);
    }
    cells.push([heroContent]);
    const table = WebImporter.DOMUtils.createTable(cells, document);
    hero.replaceWith(table);
  });
};

// special handling for the curved wave c2a section
// must be called before transformSections
const transformCurvedWaveFragment = (document) => {
  const FRAGMENT_PATH = '/fragments/next-big-discovery';
  document.querySelectorAll('div.content-section.cover-bg.curv-footer-top-section').forEach((section) => {
    section.before(document.createElement('hr'));
    const a = document.createElement('a');
    a.href = FRAGMENT_PATH;
    a.textContent = FRAGMENT_PATH;
    const cells = [['Fragment'], [a]];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    table.id = 'defaultWave';
    section.replaceWith(table);
  });
};

// we have different usages of sections - with <section></section>, <div></div>
const transformSections = (document) => {
  document.querySelectorAll('section * section:not(.blogsPage)').forEach((section, index) => {
    if (index > 0) {
      section.firstChild.before(document.createElement('hr'));
    }
    const cells = [['Section Metadata']];
    const styles = [];
    if (section.classList.contains('grey_molecules_bg_top')) {
      styles.push('Background Molecules');
    }
    if (section.classList.contains('parallax-container1')) {
      styles.push('Background Parallax');
    }
    if (section.classList.contains('franklin-horizontal')) {
      styles.push('Columns 2');
    }
    if (section.classList.contains('greyBg')) {
      styles.push('Background Grey');
    }
    if (styles.length > 0) {
      cells.push(['style', styles.toString()]);
    }

    if (cells.length > 1) {
      const table = WebImporter.DOMUtils.createTable(cells, document);
      section.after(table);
    }
  });
};

const transformFragmentDocuments = (document) => {
  const isFragment = !![...document.querySelectorAll('table td')].find((td) => td.textContent === 'Type');
  if (isFragment) {
    document.querySelectorAll('.section-image.cover-bg, .section-image.cover-bg-new').forEach((hero) => {
      const headline = hero.querySelector('h1');
      hero.before(headline);
      const img = hero.querySelector('img');
      if (img) {
        hero.before(img);
      }
      const description = hero.querySelector('.hero-desc');
      if (description) {
        hero.before(description);
      }
      hero.remove();
    });
    document.querySelectorAll('.editor_discription .row').forEach((row) => row.classList.remove('row'));
  }
};

const transformTabsNav = (document) => {
  const tabNav = document.querySelector('.nav.nav-tabs');
  if (tabNav) {
    const cells = [['Page Tabs']];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    tabNav.replaceWith(table);
  }
};

const transformTabsSections = (document) => {
  // move the wave section visible on the overview tab into the tab div
  const overviewWaveContent = document.getElementById('overviewTabContent');
  const overviewTab = document.querySelector('.tab-content .tab-pane#Overview');
  if (overviewTab) {
    if (overviewWaveContent && overviewWaveContent.classList.contains('cover-bg-no-cover')) {
      overviewTab.append(document.createElement('hr'), overviewWaveContent);
    }
  }

  document.querySelectorAll('.tab-content .tab-pane').forEach((tab) => {
    const hasContent = tab.textContent.trim() !== '';
    if (hasContent) {
      const tabConfig = TABS_MAPPING.find((m) => m.id.toLowerCase() === tab.id.toLowerCase());
      tab.before(document.createElement('hr'));

      const metadataCells = [['Section Metadata']];
      // eslint-disable-next-line no-nested-ternary
      metadataCells.push(['name', tabConfig ? ('sectionName' in tabConfig ? tabConfig.sectionName : tabConfig.id) : tab.id]);

      const isOverviewTab = tab.id === 'Overview';
      if (isOverviewTab) {
        const waveSection = tab.querySelector('section.content-section.cover-bg-no-cover');
        if (waveSection) {
          metadataCells.push(['style', 'Wave, Text White, Orange Buttons']);
          const bgImage = extractBackgroundImage(waveSection);
          if (bgImage) {
            const img = document.createElement('img');
            img.src = bgImage;
            img.alt = 'Background Image';
            metadataCells.push(['background', img]);
          }
        }
      }
      const sectionMetaData = WebImporter.DOMUtils.createTable(metadataCells, document);

      // entire tab is loaded from a fragment?
      if (tabConfig && tabConfig.fragment) {
        const heading = tab.querySelector('h2');
        tab.before(heading);

        const a = document.createElement('a');
        a.href = tabConfig.fragment;
        a.textContent = tabConfig.fragment;
        const cells = [['Fragment'], [a]];
        const table = WebImporter.DOMUtils.createTable(cells, document);
        tab.replaceWith(table);
        table.after(sectionMetaData);
        sectionMetaData.after(document.createElement('hr'));
      } else {
        tab.after(sectionMetaData);
      }
    }
  });
};

const transformProductOverviewHeadlines = (block, document) => {
  document.querySelectorAll('.views-element-container p.result-header').forEach((heading) => {
    const h3 = document.createElement('h3');
    h3.textContent = heading.textContent;
    heading.replaceWith(h3);
  });
};

const transformFeatureList = (block, document) => {
  block.querySelectorAll('.listing-image').forEach((featureList) => {
    const cells = [['Features']];
    featureList.querySelectorAll('li').forEach((item) => cells.push([...item.children]));
    const table = WebImporter.DOMUtils.createTable(cells, document);
    featureList.replaceWith(table);
  });
};

const transformFeatureSection = (block, document) => {
  const featuresSection = block.querySelector('.featuredSection');
  if (featuresSection) {
    featuresSection.before(document.createElement('hr'));
    const sectionMetaData = WebImporter.DOMUtils.createTable([['Section Metadata'], ['style', 'Features Section']], document);
    featuresSection.after(sectionMetaData, document.createElement('hr'));
  }
};

const transformResourcesCarousel = (block, document) => {
  const recentResources = block.querySelector('.apps-recent-res');
  if (recentResources) {
    recentResources.before(document.createElement('hr'));
    const cells = [['Resources Carousel']];
    const carousel = recentResources.querySelector('.view-content');
    if (carousel) {
      const table = WebImporter.DOMUtils.createTable(cells, document);
      carousel.replaceWith(table);
    }
    if (recentResources.classList.contains('greyBg')) {
      const sectionMetaData = WebImporter.DOMUtils.createTable([['Section Metadata'], ['style', 'Background Grey']], document);
      recentResources.after(sectionMetaData);
    }
  }
};

const transformImageGallery = (document) => {
  const imageGallery = document.querySelector('.images-gallery1, .images-gallery');
  if (imageGallery) {
    imageGallery.querySelectorAll('.row .fst-set, .row.snd-set').forEach((div) => div.remove());
    const imageContainer = imageGallery.querySelector('.modal .carousel');
    if (imageContainer) {
      const cells = [['Image Gallery']];
      const entries = imageContainer.querySelectorAll('.carousel .item');
      entries.forEach((entry) => {
        cells.push([[...entry.children].reverse()]);
      });

      const table = WebImporter.DOMUtils.createTable(cells, document);
      imageContainer.replaceWith(table);
    }
  }
};

const transformFeaturedApplicationsCarousel = (block, document) => {
  const div = document.querySelector('.view.view-product-featured-carousel');
  if (div) {
    const cells = [['Applications Carousel']];

    const applications = div.querySelectorAll('.pro-container h3');
    if (applications) {
      // eslint-disable-next-line max-len
      const linkList = createFragmentList(document, 'Applications', [...applications].map((h3) => h3.textContent.trim()));
      cells.push([linkList]);
    }
    const table = WebImporter.DOMUtils.createTable(cells, document);
    div.replaceWith(table);
  }
};

const transformCustomerStory = (block, document) => {
  const div = document.querySelector('.view.view-product-custom-story');
  if (div) {
    const cells = [['Customer Story']];
    const img = div.querySelector('img');
    const content = div.querySelector('.pro-page-detail');
    cells.push([img, content]);

    const table = WebImporter.DOMUtils.createTable(cells, document);
    div.replaceWith(table);
  }
};

const transformButtons = (document) => {
  // convert primary/secondary buttons
  document.querySelectorAll('a.btn').forEach((button) => {
    button.querySelectorAll('span').forEach((span) => span.remove());
    button.querySelectorAll('i.fa').forEach((icon) => {
      button.textContent = `${button.textContent} :${icon.classList[1]}:`;
      icon.remove();
    });
  });

  // convert primary buttons
  document.querySelectorAll('a.btn-info, a.gradiantBlueBtn, a.orangeBlueBtn').forEach((button) => {
    const wrapper = document.createElement('strong');
    wrapper.innerHTML = button.outerHTML;
    button.replaceWith(wrapper);
  });

  // convert secondary buttons
  document.querySelectorAll('a.gradiantTealreverse, a.whiteBtn, a.banner_btn.bluebdr-mb').forEach((button) => {
    const wrapper = document.createElement('em');
    wrapper.innerHTML = button.outerHTML;
    button.replaceWith(wrapper);
  });

  // convert links with icons
  document.querySelectorAll('a.linkBtn').forEach((button) => {
    button.querySelectorAll('i.icon-icon_link').forEach((icon) => {
      const iconName = icon.classList[0].substring(5, icon.classList[0].lenght);
      button.textContent = `${button.textContent} :${iconName}:`;
      icon.remove();
    });
  });
};

const transformTables = (document) => {
  document.querySelectorAll('.table-responsive table, table.table').forEach((table) => {
    // clean up <br> tags
    table.querySelectorAll('td, th').forEach((td) => {
      if (td.querySelector('br')) {
        [...td.childNodes].forEach((c) => {
          if (c.nodeType === Node.TEXT_NODE) {
            const p = document.createElement('p');
            p.textContent = c.textContent;
            c.replaceWith(p);
          }
          if (c.nodeName === 'BR') {
            c.remove();
          }
        });
      }
    });

    // get number of columns
    // eslint-disable-next-line max-len
    const numCols = table.rows[0] ? [...table.rows[0].cells].reduce((cols, cell) => cols + cell.colSpan, 0) : 0;

    // convert caption into header row
    table.querySelectorAll('caption').forEach((caption) => {
      const tr = table.insertRow(0);
      const th = document.createElement('th');
      th.textContent = caption.textContent;
      th.setAttribute('colspan', numCols);
      tr.append(th);
      table.deleteCaption();
    });

    // convert rows th > td
    table.querySelectorAll('tr').forEach((row) => {
      [...row.children].forEach((item) => {
        if (item.nodeName === 'TH') {
          const newTd = document.createElement('td');
          newTd.innerHTML = item.innerHTML;
          if (item.hasAttribute('colspan')) {
            newTd.setAttribute('colspan', item.getAttribute('colspan'));
          }
          item.replaceWith(newTd);
        }
      });
    });

    // create block table head row
    const tr = table.insertRow(0);
    const th = document.createElement('th');
    th.textContent = 'Table';
    th.setAttribute('colspan', numCols);
    tr.append(th);
  });
};

const transformColumns = (document) => {
  const COLUMN_STYLES = [
    {
      match: ['col-sm-4', 'col-lg-4'],
      blockStyle: 'layout 33 66',
    },
    {
      match: ['col-sm-3', 'col-md-3', 'col-lg-3'],
      blockStyle: 'layout 25 75',
    },
    {
      match: ['col-sm-8', 'col-md-8', 'col-lg-8'],
      blockStyle: 'layout 66 33',
    },
  ];

  document.querySelectorAll('.row .swap, .row .not-swap').forEach((div) => {
    const row = div.parentElement;
    row.classList.add(div.className);
    row.append(...div.children);
    div.remove();
  });

  document.querySelectorAll('.row > [class*="col-"]:first-of-type').forEach((column) => {
    const row = column.parentElement;
    const sectionStyle = row.classList.contains('section');
    if (row.childElementCount > 1 && !row.closest('section.franklin-horizontal')) {
      if (sectionStyle) {
        row.before(document.createElement('hr'));
        const metaCells = [['Section Metadata'], [['style'], ['Columns 2']]];
        const metaTable = WebImporter.DOMUtils.createTable(metaCells, document);
        row.append(metaTable);
        row.after(document.createElement('hr'));
      } else {
        const cells = [['Columns']];
        const blockOptions = [];
        [...row.children].forEach((col) => {
          if (col.classList.length === 1 && col.className.indexOf('-12') > 0) {
            row.after(col);
          }
        });
        // check swap / reverse order tables
        let children = [...row.children];
        if (row.classList.contains('swap')) {
          children = children.reverse();
          blockOptions.push('swap');
        }
        // match column width layouts
        // eslint-disable-next-line max-len
        const styleMatch = COLUMN_STYLES.find((e) => e.match.some((match) => column.classList.contains(match)));
        if (styleMatch) {
          blockOptions.push(styleMatch.blockStyle);
        }

        if (blockOptions.length > 0) {
          cells[0] = [`Columns (${blockOptions.join(', ')})`];
        }
        cells.push(children);
        const table = WebImporter.DOMUtils.createTable(cells, document);
        row.replaceWith(table);
      }
    }
  });
};

const transformReferenceToColumns = (document) => {
  document.querySelectorAll('.reference-block').forEach((reference) => {
    const cells = [['Columns'], [...reference.children]];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    reference.replaceWith(table);
  });
};

/* special handling for products references in success story,
 * must be called before transformSections
 */
const transformReferenceProducts = (document) => {
  document.querySelectorAll('.featured-applications-div').forEach((featuredProductsBlock) => {
    const parentSection = featuredProductsBlock.closest('section');
    parentSection.classList.add('franklin-horizontal');
    const featuredProducts = featuredProductsBlock.querySelector('.view-customer-story-product');
    const cells = [['Featured Products Carousel (mini)']];
    featuredProducts.querySelectorAll('.product-container').forEach((p) => cells.push([...p.children]));
    const table = WebImporter.DOMUtils.createTable(cells, document);
    featuredProducts.replaceWith(table);
  });
};

const transformQuotes = (document) => {
  document.querySelectorAll('.quots-part').forEach((quote) => {
    const cells = [['Quote']];
    cells.push([quote.querySelector('.quots-text')]);
    if (quote.querySelector('.author')) {
      cells.push([quote.querySelector('.author')]);
    }
    const table = WebImporter.DOMUtils.createTable(cells, document);
    quote.replaceWith(table);
  });
};

const transformAccordions = (document) => {
  document.querySelectorAll('.faq_accordion').forEach((accordion) => {
    const cells = [['Accordion (FAQ)']];

    accordion.querySelectorAll('.faqfield-question').forEach((tab) => {
      const entryWrapper = document.createElement('div');
      entryWrapper.append(tab, tab.nextElementSibling);
      cells.push([entryWrapper]);
    });

    const table = WebImporter.DOMUtils.createTable(cells, document);
    accordion.replaceWith(table);
  });

  document.querySelectorAll('.accordian-list-part .accordion').forEach((accordion) => {
    const cells = [['Accordion (FAQ)']];

    accordion.querySelectorAll('.card').forEach((tab) => {
      cells.push([tab]);
    });

    const table = WebImporter.DOMUtils.createTable(cells, document);
    accordion.replaceWith(table);
  });
};

const transformImageCaption = (document) => {
  [
    ...document.querySelectorAll('p.text-caption'),
    ...document.querySelectorAll('p.caption'),
  ].forEach((caption) => {
    const captionWrapper = document.createElement('em');
    captionWrapper.innerHTML = caption.innerHTML;
    caption.replaceWith(captionWrapper);
  });
};

const transformListCaption = (document) => {
  document.querySelectorAll('ol.text-caption').forEach((caption) => {
    caption.children.forEach((li) => {
      const liEm = document.createElement('em');
      liEm.innerHTML = li.innerHTML;
      li.appendChild(liEm);
    });
  });
};

const transformBlogRecentPosts = (document) => {
  document.querySelectorAll('.recent-posts').forEach((recentPostsContainer) => {
    recentPostsContainer.before(document.createElement('hr'));
    const viewAll = document.createElement('a');
    viewAll.href = '/lab-notes/blog';
    viewAll.textContent = ':view-all-posts:';

    const carousel = recentPostsContainer.querySelector('.views-element-container');
    carousel.before(viewAll);
    const cells = [['Recent Blogs Carousel']];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    carousel.replaceWith(table);

    const metaCells = [['Section Metadata'], [['style'], ['Blog Heading']]];
    const metaTable = WebImporter.DOMUtils.createTable(metaCells, document);
    recentPostsContainer.append(metaTable);
  });
};

const transformCustomerBreakthroughShareStory = (document) => {
  document.querySelectorAll('.share-story').forEach((share) => {
    const cells = [['Share Story'], [share.querySelector('h3')]];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    share.replaceWith(table);
  });
};

// convert Citations doc styles and remove columns here,
// hence should be called before column transformation
const transformCitations = (document) => {
  document.querySelectorAll('.editor_citations .citations .views-element-container').forEach((citation) => {
    const cells = [['Citations']];
    const linkList = createFragmentList(document, 'Citation', [...citation.querySelectorAll('#citation-accordian .views-row h2')].map((h2) => h2.textContent.trim()));
    cells.push([linkList]);
    const table = WebImporter.DOMUtils.createTable(cells, document);
    citation.replaceWith(table);
  });
};

const transformEventDetails = (document) => {
  if (document.querySelector('body.page-node-type-events')) {
    const eventDetails = document.querySelector('.event-block');
    if (eventDetails) {
      const cells = [
        ['Event'],
        [eventDetails.querySelector('cite')],
        [eventDetails.querySelector('h3')],
        [eventDetails.querySelector('ul')],
      ];
      const table = WebImporter.DOMUtils.createTable(cells, document);
      eventDetails.replaceWith(table);
    }

    const relatedProducts = document.querySelector('.pro_car_wrap');
    if (relatedProducts) {
      const cells = [['Cards (Products, Quote)']];
      cells.push([[...relatedProducts.querySelectorAll('.item h3 a')]]);
      const table = WebImporter.DOMUtils.createTable(cells, document);
      relatedProducts.replaceWith(table);
    }

    const relatedResources = document.querySelector('.products-container-area');
    if (relatedResources) {
      const cells = [['Resources Carousel']];
      const links = [...relatedResources.querySelectorAll('.scroll-item .pro-container h3')]
        .map((h3) => {
          const a = h3.closest('a');
          a.textContent = h3.textContent;
          return a;
        });
      cells.push([links]);
      const table = WebImporter.DOMUtils.createTable(cells, document);
      relatedResources.replaceWith(table);
    }
  }
};

// convert embed objects
const transformEmbeds = (document) => {
  // detect ceros embeds
  document.querySelectorAll('.ceros-overview').forEach((ceros) => {
    const container = ceros.closest('.video-container');
    const cerosUrl = ceros.getAttribute('data-url');
    if (container && cerosUrl) {
      container.querySelectorAll('.modal#cerospop_overview').forEach((m) => m.remove());
      const img = container.querySelector('img');
      const title = container.querySelector('p');
      const wrapper = document.createElement('div');
      wrapper.append(img, cerosUrl, title);
      const cells = [['Ceros'], [wrapper]];
      const table = WebImporter.DOMUtils.createTable(cells, document);
      container.replaceWith(table);
    }
  });

  // detect vidyard video player embeds using v4 code
  document.querySelectorAll('.vidyard-player-embed').forEach((vidyard) => {
    const videoId = vidyard.getAttribute('data-uuid');
    const type = vidyard.getAttribute('data-type');
    if (vidyard.closest('table')) {
      vidyard.replaceWith(`https://share.vidyard.com/watch/${videoId}`);
    } else {
      const cells = [
        [type !== 'inline' ? `Vidyard (${type})` : 'Vidyard'],
        [`https://share.vidyard.com/watch/${videoId}`],
      ];
      const table = WebImporter.DOMUtils.createTable(cells, document);
      vidyard.replaceWith(table);
    }
  });

  // detect embed iframe in main content
  document.querySelectorAll('.container iframe').forEach((iframe) => {
    const iframeSrc = iframe.src;
    if (iframeSrc) {
      const link = document.createElement('a');
      link.href = iframeSrc;
      link.textContent = iframeSrc;
      const cells = [['Embed'], [link]];
      const table = WebImporter.DOMUtils.createTable(cells, document);
      iframe.replaceWith(table);
    }
  });
};

const transformProductOverview = (document) => {
  const div = document.querySelector('div.tab-pane#Overview, div.tab-pane#overview');
  if (div) {
    // special handling for nested columns with blocks to use a section instead of column block
    div.querySelectorAll('.row').forEach((row) => {
      if (row.querySelector('table')) {
        row.classList.add('section');
      }
    });

    transformProductOverviewHeadlines(div, document);
    transformFeatureList(div, document);
    transformFeatureSection(div, document);
    transformResourcesCarousel(div, document);
    transformFeaturedApplicationsCarousel(div, document);
    transformCustomerStory(div, document);
  }
};

const transformProductOptions = (document) => {
  const div = document.querySelector('div.tab-pane#options');
  if (div) {
    transformProductOverviewHeadlines(div, document);
    transformFeatureList(div, document);
    transformFeatureSection(div, document);
    transformResourcesCarousel(div, document);
  }
};

const transformProductApplications = (document) => {
  const div = document.querySelector('div.tab-pane#Applications, div.tab-pane#Technology');
  if (div) {
    const heading = div.querySelector('h2');
    div.before(heading);
    const cells = [['Related Applications']];
    const hasTOC = div.querySelector('.view-application-resources');
    if (hasTOC) {
      cells[0] = ['Related Applications (TOC)'];
    }

    const applications = div.querySelectorAll('.view-product-resource-widyard li h2');
    if (applications) {
      const linkList = createFragmentList(document, 'Applications', [...applications].map((h2) => h2.textContent.trim()));
      cells.push([linkList]);
    }

    const table = WebImporter.DOMUtils.createTable(cells, document);
    div.replaceWith(table);
  }
};

const transformProductAssayData = (document) => {
  const div = document.querySelector('div.tab-pane#Data');
  if (div) {
    const heading = div.querySelector('h2');
    div.before(heading);
    const cells = [['Related Assay Data']];

    const applications = div.querySelectorAll('.view-product-resource-widyard li h2');
    if (applications) {
      // eslint-disable-next-line max-len
      const linkList = createFragmentList(document, 'Assay Data', [...applications].map((h2) => h2.textContent.trim()));
      cells.push([linkList]);
    }

    const table = WebImporter.DOMUtils.createTable(cells, document);
    div.replaceWith(table);
  }
};

const transformProductTab = (document, tabConfig) => {
  const div = document.querySelector(`div.tab-pane#${tabConfig.id}`);
  if (div && tabConfig.blockName) {
    const heading = div.querySelector('h2');
    div.before(heading);
    const cells = [[tabConfig.blockName]];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    div.replaceWith(table);
  }
};

const transformProductTabs = (document) => {
  TABS_MAPPING.forEach((tab) => transformProductTab(document, tab));
};

const transformResources = (document) => {
  const div = document.querySelector('div.tab-pane#Resources, div.tab-pane#resources');

  if (div) {
    const resources = div.querySelectorAll('.views-element-container')[1];
    if (resources) {
      const cells = [['Content Resources']];
      const table = WebImporter.DOMUtils.createTable(cells, document);
      resources.parentElement.replaceWith(table);
    }

    const videoResources = div.querySelector('#res_videos');
    if (videoResources) {
      const cells = [['Video Resources']];

      const heading = videoResources.querySelector('.section-heading');
      cells.push([heading]);
      const table = WebImporter.DOMUtils.createTable(cells, document);
      videoResources.replaceWith(table);
    }
  }
};

const transformTechnologyApplications = (document) => {
  document.querySelectorAll('.views-element-container .fortebiocls.view-application-resources, .technology-section.fortebiocls.view-product-resource-widyard')
    .forEach((div) => {
      if (div.childElementCount > 0) {
        div.querySelectorAll('.modal.fade').forEach((modals) => modals.remove());
        const cells = [['Related Applications (TOC)']];
        const applications = div.querySelectorAll('li h2');
        if (applications) {
          const linkList = createFragmentList(
            document,
            'Applications',
            [...applications].map((h2) => h2.textContent.trim())
          );
          cells.push([linkList]);
        }

        let parentContainer = div.closest('.container');
        if (parentContainer.closest('.tabbingContainer')) {
          parentContainer = parentContainer.closest('.tabbingContainer');
        }
        parentContainer.querySelectorAll('.views-element-container .metax-apps.view-application-resources, .tabbingContainer .container.greyBg')
          .forEach((toc) => toc.remove());

        const table = WebImporter.DOMUtils.createTable(cells, document);
        const container = div.closest('ul');
        if (container) {
          container.replaceWith(table);
        } else {
          div.replaceWith(table);
        }
      }
    });
};

const transformOtherResourcesList = (document) => {
  document.querySelectorAll('.application-other-resources').forEach((div) => {
    const cells = [['More Resources']];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    div.replaceWith(table);
  });
};

const transformFeaturedResources = (document) => {
  document.querySelectorAll('.related-news-part').forEach((div) => {
    const cells = [['Columns']];
    const headline = div.querySelector('h2');
    if (headline) {
      div.before(headline);
    }
    div.querySelectorAll('.inside-2-col').forEach((row) => {
      const image = row.querySelector('img');
      const content = row.querySelector('.col-sm-8');
      cells.push([image, content]);
    });
    const table = WebImporter.DOMUtils.createTable(cells, document);
    div.replaceWith(table);
  });
};

const transformElisaWorkflow = (document) => {
  document.querySelectorAll('.workflow_elisa').forEach((div) => {
    const cells = [['Elias Workflow']];

    const heading = div.querySelector('.timeline-start');
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent;
    cells.push([h2]);

    div.querySelectorAll('.conference-timeline-content .timeline-article').forEach((entry) => {
      cells.push([entry.querySelector('.content-left-container')], [entry.querySelector('.content-right-container')]);
    });

    const table = WebImporter.DOMUtils.createTable(cells, document);
    div.replaceWith(table);
  });
};

function makeProxySrcs(document) {
  const host = 'https://www.moleculardevices.com/';
  document.querySelectorAll('img').forEach((img) => {
    if (img.src.startsWith('/')) {
      // make absolute
      const cu = new URL(host);
      img.src = `${cu.origin}${img.src}`;
    }
    try {
      const u = new URL(img.src);
      u.searchParams.append('host', u.origin);
      img.src = `http://localhost:3001${u.pathname}${u.search}`;
    } catch (error) {
      console.warn(`Unable to make proxy src for ${img.src}: ${error.message}`);
    }
  });
}

function makeAbsoluteLinks(main) {
  main.querySelectorAll('a').forEach((a) => {
    if (a.href.startsWith('/')) {
      const ori = a.href;
      const u = new URL(a.href, 'https://main--moleculardevices--hlxsites.hlx.page/');

      // Remove .html extension
      if (u.pathname.endsWith('.html')) {
        u.pathname = u.pathname.slice(0, -5);
      }

      a.href = u.toString();

      if (a.textContent === ori) {
        a.textContent = a.href;
      }
    }
    if (a.href.startsWith('http://localhost:3001')) {
      a.href = a.href.replaceAll(
        'http://localhost:3001',
        'https://main--moleculardevices--hlxsites.hlx.page'
      );
    }
  });
}

export default {
  /**
   * Apply DOM pre processing
   * @param {HTMLDocument} document The document
   */
  preprocess: ({ document, url, html, params }) => {
    // try to fix malformed URLs
    document.querySelectorAll('a').forEach((a) => {
      const { href } = a;
      try {
        decodeURI(href);
      } catch (error) {
        console.warn(`Invalid link in the page: ${href}`, error);
        // TODO
        // a.href = new URL(href).toString();
        a.href = '';
      }
    });

    // prepare vidyard script URLs before their are filtered
    document.querySelectorAll('.video script').forEach((vidyard) => {
      const scriptsToTest = ['ceros', 'embed/v4.js'];
      if (vidyard.src && !scriptsToTest.some((script) => vidyard.src.includes(script))) {
        const videoDiv = vidyard.parentElement;
        videoDiv.classList.add('vidyard-player-embed');
        const videoUuid = vidyard.src.match(/.*com\/(.*)\.js/)[1];
        const videoParams = new URLSearchParams(vidyard.src);
        videoDiv.setAttribute('data-url', vidyard.src);
        videoDiv.setAttribute('data-uuid', videoUuid);
        videoDiv.setAttribute('data-type', videoParams.get('type'));
      }
    });

    // rewrite media gallery link if present and remove galley items
    const heroMediaGalleryLink = document.getElementById('openMediaGallery');
    if (heroMediaGalleryLink) {
      const pageUrl = WebImporter.FileUtils.sanitizePath(new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '')).substring(1);
      const pageType = pageUrl.substring(0, pageUrl.indexOf('/'));
      const pageFilename = pageUrl.substring(pageUrl.lastIndexOf('/') + 1);
      heroMediaGalleryLink.href = `/fragments/media-gallery/${pageType}/${pageFilename}`;
    }

    // rewrite all links with spans before they get cleaned up
    document.querySelectorAll('a span.text').forEach((span) => span.replaceWith(span.textContent));
    document.querySelectorAll('a strong').forEach((strong) => strong.replaceWith(strong.textContent));
  },

  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @returns {HTMLElement} The root element to be transformed
   */
  transformDOM: ({
    // eslint-disable-next-line no-unused-vars
    document,
    url,
    html,
    params,
  }) => {
    // define the main element: the one that will be transformed to Markdown
    const main = document.body;

    // use helper method to remove header, footer, etc.
    WebImporter.DOMUtils.remove(main, [
      'header',
      'footer',
      'nav#block-mobilenavigation',
      'div#resources .tabbingContainer', // TODO should be replaced with some block, not removed
      'body > #mediaGallary', // remove the hero media gallery only
      '.blog-details .hero-desc ul', // blog author & date which we read from meta data
      '.breadcrumb',
      '.skip-link',
      '.cart-store',
      '.procompare',
      '.share-event',
      '.sticky-social-list',
      '.back-labnote',
      '.recent-posts .overview-page',
      '.herobanner_wrap .visible-xs-block',
      '.ins-nav-container',
      '.OneLinkShow_zh',
      '.onetrust-consent-sdk',
      '.drift-frame-chat',
      '.drift-frame-controller',
      '.page-node-type-events .button-wrap .linkBtn.blue', // add to calender button on events
    ]);

    // create the metadata block and append it to the main element
    const meta = createMetadata(url, document);
    loadResourceMetaAttributes(url, params, document, meta);

    const block = WebImporter.Blocks.getMetadataBlock(document, meta);
    main.append(block);

    // convert all blocks
    [
      cleanUp,
      transformReferenceProducts,
      transformSections,
      transformFragmentDocuments,
      transformHero,
      transformTables,
      transformButtons,
      transformCitations,
      transformEventDetails,
      transformImageGallery,
      transformElisaWorkflow,
      transformReferenceToColumns,
      transformEmbeds,
      transformQuotes,
      transformAccordions,
      transformBlogRecentPosts,
      transformImageCaption,
      transformListCaption,
      transformCustomerBreakthroughShareStory,
      transformTabsNav,
      transformTabsSections,
      transformProductOverview,
      transformProductOptions,
      transformProductApplications,
      transformProductAssayData,
      transformProductTabs,
      transformOtherResourcesList,
      transformFeaturedResources,
      transformTechnologyApplications,
      transformResources,
      transformCurvedWaveFragment,
      transformColumns,
      makeProxySrcs,
      makeAbsoluteLinks,
    ].forEach((f) => f.call(null, document));

    return main;
  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @return {string} The path
   */
  generateDocumentPath: ({
    // eslint-disable-next-line no-unused-vars
    document,
    url,
    html,
    params,
  }) =>
    WebImporter.FileUtils.sanitizePath(
      new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '')
    ),
};
