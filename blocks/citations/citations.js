import { decorateLinks, fetchFragment } from '../../scripts/scripts.js';
import { div } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture, fetchPlaceholders } from '../../scripts/lib-franklin.js';

let placeholders = {};

function viewLongDescription(citation) {
  const shortDescriptionBlock = citation.querySelector('.citation-short-description');
  const longDescriptionBlock = citation.querySelector('.citation-long-description');
  shortDescriptionBlock.style.display = 'none';
  longDescriptionBlock.classList.add('show');
}

function viewShortDescription(citation) {
  const shortDescriptionBlock = citation.querySelector('.citation-short-description');
  const longDescriptionBlock = citation.querySelector('.citation-long-description');
  longDescriptionBlock.classList.remove('show');
  shortDescriptionBlock.style.display = 'block';
}

async function parseCitationFragments(fragmentPaths) {
  const fragments = {};
  await Promise.all(fragmentPaths.map(async (path) => {
    const fragmentHtml = await fetchFragment(path);
    if (fragmentHtml) {
      const fragmentElement = document.createElement('div');
      fragmentElement.innerHTML = fragmentHtml;

      const titleBlock = fragmentElement.querySelector('h2');
      // remove the 'Citations : ' prefix from the title
      if (titleBlock) {
        const link = titleBlock.querySelector('a');
        link.innerText = link.innerText.replace('Citations : ', '');
      }

      const pTags = fragmentElement.querySelectorAll('p');
      const dateBlock = pTags[0];
      const publicationNameBlock = pTags[1];
      const descriptionBlock = pTags[2];
      const contributorsBlock = pTags[3];
      const gotToBlock = pTags[4];

      fragments[path] = {
        dateBlock,
        publicationNameBlock,
        titleBlock,
        descriptionBlock,
        contributorsBlock,
        gotToBlock,
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
    gotToBlock,
  } = fragment;

  // create short description which limits the description to 50 words
  let shortDescriptionBlock = null;
  if (descriptionBlock) {
    const shortDescription = descriptionBlock.innerText.split(' ').slice(0, 40).join(' ');
    shortDescriptionBlock = document.createElement('p');
    // append ... to the end of the short description
    shortDescriptionBlock.innerText = `${shortDescription}...`;
  }

  const viewMoreBlock = div({ class: 'view-change view-more' });
  viewMoreBlock.innerHTML = `
    ${placeholders.viewMore || 'View more'} <i class="fa fa-angle-down" aria-hidden="true"></i>
  `;

  const viewLessBlock = div({ class: 'view-change view-less' });
  viewLessBlock.innerHTML = `
    ${placeholders.viewLess || 'View less'} <i class="fa fa-angle-up" aria-hidden="true"></i>
  `;

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
        publicationNameBlock,
        titleBlock,
      ),
      div(
        { class: 'citation-short-description' },
        shortDescriptionBlock,
        viewMoreBlock,
      ),
      div(
        { class: 'citation-long-description' },
        descriptionBlock || '',
        contributorsBlock || '',
        gotToBlock || '',
        viewLessBlock,
      ),
    ),
  );

  decorateLinks(citation);

  return citation;
}

export default async function decorate(block) {
  const fragmentPaths = [...block.querySelectorAll('a')].map((a) => a.href);
  block.innerHTML = '';
  if (fragmentPaths.length === 0) {
    return '';
  }

  placeholders = await fetchPlaceholders();

  const fragments = await parseCitationFragments(fragmentPaths);

  fragmentPaths.forEach((path) => {
    const fragment = fragments[path];
    if (fragment) {
      block.append(buildCitation(fragment));
    }
  });

  // add listener for when the user clicks on view more
  block.querySelectorAll('.view-more').forEach((viewMoreBlock) => {
    viewMoreBlock.addEventListener('click', () => {
      const citation = viewMoreBlock.closest('.citation');
      viewLongDescription(citation);
    });
  });

  // add listener for when the user clicks on view less
  block.querySelectorAll('.view-less').forEach((viewLessBlock) => {
    viewLessBlock.addEventListener('click', () => {
      const citation = viewLessBlock.closest('.citation');
      viewShortDescription(citation);
    });
  });

  return block;
}
