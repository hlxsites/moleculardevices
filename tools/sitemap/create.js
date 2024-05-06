import fs from 'fs/promises';
// eslint-disable-next-line import/no-unresolved
import convert from 'xml-js';
import path from 'path';

const QUERY_INDEX_URL = 'https://www.moleculardevices.com/query-index.json?sheet=sitemap&limit=5000';
const LOCALE_URL = 'https://www.moleculardevices.com';

const hreflangMap = [
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
  const sitemapPath = path.join(process.cwd(), '../../content-sitemap.xml');

  const output = {
    urlset: {
      _attributes: {
        'xmlns:xhtml': 'http://www.w3.org/1999/xhtml',
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
      },
      url: json?.data.map((row) => ({
        loc: `${LOCALE_URL}${row.path}`,
        'xhtml:link': Object.keys(hreflangMap).map((key) => {
          const hreflang = hreflangMap[key][0];
          const href = `${hreflangMap[key][1].baseUrl}${row.path}`;
          return {
            _attributes: {
              rel: 'alternate',
              hreflang,
              href,
            },
          };
        }),
        lastmod: row.lastModified ? new Date(row.lastModified * 1000).toISOString().split('T')[0] : null,
      })),
    },
  };

  const options = { compact: true, ignoreComment: true, spaces: 4 };
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${convert.json2xml(output, options)}`;
  await fs.writeFile(sitemapPath, xml);
} catch (error) {
  // eslint-disable-next-line no-console
  console.error(error);
}
