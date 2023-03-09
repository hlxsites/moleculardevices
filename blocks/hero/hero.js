export default function decorate(block) {
  const picture = block.querySelector('picture');
  if (picture) {
    block.prepend(picture.parentElement); 
  }
}