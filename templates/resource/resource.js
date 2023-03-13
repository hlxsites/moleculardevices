function styleCaption(elems) {
  elems.forEach((elem) => {
    const checkEm = elem.parentElement.nextElementSibling.querySelector('p > em');
    if (checkEm) {
      const ems = checkEm.parentElement.children;
      [...ems].forEach((em) => {
        em.classList.add('text-caption');
      });
    }
  });
}

function decorateNews(content) {
  if (!content) {
    return;
  }
  const row = document.createElement('div');
  row.classList.add('content-wrapper');

  const pic = document.createElement('div');
  pic.classList.add('picture-wrapper');

  const txt = document.createElement('div');
  txt.classList.add('text-wrapper');

  row.append(pic);
  row.append(txt);
  content.append(row);

  [...content.children].forEach((child) => {
    if (child.matches('p:has(picture)')) {
      pic.append(child);
    } else if (child.matches('p')) {
      txt.append(child);
    }
  });
}

export default function buildAutoBlocks() {
  const main = document.querySelector('.hero-container');
  if (main) {
    styleCaption(main.querySelectorAll('p > picture'));
    styleCaption(main.querySelectorAll('div.table'));
  }

  const content = document.querySelector('.section > .default-content-wrapper');
  decorateNews(content);
}
