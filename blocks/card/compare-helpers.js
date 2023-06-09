export function getPathFromNode(item) {
  return item.getAttribute('data-path');
}

export function getNameFromNode(item) {
  // gets the name from the neares h3 above the item
  return item.closest('.card-caption').querySelector('h3').textContent;
}

export function getSelectedItems() {
  return [...document.querySelectorAll('.compare-button .compare-checkbox.selected')]
    .filter((value, index, self) => index === self.findIndex((t) => (
      getPathFromNode(t) === getPathFromNode(value)
    ),
    ))
    .map((item) => getPathFromNode(item));
}

export function unselectAllComparedItems() {
  const selectedItemPaths = getSelectedItems();
  selectedItemPaths.splice(0, selectedItemPaths.length);
  return selectedItemPaths;
}

export function updateCompareButtons(selectedItemPaths, numSelectedItems) {
  // update all compare buttons
  const allCompareCheckboxes = [...document.querySelectorAll('.compare-button .compare-checkbox')];
  allCompareCheckboxes.forEach((item) => {
    const buttonParent = item.parentNode;
    item.classList.remove('selected');
    buttonParent.querySelector('.compare-count').innerHTML = '0';
    const currentProductPath = getPathFromNode(item);
    if (selectedItemPaths.includes(currentProductPath)) {
      item.classList.add('selected');
      buttonParent.querySelector('.compare-count').innerHTML = numSelectedItems;
    }
  });
}
