export function decorateAutoBlock(content) {
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
  const content = document.querySelector('.section > .default-content-wrapper');
  decorateAutoBlock(content);
}
