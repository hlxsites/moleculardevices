import { loadCSS } from '../../scripts/lib-franklin.js';
import { getCookie, loadScript } from '../../scripts/scripts.js';

const organizationId = 'moleculardevicesproductionca45f5xc';
const coveoToken = 'xxd4878081-5099-4f8c-98a1-6ed5c5399e12';

function getCategoriesBasedOnProfile(userProfile) {
  const CUSTOMER_ACCESS_LEVEL_CATEGORY = 'Customer';
  const DISTRIBUTOR_ACCESS_LEVEL_CATEGORY = 'Distributor';
  const SYSTEM_INTEGRATOR_ACCESS_LEVEL_CATEGORY = 'System_Integrator';
  const MOLDEV_SALES_ACCESS_LEVEL_CATEGORY = 'MolDev_Empl_Sales';
  const MOLDEV_TECH_ACCESS_LEVEL_CATEGORY = 'MolDev_Empl_Tech';
  let categoryAccessLevel;

  switch (userProfile) {
    case 'ADMIN':
      categoryAccessLevel = '';
      break;
    case 'DISTRIBUTOR':
      categoryAccessLevel = `(${CUSTOMER_ACCESS_LEVEL_CATEGORY},${DISTRIBUTOR_ACCESS_LEVEL_CATEGORY})`;
      break;
    case 'INTEGRATOR':
      categoryAccessLevel = `(${CUSTOMER_ACCESS_LEVEL_CATEGORY},${SYSTEM_INTEGRATOR_ACCESS_LEVEL_CATEGORY})`;
      break;
    case 'SALES':
      categoryAccessLevel = `(${CUSTOMER_ACCESS_LEVEL_CATEGORY},${DISTRIBUTOR_ACCESS_LEVEL_CATEGORY},${SYSTEM_INTEGRATOR_ACCESS_LEVEL_CATEGORY},${MOLDEV_SALES_ACCESS_LEVEL_CATEGORY})`;
      break;
    case 'TECH':
      categoryAccessLevel = `(${CUSTOMER_ACCESS_LEVEL_CATEGORY},${DISTRIBUTOR_ACCESS_LEVEL_CATEGORY},${SYSTEM_INTEGRATOR_ACCESS_LEVEL_CATEGORY},${MOLDEV_SALES_ACCESS_LEVEL_CATEGORY},${MOLDEV_TECH_ACCESS_LEVEL_CATEGORY})`;
      break;

    default:
      categoryAccessLevel = CUSTOMER_ACCESS_LEVEL_CATEGORY;
  }
  return categoryAccessLevel;
}

function getUserProfile() {
  return (getCookie('STYXKEY_PortalUserRole')) ? getCookie('STYXKEY_PortalUserRole') : '';
}

function getFilter() {
  const userProfile = getUserProfile();
  const accessLevel = getCategoriesBasedOnProfile(userProfile);

  return userProfile === 'ADMIN'
    ? ''
    : ` AND NOT @sfkbid OR @sfdatacategoryaccess_level==${accessLevel} OR @sfisvisibleinpkb==true`;
}

function searchFormHeader() {
  return `
          <div id="search" class="CoveoSearchInterface mdcoveo" data-enable-history="true" data-excerpt-length="350">
            <div class="CoveoFolding"></div>
            <div class="CoveoAnalytics" data-endpoint="https://moleculardevicesproductionca45f5xc.analytics.org.coveo.com/rest/ua"></div>
            <div class="section cover-banner-wrapper">
              <div class="cover-banner">
                <div class="cover-banner-content">
                  <h1>Welcome to Resource Hub</h1>
                  <h3>HOW CAN WE HELP YOU TODAY?</h3>
                </div>
                <div class="not-fixed-search">
                  <div class="coveo-search-section">
                    <div class="CoveoSearchbox coveo-search-box" data-enable-omnibox="true" data-enable-search-as-you-type="true" data-number-of-suggestions="5" data-partial-match-keywords="" data-enable-partial-match="true" data-inline="true" data-placeholder="" data-enable-query-suggest-addon="true"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
}

export function searchMainSection() {
  return `
            <div class="section coveo-tab-section-wrapper sticky-element sticky-desktop">
              <div class="coveo-tab-section">
                <a class="CoveoTab coveo-tab" data-id="All" data-caption="All Content" data-expression="@source==&quot;Molecular Devices Franklin&quot; OR @source==&quot;Molecular Devices Support Portal&quot;${getFilter()}"></a>
                <div class="CoveoTab coveo-tab" data-id="Resources" data-caption="Resources" data-expression="@source==&quot;Molecular Devices Franklin&quot; AND @md_pagetype==Resource AND NOT @md_contenttype==CoA AND NOT @md_contenttype==SDS AND NOT @md_contenttype==SDS">
                </div>
                <div class="CoveoTab coveo-tab" data-id="Videos" data-caption="Videos" data-expression="@source==&quot;Molecular Devices Franklin&quot; AND @md_contenttype==&quot;Videos &amp; Webinars&quot;">
                </div>
                <div class="CoveoTab coveo-tab" data-id="KBArticles" data-caption="Knowledge Base" data-expression="@source==&quot;Molecular Devices Support Portal&quot;${getFilter()}"></div>
                <div class="CoveoTab coveo-tab" data-id="CoA" data-caption="CoA" data-expression="@source==&quot;Molecular Devices Franklin&quot; AND @md_contenttype==CoA"></div>
                <div class="CoveoTab coveo-tab" data-id="SDS" data-caption="SDS" data-expression="@source==&quot;Molecular Devices Franklin&quot; AND @md_contenttype==SDS"></div>
              </div>
            </div>
            <div class="section coveo-main-section-wrapper">
              <div class="coveo-main-section">
                <p class='coveoMainTitle coveo-main-title'></p>
                <div class="coveo-facet-column">
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

function coveoSearchInitiation(organizationID) {
  if (typeof Coveo !== 'undefined') {
    /* global Coveo */
    Coveo.SearchEndpoint.configureCloudV2Endpoint(organizationID, coveoToken);
    Coveo.init(document.getElementById('search'), { analytics: { enabled: false } });
  } else {
    // eslint-disable-next-line no-console
    console.error('Coveo library is not available.');
  }
}

export function addCoveoFiles() {
  loadCSS('https://static.cloud.coveo.com/searchui/v2.10114/css/CoveoFullSearch.min.css');
  loadScript('https://static.cloud.coveo.com/searchui/v2.10104/js/CoveoJsSearch.Lazy.min.js', () => {
    loadScript('https://static.cloud.coveo.com/searchui/v2.10104/js/templates/templates.js', () => {
      coveoSearchInitiation(organizationId);
    });
  });
}

export default async function decorate(block) {
  const backgroundImage = block.querySelector('picture');
  block.children[0].innerHTML = searchFormHeader();
  block.children[0].querySelector('.cover-banner-wrapper').prepend(backgroundImage);
  const cRange = document.createRange();
  block.children[0].children[0].appendChild(cRange.createContextualFragment(searchMainSection()));
  addCoveoFiles();
}
