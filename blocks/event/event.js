export default async function decorate(block) {
  const date = block.firstElementChild;
  if (date) date.classList.add('event-date');

  const subtitleContainer = block.querySelector('div:nth-child(2)');
  if (subtitleContainer) {
    const subtitle = subtitleContainer.querySelector('h3');
    subtitle.classList.add('event-subtitle');
  }

  const keywordsContainer = block.querySelector('div:nth-child(3)');
  if (keywordsContainer) {
    keywordsContainer.classList.add('event-keywords');
    const list = keywordsContainer.querySelector('ul');
    if (list) {
      list.classList.add('keyword-list');
    }
  }
}
