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
    'http://localhost:3001/export/moldev-resources-sheet-03282023.json?host=https%3A%2F%2Fmain--moleculardevices--hlxsites.hlx.page&limit=10000&sheet=products-applications',
    false,
  );
  request.overrideMimeType('text/json; UTF-8');
  request.send(null);
  if (request.status === 200) {
    resourceMetadata = JSON.parse(request.responseText).data;
  }

  const resource = resourceMetadata.find((n) => n.URL === params.originalURL);
  if (resource) {
    if (resource['Asset Type']) {
      meta.Type = resource['Asset Type'];
    }
  } else {
    console.warn('Resource item for %s not found', params.originalURL);
  }
};

const createMetadata = (url, document) => {
  const meta = {};

  let title = document.querySelector('title');
  if (title) {
    title = title.innerHTML
      .replace(/[\n\t]/gm, '')
      .replace(/\|.*/, '')
      .trim();
    meta.Title = `Media Gallery for ${title}`;
  }

  meta.Robots = 'noindex, nofollow';
  return meta;
};

/**
 * Sanitizes a name for use as class name.
 * @param {string} name The unsanitized name
 * @returns {string} The class name
 */
export function toClassName(name) {
  return typeof name === 'string'
    ? name
      .toLowerCase()
      .replace(/[^0-9a-z]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    : '';
}

const cleanUp = (document) => {
  document.querySelectorAll('table').forEach((table) => {
    table.innerHTML = table.innerHTML.replace(/\\~/gm, '~');
  });
  document
    .querySelectorAll('.row > [class*="col-"][class*="-12"]')
    .forEach((col) => col.classList.remove('col-xs-12', 'col-sm-12', 'col-md-12', 'col-lg-12'));
  document
    .querySelectorAll('.herobanner_wrap .row > [class*="col-"]')
    .forEach((col) => col.removeAttribute('class'));
  document.querySelectorAll('.content-section .listing-image.ico-list').forEach((div) => {
    if (div.textContent.trim() === '') {
      div.remove();
    }
  });
};

const transformHeroGallery = (document) => {
  const mediaGallery = document.getElementById('mediaGallary');
  if (mediaGallery && mediaGallery.textContent.trim() !== '') {
    mediaGallery.querySelectorAll('button, .carousel-control').forEach((button) => button.remove());

    // prepare video & iframe links links
    mediaGallery.querySelectorAll('.mediagalVid iframe').forEach((iframe) => {
      const iframeSrc = iframe.src ? iframe.src : iframe.getAttribute('data-url');
      if (iframeSrc) {
        const link = document.createElement('a');
        link.href = iframeSrc;
        link.textContent = iframeSrc;
        const cells = [['Embed'], [link]];
        const table = WebImporter.DOMUtils.createTable(cells, document);
        iframe.replaceWith(table);
      }
    });

    // transform items
    const items = mediaGallery.querySelectorAll('#mediaGalSlid .item');
    items.forEach((div, index) => {
      const title = div.querySelector('.slide-desc');
      if (title) {
        const heading = document.createElement('h3');
        heading.textContent = title.textContent;
        title.replaceWith(heading);
      }
      if (index < items.length - 1) {
        div.after(document.createElement('hr'));
      }
    });
  } else {
    throw new Error('No media gallery, nothing to import');
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
    document, url, html, params,
  }) => {
    // define the main element: the one that will be transformed to Markdown
    const main = document.body;

    // use helper method to remove header, footer, etc.
    WebImporter.DOMUtils.remove(main, [
      'header',
      'footer',
      'nav#block-mobilenavigation',
      '.visually-hidden.focusable.skip-link',
      '.herobanner_wrap',
      '.breadcrumb',
      '.tabWrapper',
      '.cart-store',
      '.procompare',
      '.share-event',
      '.sticky-social-list',
      '.content-section.cover-bg',
      '.content-section.cover-bg-no-cover',
      '.ins-nav-container',
      '.OneLinkShow_zh',
      '.onetrust-consent-sdk',
      '.drift-frame-chat',
      '.drift-frame-controller',
      '.dialog-off-canvas-main-canvas',
    ]);

    // create the metadata block and append it to the main element
    const meta = createMetadata(url, document);
    loadResourceMetaAttributes(url, params, document, meta);

    const block = WebImporter.Blocks.getMetadataBlock(document, meta);
    main.append(block);

    // convert all blocks
    // eslint-disable-next-line max-len
    [cleanUp, transformHeroGallery, makeProxySrcs, makeAbsoluteLinks].forEach((f) => f.call(null, document));

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
    document, url, html, params,
  }) => {
    let fileURL = url;
    const { originalURL } = params;
    const typeCell = [...document.querySelectorAll('table td')].find(
      (td) => td.textContent === 'Type',
    );
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
      fileURL = `http://localhost:3001/fragments/media-gallery/${type}/${filename}`;
    }
    return WebImporter.FileUtils.sanitizePath(
      new URL(fileURL).pathname.replace(/\.html$/, '').replace(/\/$/, ''),
    );
  },
};
