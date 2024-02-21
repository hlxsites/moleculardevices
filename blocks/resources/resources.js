import {
  createOptimizedPicture, decorateBlock, decorateIcons,
  fetchPlaceholders, getMetadata, loadBlock, loadCSS,
} from '../../scripts/lib-franklin.js';
import {
  loadScript, embedVideo, fetchFragment, isGatedResource, summariseDescription,
} from '../../scripts/scripts.js';
import { getCoveoToken, searchMainSection } from '../coveo-search/coveo-search.js';
import {
  div, a, p, h3, i, h2, span, ul, li,
} from '../../scripts/dom-helpers.js';
import ffetch from '../../scripts/ffetch.js';
import resourceMapping from './resource-mapping.js';

const relatedResourcesHeaders = {
  Product: 'relatedProducts',
  Technology: 'relatedTechnologies',
  Application: 'relatedApplications',
};
const videoResourceTypes = ['Videos and Webinars', 'Interactive Demo'];
const excludedResourcesProducts = ['Citation', 'COA', ...videoResourceTypes];
const excludedResourcesApplications = ['COA', ...videoResourceTypes];

function handleFilterClick(e) {
  e.preventDefault();
  const { target } = e;
  const targetFilter = target.closest('li.filter');

  // toggle filters dropdown on mobile
  const targetFilters = target.closest('.filters');
  targetFilters.classList.toggle('dropdown');

  const selected = targetFilter.getAttribute('aria-selected') === 'true';
  if (!selected) {
    const resourceType = targetFilter.getAttribute('aria-labelledby');
    const allFilters = document.querySelectorAll('.filter');
    allFilters.forEach((item) => item.setAttribute('aria-selected', false));
    targetFilter.setAttribute('aria-selected', true);
    if (resourceType === 'View All') {
      const filteredResources = document.querySelectorAll('.filtered-item');
      filteredResources.forEach((item) => item.setAttribute('aria-hidden', false));
    } else {
      // hide all displayed items
      const filteredResources = document.querySelectorAll('.filtered-item');
      filteredResources.forEach((item) => item.setAttribute('aria-hidden', true));
      // show filtered items
      const selectedResources = document.querySelectorAll(`.filtered-item[aria-labelledby="${resourceType}"]`);
      selectedResources.forEach((item) => item.setAttribute('aria-hidden', false));
    }
  }
}

export async function decorateResources(block) {
  const template = getMetadata('template');
  const identifier = getMetadata('identifier') || document.querySelector('.hero .container h1, .hero-advanced .container h1').textContent;

  const includedResourceTypes = Object.keys(resourceMapping);
  const relatedResource = relatedResourcesHeaders[template] || 'relatedProducts';

  const resources = await ffetch('/query-index.json')
    .sheet('resources')
    .filter((resource) => resource[relatedResource].includes(identifier)
      && includedResourceTypes.includes(resource.type))
    .all();
  const excludedResources = template === 'Application' ? excludedResourcesApplications : excludedResourcesProducts;
  const otherResources = resources.filter((item) => !excludedResources.includes(item.type));
  const videoResources = resources.filter((item) => videoResourceTypes.includes(item.type));

  const filtersBlock = ul({ class: 'filters' });
  const filters = [...new Set(otherResources.map((item) => item.type))];
  if (videoResources.length > 0) {
    filters.push('Videos and Webinars');
  }
  const sortedFilters = filters.sort((x, y) => (x.toLowerCase() < y.toLowerCase() ? -1 : 1));
  sortedFilters.unshift('View All');

  const placeholders = await fetchPlaceholders();
  const displayFilters = {};
  displayFilters['View All'] = placeholders.viewAll || 'View All';
  displayFilters['Videos and Webinars'] = placeholders.videosAndWebinars || 'Videos and Webinars';

  const otherResourcesBlock = div({ class: 'resources-section' });
  otherResources.forEach((item) => {
    const resourceType = item.type;
    const resourceDisplayType = item.displayType;
    const resourceImage = resourceMapping[item.type]?.image;
    const resourceLink = isGatedResource(item) ? item.gatedURL : item.path;
    displayFilters[resourceType] = resourceDisplayType;

    const resourceBlock = div(
      {
        class: 'resource filtered-item',
        'aria-hidden': false,
        'aria-labelledby': resourceType,
      },
      div(
        { class: 'resource-icon' },
        createOptimizedPicture(
          `/images/resource-icons/${resourceImage}.png`,
          resourceImage,
          false,
          [{ media: '(max-width: 991px)', width: '35' }, { width: '60' }],
        ),
      ),
      div(
        { class: 'resource-info' },
        div(
          { class: 'resource-header' },
          p(item.displayType),
          h3(item.title),
        ),
        div(
          { class: 'resource-description' },
          item.description && item.description !== '0' ? summariseDescription(item.description, 230) : '',
        ),
        div(
          { class: 'resource-actions' },
          p(
            { class: 'resource-link' },
            a(
              { href: resourceLink },
              placeholders[resourceMapping[resourceType]?.action] || 'View Resource',
              i({ class: 'fa fa-chevron-circle-right' }),
            ),
          ),
        ),
      ),
    );
    otherResourcesBlock.append(resourceBlock);
  });

  let videoResourcesBlock = null;
  if (videoResources.length > 0) {
    videoResourcesBlock = div({
      class: 'videos-container filtered-item',
      'aria-hidden': false,
      'aria-labelledby': 'Videos and Webinars',
    });

    const videosContainerBlock = div({ class: 'resources-section' });
    await Promise.all(videoResources.map(async (item) => {
      displayFilters[item.type] = item.displayType;
      // eslint-disable-next-line no-nested-ternary
      const imageSrc = item.thumbnail && item.thumbnail !== '0'
        ? item.thumbnail
        : (item.image && item.image !== '0'
          ? item.image : '/images/default-card-thumbnail.webp');
      if (isGatedResource(item)) {
        const videoWrapper = div({ class: 'video-wrapper' },
          div({ class: 'video-container' },
            div({ class: 'vidyard-video-placeholder' },
              createOptimizedPicture(imageSrc),
              a({ href: item.gatedURL, target: '_blank' },
                div({ class: 'play-button' },
                  div({ class: 'play-button-size' }),
                  div({ class: 'arrow-size' },
                    div({ class: 'arrow-size-ratio' }),
                    div({ class: 'arrow' }),
                  ),
                ),
              ),
            ),
          ),
          p({ class: 'video-title' }, item.title),
        );
        videosContainerBlock.append(videoWrapper);
      } else {
        const videoFragmentHtml = await fetchFragment(item.path);
        const videoFragment = document.createElement('div');
        videoFragment.innerHTML = videoFragmentHtml;
        const videoElement = videoFragment.querySelector('a[href^="https://share.vidyard.com/watch/"], a[href^="https://view.ceros.com/molecular-devices/"]');
        const videoHref = videoElement?.href;
        if (videoElement && videoHref && videoHref.startsWith('https://')) {
          const videoURL = new URL(videoHref);
          const videoWrapper = div({ class: 'video-wrapper' },
            div({ class: 'video-container' }),
            p({ class: 'video-title' }, item.title),
          );
          const videoContainer = videoWrapper.querySelector('.video-container');
          const videoLinkElement = a({ href: videoHref }, videoHref);
          if (item.type === 'Interactive Demo') {
            videoContainer.append(
              div({ class: 'ceros' },
                createOptimizedPicture(imageSrc),
                videoLinkElement,
              ),
            );
            const cerosBlock = videoContainer.querySelector('.ceros');
            decorateBlock(cerosBlock);
            await loadBlock(cerosBlock);
          } else {
            videoContainer.append(videoLinkElement);
            embedVideo(videoWrapper.querySelector('a'), videoURL, 'lightbox');
          }
          videosContainerBlock.append(videoWrapper);
        }
      }
    }));

    videoResourcesBlock.append(h2({ class: 'video-resources-title' }, displayFilters['Videos and Webinars'] || 'Videos and Webinars'));
    videoResourcesBlock.append(videosContainerBlock);
  }

  sortedFilters.forEach((filter, idx) => {
    filtersBlock.append(
      li({
        class: 'filter',
        'aria-labelledby': filter,
        'aria-selected': idx === 0,
        onclick: handleFilterClick,
      }, span({ class: 'filter-divider' }, idx === 0 ? '' : '|'), a({
        href: '#',
      }, displayFilters[filter] || filter), span({ class: 'icon icon-chevron-right-outline' }),
      ),
    );
  });
  if (window.matchMedia('only screen and (max-width: 767px)').matches) {
    decorateIcons(filtersBlock);
  }

  block.append(filtersBlock);
  block.append(otherResourcesBlock);
  if (videoResourcesBlock) {
    block.append(videoResourcesBlock);
  }

  return block;
}

function searchFormHeader() {
  return `
    <div id="search" class="CoveoSearchInterface mdcoveo" data-enable-history="true" data-excerpt-length="350">
      <div class="section cover-banner-wrapper no-padding-top">
        <div class="cover-banner">
          <div class="not-fixed-search">
            <div class="coveo-search-section">
              <div class="CoveoSearchbox coveo-search-box" data-enable-omnibox="true" data-enable-search-as-you-type="true" data-number-of-suggestions="5" data-partial-match-keywords="" data-enable-partial-match="true" data-inline="true" data-placeholder="" data-enable-query-suggest-addon="true"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="CoveoFolding"></div>
      <div class="CoveoAnalytics"></div>
    </div>
  `;
}

export default async function decorate(block) {
  const pageType = getMetadata('template');

  if (pageType === 'Product') {
    block.innerHTML = searchFormHeader();
    const cRange = document.createRange();
    /* eslint-disable no-new */
    new Promise(() => {
      block.children[0].children[0].appendChild(
        cRange.createContextualFragment(searchMainSection()),
      );
      loadCSS('/blocks/coveo-search/coveo-search.css');
      loadCSS('https://static.cloud.coveo.com/searchui/v2.10114/css/CoveoFullSearch.min.css');
    });
    loadScript('https://static.cloud.coveo.com/searchui/v2.10114/js/CoveoJsSearch.Lazy.min.js', null, null, true);
    loadScript('https://static.cloud.coveo.com/searchui/v2.10114/js/templates/templates.js', null, null, true);
    setTimeout(getCoveoToken, 300);
  } else {
    console.log('START');
    await decorateResources(block);
    console.log('END');
  }
}
