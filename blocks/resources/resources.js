import {
  createOptimizedPicture, decorateBlock, decorateIcons,
  fetchPlaceholders, getMetadata, loadBlock, loadCSS,
} from '../../scripts/lib-franklin.js';
import {
  embedVideo, fetchFragment, isGatedResource, itemSearchTitle, summariseDescription,
} from '../../scripts/scripts.js';
import { addCoveoFiles } from '../coveo-search/coveo-search.js';
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
          h3(itemSearchTitle(item)),
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
            <div class="coveo-search-section"></div>
          </div>
        </div>
      </div>
      <div class="CoveoFolding"></div>
      <div class="CoveoAnalytics" data-endpoint="https://moleculardevicesproductionca45f5xc.analytics.org.coveo.com/rest/ua"></div>
    </div>
  `;
}

function searchMainSection() {
  return `
    <div class="section coveo-tab-section-wrapper sticky-element sticky-desktop">
      <div class="coveo-tab-section">
        <div class="CoveoTab coveo-tab" data-id="Resources" data-caption="Resources" data-expression="@source==&quot;Molecular Devices Franklin&quot; AND @md_pagetype==Resource AND NOT @md_contenttype==CoA AND NOT @md_contenttype==SDS AND NOT @md_source==KB"></div>
      </div>
    </div>
    <div class="section coveo-main-section-wrapper">
      <div class="coveo-main-section">
        <p class='coveoMainTitle coveo-main-title'></p>
        <div class="coveo-facet-column">
        <div class="CoveoSearchbox coveo-search-box" data-enable-omnibox="true" data-enable-search-as-you-type="true" data-number-of-suggestions="5" data-partial-match-keywords="" data-enable-partial-match="true" data-inline="true" data-placeholder="" data-enable-query-suggest-addon="true"></div>
          <div class="CoveoDynamicFacet" data-enable-scroll-to-top="false" data-title="Country" data-field="@md_country" data-tab="SDS" data-id="Country" data-number-of-values="" data-enable-facet-search="false"></div>
          <div class="CoveoDynamicHierarchicalFacet coveo-dynamic-hierarchical-facet" data-enable-facet-search="false" data-delimiting-character="|" data-title="Products" data-field="@mdproductsdatacategory" data-tab="Products, All, Resources, KBArticles, Videos" data-number-of-values="8" data-enable-collapse="true" data-enable-scroll-to-top="false" data-filter-facet-count="false"></div>
          <div class="CoveoDynamicHierarchicalFacet coveo-dynamic-hierarchical-facet" data-enable-facet-search="false" data-delimiting-character="|" data-title="Applications" data-field="@mdapplicationsdatacategory" data-tab="Applications, All, Resources, KBArticles, Videos" data-number-of-values="8" data-enable-collapse="true" data-enable-scroll-to-top="false" data-filter-facet-count="false"></div>
          <div class="CoveoDynamicFacet" data-enable-scroll-to-top="false" data-title="Languages" data-field="@md_lang" data-tab="SDS" data-number-of-values="" data-depends-on="Country"></div>
          <div class="CoveoDynamicFacet" data-enable-scroll-to-top="false" data-title="Type" data-field="@objecttype" data-tab="Resources"></div>
          <div class="CoveoDynamicFacet" data-enable-scroll-to-top="false" data-title="Content Type" data-enable-facet-search="false" data-field="@md_contenttype" data-number-of-values="8" data-tab="Resources, All"></div>
          <div class="CoveoDynamicFacet" data-enable-scroll-to-top="false" data-enable-facet-search="false" data-title="Article Type" data-field="@mdarticletypedatacategory" data-number-of-values="8" data-tab="All, SalesforceArticle"></div>
          <div class="CoveoDynamicFacet" data-enable-scroll-to-top="false" data-title="Content Type 2" data-field="@pagetype" data-tab="Resources"></div>

        </div>
        <div class="coveo-results-column">
          <div class="CoveoShareQuery"></div>
          <div class="CoveoPreferencesPanel">
            <div class="CoveoResultsPreferences"></div>
            <div class="CoveoResultsFiltersPreferences"></div>
          </div>
          <div class="CoveoTriggers"></div>
          <div class="CoveoBreadcrumb"></div>
          <div class="CoveoDidYouMean"></div>
          <div class="coveo-results-header">
            <div class="coveo-summary-section">
              <span class="CoveoQuerySummary">
                <div class="coveo-show-if-no-results"></div>
              </span>
              <span class="CoveoQueryDuration"></span>
            </div>
            <div class="coveo-result-layout-section">
              <span class="CoveoResultLayout"></span>
            </div>
            <div class="coveo-sort-section">
              <span class="CoveoSort coveo-sort" data-sort-criteria="relevancy" data-caption="Relevance"></span>
              <span class="CoveoSort coveo-sort" data-sort-criteria="date descending,date ascending" data-caption="Date"></span>
            </div>
          </div>
          <div class="CoveoHiddenQuery"></div>
          <div class="CoveoErrorReport" data-pop-up="false"></div>
          <div class="CoveoResultList coveo-result-list" data-layout="list" data-wait-animation="fade" data-auto-select-fields-to-include="false">
            <script id="SalesforceKnowledgeArticle" class="result-template" type="text/html" data-field-sfknowledgearticleid="">
                  <div class="coveo-result-frame">
                    <div class="coveo-result-cell">
                      <span class="CoveoIcon" data-small="true"></span>
                    </div>
                    <div class="coveo-result-cell">
                      <div class="coveo-result-row">
                        <div class="coveo-result-cell">
                          <a class="CoveoResultLink coveo-result-link"  data-href-template="https://support.moleculardevices.com/s/article/\${raw.sfurlname}" target="_blank"> </a>
                        </div>
                        <div class="coveo-result-cell">
                          <div class="coveo-result-row">
                            <span class="CoveoFieldValue" data-field="@sflastmodifieddate" data-helper="date"></span>
                          </div>
                        </div>
                      </div>
                      <div class="CoveoConditionalRendering" id="ExcerptConditionalRendering">
                  <div class="coveo-result-row">
                  <div class="coveo-result-cell">
                  <span class="CoveoFieldValue" data-helper="shorten" data-helper-options-length="200" data-field="@sfquestion__c" data-html-value="true"></span>
                  <span class="CoveoExcerpt coveo-excerpt"></span>
                  </div>
                  </div>
                  </div>
                      <div class="coveo-result-row">
                        <div class="coveo-result-cell">
                          <span class="CoveoFieldValue" data-field="@sfownername" data-text-caption="Owner"></span>
                          <span class="CoveoFieldValue" data-field="@sfarticletype" data-text-caption="Type"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
              </script>
            <script id="Default" class="result-template" type="text/html" data-layout="list">
              <div class="coveo-result-frame">
                <div class="coveo-result-cell" >
                  <span class="CoveoIcon" data-small="true" data-with-label="false" data-field="@md_img" data-condition-field-not-md_img=""></span>
                  <table class="CoveoFieldTable" data-expanded-title="Type"></table>
                  <span class="CoveoFieldValue product_img product-img" data-field="@md_img" data-helper="image" data-html-value="true"></span>
                </div>
                <div class="coveo-result-cell">
                  <div class="coveo-result-row">
                    <div class="coveo-result-cell" role="heading" aria-level="2">
                      <a class="CoveoResultLink coveo-result-link" target="_blank"><span class="CoveoFieldValue" data-field="@md_title"> <span class="CoveoFieldValue" data-field="@title" data-condition-field-not-md_title=""></span></span></a>
                    </div>
                    <div class="coveo-result-cell">
                      <div class="coveo-result-row">
                        <span class="CoveoFieldValue" data-field="@date" data-helper="date"></span>
                      </div>
                    </div>
                  </div>
                  <div class="coveo-result-row">
                    <div class="coveo-result-cell">
                      <span class="CoveoExcerpt coveo-excerpt"></span>
                    </div>
                  </div>
                  <div class="coveo-result-row">
                    <div class="coveo-result-cell">
                      <span class="CoveoFieldValue" data-field="@md_rfq" data-html-value="true" data-helper="anchor" data-text-caption="" data-helper-options-text="Request Quote"></span>
                    </div>
                  </div>
                  <div class="coveo-result-row">
                  </div>
                  <div class="coveo-result-row">
                    <div class="coveo-result-cell">
                      <div class="CoveoMissingTerms"></div>
                    </div>
                  </div>
                </div>
              </div>
            </script>
          </div>
          <div class="CoveoPager"></div>
          <div class="CoveoResultsPerPage"></div>
        </div>
      </div>
    </div>
  `;
}

export async function initializeCoveo(block) {
  block.classList.add('loading-coveo');
  if (!block.querySelector('#search')) {
    block.innerHTML = searchFormHeader();
    const cRange = document.createRange();
    block.children[0].children[0].appendChild(
      cRange.createContextualFragment(searchMainSection()),
    );
    loadCSS('/blocks/coveo-search/coveo-search.css');
    addCoveoFiles();
  }
}

export async function coveoResources(target) {
  const coveoTabName = 'resources';
  const resourcesBlock = document.getElementsByClassName(coveoTabName)[0];
  const url = new URL(window.location.href);
  const landingPageType = getMetadata('template');

  if (landingPageType === 'Product' || landingPageType === 'Application') {
    if (target.hash.toLowerCase() === `#${coveoTabName}`) {
      const category = encodeURIComponent(getMetadata('category').trim());
      const subCategory = encodeURIComponent(getMetadata('sub-category').trim());
      let searchTitle = encodeURIComponent(getMetadata('search-title').trim());
      if (!searchTitle) {
        searchTitle = encodeURIComponent(getMetadata('og:title').trim());
      }
      let params;
      if (!subCategory) {
        params = `${category},${searchTitle}`;
      } else {
        params = `${category},${subCategory},${searchTitle}`;
      }

      if (landingPageType === 'Product') {
        url.hash = `t=Resources&sort=relevancy&f:@mdproductsdatacategory=[${params}]`;
      }

      if (landingPageType === 'Application') {
        url.hash = `t=Resources&sort=relevancy&f:@mdapplicationsdatacategory=[${params}]`;
      }

      window.history.replaceState(null, null, url);
      await initializeCoveo(resourcesBlock);
      setTimeout(() => {
        resourcesBlock.classList.remove('loading-coveo');
      }, 1000);
    }
  }
}

export default async function decorate(block) {
  const landingPageType = getMetadata('template');

  if (landingPageType === 'Technology') {
    await decorateResources(block);
  }
}
