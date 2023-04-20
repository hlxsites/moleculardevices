let LAST_SCROLL_POSITION = 0;

/**
 * Enable sticky components
 *
 */
export default function enableStickyElements() {
  const stickyElements = document.querySelectorAll('.sticky-element');
  const offsets = [];

  stickyElements.forEach((element, index) => {
    offsets[index] = element.offsetTop;
  });

  window.addEventListener('scroll', () => {
    const currentScrollPosition = window.pageYOffset;
    let stackedHeight = 0;
    stickyElements.forEach((element, index) => {
      if (currentScrollPosition > offsets[index] - stackedHeight) {
        element.classList.add('sticky');
        element.style.top = `${stackedHeight}px`;
        stackedHeight += element.offsetHeight;
      } else {
        element.classList.remove('sticky');
        element.style.top = '';
      }

      if (currentScrollPosition < LAST_SCROLL_POSITION && currentScrollPosition <= offsets[index]) {
        element.style.top = `${Math.max(offsets[index] - currentScrollPosition, stackedHeight - element.offsetHeight)}px`;
      } else {
        element.style.top = `${stackedHeight - element.offsetHeight}px`;
      }
    });

    LAST_SCROLL_POSITION = currentScrollPosition;
  });
}
