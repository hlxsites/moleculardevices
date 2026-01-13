import { button, div } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const source = block.querySelector(':scope > div > div') || block;

  const originalNodes = Array.from(source.childNodes).filter(
    (n) => n.nodeType === Node.ELEMENT_NODE || n.textContent.trim(),
  );

  block.innerHTML = '';

  const MAX_CHARS = 4000;
  let expanded = false;

  const content = div({ class: 'transcript-content' });
  const toggle = button({ class: 'transcript-toggle', type: 'button' });
  block.append(content, toggle);

  let charCount = 0;
  const previewNodes = [];

  originalNodes.some((node) => {
    const len = node.textContent.length;

    if (charCount + len > MAX_CHARS) {
      previewNodes.push(node);
      return true;
    }

    previewNodes.push(node);
    charCount += len;
    return false;
  });

  const isExpandable = previewNodes.length < originalNodes.length;

  function setHeight() {
    const height = content.scrollHeight;
    content.style.maxHeight = `${height}px`;
  }

  function render() {
    const startHeight = content.scrollHeight;
    content.style.maxHeight = `${startHeight}px`;

    content.innerHTML = '';

    const nodesToRender = expanded ? originalNodes : previewNodes;
    nodesToRender.forEach((node) => {
      content.append(node.cloneNode(true));
    });

    toggle.innerHTML = expanded
      ? 'View less <i class="fa fa-angle-up"></i>'
      : 'View more <i class="fa fa-angle-down"></i>';

    toggle.style.display = isExpandable ? 'inline-flex' : 'none';

    requestAnimationFrame(setHeight);
  }

  toggle.addEventListener('click', () => {
    expanded = !expanded;
    render();
  });

  render();
}
