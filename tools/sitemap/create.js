import fs from 'fs/promises';
// eslint-disable-next-line import/no-unresolved
import convert from 'xml-js';
import path from 'path';

const QUERY_INDEX_URL = 'https://www.moleculardevices.com/query-index.json?sheet=sitemap&limit=5000';
// const LOCALE_URL = 'https://www.moleculardevices.com';

const hreflangMap = [
  ['en', { baseUrl: 'https://www.moleculardevices.com' }],
  ['de', { baseUrl: 'https://de.moleculardevices.com' }],
  ['it', { baseUrl: 'https://it.moleculardevices.com' }],
  ['es', { baseUrl: 'https://es.moleculardevices.com' }],
  ['fr', { baseUrl: 'https://fr.moleculardevices.com' }],
  ['ko', { baseUrl: 'https://ko.moleculardevices.com' }],
  ['zh', { baseUrl: 'https://www.moleculardevices.com.cn' }],
  ['x-default', { baseUrl: 'https://www.moleculardevices.com' }],
];

try {
  const response = await fetch(QUERY_INDEX_URL);
  const json = await response.json();
  const filteredJson = json?.data.filter((row) => row.showinSitemap !== 'No');
  const sitemapPath = path.join(process.cwd(), '../../content-sitemap.xml');

  const urls = [];

  filteredJson.forEach((row) => {
    // eslint-disable-next-line no-unused-vars
    hreflangMap.forEach(([hreflang, { baseUrl }]) => {
      const urlEntry = {
        loc: `${baseUrl}${row.path}`,
        'xhtml:link': hreflangMap.map(([altHreflang, { baseUrl: altBaseUrl }]) => ({
          _attributes: {
            rel: 'alternate',
            hreflang: altHreflang,
            href: `${altBaseUrl}${row.path}`,
          },
        })),
        lastmod: row.lastModified ? new Date(row.lastModified * 1000).toISOString().split('T')[0] : null,
      };
      urls.push(urlEntry);
    });
  });

  const output = {
    urlset: {
      _attributes: {
        'xmlns:xhtml': 'http://www.w3.org/1999/xhtml',
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
      },
      url: urls,
    },
  };

  const options = { compact: true, ignoreComment: true, spaces: 4 };
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${convert.json2xml(output, options)}`;
  await fs.writeFile(sitemapPath, xml);
} catch (error) {
  // eslint-disable-next-line no-console
  console.error(error);
}
