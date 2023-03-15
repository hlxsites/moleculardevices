import { formatDate } from '../../scripts/delayed.js';

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

  const row = document.createElement('div');
  row.classList.add('content-2col');

  const txt = document.createElement('div');
  txt.classList.add('right-col');

  row.append(txt);
  content.append(row);

  const picture = content.querySelector('p').firstElementChild;
  if (picture) {
    console.log(picture);
    picture.parentElement.classList.add('left-col');
  }

  [...content.children].forEach((child) => {
    if (child.matches('p') && child.querySelector('picture')) {
      row.insertBefore(child, txt);
    } else if (child.matches('p')) {
      txt.append(child);
    }
  });
}

export default function buildAutoBlocks() {
  const content = document.querySelector('.section > .default-content-wrapper');
  decorateAutoBlock(content);
}
