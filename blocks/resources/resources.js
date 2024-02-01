import { loadCSS } from '../../scripts/lib-franklin.js';
import { loadScript } from '../../scripts/scripts.js';
import { getCoveoToken, searchMainSection } from '../coveo-search/coveo-search.js';

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

export default function decorate(block) {
  block.innerHTML = searchFormHeader();
  const cRange = document.createRange();
  /* eslint-disable no-new */
  new Promise(() => {
    block.children[0].children[0].appendChild(cRange.createContextualFragment(searchMainSection()));
    loadCSS('/blocks/coveo-search/coveo-search.css');
    loadCSS('https://static.cloud.coveo.com/searchui/v2.10104/css/CoveoFullSearch.min.css');
  });
  loadScript('https://static.cloud.coveo.com/searchui/v2.10104/js/CoveoJsSearch.Lazy.min.js', null, null, true);
  loadScript('https://static.cloud.coveo.com/searchui/v2.10104/js/templates/templates.js', null, null, true);
  setTimeout(getCoveoToken, 1000);
}
