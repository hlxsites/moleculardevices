export default function decorate(block) {
  block.children[0].classList.add('main');
  block.children[1].classList.add('side');
}
