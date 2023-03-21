import { formatDate } from '../../scripts/scripts.js';

const { buildBlock, decorateBlock, loadBlock } = await import('../../scripts/lib-franklin.js');

function getPublicationDateFromMetaData() {
  let dateStr = '';
  const dtElem = document.querySelector('head meta[name="publication-date"]');
  if (dtElem) {
    if (dtElem.getAttribute('content')) {
      dateStr = formatDate(dtElem.getAttribute('content'));
    }
  }
  return dateStr;
}

function styleCite(parentElem) {
  const dt = getPublicationDateFromMetaData();
  if (dt) {
    const cite = document.createElement('cite');
    cite.innerHTML = dt;
    parentElem.append(cite);
  }
}

function styleStrong(elems) {
  elems.forEach((elem) => {
    const parent = elem.parentElement;
    if (parent.children.length === 1) {
      parent.classList.add('text-strong');
    }
  });
}

function styleCaption(elems) {
  elems.forEach((elem) => {
    const parent = elem.parentElement;
    const next = parent.nextElementSibling;
    if (parent && next && next.querySelector('p > em')) {
      next.classList.add('text-caption');
    }
  });
}

function styleReadMore(linkElem) {
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

function addSocialShare(contentWrapper, content) {
  const socialShare = buildBlock('social-share', content);
  contentWrapper.append(socialShare);
  decorateBlock(socialShare);
  loadBlock(socialShare);
}

export function decorateAutoBlock(content) {
  if (!content) {
    return;
  }

  styleCite(content);

  const contentWrapper = document.createElement('div');
  contentWrapper.classList.add('content-wrapper');

  const hasLeftCol = document.querySelector('main .section > .default-content-wrapper :nth-child(2) picture');
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

  content.append(contentWrapper);
  contentWrapper.append(txt);

  styleStrong(content.querySelectorAll('.right-col p > strong'));
  styleCaption(content.querySelectorAll('.left-col p > picture'));
  styleCaption(content.querySelectorAll('.right-col p > picture'));

  styleReadMore(contentWrapper.querySelector('.button-container a'));

  addSocialShare(content.querySelector('.content-wrapper'), '<p>Share this news</p>');
}

export default function buildAutoBlocks() {
  const content = document.querySelector('main .section > .default-content-wrapper');
  decorateAutoBlock(content);
}
