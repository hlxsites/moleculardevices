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
  { id: 'Resources' },
  { id: 'Orderingoptions', sectionName: 'Ordering Options' },
  { id: 'Order' },
  { id: 'options', sectionName: 'Options' },
  { id: 'workflow', sectionName: 'Workflow' },
  { id: 'CompatibleProducts', sectionName: 'Compatible Products & Services' },
  { id: 'Citations' },
  { id: 'RelatedProducts', sectionName: 'Related Products & Services' },
  { id: 'specs', sectionName: 'Specifications & Options' },
  { id: 'planoptions', sectionName: 'Plan Options' },
];

const META_SHEET_MAPPING = [
  { url: '/newsroom/in-the-news/', sheet: 'publications' },
  { url: '/products/', sheet: 'products' },
  { url: '/service-support/', sheet: 'products' },
  { url: '/applications/', sheet: 'applications' },
  { url: '/events/', sheet: 'events' },
  { url: '/resources/citations/', sheet: 'citations' },
  { url: '/technology', sheet: 'technologies' },
];

const isProduct = (document) => document.type === 'Products' && document.querySelector('body').classList.contains('page-node-type-products');
const isAssayKit = (document) => document.productType && (document.productType === 'Assay Kits' || document.productType === 'Labware');
const isApplication = (document) => document.type && document.type === 'Application';
const isTechnology = (document) => document.type && document.type === 'Technology';

const formatDate = (date, includeTime = false) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    return date.toLocaleString('en-US', options);
  }
  return date.toLocaleDateString('en-US', options);
};

const makeUrlRelative = (url) => {
  if (url.startsWith('https://www.moleculardevices.com')) {
    return url.substring(32, url.length);
  }
  return url;
};

/**
 * Special handling for resource document meta data.
 */
const loadResourceMetaAttributes = (url, params, document, meta) => {
  let resourceMetadata = {};
  // we use old XMLHttpRequest as fetch seams to have problems in bulk import
  const request = new XMLHttpRequest();
  let sheet = 'resources';
  const metaSheet = META_SHEET_MAPPING.find((m) => params.originalURL.indexOf(m.url) > -1);
  if (metaSheet) {
    sheet = metaSheet.sheet;
  }
  request.open(
    'GET',
    `https://main--moleculardevices--hlxsites.hlx.page/export/moldev-resources-sheet-05152023.json?limit=10000&sheet=${sheet}`,
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
      document.type = resource['Asset Type'];
    }
    if (resource['Tagged to Products']) {
      meta['Related Products'] = resource['Tagged to Products'];
    }
    if (resource['Tagged to Technology']) {
      meta['Related Technologies'] = resource['Tagged to Technology'];
    }
    if (resource['Tagged to Applications']) {
      meta['Related Applications'] = resource['Tagged to Applications'];
    }
    if (resource['Tagged Topics']) {
      meta['Related Topics'] = resource['Tagged Topics'];
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
    if (resource['SHORT DESCRIPTION']) {
      if (meta.Description) {
        meta['Card Description'] = resource['SHORT DESCRIPTION'];
      } else {
        meta.Description = resource['SHORT DESCRIPTION'];
      }
    }
    if (resource.SUMMARY) {
      if (meta.Description) {
        meta['Card Description'] = resource.SUMMARY;
      } else {
        meta.Description = resource.SUMMARY;
      }
    }
    if (resource['COVEO TITLE']) {
      meta['Search Title'] = resource['COVEO TITLE'];
    }
    if (resource['Product Category']) {
      meta.Category = resource['Product Category'];
    }
    if (resource.Category) {
      meta.Category = resource.Category;
    }
    if (resource['Sub Category'] && resource['Sub Category'] !== resource.Category) {
      meta['Sub Category'] = resource['Sub Category'];
    }
    if (resource['Product Related Categories']) {
      meta['Related Categories'] = resource['Product Related Categories'];
    }
    if (resource['PRODUCT FAMILY']) {
      meta['Product Family'] = resource['PRODUCT FAMILY'];
    }
    if (resource['LINE OF BUSINESS']) {
      meta['Line of Business'] = resource['LINE OF BUSINESS'];
    }
    if (resource['Family ID']) {
      meta['Family ID'] = resource['Family ID'];
      document.pid = resource['Family ID'];
    }
    if (resource.Source) {
      meta.Source = resource.Source;
    }
    if (resource.Country) {
      meta.Country = resource.Country;
    }
    if (resource.Language) {
      meta.Language = resource.Language;
    }
    if (resource.Locale) {
      meta.Locale = resource.Locale;
    }

    if (params.originalURL.indexOf('/resources/citations/') > 0) {
      if (resource['Citation Number']) {
        meta['Citation Number'] = resource['Citation Number'];
      }
      meta.Title = resource.Title;
    }

    if (params.originalURL.indexOf('/events/') > 0) {
      if (resource['Event Type']) {
        meta['Event Type'] = resource['Event Type'];
      }
      if (resource.Region) {
        meta['Event Region'] = resource.Region;
      }
      if (resource['Event Address']) {
        meta['Event Address'] = resource['Event Address'];
      }
      const startDate = new Date(resource['START DATE']);
      if (startDate) {
        meta['Event Start'] = formatDate(startDate, true);
      }
      const endDate = new Date(resource['END DATE']);
      if (endDate) {
        meta['Event End'] = formatDate(endDate, true);
      }
    }

    if (isProduct(document)) {
      if (resource['PRODUCT TYPE']) {
        meta['Product Type'] = resource['PRODUCT TYPE'];
        document.productType = resource['PRODUCT TYPE'];
      }
      if (resource['SHOPIFY HANDLES']) {
        document.shopfiyHandler = resource['SHOPIFY HANDLES'];
      }
      if (resource['PRODUCT ASSAY KITS']) {
        meta['Product Assay Kits'] = resource['PRODUCT ASSAY KITS'];
      }
      if (resource['IS SERIES MAIN PRODUCT'] && resource['IS SERIES MAIN PRODUCT'].toLowerCase() === 'yes') {
        meta['Series Main Product'] = resource['IS SERIES MAIN PRODUCT'];
      }
      if (resource['SERIES PRODUCT']) {
        meta['Series Product'] = resource['SERIES PRODUCT'];
      }
      if (resource['SHOW IN PRODUCT FINDER'] && resource['SHOW IN PRODUCT FINDER'].toLowerCase() === 'yes') {
        meta['Show in Product Finder'] = resource['SHOW IN PRODUCT FINDER'];
      }
      if (resource['PRODUCT WEIGHT']) {
        meta['Product Weight'] = resource['PRODUCT WEIGHT'];
      }
      if (resource['PRODUCT LANDING PAGE ORDER']) {
        const order = parseInt(resource['PRODUCT LANDING PAGE ORDER'], 10);
        meta['Landing Page Order'] = order + 1;
      }
      if (resource['BUNDLE PRODUCTS']) {
        meta['Bundle Products'] = resource['BUNDLE PRODUCTS'];
      }
      if (resource['PRODUCT READ MODE TYPES']) {
        meta['Read Mode Types'] = resource['PRODUCT READ MODE TYPES'];
      }
    }

    if (isApplication(document)) {
      if (resource['APPLICATION TYPE']) {
        meta['Application Type'] = resource['APPLICATION TYPE'];
      }
      if (resource['SHOW IN RESOURCES']) {
        meta['Resource Category'] = resource['SHOW IN RESOURCES'];
      }
      if (resource['SET ON CATEGORY']) {
        meta['Set On Category'] = resource['SET ON CATEGORY'];
      }
      if (resource['Parent Application']) {
        meta['Parent Application'] = resource['Parent Application'];
      }
    }

    if (isTechnology(document)) {
      if (resource['TECHNOLOGY TYPE']) {
        meta['Technology Type'] = resource['TECHNOLOGY TYPE'];
      }
      if (resource['Tagged Topics']) {
        meta['Set On Category'] = resource['Tagged Topics'];
      }
    }

    if (resource.Thumbnail) {
      const el = document.createElement('img');
      el.src = makeUrlRelative(resource.Thumbnail);
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
      meta['Publication Date'] = formatDate(publishDate);
    }
  } else {
    console.warn('Resource item for %s not found', params.originalURL);
  }
};

const loadFragmentIndex = (type, ref) => {
  const request = new XMLHttpRequest();
  request.open(
    'GET',
    'https://main--moleculardevices--hlxsites.hlx.page/fragments/query-index.json?limit=1000',
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

const createFragmentTable = (document, url) => {
  const a = document.createElement('a');
  a.href = url;
  a.textContent = a.href;
  const cells = [['Fragment'], [a]];
  return WebImporter.DOMUtils.createTable(cells, document);
};

/**
 * Meta data extraction form the original page
 */
const createMetadata = (url, document) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML
      .replace(/[\n\t]/gm, '')
      .replace(/\|.*/, '')
      .replace(/&amp;/, '&')
      .trim();
  }

  const desc = document.querySelector('meta[name="description"]');
  const ogDesc = document.querySelector('[property="og:description"]');
  if (desc) {
    meta.Description = desc.content;
    if (ogDesc) {
      meta['og:description'] = ogDesc.content;
      meta['twitter:description'] = ogDesc.content;
    }
  } else if (ogDesc) {
    meta.Description = ogDesc.content;
  }

  const img = document.querySelector('[property="og:image"]');
  if (img && img.content) {
    const el = document.createElement('img');
    const imgUrl = img.content;
    el.src = makeUrlRelative(imgUrl);
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

  // remove green default wave from pages as we are going to inject the fragment into every tab
  document.querySelectorAll('div.content-section.cover-bg.curv-footer-top-section').forEach((wave) => wave.remove());

  // remove empty media gallery with not items
  const mediaGallery = document.querySelector('div#mediaGallary');
  if (mediaGallery) {
    if (mediaGallery.querySelector('.carousel-inner') && mediaGallery.querySelector('.carousel-inner').childElementCount === 0) {
      mediaGallery.remove();
    }
  }
};

const extractBackgroundImage = (content) => {
  const { backgroundImage } = content.style;
  if (backgroundImage && backgroundImage.match(/url\((.*?)\)/)) {
    return makeUrlRelative(backgroundImage.match(/url\((.*?)\)/)[1].trim());
  }

  // fallback and check on attributes
  if (content.hasAttribute('style') && content.getAttribute('style').match(/background-image: url(?:\(['"]?)(.*?)(?:['"]?\))/)) {
    const backgroundUrl = content.getAttribute('style').match(/background-image: url(?:\(['"]?)(.*?)(?:['"]?\))/)[1];
    return backgroundUrl ? makeUrlRelative(backgroundUrl.trim()) : null;
  }
  return null;
};

const transformHero = (document) => {
  // detect the default hero styles
  document.querySelectorAll('.section-image.cover-bg, .section-image.cover-bg-new').forEach((hero) => {
    // clean
    hero.querySelectorAll('.row').forEach((row) => row.removeAttribute('class'));

    // extract hero image
    const backgroundUrl = extractBackgroundImage(hero);
    let backgroundImg = null;
    if (backgroundUrl) {
      backgroundImg = document.createElement('img');
      backgroundImg.src = backgroundUrl;
    }

    // extract mobile image
    let mobileBackgroundImg = null;
    if (hero.querySelector('div.visible-xs-block > img')) {
      const mobileBackgroundDiv = hero.querySelector('div.visible-xs-block');
      mobileBackgroundImg = mobileBackgroundDiv.querySelector('img');
      mobileBackgroundDiv.remove();
    }

    // extract hero video
    let videoLink = null;
    if (hero.querySelector('.video-container')) {
      const videoOverlay = hero.querySelector('.video-container');
      const video = videoOverlay.querySelector('a[onclick]').getAttribute('onclick');

      const regex = /launchLightbox\('(.*)'\)|fn_vidyard_(.*)\(\)/;
      let m;
      // eslint-disable-next-line no-cond-assign
      if ((m = regex.exec(video)) !== null) {
        const videoId = m[1] || m[2];
        if (videoId) {
          videoLink = `https://share.vidyard.com/watch/${videoId}`;
        }
      }
      videoOverlay.remove();
    }

    const cells = [['Hero']];
    const isBlog = hero.classList.contains('blog-details');

    // prepare hero content
    const heroContent = isBlog ? hero.querySelector('.hero-desc') : hero.querySelector('.container');
    if (heroContent.querySelector('.btn-wrap-mb')) {
      const buttons = heroContent.querySelector('.btn-wrap-mb').children;
      [...buttons].forEach((button) => {
        const buttonWrapper = document.createElement('p');
        button.parentNode.insertBefore(buttonWrapper, button);
        buttonWrapper.append(button);
      });
    }
    const row = [heroContent];

    // add video link
    if (videoLink) {
      row.push([videoLink]);
    }

    // handle product pages with advanced header
    if (isProduct(document) && !isAssayKit(document)) {
      cells[0] = ['Hero Advanced'];
      if (backgroundImg) {
        cells.push(['Desktop', backgroundImg]);
      }
      if (mobileBackgroundImg) {
        cells.push(['Mobile', mobileBackgroundImg]);
      }
    } else {
      if (isBlog) {
        cells[0] = ['Hero (Blog)'];
      }
      const isOrangeStyle = hero.querySelector('a.orangeBlueBtn');
      if (isOrangeStyle) {
        cells[0] = ['Hero (Orange Buttons)'];
      }

      if (backgroundImg) {
        heroContent.insertBefore(backgroundImg, heroContent.firstChild);
      }

      // add second column for customer success story
      const customerStoryHeader = hero.parentElement.querySelector('.customer-story-section');
      if (customerStoryHeader) {
        customerStoryHeader.querySelectorAll('.customer-info > label').forEach((label) => {
          const h6 = document.createElement('h6');
          h6.innerHTML = label.innerHTML;
          label.replaceWith(h6);
        });
        cells[0] = ['Hero (Customer Story)'];
        row.push([customerStoryHeader]);
      }
    }

    cells.push(row);
    const table = WebImporter.DOMUtils.createTable(cells, document);
    hero.replaceWith(table);
  });

  // detect the waved "ebook" style hero used on most gates pages plus some others
  document.querySelectorAll('.ebook-banner.wave').forEach((hero) => {
    const cells = [['Hero (wave)']];
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

// we have different usages of sections - with <section></section>, <div></div>
const transformSections = (document) => {
  document.querySelectorAll('section * section:not(.blogsPage), .category-page-section').forEach((section, index) => {
    // if (index > 0) {
    // section.firstChild.before(document.createElement('hr'));
    // }
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
      section.after(table, document.createElement('hr'));
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
  const overviewTab = document.querySelector('.tab-content .tab-pane#Overview, .tab-content .tab-pane#overview');
  if (overviewTab) {
    if (overviewWaveContent && overviewWaveContent.classList.contains('cover-bg-no-cover')) {
      overviewTab.append(document.createElement('hr'), overviewWaveContent);
    }
  }

  // check if we have covid19 wave
  const covidWave = document.querySelector('section .content-section.cover-bg');
  let hasCovidWave = false;
  if (covidWave) {
    const backgroundUrl = extractBackgroundImage(covidWave);
    if (backgroundUrl && backgroundUrl.indexOf('covid19-footer') > -1) {
      hasCovidWave = true;
      covidWave.remove();
    }
  }

  const fragmentPath = hasCovidWave ? '/fragments/we-are-here-to-help' : '/fragments/next-big-discovery';

  document.querySelectorAll('.tab-content .tab-pane').forEach((tab) => {
    const hasContent = tab.textContent.trim() !== '';
    if (hasContent) {
      const tabConfig = TABS_MAPPING.find((m) => m.id.toLowerCase() === tab.id.toLowerCase());
      tab.before(document.createElement('hr'));

      const metadataCells = [['Section Metadata']];
      // eslint-disable-next-line no-nested-ternary
      metadataCells.push(['name', tabConfig ? ('sectionName' in tabConfig ? tabConfig.sectionName : tabConfig.id) : tab.id]);

      const isOverviewTab = tab.id.toLowerCase() === 'overview';
      if (isOverviewTab) {
        // add overview tab wave section
        const waveSection = tab.querySelector('section.content-section.cover-bg-no-cover');
        if (waveSection) {
          metadataCells.push(['style', 'Wave, Orange Buttons']);
          const bgImage = extractBackgroundImage(waveSection);
          if (bgImage) {
            const img = document.createElement('img');
            img.src = bgImage;
            img.alt = 'Background Image';
            metadataCells.push(['background', img]);
          }
        }

        if (isAssayKit(document) || isApplication(document)) {
          if (overviewWaveContent) {
            overviewWaveContent.remove();
          }
          tab.append(document.createElement('hr'), createFragmentTable(document, fragmentPath));
        }
      }
      const sectionMetaData = WebImporter.DOMUtils.createTable(metadataCells, document);

      // entire tab is loaded from a fragment?
      if (tabConfig && tabConfig.fragment) {
        const heading = tab.querySelector('h2');
        tab.before(heading);

        const container = document.createElement('div');
        container.append(createFragmentTable(document, tabConfig.fragment));
        container.append(document.createElement('hr'), createFragmentTable(document, fragmentPath));
        container.append(sectionMetaData);

        tab.replaceWith(container);
      } else {
        tab.after(sectionMetaData);
        if (!isOverviewTab) {
          tab.after(document.createElement('hr'), createFragmentTable(document, fragmentPath));
        }
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

const transformImageList = (document) => {
  document.querySelectorAll('.listing-image').forEach((featureList) => {
    const cells = [[featureList.classList.contains('overview-features') ? 'Image List (Features)' : 'Image List']];
    [...featureList.children].forEach((item) => cells.push([...item.children]));
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
    const heading = recentResources.querySelector('.view-header h2');
    recentResources.before(document.createElement('hr'), heading);
    const cells = [['Latest Resources']];
    const carousel = recentResources.querySelector('.container');
    if (carousel) {
      const table = WebImporter.DOMUtils.createTable(cells, document);
      carousel.replaceWith(table);
    }
    if (recentResources.classList.contains('greyBg')) {
      const sectionMetaData = WebImporter.DOMUtils.createTable([['Section Metadata'], ['style', 'Background Grey, Center']], document);
      recentResources.after(sectionMetaData);
    }
  }
};

const transformImageGallery = (document) => {
  const imageGallery = document.querySelector('.images-gallery1, .images-gallery');
  if (imageGallery) {
    // get thumbnails
    const thumbnails = imageGallery.querySelectorAll('.row .fst-set img, .row.snd-set img, .snd-set img');
    // get lightbox images
    const imageContainer = imageGallery.querySelector('.modal .carousel');
    if (imageContainer) {
      const cells = [[imageGallery.classList.contains('images-gallery1') ? 'Image Gallery (showcase right)' : 'Image Gallery']];
      const entries = imageContainer.querySelectorAll('.carousel .item');
      entries.forEach((entry, index) => {
        if (index < thumbnails.length) {
          if (thumbnails[index].src !== entry.querySelector('img').src) {
            entry.append(thumbnails[index]);
          } else {
            thumbnails[index].remove();
          }
        }
        cells.push([[...entry.children].reverse()]);
      });

      const table = WebImporter.DOMUtils.createTable(cells, document);
      imageGallery.replaceWith(table);
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
  document.querySelectorAll('a.gradiantTealreverse, a.gradiantOrangereverse, a.whiteBtn, a.banner_btn.bluebdr-mb, a.banner_btn').forEach((button) => {
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
    th.textContent = table.closest('#Order') ? 'Table (Order)' : 'Table';
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

  document.querySelectorAll('.row [class*="col-"]:first-of-type').forEach((column) => {
    column.id = 'col';
    const row = column.closest('.row:not(#col)');
    if (row) {
      const sectionStyle = row.classList.contains('section') || row.querySelector('table');
      if (row.childElementCount > 1 && !row.closest('section.franklin-horizontal')) {
        if (sectionStyle) {
          row.before(document.createElement('hr'));
          const metaCells = [['Section Metadata'], [['style'], ['Columns 2']]];
          const metaTable = WebImporter.DOMUtils.createTable(metaCells, document);
          row.append(metaTable);
          //row.after(document.createElement('hr'));
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
    const cells = [['Accordion']];

    accordion.querySelectorAll('.faqfield-question').forEach((tab) => {
      const entryWrapper = document.createElement('div');
      entryWrapper.append(tab, tab.nextElementSibling);
      cells.push([entryWrapper]);
    });

    const table = WebImporter.DOMUtils.createTable(cells, document);
    accordion.replaceWith(table);
  });

  document.querySelectorAll('.accordion.patchClamp-accordian').forEach((accordion) => {
    accordion.querySelectorAll('.row').forEach((row) => row.removeAttribute('class'));

    const cells = [['Accordion']];
    if (accordion.querySelector('.sl-number')) {
      cells[0] = ['Accordion (Numbers)'];
      accordion.querySelectorAll('.sl-number').forEach((span) => span.remove());
    }

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

const transformImageLinks = (document) => {
  document.querySelectorAll('a img, a picture').forEach((image) => {
    const link = image.closest('a');
    link.before(image, document.createElement('br'));
    if (link.textContent.trim() === '') {
      link.textContent = link.href;
    }
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

const transformBlogRecentPostsCarousel = (document) => {
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

const transformCustomerBreakthroughCarousel = (document) => {
  document.querySelectorAll('.brk-through-slider').forEach((container) => {
    let style = null;
    if (container.classList.contains('left-breakthrough')) {
      style = 'Green';
    }
    if (container.classList.contains('right-breakthrough')) {
      style = 'Blue';
    }
    const metaDataCells = [['Section Metadata'], ['style', 'Wave, WaveCarousel']];
    if (style) {
      metaDataCells[1] = ['style', `Wave, WaveCarousel, ${style}`];
    }
    const sectionMetaData = WebImporter.DOMUtils.createTable(metaDataCells, document);
    container.before(document.createElement('hr'));
    container.after(sectionMetaData, document.createElement('hr'));

    const cells = [['Carousel (Wave)']];
    if (style) {
      cells[0] = [`Carousel (Wave, ${style})`];
    }
    // convert bg images to img tag
    container.querySelectorAll('.item > div.image-part').forEach((div) => {
      const bgImg = extractBackgroundImage(div);
      if (bgImg) {
        const img = document.createElement('img');
        img.src = bgImg;
        div.append(img);
      }
    });

    container.querySelectorAll('.owl-carousel .item').forEach((item) => {
      cells.push([...item.children]);
    });

    const table = WebImporter.DOMUtils.createTable(cells, document);
    container.replaceWith(table);
  });
};

const transformCustomerBreakthroughShareStory = (document) => {
  document.querySelectorAll('.share-story').forEach((share) => {
    share.after(document.createElement('hr'), createFragmentTable(document, '/fragments/next-big-discovery'));

    const cells = [['Share Story'], [share.querySelector('h3')]];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    share.replaceWith(table);
  });
};

const transformLinkedCardCarousel = (document) => {
  document.querySelectorAll('.products-container-area .owl-carousel').forEach((container) => {
    const parent = container.closest('.products-container-area');
    const cells = [['Carousel (Cards)']];

    container.querySelectorAll('.owl-carousel .item').forEach((item) => {
      const image = item.querySelector('img');

      const content = document.createElement('div');
      content.append(item.querySelector('.pro-details'), item.querySelector('.compare-box a'));

      cells.push([image, content]);
    });

    const table = WebImporter.DOMUtils.createTable(cells, document);
    parent.replaceWith(table);
  });
};

// convert Citations doc styles and remove columns here,
// hence should be called before column transformation
const transformCitations = (document) => {
  if (document.querySelector('.citations')) {
    // unify summary structure
    const summary = document.querySelector('.citations .citation-title-part');
    if (summary) {
      // transform labels
      summary.querySelectorAll('span.brand-blue').forEach((span) => {
        const em = document.createElement('em');
        em.textContent = span.textContent.trim();
        span.replaceWith(em);
      });
      // check for summary parent container on product pages and remove it
      const parentContainer = summary.closest('.views-element-container');
      if (parentContainer) {
        parentContainer.replaceWith(summary);
      }
    }

    document.querySelectorAll('.citations .views-element-container').forEach((citation) => {
      const cells = [['Citations']];
      const linkList = createFragmentList(document, 'Citation', [...citation.querySelectorAll('#citation-accordian .views-row h2, .cell-match-height .citation-tab-list h2')].map((h2) => h2.textContent.trim()));
      cells.push([linkList]);
      const table = WebImporter.DOMUtils.createTable(cells, document);
      citation.replaceWith(table);
    });
  }
};

const transformEventDetails = (document) => {
  if (document.querySelector('body.page-node-type-events')) {
    document.querySelectorAll('.event-block').forEach((div) => div.remove());

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
    const videoContainer = vidyard.closest('.video-container');

    const videoLink = document.createElement('a');
    videoLink.href = `https://share.vidyard.com/watch/${videoId}`;
    if (videoContainer && videoContainer.querySelector('p')) {
      videoLink.append(videoContainer.querySelector('p'));
    } else {
      videoLink.textContent = videoLink.href;
    }

    if (type === 'inline') {
      const videoWrapper = document.createElement('em');
      videoWrapper.append(videoLink);
      vidyard.replaceWith(videoWrapper);
    } else {
      vidyard.replaceWith(videoLink);
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
    transformFeatureSection(div, document);
    transformResourcesCarousel(div, document);
  }
};

const transformProductSpecs = (document) => {
  const div = document.querySelector('div.tab-pane#specs .specsTable');
  if (div && document.originalURL) {
    const filename = document.originalURL.substring(document.originalURL.lastIndexOf('/') + 1);
    const cells = [['Specifications'], [`https://main--moleculardevices--hlxsites.hlx.page/products/specifications/${filename}.json`]];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    div.replaceWith(table);
  }
};

const transformProductOrderOptions = (document) => {
  const div = document.querySelector('div.ordering_wrap');
  if (div && div.textContent.trim().length > 0) {
    const cells = [['Ordering Options']];
    if (document.shopfiyHandler) {
      cells.push([document.shopfiyHandler]);
    }
    const table = WebImporter.DOMUtils.createTable(cells, document);
    div.replaceWith(table);
  }
};

const transformProductRelatedProducts = (document) => {
  const div = document.querySelector('div.cat-related-products');
  if (div && div.textContent.trim().length > 0) {
    const cells = [['Related Products']];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    div.replaceWith(table);
  }
};

const transformProductApplications = (document) => {
  const div = document.querySelector('div.tab-pane#Applications, div.tab-pane#Technology');
  if (div) {
    if (div.textContent.trim()) {
      const heading = div.querySelector('h2');
      div.before(heading);
      const cells = [['Related Applications']];
      const hasTOC = div.querySelector('.view-application-resources');
      if (hasTOC) {
        cells[0] = ['Related Applications (TOC)'];
      }
      const applications = div.querySelectorAll('.view-product-resource-widyard li h2');
      if (applications) {
        const linkList = createFragmentList(
          document,
          'Applications',
          [...applications].map((h2) => h2.textContent.trim()),
        );
        cells.push([linkList]);
      }

      const table = WebImporter.DOMUtils.createTable(cells, document);
      div.replaceWith(table);
    } else {
      div.remove();
    }
  }
};

const transformProductAssayData = (document) => {
  const div = document.querySelector('div.tab-pane#Data');
  if (div) {
    if (div.textContent.trim()) {
      const heading = div.querySelector('h2');
      div.before(heading);
      const cells = [['Related Assay Data']];

      const applications = div.querySelectorAll('.view-product-resource-widyard li h2');
      if (applications) {
        // eslint-disable-next-line max-len
        const linkList = createFragmentList(
          document,
          'Assay Data',
          [...applications].map((h2) => h2.textContent.trim()),
        );
        cells.push([linkList]);
      }

      const table = WebImporter.DOMUtils.createTable(cells, document);
      div.replaceWith(table);
    } else {
      div.remove();
    }
  }
};

const transformResources = (document) => {
  const div = document.querySelector('div.tab-pane#Resources, div.tab-pane#resources');
  if (div) {
    const container = div.querySelector('.tabbingContainer');
    const headline = div.querySelector('h2');
    const cellsResources = [['Resources']];
    const tableResources = WebImporter.DOMUtils.createTable(cellsResources, document);
    container.after(headline, tableResources);

    div.querySelectorAll('.content-section').forEach((child) => child.remove());
  }
};

const transformTechnologyApplications = (document) => {
  document.querySelectorAll('.views-element-container .fortebiocls.view-application-resources, .technology-section.fortebiocls.view-product-resource-widyard')
    .forEach((div) => {
      if (div.childElementCount > 0) {
        div.querySelectorAll('.modal.fade').forEach((modals) => modals.remove());
        const cells = [['Related Applications']];
        const hasTOC = div.closest('.horizontal-list-tab').querySelector('.view-display-id-block_15') || document.querySelector('.technology-section.overview-block');
        if (hasTOC) {
          cells[0] = ['Related Applications (TOC)'];
          hasTOC.remove();
        }
        if (isTechnology(document)) {
          cells[0] = ['Related Applications (TOC)'];
        }
        const applications = div.querySelectorAll('li h2');
        if (applications) {
          const linkList = createFragmentList(
            document,
            'Applications',
            [...applications].map((h2) => h2.textContent.trim()),
          );
          cells.push([linkList]);
        }

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

const transformProductCompareTable = (document) => {
  document.querySelectorAll('#platereadertbllink').forEach((div) => {
    const cells = [['Product Comparsion']];

    // get the products
    const productLinks = [];
    div.querySelectorAll('#productcomparison th .comp-tbl-lbl a').forEach((productLink) => {
      const filename = productLink.href.substring(productLink.href.lastIndexOf('/') + 1);
      const p = document.createElement('p');
      p.append(`https://main--moleculardevices--hlxsites.hlx.page/products/specifications/${filename}.json`);
      productLinks.push(p);
    });
    cells.push(['products', productLinks]);

    // get the attributes to be displayed
    const attributes = [];
    div.querySelectorAll('.fixt-part tr td').forEach((attribute) => {
      const p = document.createElement('p');
      p.append(attribute.innerHTML.replaceAll('<br>', ' '));
      attributes.push(p);
    });
    cells.push(['attributes', attributes]);

    const table = WebImporter.DOMUtils.createTable(cells, document);
    div.replaceWith(table);
    table.before(document.createElement('hr'));
  });
};

const transformProductProvenComplicateFragment = (document) => {
  document.querySelectorAll('.proven-xp-section').forEach((div) => {
    const heading = div.querySelector('h2');
    if (heading && heading.textContent === 'Assure data integrity and compliance with confidence') {
      const fragmentContent = heading.nextElementSibling;
      if (fragmentContent) {
        heading.remove();
        fragmentContent.replaceWith(createFragmentTable(document, 'https://main--moleculardevices--hlxsites.hlx.page/fragments/product-proven-compliance'));
      }
    }
  });
};

const transformCategorySubSections = (document) => {
  document.querySelectorAll('.subcat.category-page-section .container .row').forEach((div) => {
    // move all full with columns before the row
    if (div.firstElementChild.className.indexOf('col-') < 0) {
      div.before(div.firstElementChild);
    }

    // fix c2a buttons in lists
    div.querySelectorAll('a.btn').forEach((link) => {
      const liWrapper = link.closest('li');
      if (liWrapper) {
        const ulWrapper = liWrapper.parentElement;
        if (link.parentElement.nodeName.match('STRONG|EM')) {
          ulWrapper.after(link.parentElement);
        } else {
          ulWrapper.after(link);
        }
      }
    });
    div.querySelectorAll('li').forEach((li) => {
      if (li.textContent.trim().length === 0) {
        li.remove();
      }
    });

    // map columns
    const cells = [['Columns']];
    const children = [...div.children];

    cells.push(children);
  });
};

const transformOtherResourcesList = (document) => {
  document.querySelectorAll('.application-other-resources').forEach((div) => {
    const cells = [['Latest Resources (List)']];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    const container = div.closest('.container');
    if (container) {
      container.replaceWith(table);
    } else {
      div.replaceWith(table);
    }
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
    const cells = [['Application Workflow']];

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

const prepareRequestQuoteLinks = (document) => {
  if (document.pid) {
    document.querySelectorAll('a').forEach((a) => {
      if (a.href && a.href.indexOf('/quote-request') > -1) {
        const urlParams = new URLSearchParams(a.href.substring(14));
        if (urlParams.has('request_type') && urlParams.get('request_type').toLocaleLowerCase() === 'call') {
          urlParams.delete('request_type');
        }
        urlParams.set('pid', document.pid);
        a.href = `/quote-request?${urlParams.toString()}`;
      }
    });
  }
};

function makeAbsoluteLinks(main, url) {
  const HOST = 'https://main--moleculardevices--hlxsites.hlx.page/';
  const pagePath = WebImporter.FileUtils.sanitizePath(
    new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, ''),
  );

  main.querySelectorAll('a').forEach((a) => {
    if (!a.href) {
      a.href = pagePath + a.name;
    }
    if (a.href.startsWith('/')) {
      const ori = a.href;
      const u = new URL(a.href, HOST);

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
      a.href = a.href.replaceAll('http://localhost:3001/', HOST);
      a.textContent = a.textContent.replaceAll('http://localhost:3001/', HOST);
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

      if (href.startsWith('https://www.moleculardevices.com')) {
        a.href = href.substring(32, href.length);
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

    // rewrite picture tags to img only
    document.querySelectorAll('picture').forEach((picture) => {
      const img = picture.querySelector('img');
      if (img) {
        img.srcset = '';
        picture.replaceWith(img);
      }
    });

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
      'style',
      'header',
      'footer',
      'nav#block-mobilenavigation',
      'body > div#mediaGallary', // remove the hero media gallery only
      '.blog-details .hero-desc ul', // blog author & date which we read from meta data
      '.breadcrumb',
      '.skip-link',
      '.cart-store',
      '.procompare',
      '.share-event',
      '.sticky-social-list',
      '.back-labnote',
      '.recent-posts .overview-page',
      '.ins-nav-container',
      '.OneLinkShow_zh',
      '.onetrust-consent-sdk',
      '.drift-frame-chat',
      '.drift-frame-controller',
      '.page-node-type-events .button-wrap .linkBtn.blue', // add to calender button on events
      '.content-section.cover-bg.curv-footer-top-section.white-text.lab-autm-pages',
      'img.new-tag', // to be checked
      '#product-image-modal', // TODO
    ]);

    // create the metadata block and append it to the main element
    document.originalURL = params.originalURL;
    const meta = createMetadata(url, document);
    loadResourceMetaAttributes(url, params, document, meta);

    const block = WebImporter.Blocks.getMetadataBlock(document, meta);
    main.append(block);

    // convert all blocks
    [
      cleanUp,
      prepareRequestQuoteLinks,
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
      transformImageList,
      transformBlogRecentPostsCarousel,
      transformImageCaption,
      transformListCaption,
      transformCustomerBreakthroughShareStory,
      transformCustomerBreakthroughCarousel,
      transformTabsNav,
      transformTabsSections,
      transformProductOverview,
      transformProductSpecs,
      transformProductOptions,
      transformProductOrderOptions,
      transformProductRelatedProducts,
      transformProductApplications,
      transformProductAssayData,
      transformProductCompareTable,
      transformProductProvenComplicateFragment,
      transformCategorySubSections,
      transformOtherResourcesList,
      transformFeaturedResources,
      transformTechnologyApplications,
      transformLinkedCardCarousel,
      transformResources,
      transformColumns,
      transformImageLinks,
    ].forEach((f) => f.call(null, document));

    makeAbsoluteLinks(document, url);

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
