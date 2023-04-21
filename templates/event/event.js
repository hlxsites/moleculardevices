export default function buildAutoBlocks() {
  const title = document.getElementById('event-details');
  if (title) title.classList.add('event-title');

  const details = document.querySelector('.event .event');

  const date = details.firstElementChild;
  if (date) date.classList.add('event-date');

  const subtitleContainer = details.querySelector('div:nth-child(2)');
  if (subtitleContainer) {
    const subtitle = subtitleContainer.querySelector('h3');
    subtitle.classList.add('event-subtitle');
  }

  const keywordsContainer = details.querySelector('div:nth-child(3)');
  if (keywordsContainer) {
    keywordsContainer.classList.add('event-keywords');
    const list = keywordsContainer.querySelector('ul');
    if (list) {
      list.classList.add('keyword-list');
    }
  }
}
