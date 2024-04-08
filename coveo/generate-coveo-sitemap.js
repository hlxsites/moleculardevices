/* eslint-disable no-console, no-unused-expressions, no-nested-ternary, quote-props */

const https = require('https');
const fs = require('fs');

const BASE_URL = 'https://www.moleculardevices.com';

const INDENTIFIER_MAPPING = new Map();

const RESOURCES = [
  'News',
  'Publications',
  'Videos & Webinars',
  'Application Note',
  'Customer Breakthrough',
  'Data Sheet',
  'Brochure',
  'Scientific Poster',
  'Flyer',
  'Infographic',
  'Presentations',
  'Cell Counter',
  'eBook',
  'User Guide',
  'Newsletter',
  'Interactive Demo',
  'Product Insert',
  'Assay Data',
  'Legal',
  'Blog',
  'COA',
  'SDS',
  'Training Material',
  'Technical Guide',
  'White Paper',
  'Declaration of Conformity',
];

const PRIORITYMAPPING = {
  '/': 0.1,
  '/contact': 0.1,
  '/customer-breakthroughs': 0.1,
  '/events': 0.1,
  '/newsroom/in-the-news': 0.1,
  '/newsroom/news': 0.1,
  '/newsroom': 0.1,
  '/product-finder': 0.1,
  '/quote-request': 0.1,
  '/search-results': 0.1,
  'video-gallery': 0.1,
  '/applications': 0.1,
  '/citations': 0.1,
  '/service-support': 0.1,
  '/lab-notes': 0.1,
  '/applications/cell-counting/counting-cells-without-cell-staining': 0.1,
  '/products/cellular-imaging-systems/high-content-imaging/pico/cell-counting-using-automated-cell-imaging': 0.5,
  '/products/cellular-imaging-systems/high-content-imaging/pico/apoptosis-analysis-using-automated-cell-imaging': 0.5,
  Product: 0.2,
  Category: 0.2,
};

async function getData() {
  return new Promise((resolve) => {
    https.get('https://main--moleculardevices--hlxsites.hlx.live/query-index.json?sheet=coveo-sitemap-source&limit=7000', (res) => {
      const data = [];

      res.on('data', (chunk) => {
        data.push(chunk);
      });

      res.on('end', () => {
        const entries = JSON.parse(Buffer.concat(data).toString());
        console.log(`Successfully retrieved ${entries.data.length} items from index`);
        resolve(entries);
      });
    }).on('error', (err) => {
      console.log('Error: ', err.message);
    });
  });
}

async function getCoveoIcons() {
  return new Promise((resolve) => {
    resolve({
      'Data Sheet': '/images/resource-icons/data-sheet.png',
      COA: '/images/resource-icons/coa.png',
      'Scientific Poster': '/images/resource-icons/scientific-poster.png',
      Event: '/images/resource-icons/event.png',
      'User Guide': '/images/resource-icons/brochure.png',
      Legal: '/images/resource-icons/document.png',
      'Technical Guide': '/images/resource-icons/brochure.png',
      eBook: '/images/resource-icons/ebook.png',
      Brochure: '/images/resource-icons/brochure.png',
      'Customer Breakthrough': '/images/resource-icons/customer-breakthrough.png',
      SDS: '/images/resource-icons/sds.png',
      Application: '/images/resource-icons/application-note.png',
      Blog: '/images/resource-icons/blog.png',
      'Videos and Webinars': '/images/resource-icons/videos-and-webinars.png',
      Publication: '/images/resource-icons/document.png',
      News: '/images/resource-icons/document.png',
      Flyer: '/images/resource-icons/flyer.png',
      'Product Insert': '/images/resource-icons/document.png',
      Citation: '/images/resource-icons/citation.png',
      'Training Material': '/images/resource-icons/document.png',
      'Interactive Demo': '/images/resource-icons/interactive-demo.png',
      Technology: '/images/resource-icons/technology.png',
      Infographic: '/images/resource-icons/infographic.png',
      'White Paper': '/images/resource-icons/document.png',
      Presentations: '/images/resource-icons/presentations.png',
      Newsletter: '/images/resource-icons/document.png',
      'Application Note': '/images/resource-icons/application-note.png',
      'Cell Counter': '/images/resource-icons/document.png',
      'Declaration of Conformity': '/images/resource-icons/document.png',
      Category: '/images/resource-icons/technology.png',
      homepage: '/images/resource-icons/technology.png',
      'Video Gallery': '/images/resource-icons/technology.png',
      'Integrity and Compliance': '/images/resource-icons/technology.png',
    }); // TODO get from sheet
  });
}

function isNotEmpty(field) {
  return field && field !== '0' && field !== '#N/A';
}

export default function itemSearchTitle(item) {
  if (isNotEmpty(item.searchTitle)) {
    return item.searchTitle;
  }

  if (isNotEmpty(item.h1)) {
    return item.h1;
  }

  if (isNotEmpty(item.title)) {
    return item.title;
  }

  return '';
}

function preprocess(index) {
  index.data.forEach((item) => {
    // There are some technology pages that should also be indexed as applications
    if (item.type === 'Technology' && isNotEmpty(item.category)) {
      const deepClone = JSON.parse(JSON.stringify(item));
      deepClone.type = 'Application';
      deepClone.internal_path = deepClone.internal_path.replace('/technology/', '/applications/');
      index.data.push(deepClone);
    }
  });
}

function createCoveoFields(index, icons) {
  console.log('Procesing data...');
  index.data.forEach((item) => {
    if (isNotEmpty(item.identifier)) {
      INDENTIFIER_MAPPING.set(item.identifier, item);
    }

    const lastModified = new Date(0);
    lastModified.setUTCSeconds(isNotEmpty(item.date) ? item.date : item.lastModified);
    item.lastmod = lastModified.toISOString();

    item.path = isNotEmpty(item.gatedURL) ? item.gatedURL : item.internal_path;
    if (!item.path.startsWith('http')) {
      const url = new URL(BASE_URL);
      url.pathname = item.path;
      item.path = url.toString();
    }

    item.description = isNotEmpty(item.internal_description)
      ? item.internal_description
      : item.title;

    item.filetype = item.internal_path.endsWith('.pdf') ? 'pdf' : 'html';

    item.md_rfq = item.familyid && item.familyid !== '0'
      ? `${BASE_URL}/quote-request?pid=${item.familyid}`
      : '';

    // image computation must happen before type remapping
    const coveoImage = item.type === 'Product'
      ? isNotEmpty(item.thumbnail) ? item.thumbnail : item.image
      : icons[item.type] || '/images/resource-icons/document.png';

    const TYPE_REMAP_PREFIXES = {
      '/en/assets/app-note/': 'Application Note',
      '/en/assets/ebook/': 'eBook',
      '/en/assets/scientific-posters/': 'Scientific Poster',
      '/en/assets/tutorials-videos/': 'Videos & Webinars',
      '/en/assets/customer-breakthrough/': 'Customer Breakthrough',
      '/en/assets/brochures/': 'Brochure',
      '/en/assets/presentations': 'Presentations',
    };

    const TYPE_REMAP = {
      'Videos and Webinars': 'Videos & Webinars',
      'Publication': 'Publications',
      'homepage': 'home',
      'Video Gallery': 'video-gallery',
      'Integrity and Compliance': 'page',
      'About Us': 'multi_pages',
      '/applications': 'Application',
      '/citations': 'Citation',
      '/leadership': 'multi_pages',
      '/customer-breakthroughs': 'customer-breakthroughs',
      '/events': 'Event',
      '/product-finder': 'product-finder',
      '/quote-request': 'quote-request',
      '/search-results': 'resources-search',
      '/service-support': 'Services and Support',
      '/products/microplate-readers/softmax-pro-insider': 'page',
    };

    Object.keys(TYPE_REMAP_PREFIXES).forEach((prefix) => {
      if (item.internal_path.startsWith(prefix)) {
        item.type = TYPE_REMAP_PREFIXES[prefix];
      }
    });
    item.type = TYPE_REMAP[item.internal_path] || TYPE_REMAP[item.type] || item.type;
    item.type = isNotEmpty(item.type) ? item.type : 'page';

    const isResource = RESOURCES.includes(item.type);
    item.md_pagetype = isResource ? 'Resource' : (item.type.includes('Category') ? 'Category' : item.type);
    item.md_contenttype = isResource ? item.type : '';

    const coveoImageURL = new URL(coveoImage, BASE_URL);
    coveoImageURL.search = '';

    item.md_img = coveoImageURL.toString();

    if (item.type === 'Product' && isNotEmpty(item.category)) {
      const result = [item.category];
      isNotEmpty(item.subcategory) && result.push(`${item.category}|${item.subcategory}`);
      isNotEmpty(item.subcategory) && result.push(`${item.category}|${item.subcategory}|${itemSearchTitle(item)}`);
      item.mdproductsdatacategory = result.join(';');
    }

    if (item.md_pagetype === 'Resource' || item.path.endsWith('.pdf')) {
      item.md_title = itemSearchTitle(item);
    }

    item.priority = PRIORITYMAPPING[item.internal_path] || PRIORITYMAPPING[item.md_pagetype] || 0.5;
  });
}

function createCoveoFieldsFromRelatedData(index) {
  index.data.forEach((item) => {
    if (item.md_pagetype === 'Resource') {
      // set related product info
      if (isNotEmpty(item.relatedProducts)) {
        const relatedProducts = item.relatedProducts.split(',')
          .map((identifier) => INDENTIFIER_MAPPING.get(identifier.trim()))
          .filter((product) => !!product);

        item.md_product = relatedProducts.map(itemSearchTitle).join(';');
        item.mdproductsdatacategory = relatedProducts
          .map((product) => product.mdproductsdatacategory)
          .filter((category) => !!category)
          .join(';');
      }

      // set related application info
      if (isNotEmpty(item.relatedApplications)) {
        item.md_application = item.relatedApplications.split(',')
          .map((identifier) => INDENTIFIER_MAPPING.get(identifier.trim()))
          .filter((application) => !!application)
          .map(itemSearchTitle)
          .join(';');
      }
    }
  });
}

async function writeCoveoSitemapXML(index) {
  index.data.sort((item1, item2) => item1.priority - item2.priority);

  const EMPTY = '<![CDATA[ ]]>';
  const xmlData = [];
  xmlData.push('<urlset xmlns="http://www.google.com/schemas/sitemap/0.84" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:coveo="http://www.coveo.com/schemas/metadata" xsi:schemaLocation="http://www.google.com/schemas/sitemap/0.84 http://www.google.com/schemas/sitemap/0.84/sitemap.xsd">');
  let count = 0;

  index.data.forEach((item) => {
    if (item.internal_path.startsWith('/products/series-products')) return;
    if (item.internal_path.startsWith('/fragments')) return;

    if (item.type === 'Landing Page') return;
    const excludedPaths = [
      '/nav',
      '/nav-landing-page',
      '/footer',
      '/quote-request-success',
      '/contact-search',
      '/archived-events',
      '/video-gallery-landing/de',
      '/video-gallery-landing/fr',
      '/cp-request',
    ];

    if (excludedPaths.includes(item.internal_path)) {
      return;
    }

    xmlData.push('  <url>');
    xmlData.push(`    <loc>${item.path}</loc>`);
    xmlData.push(`    <lastmod>${item.lastmod}</lastmod>`);
    xmlData.push('    <changefreq>daily</changefreq>');
    xmlData.push(`    <priority>${item.priority}</priority>`);
    xmlData.push('    <coveo:metadata>');
    item.md_title && xmlData.push(`      <md_title><![CDATA[ ${itemSearchTitle(item)} ]]></md_title>`);
    xmlData.push(`      <md_contenttype><![CDATA[ ${item.md_contenttype || ''} ]]></md_contenttype>`);
    xmlData.push(`      <md_pagetype>${item.md_pagetype || EMPTY}</md_pagetype>`);
    xmlData.push(`      <md_img>${item.md_img}</md_img>`);
    xmlData.push(`      <md_product><![CDATA[ ${item.md_product || ''}  ]]></md_product>`);
    xmlData.push(`      <md_application><![CDATA[ ${item.md_application || ''} ]]></md_application>`);
    xmlData.push(`      <mdproductsdatacategory><![CDATA[ ${item.mdproductsdatacategory || ''} ]]></mdproductsdatacategory>`); // TODO
    item.md_rfq && xmlData.push(`      <md_rfq>${item.md_rfq}</md_rfq>`);
    xmlData.push(`      <md_country><![CDATA[ ${isNotEmpty(item.md_country) ? item.md_country : ''} ]]></md_country>`); // TODO
    xmlData.push(`      <md_lang><![CDATA[ ${isNotEmpty(item.md_lang) ? item.md_lang : ''} ]]></md_lang>`); // TODO
    xmlData.push(`      <md_source><![CDATA[ ${isNotEmpty(item.md_source) ? item.md_source : ''} ]]></md_source>`); // TODO
    xmlData.push('    </coveo:metadata>');
    xmlData.push('    <md_pagesort>1</md_pagesort>');
    xmlData.push('  </url>');

    count += 1;
  });

  xmlData.push('</urlset>');

  try {
    fs.writeFileSync('coveo-xml.xml', xmlData.join('\n'));
    console.log(`Successfully wrote ${count} items to coveo xml`);
  } catch (err) {
    console.error(err);
  }
}

async function main() {
  const index = await getData();
  const icons = await getCoveoIcons();

  preprocess(index);
  createCoveoFields(index, icons);
  createCoveoFieldsFromRelatedData(index);
  writeCoveoSitemapXML(index);
}

main();
