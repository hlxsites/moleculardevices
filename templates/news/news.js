import { formatDate } from '../../scripts/scripts.js';

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

function styleCaption(elems) {
  elems.forEach((elem) => {
    const parent = elem.parentElement;
    const next = parent.nextElementSibling;
    if (parent && next && next.querySelector('p > em')) {
      next.classList.add('text-caption');
    }
  });
}

export function decorateAutoBlock(content) {
  if (!content) {
    return;
  }

  const dt = getPublicationDateFromMetaData();
  if (dt) {
    const cite = document.createElement('cite');
    cite.innerHTML = dt;
    content.append(cite);
  }

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

  styleCaption(content.querySelectorAll('.left-col p > picture'));
  styleCaption(content.querySelectorAll('.right-col p > picture'));
}

export default function buildAutoBlocks() {
  const content = document.querySelector('main .section > .default-content-wrapper');
  decorateAutoBlock(content);
}
