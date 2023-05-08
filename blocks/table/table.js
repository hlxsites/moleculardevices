function buildCell(header, colspan, dataAlign, dataVAlign) {
  const cell = header
    ? document.createElement('th')
    : document.createElement('td');
  if (colspan > 0) cell.setAttribute('colspan', colspan);
  if (dataAlign) cell.classList.add(`text-align-${dataAlign}`);
  if (dataVAlign) cell.classList.add(`vertical-align-${dataVAlign}`);
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
  if (cols !== maxCols && cols === colIndex + 1) {
    colspan = maxCols - colIndex;
  }
  return colspan;
}

function isHeader(idx, originalRow, orderVariant = false) {
  return !idx // regular tables: first row is a header
  // Product pages -> Order tab.
  // * Rows with strong elements are header.
  // * Rows with heading are not. :)
  || (orderVariant
    && originalRow.querySelector('strong')
    && !originalRow.querySelector('h3,em'));
}

function isApparentHeading(idx, originalRow, allRows, orderVariant = false) {
  return orderVariant
    && originalRow.children.length === 1
    && isHeader(idx, originalRow, orderVariant)
    && idx + 1 < allRows.length
    && isHeader(idx + 1, allRows[idx + 1], orderVariant);
}

export default async function decorate(block) {
  const orderVariant = block.classList.contains('order');

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  const cols = getNumberOfColumns(block);
  const blockChildren = [...block.children];
  blockChildren.forEach((child, i) => {
    const row = document.createElement('tr');

    if (i || orderVariant) {
      tbody.append(row);
    } else {
      thead.append(row);
    }

    if (isApparentHeading(i, child, blockChildren, orderVariant)) {
      row.classList.add('apparent-heading');
    }

    [...child.children].forEach((col, j) => {
      const colspan = calculateColspan(j, child.children.length, cols);
      const dataAlign = col.getAttribute('data-align');
      const dataVAlign = col.getAttribute('data-valign');
      const cell = buildCell(isHeader(i, child, orderVariant), colspan, dataAlign, dataVAlign);
      cell.innerHTML += col.innerHTML;
      row.append(cell);
    });
  });
  block.innerHTML = '';
  block.append(table);
}
