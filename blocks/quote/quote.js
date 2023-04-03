/* eslint-disable no-unused-expressions */
export default function decorate(block) {
  block.children.length > 0 && block.children[0].classList.add('quote-text');
  block.children.length > 1 && block.children[1].classList.add('quote-author');
}
