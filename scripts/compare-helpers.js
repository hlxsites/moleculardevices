export const MAX_COMPARE_ITEMS = 3;

export function getTitleFromNode(item) {
  return item.getAttribute('data-title');
}

export function getSelectedItems() {
  return [...document.querySelectorAll('.compare-button .compare-checkbox.selected')]
    .filter((value, index, self) => index === self.findIndex((t) => (
      getTitleFromNode(t) === getTitleFromNode(value)
    ),
    ))
    .map((item) => getTitleFromNode(item));
}

export function unselectAllComparedItems() {
  [...document.querySelectorAll('.compare-button .compare-checkbox.selected')]
    .forEach((item) => item.classList.remove('selected'));
}

export function updateCompareButtons(selectedItemTitles) {
  // update all compare buttons
  const allCompareCheckboxes = [...document.querySelectorAll('.compare-button .compare-checkbox')];
  allCompareCheckboxes.forEach((item) => {
    const buttonParent = item.parentNode;
    item.classList.remove('selected');
    buttonParent.querySelector('.compare-count').innerHTML = '0';
    const currentProductTitle = getTitleFromNode(item);
    if (selectedItemTitles.includes(currentProductTitle)) {
      item.classList.add('selected');
      buttonParent.querySelector('.compare-count').innerHTML = selectedItemTitles.length;
    }
  });
}
