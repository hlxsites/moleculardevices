/* eslint-disable no-unused-expressions */
import { button, div, span } from '../../scripts/dom-helpers.js';
import { decorateIcons, fetchPlaceholders } from '../../scripts/lib-franklin.js';
import { embedCerosFrame } from '../embed/embed.js';

function openCerosModal(block, cerosUrl) {
  const cerosModal = block.querySelector('.ceros-modal');
  const cerosModalContent = cerosModal.children[0];
  if (!cerosModalContent.querySelector('iframe')) {
    cerosModalContent.appendChild(
      document.createRange().createContextualFragment(embedCerosFrame(cerosUrl)),
    );
  }

  cerosModal.classList.add('open');
}

function closeCerosModal(block) {
  block.querySelector('.ceros-modal').classList.remove('open');
}

export default async function decorate(block) {
  const cerosUrl = block.querySelector('a');
  if (!cerosUrl) return; // no ceros link provided

  const cerosPoster = block.querySelector('picture') ? block.querySelector('picture') : '';

  const cerosTitle = block.querySelector('p:last-of-type');
  block.innerHTML = '';

  cerosPoster
    && cerosTitle
    && !cerosTitle.classList.contains('picture')
    && !cerosTitle.querySelector('a')
    && block.parentElement.appendChild(cerosTitle);

  let buttonClasses = 'primary open';
  if (cerosPoster) {
    buttonClasses += ' ceros-poster-overlay';
  }

  const placeholders = await fetchPlaceholders();

  block.append(
    cerosPoster,
    button({ class: buttonClasses, onclick: () => openCerosModal(block, cerosUrl) },
      !cerosPoster ? cerosUrl.textContent : placeholders.clickToViewDemo || 'Click to View Demo',
    ),
    div({ class: 'ceros-modal', onclick: () => closeCerosModal(block) },
      div({ class: 'ceros-modal-content' },
        button({ class: 'close', 'aria-label': placeholders.close || 'Close', onclick: () => closeCerosModal(block) },
          span({ class: 'icon icon-close-circle-outline' }),
        ),
      ),
    ),
  );

  decorateIcons(block);
}
