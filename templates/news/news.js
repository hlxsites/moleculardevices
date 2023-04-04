import { formatDate } from '../../scripts/scripts.js';

import {
  getMetadata, buildBlock,
} from '../../scripts/lib-franklin.js';

function decorateTitle(parentElem, titleElem) {
  titleElem.classList.add('event-title');
  if (titleElem) {
    parentElem.append(titleElem);
  }
}

function decorateCite(parentElem) {
  const dt = getMetadata('publication-date');
  if (dt) {
    const cite = document.createElement('cite');
    cite.classList.add('event-date');
    cite.innerHTML = formatDate(dt);
    parentElem.append(cite);
  }
}

function decorateStrong(elems) {
  elems.forEach((elem) => {
    const parent = elem.parentElement;
    if (parent.children.length === 1) {
      parent.classList.add('text-strong');
    }
  });
}

function decorateCaption(elems) {
  elems.forEach((elem) => {
    const parent = elem.parentElement;
    const next = parent.nextElementSibling;
    if (parent && next && next.querySelector('p > em')) {
      next.classList.add('text-caption');
    }
  });
}

function decorateReadMore(linkElem) {
  if (linkElem) {
    linkElem.classList.add('ext');
    linkElem.setAttribute('target', '_blank');
    linkElem.setAttribute('rel', 'noopener noreferrer');

    const extLinkBtn = document.createElement('i');
    extLinkBtn.classList.add('fa', 'fa-external-link');
    extLinkBtn.setAttribute('aria-hidden', 'true');

    linkElem.append(extLinkBtn);
  }
}

export function decorateAutoBlock(content) {
  if (!content) {
    return;
  }

  const contentWrapper = document.createElement('span');
  contentWrapper.classList.add('event-container');

  decorateTitle(contentWrapper, content.querySelector('h1'));
  decorateCite(contentWrapper);

  const hasLeftCol = content.querySelector('p:first-child picture');
  const pic = document.createElement('div');
  if (hasLeftCol) {
    pic.classList.add('left-col');
    contentWrapper.append(pic);
  }

  const txt = document.createElement('div');
  txt.classList.add('right-col');

  let isInleftCol = hasLeftCol;
  [...content.children].forEach((child) => {
    if (isInleftCol && child.matches('p') && child.querySelector('picture')) {
      pic.append(child);
    } else if (!child.matches('h1') && !child.matches('cite')) {
      isInleftCol = false;
      txt.append(child);
    }
  });

  contentWrapper.append(txt);
  content.append(contentWrapper);

  decorateStrong(contentWrapper.querySelectorAll('.right-col p > strong'));
  decorateCaption(contentWrapper.querySelectorAll('.left-col p > picture'));
  decorateCaption(contentWrapper.querySelectorAll('.right-col p > picture'));

  decorateReadMore(contentWrapper.querySelector('p:last-child a'));
}

export default function buildAutoBlocks() {
  const container = document.querySelector('main div');
  decorateAutoBlock(container);
  container.append(buildBlock('social-share', '<p>Share this news</p>'));
}
