import {
  decorateLinks, fetchFragment, formatNumberInUs, sortDataByDate,
} from '../../scripts/scripts.js';
import {
  a, div, h3, p, span,
} from '../../scripts/dom-helpers.js';
import {
  createOptimizedPicture, getMetadata, toClassName,
} from '../../scripts/lib-franklin.js';
import ffetch from '../../scripts/ffetch.js';

const lineHeightOfPage = 1.33 * 18;
const truncateLines = 3;
const truncateHeight = Math.floor(lineHeightOfPage * truncateLines) - 3;

function viewLongDescription(citation, toggleButton) {
  const citationDescription = citation.querySelector('.citation-description');
  const maxHeight = Math.floor(citationDescription.scrollHeight);

  if (citationDescription.classList.contains('show-less')) {
    citationDescription.classList.remove('show-less');
    citationDescription.style.maxHeight = `${maxHeight}px`;
    toggleButton.innerHTML = 'View less <i class="fa fa-angle-up" aria-hidden="true"></i>';
  } else {
    citationDescription.style.maxHeight = `${truncateHeight}px`;
    citationDescription.classList.add('show-less');
    toggleButton.innerHTML = 'View more <i class="fa fa-angle-down" aria-hidden="true"></i>';
  }
}

function getParaFromBlock(pTags) {
  const paragraphBlocks = {
    dateBlock: 'Dated',
    publicationNameBlock: 'Publication Name',
    contributorsBlock: 'Contributors',
    goToBlock: 'Go to article',
  };

  const result = { descriptionBlock: null };

  pTags.forEach((pTag) => {
    const textContent = pTag.textContent.trim();
    if (pTag.firstChild.tagName === 'BR') {
      pTag.firstChild.remove();
    }

    if (textContent.includes(paragraphBlocks.dateBlock)) {
      result.dateBlock = pTag;
    } else if (textContent.includes(paragraphBlocks.publicationNameBlock)) {
      result.publicationNameBlock = pTag;
    } else if (textContent.includes(paragraphBlocks.contributorsBlock)) {
      result.contributorsBlock = pTag;
    } else if (textContent.includes(paragraphBlocks.goToBlock)) {
      result.goToBlock = pTag;
    } else {
      result.descriptionBlock = pTag;
    }
  });

  return result;
}

async function parseCitationFragments(fragmentPaths) {
  const fragments = {};
  await Promise.all(fragmentPaths.map(async (path) => {
    const fragmentHtml = await fetchFragment(path);
    if (fragmentHtml) {
      const fragmentElement = div();
      fragmentElement.innerHTML = fragmentHtml;

      const titleBlock = fragmentElement.querySelector('h2');
      // remove the 'Citations : ' prefix from the title
      if (titleBlock) {
        const link = titleBlock.querySelector('a');
        link.innerText = link.innerText.replace('Citations : ', '');
      }

      const pTags = fragmentElement.querySelectorAll('p');
      const {
        dateBlock, publicationNameBlock, contributorsBlock, goToBlock, descriptionBlock,
      } = getParaFromBlock(pTags);

      fragments[path] = {
        dateBlock,
        publicationNameBlock,
        titleBlock,
        descriptionBlock,
        contributorsBlock,
        goToBlock,
      };
    }
  }));

  return fragments;
}

function buildCitation(fragment) {
  const {
    dateBlock,
    publicationNameBlock,
    titleBlock,
    descriptionBlock,
    contributorsBlock,
    goToBlock,
  } = fragment;

  // create short description which limits the description to 50 words
  let shortDescriptionBlock = null;
  if (descriptionBlock) {
    const shortDescription = descriptionBlock.innerText.split(' ').slice(0, 40).join(' ');
    shortDescriptionBlock = p();
    shortDescriptionBlock.innerText = `${shortDescription}...`;
  }

  const toggleButton = div({ class: 'view-change view-less' });
  toggleButton.innerHTML = 'View more <i class="fa fa-angle-down" aria-hidden="true"></i>';

  const citation = div(
    { class: 'citation' },
    div(
      { class: 'citation-icon' },
      createOptimizedPicture('/images/resource-icons/citation.png', 'citation icon'),
    ),
    div(
      { class: 'citation-info' },
      div(
        { class: 'citation-header' },
        dateBlock,
        publicationNameBlock || '',
        titleBlock,
      ),
      div(
        {
          class: ['citation-description', 'show-less'],
          style: `max-height: ${truncateHeight}px`,
        },
        descriptionBlock || '',
        contributorsBlock || '',
        goToBlock || '',
      ),
      div(
        { class: 'citation-footer' },
        toggleButton,
      ),
    ),
  );

  decorateLinks(citation);

  return citation;
}

function citationDetails(count, gatedUrl) {
  const sourceUrl = 'https://scholar.google.com/';
  const headingText = `Number of Citations*: ${formatNumberInUs(count)}`;

  const header = div({ class: 'default-content-wrapper' },
    h3({ id: toClassName(headingText) }, headingText),
    p(
      span('Latest Citations: '),
      'For a complete list, please ',
      a({
        href: gatedUrl,
      }, 'Click here'),
    ),
    p(
      span('*Source: '),
      a({
        href: sourceUrl,
      }, sourceUrl),
    ),
  );

  decorateLinks(header);
  return header;
}

async function getResourcesFromMetaTags(heading, identifier) {
  const fragmentCitations = await ffetch('/fragments/query-index.json')
    .sheet('citations')
    .filter((citation) => citation.relatedProducts && citation.relatedProducts !== '0'
      && (
        citation.relatedProducts.indexOf(identifier || heading) > -1
        || heading.includes(citation.relatedProducts)
      ))
    .all();

  return sortDataByDate(fragmentCitations);
}

export default async function decorate(block) {
  let heading = document.querySelector('.hero .container h1, .hero-advanced .container h1').textContent;
  if (heading.indexOf('Citations') > -1) {
    heading = heading.replace('Citations: ', '');
    heading = heading.replace('Citations : ', '');
  }

  const identifier = getMetadata('identifier');
  const resources = await getResourcesFromMetaTags(heading, identifier);
  const fragmentPaths = resources.map((resource) => resource.path);
  const fragments = await parseCitationFragments(fragmentPaths);

  // fetch citation details
  const resourceCitations = await ffetch('/resources/citations/query-index.json')
    .filter((citation) => (citation.identifier !== '0' && heading.includes(citation.identifier))
      || heading.includes(citation.title))
    .all();

  if (resourceCitations && resourceCitations.length > 0) {
    resourceCitations.forEach((citation) => {
      block.parentElement.parentElement.prepend(citationDetails(citation.count, citation.gatedUrl));
    });
  }

  block.innerHTML = '';
  if (fragmentPaths.length === 0) {
    return '';
  }

  fragmentPaths.forEach((path) => {
    const fragment = fragments[path];
    if (fragment) {
      block.append(buildCitation(fragment));
    }
  });

  // add listener for when the user clicks on view more
  block.querySelectorAll('.view-change').forEach((viewChangeBlock) => {
    viewChangeBlock.addEventListener('click', () => {
      const citation = viewChangeBlock.closest('.citation');
      viewLongDescription(citation, viewChangeBlock);
    });
  });

  return block;
}
