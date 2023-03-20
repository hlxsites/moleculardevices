const iconPlus = 'fa-plus';
const iconMinus = 'fa-minus';
const classActive = 'active';
const mediaQ1 = 768;
const mediaQ2 = 992;

function getEmptyHeight(tabPane) {
  const tabPaneInside = tabPane.querySelector('.accordion-tab-pane-inside');
  const tabPaneInsideCS = window.getComputedStyle(tabPaneInside);
  const tabBtn = tabPane.querySelector('.accordion-tab-btn');
  const emptyHeight = (parseInt(tabPaneInsideCS.paddingTop, 10) * 2) + tabBtn.offsetHeight;
  return emptyHeight;
}

function setHeights(block) {
  const tabPanes = block.querySelectorAll('.accordion-tab-pane');
  [...tabPanes].forEach((tabPane) => {
    if (window.innerWidth < mediaQ1) {
      const emptyHeight = getEmptyHeight(tabPane);
      if (tabPane.classList.contains('active')) {
        const height = `${(tabPane.querySelector('.accordion-tab-content').offsetHeight + emptyHeight)}px`;
        tabPane.style.height = height;
      } else {
        tabPane.style.height = `${emptyHeight}px`;
      }
    } else {
      tabPane.style.removeProperty('height');
    }
  });
}

function toggleItem(item, on) {
  if (item) {
    const icon = item.querySelector('i');
    if (on) {
      item.classList.add(classActive);
      if (icon) icon.classList.replace(iconPlus, iconMinus);
    } else {
      item.classList.remove(classActive);
      if (icon) icon.classList.replace(iconMinus, iconPlus);
    }
  }
  setHeights(item.closest('.accordion.block'));
}

function toggleNav(block, target, i) {
  const actives = block.querySelectorAll(`.${classActive}`);
  if (actives.length) {
    [...actives].forEach((active) => {
      const newActive = active.parentElement.children[i];
      toggleItem(active, false);
      if (active !== newActive) {
        toggleItem(newActive, true);
      }
    });
  } else {
    toggleItem(target.closest('.accordion-tab-pane'), true);
  }
}

function buildNav(block) {
  const ul = document.createElement('ul');
  const titles = block.querySelectorAll('div:not(:first-child) > div:first-child');

  [...titles].forEach((title, i) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.textContent = title.textContent;
    a.setAttribute('aria-label', title.textContent);
    a.addEventListener('click', (e) => {
      toggleNav(block, e.target, i);
    });
    li.appendChild(a);
    ul.appendChild(li);
  });

  ul.querySelector('li').classList.add(classActive);
  return (ul);
}

export default function decorate(block) {
  const ul = buildNav(block);
  ul.classList.add('nav-tabs');

  const tabList = block.querySelector('div');
  tabList.classList.add('accordion-tab-list');
  tabList.querySelector('div').appendChild(ul);

  const tabMainContent = document.createElement('div');
  tabMainContent.classList.add('accordion-tab-main-content');

  [...block.children].forEach((row, i) => {
    // first row is for navigation, start from second row
    if (i) {
      const tabPane = document.createElement('div');
      tabPane.classList.add('accordion-tab-pane');

      const picture = row.querySelector('picture');
      tabPane.appendChild(picture);

      row.classList.add('accordion-tab-pane-inside');
      // row width needs to be absolute for transition effect. setting inline proportional to window
      // TODO make it relative to container
      if (window.innerWidth >= mediaQ1) {
        if (window.innerWidth >= mediaQ2) {
          row.style.width = `${(Math.round(window.innerWidth * 0.65))}px`;
        } else {
          row.style.width = `${(Math.round(window.innerWidth * 0.70))}px`;
        }
      }
      tabPane.appendChild(row);

      const div = row.querySelector('div');
      const button = document.createElement('button');
      button.classList.add('accordion-tab-btn');
      button.innerHTML = `<i class='fa ${iconPlus}'></i>${div.textContent}`;
      button.addEventListener('click', (e) => {
        toggleNav(block, e.target, i - 1);
      });
      div.remove();
      row.prepend(button);

      row.querySelector('div').classList.add('accordion-tab-content');
      tabMainContent.appendChild(tabPane);
    }
  });

  // set first tab active
  const firstTabPane = tabMainContent.querySelector('.accordion-tab-pane');
  firstTabPane.classList.add(classActive);
  const firstI = firstTabPane.querySelector('i');
  firstI.classList.remove(iconPlus);
  firstI.classList.add(iconMinus);

  block.appendChild(tabMainContent);
}
