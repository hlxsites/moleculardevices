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

/**
 * Derive column widths from block classes.
 *
 * Accepts:
 *  - col-30-70      (mobile/tablet: <= 991px)
 *  - col-m-50-50    (desktop: >= 992px)
 *
 * Returns an array of widths per column (normalized to maxCols),
 * or null if no width classes are present.
 */
function getColumnWidths(block, maxCols) {
  let mobile = null;
  let desktop = null;

  [...block.classList].forEach((cls) => {
    let match;

    // Mobile / tablet → col-30-70
    match = cls.match(/^col-(\d{1,3}(?:-\d{1,3})*)$/);
    if (match) {
      mobile = match[1]
        .split('-')
        .map((v) => Number.parseInt(v, 10))
        .filter((v) => Number.isFinite(v) && v >= 0);
    }

    // Desktop → col-m-50-50
    match = cls.match(/^col-m-(\d{1,3}(?:-\d{1,3})*)$/);
    if (match) {
      desktop = match[1]
        .split('-')
        .map((v) => Number.parseInt(v, 10))
        .filter((v) => Number.isFinite(v) && v >= 0);
    }
  });

  if (!mobile && !desktop) {
    return null;
  }

  // Decide based on viewport
  const isDesktop = (typeof window !== 'undefined')
    ? window.innerWidth >= 992
    : false;

  let active = isDesktop ? (desktop || mobile) : (mobile || desktop);
  if (!active || !active.length) return null;

  // Normalize to number of columns
  while (active.length < maxCols) {
    active.push(active[active.length - 1]);
  }
  active = active.slice(0, maxCols);

  return active;
}

/**
 * Compute the effective width for a column or a colspanned header.
 */
function getHeaderCellWidth(colWidths, startIndex, colspan) {
  if (!colWidths) return null;

  const span = colspan && colspan > 0 ? colspan : 1;
  const slice = colWidths.slice(startIndex, startIndex + span);

  if (!slice.length) return null;

  const sum = slice.reduce((acc, value) => acc + value, 0);
  return sum || null;
}

export default async function decorate(block) {
  const orderVariant = block.classList.contains('order');

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  const cols = getNumberOfColumns(block);
  const colWidths = getColumnWidths(block, cols);
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

      const headerCell = isHeader(i, child, orderVariant);
      const cell = buildCell(headerCell, colspan, dataAlign, dataVAlign);

      if (headerCell && colWidths) {
        const width = getHeaderCellWidth(colWidths, j, colspan);
        if (width != null) {
          cell.style.width = `${width}%`;
        }
      }

      cell.innerHTML += col.innerHTML;
      row.append(cell);
    });
  });
  block.innerHTML = '';
  block.append(table);
}
