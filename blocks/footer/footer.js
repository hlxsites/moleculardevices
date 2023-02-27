import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';

function switchGroup(selectionTitle, position) {
  let i;
  let div;
  // Set active and inactive selection title
  for (i = 0; i < selectionTitle.parentElement.children.length; i+1) {
    div = selectionTitle.parentElement.children[i];
    div.classList.remove('on');
    div.classList.add('off');
  }    
  selectionTitle.classList.add('on');
  selectionTitle.classList.remove('off');
  // Set active and inactive content div
  let blockDiv = selectionTitle.parentElement.parentElement.parentElement;
  for (i = 1; i < blockDiv.children.length; i++) {
    div = blockDiv.children[i];
    div.classList.add('off');
    div.classList.remove('on');
  }
  blockDiv.children[position].classList.add('on');
  blockDiv.children[position].classList.remove('off');
}

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});
  const html = await resp.text();
  const footer = document.createElement('div');
  footer.innerHTML = html;

  const selectionDiv = footer.querySelector('div:nth-of-type(2)');

  const newsTitle = selectionDiv.querySelector('h3:nth-of-type(1)');
  newsTitle.innerHTML = '<a>' + newsTitle.textContent + '</a>';
  newsTitle.querySelector('a').addEventListener('click', function() {
      switchGroup(newsTitle, 1);
  }, false);

  const eventsTitle = selectionDiv.querySelector('h3:nth-of-type(2)');
  eventsTitle.innerHTML = '<a>' + eventsTitle.textContent + '</a>';
  eventsTitle.querySelector('a').addEventListener('click', function() {
      switchGroup(eventsTitle, 2);
  }, false);

  let blockDiv = newsTitle.parentElement.parentElement.parentElement;
  let i;
  for (i = 1; i < blockDiv.children.length; i+1) {
    let div = blockDiv.children[i];
    let pars = div.querySelectorAll('p');
    pars.item(pars.length - 1).innerHTML 
        += "<span class='icon-icon_link'></span>";
  }

  await decorateIcons(footer);
  block.append(footer);
}