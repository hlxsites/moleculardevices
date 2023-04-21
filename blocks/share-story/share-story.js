import {
  div, a, p, ul, li, i, h3, span, button, iframe,
} from '../../scripts/dom-helpers.js';
import { decorateIcons } from '../social-share/social-share.js';

function showSubmitStoryModal(e) {
  e.preventDefault();
  document.getElementById('submit-story-modal').classList.add('show');
  document.getElementById('submit-story-modal-overlay').classList.add('show');
  document.body.classList.add('modal-open');
}

function hideSubmitStoryModal(e) {
  e.preventDefault();
  document.getElementById('submit-story-modal').classList.remove('show');
  document.getElementById('submit-story-modal-overlay').classList.remove('show');
  document.body.classList.remove('modal-open');
}

export default function decorate(block) {
  const shareMessage = block.querySelector('h3').textContent;
  block.innerHTML = '';

  const socials = ['facebook', 'linkedin', 'twitter'];

  const shareSocialBlock = div({ class: 'share-event' },
    p('share this story'),
    div({ class: 'social-links' },
      ul({ class: 'button-container' },
        ...socials.map((social) =>
        // eslint-disable-next-line implicit-arrow-linebreak
          li({ class: `share-${social}`, 'data-type': social },
            i({ class: `fa fa-${social}` }),
          ),
        ),
      ),
    ),
  );
  decorateIcons(shareSocialBlock);
  const shareMessageBlock = div({ class: 'share-message' },
    h3(shareMessage),
  );
  const shareButtonBlock = div({ class: 'share-button' },
    p({ class: 'button-container' },
      a({
        class: 'button primary',
        href: '#',
        'aria-label': 'Submit your story',
        target: '_blank',
        rel: 'noopener noreferrer',
        onclick: showSubmitStoryModal,
      },
      'Submit your story',
      span({ class: 'button-border' }),
      ),
    ),
  );

  block.append(shareSocialBlock);
  block.append(shareMessageBlock);
  block.append(shareButtonBlock);

  // hubspot modal
  const modal = div({ class: 'submit-story-modal', id: 'submit-story-modal' });
  const modalCloseButton = button({
    class: 'submit-story-modal-close',
    id: 'submit-story-modal-close',
    onclick: hideSubmitStoryModal,
  });
  modalCloseButton.innerHTML = '&times;';
  const modalContent = div({ class: 'submit-story-modal-wrapper' },
    /*iframe({
      src: 'https://info.moleculardevices.com/submit-your-story',
      loading: 'lazy',
      width: '100%',
      height: '100%',
    }),*/
  );
  modal.append(modalCloseButton);
  modal.append(modalContent);
  const modalOverlay = div({
    class: 'submit-story-modal-overlay',
    id: 'submit-story-modal-overlay',
    onclick: hideSubmitStoryModal,
  });
  document.body.appendChild(modal);
  document.body.appendChild(modalOverlay);

  return block;
}
