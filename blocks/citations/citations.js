import { fetchFragment } from '../../scripts/scripts.js';
import { div, img } from '../../scripts/dom-helpers.js';

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

      // TODO: replace by h2 when import fixed
      const titleBlock = fragmentElement.querySelector('h3');
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
    const shortDescription = descriptionBlock.innerText.split(' ').slice(0, 50).join(' ');
    shortDescriptionBlock = document.createElement('p');
    // append ... to the end of the short description
    shortDescriptionBlock.innerText = `${shortDescription}...`;
  }

  const viewMoreBlock = div({ class: 'view-change view-more' });
  viewMoreBlock.innerHTML = `
    <a href="javascript:void(0)">View more <i class="fa fa-angle-down" aria-hidden="true"></i></a>
  `;

  const viewLessBlock = div({ class: 'view-change view-less' });
  viewLessBlock.innerHTML = `
    <a href="javascript:void(0)">View less <i class="fa fa-angle-up" aria-hidden="true"></i></a>
  `;

  // add external link icons
  const goToBlockATag = gotToBlock.querySelector('a');
  goToBlockATag.innerHTML += ' <i class="fa fa-external-link" aria-hidden="true"></i>';

  const titleBlockATag = titleBlock.querySelector('a');
  titleBlockATag.innerHTML += ' <i class="fa fa-external-link" aria-hidden="true"></i>';

  const citation = div(
    { class: 'citation' },
    div(
      { class: 'citation-icon' },
      img({ src: '/images/citation.png' }),
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
        descriptionBlock,
        contributorsBlock,
        gotToBlock,
        viewLessBlock,
      ),
    ),
  );

  return citation;
}

export default async function decorate(block) {
  const fragmentPaths = [...block.querySelectorAll('a')].map((a) => a.href);
  block.innerHTML = '';
  if (fragmentPaths.length === 0) {
    return '';
  }

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
