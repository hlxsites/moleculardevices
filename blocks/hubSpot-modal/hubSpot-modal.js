import { div, button, iframe } from '../../scripts/dom-helpers.js';

function openModal(block) {
  const modal = document.getElementById('my-modal');
  const link = block.querySelector('a');
  const iframeSrc = link.href;

  // Prevent the link from opening
  link.addEventListener('click', (event) => {
    event.preventDefault();
  });

  const modalContent = modal.querySelector('.modal-content');
  modalContent.innerHTML = '';
  modalContent.appendChild(iframe({ src: iframeSrc }));

  modal.classList.add('open');
}

function closeModal() {
  const modal = document.getElementById('my-modal');
  modal.classList.remove('open');
}

export default function decorate(block) {
  // Add a CSS class to the block element for styling
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

  // Append the modal to the document body
  document.body.appendChild(modal);

  // Add event listener to open the modal
  block.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
      event.preventDefault(); // Prevent the link from opening in a new tab
    }
    openModal(block);
  });

  // Add event listener to close the modal when clicking the backdrop
  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target === closeButtonImage) {
      closeModal();
    }
  });
}
