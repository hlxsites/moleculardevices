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
  const evnt = document.createElement('div');
  evnt.classList.add('event-wrapper');

  const row = document.createElement('div');
  row.classList.add('content-wrapper');

  const txt = document.createElement('div');
  txt.classList.add('text-wrapper');

  const dt = getPublicationDateFromMetaData();
  if (dt) {
    const cite = document.createElement('cite');
    cite.innerHTML = dt;
    evnt.append(cite);
  }

  [...content.children].forEach((child) => {
    if (child.matches('p') && child.querySelector('picture')) {
      const pic = document.createElement('div');
      pic.classList.add('picture-wrapper');
      pic.append(child);
      row.append(pic);
    } else if (child.matches('p')) {
      txt.append(child);
    }
  });

  row.append(txt);

  content.append(evnt);
  content.append(row);
}

export default function buildAutoBlocks() {
  const content = document.querySelector('.section > .default-content-wrapper');
  decorateAutoBlock(content);
}
