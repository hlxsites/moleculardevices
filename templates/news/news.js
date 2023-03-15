function formatDate(dateStr) {
  const parts = dateStr.split('/');
  const date = new Date(parts[2], parts[0] - 1, parts[1]);

  if (date) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  }
  return dateStr;
}

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

  const pic = document.createElement('div');
  pic.classList.add('picture-wrapper');

  const txt = document.createElement('div');
  txt.classList.add('text-wrapper');

  row.append(pic);
  row.append(txt);

  content.append(evnt);
  content.append(row);

  const dt = getPublicationDateFromMetaData();
  if (dt) {
    const cite = document.createElement('cite');
    cite.innerHTML = dt;
    evnt.append(cite);
  }

  [...content.children].forEach((child) => {
    if (child.matches('p') && child.querySelector('picture')) {
      pic.append(child);
    } else if (child.matches('p')) {
      txt.append(child);
    }
  });
}

export default function buildAutoBlocks() {
  const content = document.querySelector('.section > .default-content-wrapper');
  decorateAutoBlock(content);
}
