export default function decorate(block) {
  const list = block.children;
  [...list].forEach((item) => {
    item.classList.add('item');
  });
}
