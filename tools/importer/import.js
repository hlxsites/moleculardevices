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

/**
 * Special handling for resource document meta data.
 */
const loadResourceMetaAttributes = (url, params, document, meta) => {
  let resourceMetadata = {};
  // we use old XMLHttpRequest as fetch seams to have problems in bulk import
  const request = new XMLHttpRequest();
  request.open(
    'GET',
    'http://localhost:3001/export/moldev-resources-sheet-03132023.json?host=https%3A%2F%2Fmain--moleculardevices--hlxsites.hlx.page',
    false,
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
    el.src = img.content;
    meta.Image = el;
  }

  // extract author for lab notes blog
  const blogDetails = document.querySelector('.blog-details .hero-desc ul');
  if (blogDetails) {
    meta.Author = blogDetails.querySelector('.blog-author').textContent.trim();
    blogDetails.remove();
  }

  return meta;
};

const cleanUp = (document) => {
  document.querySelectorAll('table').forEach((table) => {
    table.innerHTML = table.innerHTML.replace(/\\~/gm, '~');
  });
};

const extractBackgroundImage = (content) => {
  const backgroundUrl = content
    .getAttribute('style')
    .match(/background-image: url(?:\(['"]?)(.*?)(?:['"]?\))/)[1];
  return backgroundUrl ? backgroundUrl.trim() : null;
};

const transformHero = (document) => {
  document
    .querySelectorAll('.section-image.cover-bg, .section-image.cover-bg-new')
    .forEach((hero) => {
      const isBlog = hero.classList.contains('blog-details');
      const cells = [[isBlog ? 'Hero (Blog)' : 'Hero']];
      const heroContent = isBlog
        ? hero.querySelector('.hero-desc')
        : hero.querySelector('.row, .bannerInnerPages');

      const backgroundUrl = extractBackgroundImage(hero);
      if (backgroundUrl) {
        const img = document.createElement('img');
        img.src = backgroundUrl;
        heroContent.insertBefore(img, heroContent.firstChild);
      }
      cells.push([heroContent]);

      const videoOverlay = heroContent.querySelector('.video-container');
      if (videoOverlay) {
        const videoLink = videoOverlay
          .querySelector('a.lightboxlaunch')
          .getAttribute('onclick');
        const videoId = videoLink.match(/launchLightbox\('(.*)'\)/)[1];
        if (videoId) {
          cells.push(['video', videoId]);
        }
        videoOverlay.remove();
      }

      const mediaGallery = hero.parentElement.querySelector('#mediaGallary');
      if (mediaGallery) {
        const itemList = document.createElement('ul');
        mediaGallery.querySelectorAll('#mediaGalSlid .item').forEach((div) => {
          const entry = document.createElement('li');
          const entryVideoLink = document.createElement('a');
          entryVideoLink.href = div
            .querySelector('iframe')
            .getAttribute('data-url');
          entryVideoLink.textContent =
            div.querySelector('.slide-desc').textContent;
          entry.append(entryVideoLink);
          itemList.append(entry);
        });

        cells.push(['media gallery', itemList]);
        mediaGallery.remove();
      }

      const customerStoryHeader = hero.parentElement.querySelector(
        '.customer-story-section',
      );
      if (customerStoryHeader) {
        customerStoryHeader
          .querySelectorAll('.customer-info > label')
          .forEach((label) => {
            const h6 = document.createElement('h6');
            h6.innerHTML = label.innerHTML;
            label.replaceWith(h6);
          });
        cells[0] = ['Hero (Customer Story)'];
        cells.push([customerStoryHeader]);
      }

      const table = WebImporter.DOMUtils.createTable(cells, document);
      hero.replaceWith(table);
    });
};

// special handling for the curved wave c2a section
// must be called before transformSections
const transformCurvedWaveFragment = (document) => {
  const FRAGMENT_PATH = '/en/fragments/customer-breakthrough-wave';
  document
    .querySelectorAll('div.content-section.cover-bg.curv-footer-top-section')
    .forEach((section) => {
      const a = document.createElement('a');
      a.href = FRAGMENT_PATH;
      a.textContent = FRAGMENT_PATH;
      const cells = [['Fragment'], [a]];
      const table = WebImporter.DOMUtils.createTable(cells, document);
      section.replaceWith(table);
    });
};

// we have different usages of sections - with <section></section>, <div></div>
const transformSections = (document) => {
  document
    .querySelectorAll('section * section:not(.blogsPage)')
    .forEach((section, index) => {
      if (index > 0) {
        section.firstChild.before(document.createElement('hr'));
      }
      const cells = [['Section Metadata']];
      const styles = [];
      if (section.classList.contains('grey_molecules_bg_top')) {
        styles.push('Grey Molecules');
      }
      if (section.classList.contains('franklin-horizontal')) {
        styles.push('Horizontal');
      }
      if (section.classList.contains('cover-bg')) {
        styles.push('White Text');
        const bgImage = extractBackgroundImage(section);
        if (bgImage) {
          const img = document.createElement('img');
          img.src = bgImage;
          img.alt = 'Background Image';
          cells.push(['background', img]);
        }
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

const transformTabsNav = (document) => {
  const tabNav = document.querySelector('.nav.nav-tabs');
  if (tabNav) {
    const cells = [['Tabs']];
    const tabs = document.createElement('ul');
    tabNav.querySelectorAll('li').forEach((item) => tabs.append(item));

    cells.push([tabs]);
    const table = WebImporter.DOMUtils.createTable(cells, document);
    tabNav.replaceWith(table);
  }
};

const transformTabsContent = (document) => {
  document.querySelectorAll('.tab-content .tab-pane').forEach((tab) => {
    tab.before(document.createElement('hr'));
    const cells = [['Section Metadata'], ['name', tab.id]];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    tab.after(table);
  });
};

const transformProductFeatureList = (block, document) => {
  const features = block.querySelector('.overview-features');
  if (features) {
    const cells = [['Product Features']];
    features
      .querySelectorAll('li')
      .forEach((item) => cells.push([...item.children]));

    const table = WebImporter.DOMUtils.createTable(cells, document);
    features.replaceWith(table);
  }
};

const transformResourcesCarousel = (block, document) => {
  const div = block.querySelector('.apps-recent-res');
  if (div) {
    const cells = [['Latest Resources']];
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

    const buttonClass = button.className.trim();
    if (buttonClass.indexOf('gradiantBlueBtn') > -1) {
      const wrapper = document.createElement('strong');
      wrapper.innerHTML = button.outerHTML;
      button.replaceWith(wrapper);
    }
  });

  // convert special blog post buttons
  document.querySelectorAll('a.gradiantTealreverse').forEach((button) => {
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

  // TODO convert & cleanup other buttons
};

const transformTables = (document) => {
  document.querySelectorAll('.table-responsive table').forEach((table) => {
    // convert first row th > td
    const firstRow = table.querySelector('tr');
    [...firstRow.children].forEach((item) => {
      if (item.nodeName === 'TH') {
        const newTd = document.createElement('td');
        newTd.innerHTML = item.innerHTML;
        item.replaceWith(newTd);
      }
    });

    // create block table head row
    const referenceNode =
      table.firstChild.nodeName === 'TBODY'
        ? table.firstChild.firstChild
        : table.firstChild;
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.textContent = 'Table';
    th.setAttribute('colspan', referenceNode.childElementCount);
    tr.append(th);
    referenceNode.parentElement.insertBefore(tr, referenceNode);
  });
};

const transformColumns = (document) => {
  const COLUMN_STYLES = [
    {
      match: ['col-sm-4', 'col-lg-4'],
      blockName: 'Columns (layout 33 66)',
    },
    {
      match: ['col-sm-3', 'col-md-3', 'col-lg-3'],
      blockName: 'Columns (layout 25 75)',
    },
    {
      match: ['col-sm-8', 'col-md-8', 'col-lg-8'],
      blockName: 'Columns (layout 66 33)',
    },
  ];

  document.querySelectorAll('.row .swap, .row .not-swap').forEach((div) => {
    const row = div.parentElement;
    row.classList.add(div.className);
    row.append(...div.children);
    div.remove();
  });

  document
    .querySelectorAll(
      '.row > .col-sm-6:first-of-type, .row > .col-md-6:first-of-type, .row > .col-md-4:first-of-type, .row > .col-sm-4:first-of-type, .row > .col-sm-3:first-of-type, .row > .col-md-8:first-of-type',
    )
    .forEach((column) => {
      const row = column.parentElement;
      if (row.childElementCount > 1) {
        [...row.children].forEach((col) => {
          if (col.classList.length === 1 && col.className.indexOf('-12') > 0) {
            row.after(col);
          }
        });
        let children = [...row.children];
        if (row.classList.contains('swap')) {
          children = children.reverse();
        }

        let blockName = 'Columns';
        const styleMatch = COLUMN_STYLES.find((e) =>
          e.match.some((match) => column.classList.contains(match)),
        );
        if (styleMatch) {
          blockName = styleMatch.blockName;
        }

        const cells = [[blockName], children];
        const table = WebImporter.DOMUtils.createTable(cells, document);
        row.replaceWith(table);
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

// special handling for products references in success story
// must be called before transformSections
const transformReferenceProducts = (document) => {
  document
    .querySelectorAll('.featured-applications-div')
    .forEach((featuredProductsBlock) => {
      const parentSection = featuredProductsBlock.closest('section');
      parentSection.classList.add('franklin-horizontal');

      const featuredProducts = featuredProductsBlock.querySelector(
        '.view-customer-story-product',
      );
      const ul = document.createElement('ul');
      featuredProducts
        .querySelectorAll('.product-container')
        .forEach((productDetails) => {
          const li = document.createElement('li');
          const a = productDetails.querySelector('a');
          a.textContent = productDetails.querySelector('h3').textContent;
          li.append(a);
          ul.append(li);
        });
      const cells = [['Featured Products'], [ul]];
      const table = WebImporter.DOMUtils.createTable(cells, document);
      featuredProducts.replaceWith(table);
    });
};

const transformQuotes = (document) => {
  document.querySelectorAll('.quots-part').forEach((quote) => {
    const cells = [['Quote']];
    cells.push([quote.querySelector('.quots-text')]);
    const table = WebImporter.DOMUtils.createTable(cells, document);
    quote.replaceWith(table);
  });
};

const transformFAQAccordion = (document) => {
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
};

const transformImageCaption = (document) => {
  document.querySelectorAll('p.text-caption').forEach((caption) => {
    const captionWrapper = document.createElement('em');
    captionWrapper.innerHTML = caption.innerHTML;
    caption.replaceWith(captionWrapper);
  });
};

const transformShareStory = (document) => {
  document.querySelectorAll('.share-story').forEach((share) => {
    const cells = [['Share Story'], [share.querySelector('h3')]];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    share.replaceWith(table);
  });
};

// convert embed objects
const transformEmbeds = (document) => {
  // detect ceros embeds
  document.querySelectorAll('.ceros-overview').forEach((ceros) => {
    const cerosUrl = ceros.getAttribute('data-url');
    if (cerosUrl) {
      const wrapper = document.createElement('div');
      wrapper.append(
        ceros.previousSibling,
        document.createElement('br'),
        cerosUrl,
      );
      const cells = [[`Ceros`], [wrapper]];
      const table = WebImporter.DOMUtils.createTable(cells, document);
      ceros.replaceWith(table);
    }
  });

  // detect vidyard video player embeds
  document.querySelectorAll('.vidyard-player-embed').forEach((vidyard) => {
    const type = vidyard.getAttribute('data-type');
    const videoId = vidyard.getAttribute('data-uuid');
    const cells = [[`Vidyard (${type})`], [videoId]];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    vidyard.replaceWith(table);
  });

  // detect embed iframe in main content
  document.querySelectorAll('.container iframe').forEach((iframe) => {
    const iframeSrc = iframe.src;
    if (iframeSrc) {
      const cells = [['Embed']];
      cells.push([iframeSrc]);
      const table = WebImporter.DOMUtils.createTable(cells, document);
      iframe.replaceWith(table);
    }
  });
};

const transformProductOverview = (document) => {
  const div = document.querySelector(
    'div.tab-pane#Overview, div.tab-pane#overview',
  );
  if (div) {
    transformProductFeatureList(div, document);
    transformResourcesCarousel(div, document);
  }
};

const transformProductApplications = (document) => {
  const div = document.querySelector('div.tab-pane#Applications');
  if (div) {
    const content = document.createElement('div');
    const heading = div.querySelector('h2');
    const br = document.createElement('br');
    content.append(heading, br);
    div
      .querySelectorAll('.view-product-resource-widyard .figure-container')
      .forEach((application) => {
        const link = document.createElement('a');
        link.textContent = application.querySelector('h2').textContent;
        link.href = application.querySelector('a.linkBtn').href;

        content.append(link, br.cloneNode());
      });
    const cells = [['Product Applications'], [content]];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    div.replaceWith(table);
  }
};

const transformResources = (document) => {
  const div = document.querySelector(
    'div.tab-pane#Resources, div.tab-pane#resources',
  );

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

const transformProductCitations = (document) => {
  const div = document.querySelector('div.tab-pane#Citations');
  if (div) {
    const cells = [['Product Citations']];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    div.replaceWith(table);
  }
};

const transformRelatedProducts = (document) => {
  const div = document.querySelector(
    'div.tab-pane#RelatedProducts, div.tab-pane#relatedproducts',
  );
  if (div) {
    const cells = [['Related Products']];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    div.replaceWith(table);
  }
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
      const u = new URL(
        a.href,
        'https://main--moleculardevices--hlxsites.hlx.page/',
      );

      // Remove .html extension
      if (u.pathname.endsWith('.html')) {
        u.pathname = u.pathname.slice(0, -5);
      }

      a.href = u.toString();

      if (a.textContent === ori) {
        a.textContent = a.href;
      }
    }
  });
}

export default {
  /**
   * Apply DOM pre processing
   * @param {HTMLDocument} document The document
   */
  preprocess: ({ document }) => {
    // try to fix malformed URLs
    document.querySelectorAll('a').forEach((a) => {
      const { href } = a;
      try {
        decodeURI(href);
      } catch (error) {
        console.warn(`Invalid link in the page: ${href}`, error);
        // TODO
        //a.href = new URL(href).toString();
        a.href = '';
      }
    });

    // prepare vidyard script URLs before their are filtered
    document.querySelectorAll('.video script').forEach((vidyard) => {
      const videoDiv = vidyard.parentElement;
      videoDiv.classList.add('vidyard-player-embed');
      const uuid = vidyard.src.match(/.*com\/(.*)\.js/)[1];
      const params = new URLSearchParams(vidyard.src);
      videoDiv.setAttribute('data-url', vidyard.src);
      videoDiv.setAttribute('data-uuid', uuid);
      videoDiv.setAttribute('data-type', params.get('type'));
    });
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
      '.breadcrumb',
      '.skip-link',
      '.cart-store',
      '.procompare',
      '.share-event',
      '.sticky-social-list',
      '.back-labnote',
      '.recent-posts',
      '.event-block cite',
      '.herobanner_wrap .visible-xs-block',
      '.herobanner_wrap a#openMediaGallery',
      '.ins-nav-container',
      '.OneLinkShow_zh',
      '.onetrust-consent-sdk',
      '.drift-frame-chat',
      '.drift-frame-controller',
    ]);

    // create the metadata block and append it to the main element
    const meta = createMetadata(url, document);
    loadResourceMetaAttributes(url, params, document, meta);

    const block = WebImporter.Blocks.getMetadataBlock(document, meta);
    main.append(block);

    // convert all blocks
    [
      cleanUp,
      transformCurvedWaveFragment,
      transformReferenceProducts,
      transformSections,
      transformHero,
      transformTables,
      transformButtons,
      transformColumns,
      transformReferenceToColumns,
      transformEmbeds,
      transformQuotes,
      transformFAQAccordion,
      transformImageCaption,
      transformShareStory,
      transformTabsNav,
      transformTabsContent,
      transformProductOverview,
      transformProductApplications,
      transformProductCitations,
      transformRelatedProducts,
      transformResources,
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
      new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, ''),
    ),
};
