export default function decorate(block) {
  const a = block.querySelector('a');
  const picture = block.querySelector('picture');
  if (a && picture) a.appendChild(picture);
}
