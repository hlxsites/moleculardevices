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
  const FRAGMENT_TYPES = ['Applications', 'Assay Data', 'Citation'];
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
  if (params.originalURL.indexOf('/resources/citations/') > 0) {
    sheet = 'citations';
  }
  request.open(
    'GET',
    `http://localhost:3001/export/moldev-resources-sheet-041720223.json?host=https%3A%2F%2Fmain--moleculardevices--hlxsites.hlx.page&limit=10000&sheet=${sheet}`,
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
    if (resource['Gated/Ungated'] === 'Yes') {
      meta.Gated = 'Yes';
      const gatedUrl = resource['Gated URL'];
      meta['Gated URL'] = gatedUrl.startsWith('http') ? gatedUrl : `https://www.moleculardevices.com${gatedUrl}`;
    }
    if (resource.Publisher) {
      meta.Publisher = resource.Publisher;
    }
    if (FRAGMENT_TYPES.find((type) => type === resource['Asset Type'])) {
      meta.Type = resource['Asset Type'];
    }

    if (resource['Created On']) {
      const publishDate = new Date(resource['Created On']);
      if (publishDate) {
        meta['Publication Date'] = publishDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      }
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
  document.querySelectorAll('.herobanner_wrap .row > [class*="col-"]').forEach((col) => col.removeAttribute('class'));
  document.querySelectorAll('.content-section .listing-image.ico-list').forEach((div) => {
    if (div.textContent.trim() === '') {
      div.remove();
    }
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
    if (section.classList.contains('franklin-horizontal')) {
      styles.push('Horizontal');
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

const transformCitationDocuments = (document) => {
  if (document.querySelector('.citations_detail')) {
    // transform labels
    document.querySelectorAll('span.brand-blue').forEach((span) => {
      const em = document.createElement('em');
      em.textContent = span.textContent.trim();
      span.replaceWith(em);
    });

    // rearrange content to align with citation structure
    const details = document.querySelector('.citations_detail');
    const headline = document.querySelector('h3');
    const extLink = document.querySelector('.citation_body a:last-of-type');
    const extUrl = extLink.href;
    extLink.remove();
    document.querySelector('.citation_body br').remove();
    const headlineLink = document.createElement('a');
    headlineLink.href = extUrl;
    const newHeadline = document.createElement('h2');
    newHeadline.textContent = headline.textContent;
    headlineLink.append(newHeadline);

    headline.parentNode.insertBefore(headlineLink, headline);
    headline.remove();
    headlineLink.before(details);
    const readMoreLink = document.createElement('a');
    readMoreLink.href = extLink;
    readMoreLink.textContent = 'Go to article';
    document.querySelector('.citation_body').after(readMoreLink);
  }
};

const transformFragmentDocuments = (document) => {
  const isFragment = !![...document.querySelectorAll('table td')].find((td) => td.textContent === 'Type');
  if (isFragment) {
    document.querySelectorAll('.section-image.cover-bg, .section-image.cover-bg-new').forEach((hero) => {
      const headline = hero.querySelector('h1');
      const h3 = document.createElement('h3');
      h3.textContent = headline.textContent;
      hero.before(h3);
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

const transformButtons = (document) => {
  // convert primary/secondary buttons
  document.querySelectorAll('a.btn').forEach((button) => {
    button.querySelectorAll('span').forEach((span) => span.remove());
    button.querySelectorAll('i.fa').forEach((icon) => {
      button.textContent = `${button.textContent} :${icon.classList[1]}:`;
      icon.remove();
    });

    const buttonClasses = button.classList;
    if (buttonClasses.contains('btn-info') || buttonClasses.contains('gradiantBlueBtn') || buttonClasses.contains('orangeBlueBtn')) {
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
    if (row.childElementCount > 1 && !row.closest('section.franklin-horizontal')) {
      let blockName = 'Columns';
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
      const styleMatch = COLUMN_STYLES.find((e) => e.match.some((match) => column.classList.contains(match)));
      if (styleMatch) {
        blockOptions.push(styleMatch.blockStyle);
      }

      if (blockOptions.length > 0) {
        blockName = `Columns (${blockOptions.join(', ')})`;
      }
      const cells = [[blockName], children];
      const table = WebImporter.DOMUtils.createTable(cells, document);
      row.replaceWith(table);
    }
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
        const uuid = vidyard.src.match(/.*com\/(.*)\.js/)[1];
        const params = new URLSearchParams(vidyard.src);
        videoDiv.setAttribute('data-url', vidyard.src);
        videoDiv.setAttribute('data-uuid', uuid);
        videoDiv.setAttribute('data-type', params.get('type'));
      }
    });

    // rewrite all links with spans before they get cleaned up
    document.querySelectorAll('a span.text').forEach((span) => span.replaceWith(span.textContent));
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
      '.breadcrumb',
      '.skip-link',
      '.cart-store',
      '.procompare',
      '.share-event',
      '.sticky-social-list',
      '.back-labnote',
      '.recent-posts .overview-page',
      '.event-block cite',
      '.herobanner_wrap .visible-xs-block',
      '.herobanner_wrap a#openMediaGallery',
      '.ins-nav-container',
      '.OneLinkShow_zh',
      '.onetrust-consent-sdk',
      '.drift-frame-chat',
      '.drift-frame-controller',
      '.modal.bs-example-modal-lg.mediaPopup', // TODO contains the hero media gallery links, must be added to the hero block
    ]);

    // create the metadata block and append it to the main element
    const meta = createMetadata(url, document);
    loadResourceMetaAttributes(url, params, document, meta);

    const block = WebImporter.Blocks.getMetadataBlock(document, meta);
    main.append(block);

    // convert all blocks
    [
      cleanUp,
      transformSections,
      transformFragmentDocuments,
      transformCitationDocuments,
      transformButtons,
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
  }) => {
    let fileURL = url;
    const { originalURL } = params;
    const typeCell = [...document.querySelectorAll('table td')].find((td) => td.textContent === 'Type');
    if (typeCell) {
      const typeRow = typeCell.parentElement;
      let filename = originalURL.substring(originalURL.lastIndexOf('/') + 1);
      if (params.originalURL.indexOf('/node/') > -1) {
        filename = toClassName(
          document
            .querySelector('title')
            .innerHTML.replace(/[\n\t]/gm, '')
            .split('|')[0]
            .trim(),
        );
      }
      const type = toClassName(typeRow.lastChild.textContent);
      fileURL = `http://localhost:3001/fragments/${type}/${filename}`;
    }
    return WebImporter.FileUtils.sanitizePath(new URL(fileURL).pathname.replace(/\.html$/, '').replace(/\/$/, ''));
  },
};
