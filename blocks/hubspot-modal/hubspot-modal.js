import { div, button, iframe } from '../../scripts/dom-helpers.js';

function openModal(block) {
  const modal = document.getElementById('my-modal');
  const link = block.querySelector('a');
  const iframeSrc = link.href;

  const modalContent = modal.querySelector('.modal-content');

  // Check if the iframe is already present
  if (!modalContent.querySelector('iframe')) {
    modalContent.appendChild(iframe({ src: iframeSrc }));
  }

  modal.classList.add('open');
}

function closeModal() {
  const modal = document.getElementById('my-modal');
  modal.classList.remove('open');
}

export default function decorate(block) {
  block.classList.add('modal-block');

  // Create the modal element
  const closeButton = button({ class: 'modal-close' });
  const closeButtonImage = document.createElement('img');
  closeButtonImage.src = 'https://www.moleculardevices.com/themes/moldev/images/close2.png';
  closeButtonImage.alt = 'Close';
  closeButton.appendChild(closeButtonImage);

  const modal = div({ id: 'my-modal', class: 'modal' },
    div({ class: 'modal-content' }),
    closeButton,
  );

  document.body.appendChild(modal);

  // Add event listener to open the modal
  block.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
      event.preventDefault(); // Prevent the link from opening in a new tab
    }
    openModal(block);
  });

  // Add event listener to close the modal when clicking the backdrop and close button
  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target === closeButtonImage) {
      closeModal();
    }
  });
}
