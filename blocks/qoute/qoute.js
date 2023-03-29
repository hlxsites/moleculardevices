export default function decorate(block) {
  block.children[0] && block.children[0].classList.add('qoute-text');
  block.children[1] && block.children[1].classList.add('qoute-author');
}