import createBreadcrumbs from '../breadcrumbs/breadcrumbs-create.js';

function isVideo(div) {
  const col1 = div.querySelector('div');
  if (col1.textContent === 'video') return true;
  return false;
}

function buildVideo(div){
  const col2 = div.querySelector('div:nth-child(2)');
  const videoCode = col2.textContent;
  // TODO validate video code
  if (col2) div.innerHTML = `<div class='video_icon'><a onclick='fn_vidyard_${videoCode}();'></a></div>`;
}

export default async function decorate(block) {
  const container = document.createElement('div');
  container.classList.add('container');
  if (block.childElementCount > 1) {
    container.classList.add('two-column');
  }

  [...block.children].forEach((div) => {
    if (isVideo(div)) buildVideo(div);
    container.appendChild(div);
  });

  const breadcrumbs = document.createElement('div');
  breadcrumbs.classList.add('breadcrumbs');
  await createBreadcrumbs(breadcrumbs);
  block.appendChild(breadcrumbs);
  block.appendChild(container);

  const picture = block.querySelector('picture');
  block.prepend(picture.parentElement);
}
