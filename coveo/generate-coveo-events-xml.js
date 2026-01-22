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
    https.get('https://www.moleculardevices.com/query-index.json?sheet=events&limit=500', (res) => {
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
    https.get('https://www.moleculardevices.com/query-index.json?sheet=coveo-icon-mapping&limit=50', (res) => {
      const data = [];

      res.on('data', (chunk) => {
        data.push(chunk);
      });

      res.on('end', () => {
        try {
          const entries = JSON.parse(Buffer.concat(data).toString());
          const iconMap = {};
          entries.data.forEach((entry) => {
            if (entry['Asset Type'] && entry['Resource Icon']) {
              iconMap[entry['Asset Type']] = entry['Resource Icon'];
            }
          });

          console.log(`Successfully mapped ${Object.keys(iconMap).length} icons.`);
          resolve(iconMap);
        } catch (err) {
          console.error('Failed to parse or transform icon mapping:', err);
          resolve({});
        }
      });
    }).on('error', (err) => {
      console.log('Error: ', err.message);
    });
  });
}

function isNotEmpty(field) {
  return field && field !== '0' && field !== '#N/A';
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
    if (isNotEmpty(item.title)) {
      INDENTIFIER_MAPPING.set(item.title, item);
    }

    const lastModified = new Date(0);
    lastModified.setUTCSeconds(isNotEmpty(item.date) ? item.date : item.lastModified);
    item.lastmod = lastModified.toISOString();

    item.path =  item.path;
    if (!item.path.startsWith('http')) {
      const url = new URL(BASE_URL);
      url.pathname = item.path;
      item.path = url.toString();
    }
    item.md_title      = item.title;
    item.eventType     = item.eventType;
    item.eventAddress  = item.eventAddress;
    item.eventRegion   = item.eventRegion;
    item.eventStart    = item.eventStart;
    item.eventEnd     = item.eventEnd;
    item.cardDescription = isNotEmpty(item.cardDescription) ? item.cardDescription : "";
    item.description = isNotEmpty(item.description)
      ? item.description
      : item.title;
    // image computation must happen before type remapping
    const eventImage = item.image;

    const eventImageURL = new URL(eventImage, BASE_URL);
    eventImageURL.search = '';

    item.md_img = eventImageURL.toString();


    item.priority = PRIORITYMAPPING[item.internal_path] || PRIORITYMAPPING[item.md_pagetype] || 0.5;
  });
}


async function writeCoveoSitemapXML(index) {
  index.data.sort((item1, item2) => item1.priority - item2.priority);

  const EMPTY = '<![CDATA[ ]]>';
  const xmlData = [];
  xmlData.push('<urlset xmlns="http://www.google.com/schemas/sitemap/0.84" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:coveo="http://www.coveo.com/schemas/metadata" xsi:schemaLocation="http://www.google.com/schemas/sitemap/0.84 http://www.google.com/schemas/sitemap/0.84/sitemap.xsd">');
  let count = 0;

  index.data.forEach((item) => {
     

    xmlData.push('  <url>');
    xmlData.push(`    <loc>${item.path}</loc>`);
    xmlData.push(`    <lastmod>${item.lastmod}</lastmod>`);
    xmlData.push('    <changefreq>daily</changefreq>');
    xmlData.push(`    <priority>${item.priority}</priority>`);
    xmlData.push('    <coveo:metadata>');
    item.md_title && xmlData.push(`      <md_title><![CDATA[ ${item.md_title} ]]></md_title>`);
    xmlData.push(`      <md_eventtype><![CDATA[ ${item.eventType} ]]></md_eventtype>`);
    xmlData.push(`      <md_img>${item.md_img}</md_img>`);
    xmlData.push(`      <md_eventaddress><![CDATA[ ${item.eventAddress} ]]></md_eventaddress>`); 
    xmlData.push(`      <md_eventstart><![CDATA[ ${item.eventStart} ]]></md_eventstart>`); 
    xmlData.push(`      <md_eventend><![CDATA[ ${item.eventEnd} ]]></md_eventend>`);
    xmlData.push(`      <md_carddescription><![CDATA[ ${item.cardDescription} ]]></md_carddescription>`); 
    xmlData.push(`      <md_eventdescription><![CDATA[ ${item.description} ]]></md_eventdescription>`); 
    xmlData.push(`      <md_location><![CDATA[ location ]]></md_location>`); 
    xmlData.push('    </coveo:metadata>');
    xmlData.push('    <md_pagesort>1</md_pagesort>');
    xmlData.push('  </url>');

    count += 1;
  });

  xmlData.push('</urlset>');
  // Add a timestamp comment so the file always changes
  xmlData.push(`<!-- build timestamp: ${new Date().toISOString()} -->`);
  try {
    fs.writeFileSync('cove-events.xml', xmlData.join('\n'));
    console.log(`✅ Successfully wrote ${count} items to coveo events xml`);
  } catch (err) {
    console.error('❌ Error writing coveo-events.xml:', err);
  }
}

async function main() {
  const index = await getData();
  const icons = await getCoveoIcons();

  preprocess(index);
  createCoveoFields(index, '');
  writeCoveoSitemapXML(index);
}

main();
