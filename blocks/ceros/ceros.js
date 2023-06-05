import { button, div, span } from "../../scripts/dom-helpers.js";
import { decorateIcons } from "../../scripts/lib-franklin.js";
import { embedCerosFrame } from "../embed/embed.js";

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

export default function decorate(block) {
  const cerosUrl = block.querySelector('a');
  const cerosPoster = block.querySelector('picture');
  cerosUrl.parentElement.parentElement.removeChild(cerosUrl.parentElement);
  const cerosTitle = block.querySelector('p');
  block.innerHTML = '';

  block.parentElement.appendChild(cerosTitle);
  block.appendChild(cerosPoster);

  const cerosModal = (
    div({ class: 'ceros-modal', onclick: () => closeCerosModal(block) },
      div({ class: 'ceros-modal-content' },
        button({ class: 'close', 'aria-label': 'Close', onclick: () => closeCerosModal(block) },
          span({ class: 'icon icon-close-circle-outline' }),
        ),
      ),
    )
  );
  block.appendChild(cerosModal);

  block.appendChild(
    button({class: 'primary open', onclick: () => openCerosModal(block, cerosUrl) }, 
      'Click to View Demo',
    ),
  );

  decorateIcons(block);
}