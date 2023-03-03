function buildCell(rowIndex, colspan, dataAlign, dataVAlign) {
  const cell = rowIndex ? document.createElement('td') : document.createElement('th');
  if (colspan > 0) cell.setAttribute('colspan', colspan);
  if (dataAlign) cell.classList.add('text-align-' + dataAlign);
  if (dataVAlign) cell.classList.add('vertical-align-' + dataVAlign);
  return cell;
}

function getNumberOfColumns(block) {
  // get max children length for colspan
  let maxCols = 1;
  [...block.children].forEach((child) => {
    if (child.children.length > maxCols) maxCols = child.children.length;
  });
  return maxCols;
}

function calculateColspan(colIndex, cols, maxCols) {
  // calculate how many columns have to be merged
  let colspan = 0;
  if ((cols !== maxCols) && (cols === colIndex + 1)) {
    colspan = maxCols - colIndex;
  }
  return colspan;
}

export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  let cols = getNumberOfColumns(block);
  [...block.children].forEach((child, i) => {
    const row = document.createElement('tr');
    if (i) {
       tbody.append(row);
    } else {
      thead.append(row);
    }
    [...child.children].forEach((col, j) => {
      let colspan = calculateColspan(j, child.children.length, cols);
      let dataAlign = col.getAttribute('data-align');
      let dataVAlign = col.getAttribute('data-valign');
      const cell = buildCell(i, colspan, dataAlign, dataVAlign);
      cell.innerHTML += col.innerHTML;
      row.append(cell);
    });
  });
  block.innerHTML = '';
  block.append(table);
}
