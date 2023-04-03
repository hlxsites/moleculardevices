function createVidyardHtml(type, vidId, vidParent) {
  const url = 'https://play.vidyard.com';
  const script = document.createElement('script');
  const prevImage = document.createElement('img');

  script.src = `${url}/embed/v4.js`;
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('async', true);

  prevImage.classList.add('vidyard-player-embed');
  prevImage.src = `${url}/${vidId}.jpg`;
  prevImage.setAttribute('data-uuid', vidId);
  prevImage.setAttribute('data-v', 4);
  prevImage.setAttribute('data-type', type);
  prevImage.style.width = '100%';
  prevImage.style.margin = 'auto';
  prevImage.style.display = 'block';

  vidParent.innerHTML = '';
  vidParent.appendChild(script);
  vidParent.appendChild(prevImage);
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  const defaultUrl = 'https://vids.moleculardevices.com';
  const vidUrl = block.querySelector(`a[href*='${defaultUrl}'`);
  if (vidUrl) {
    const vidParent = vidUrl.closest('div');
    let vidId = vidUrl.href.split('/').pop();
    createVidyardHtml('inline', vidId, vidParent);
  }
}
