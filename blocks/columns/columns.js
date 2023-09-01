export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  const element = block.querySelector(':scope > div');
  if (element.querySelector(':scope > div:first-child picture') !== null) {
    element.classList.add('image-left');
  }

  if (element.querySelector(':scope > div:last-child picture') !== null) {
    element.classList.add('image-right');
  }
}
