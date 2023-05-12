import { decorateIcons } from '../../scripts/lib-franklin.js';
import {
  div, span,
} from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const root = block.querySelector(':scope > div > div');
  const nodes = root.children;
  const teaserTitle = nodes[0];
  const webinarTitle = nodes[1];
  const speaker = nodes[2];
  const speakerTitle = nodes[3];
  const videoSection = nodes[4];
  videoSection.querySelector('a').setAttribute('target', '_blank');
  const webinarDescription = nodes[5];
  const registerButton = nodes[6];
  const registerButtonLink = registerButton.querySelector('a');
  registerButtonLink.append(span({ class: 'icon icon-fa-external-link' }));
  registerButtonLink.setAttribute('target', '_blank');

  block.innerHTML = '';
  const header = (
    div({ class: 'webinar-teaser-header' },
      teaserTitle,
      webinarTitle,
    )
  );
  const content = (
    div({ class: 'webinar-teaser-content' },
      div({ class: 'webinar-teaser-left-col' },
        div({ class: 'webinar-teaser-video' },
          div({ class: 'webinar-teaser-video-header' },
            speaker,
            speakerTitle,
          ),
          div({ class: 'webinar-teaser-video-link' },
            videoSection,
          ),
        ),
      ),
      div({ class: 'webinar-teaser-right-col' },
        div({ class: 'webinar-teaser-form' },
          webinarDescription,
          registerButton,
        ),
      ),
    )
  );
  block.appendChild(header);
  block.appendChild(content);

  decorateIcons(block);
}
