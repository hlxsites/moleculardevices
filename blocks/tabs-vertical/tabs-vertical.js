const iconPlus = 'fa-plus';
const iconMinus = 'fa-minus';
const classActive = 'active';
const verticalMediaQuery = '(max-width: 768px)';

function getEmptyHeight(tabPane) {
  const tabPaneInside = tabPane.querySelector('.tabs-vertical-pane-inside');
  const tabPaneInsideCS = window.getComputedStyle(tabPaneInside);
  const tabBtn = tabPane.querySelector('.tabs-vertical-btn');
  const emptyHeight = (parseInt(tabPaneInsideCS.paddingTop, 10) * 2) + tabBtn.offsetHeight;
  return emptyHeight;
}

function setHeights(block) {
  const tabPanes = block.querySelectorAll('.tabs-vertical-pane');
  [...tabPanes].forEach((tabPane) => {
    if (window.matchMedia(verticalMediaQuery).matches) {
      const emptyHeight = getEmptyHeight(tabPane);
      if (tabPane.classList.contains('active')) {
        const height = `${(tabPane.querySelector('.tabs-vertical-content').offsetHeight + emptyHeight)}px`;
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
  setHeights(item.closest('.tabs-vertical.block'));
}

function toggleNav(block, target, i) {
  if (!(target.closest('.tabs-vertical-list') && target.closest('.active'))) {
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
      toggleItem(target.closest('.tabs-vertical-pane'), true);
    }
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
    if (title.children.length > 0) {
      a.classList.add('cursor-pointer');
      a.href = title.children[0].href;

      if (window.innerWidth > 768) {
        a.addEventListener('mouseover', (e) => {
          toggleNav(block, e.target, i);
        });
      } else {
        a.addEventListener('click', (e) => {
          toggleNav(block, e.target, i);
        });
      }
    } else {
      a.classList.add('cursor-unset');
      a.addEventListener('click', (e) => {
        toggleNav(block, e.target, i);
      });
    }

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
  tabList.classList.add('tabs-vertical-list');
  tabList.querySelector('div').appendChild(ul);

  const tabMainContent = document.createElement('div');
  tabMainContent.classList.add('tabs-vertical-main-content');

  [...block.children].forEach((row, i) => {
    // first row is for navigation, start from second row
    if (i) {
      const tabPane = document.createElement('div');
      tabPane.classList.add('tabs-vertical-pane');

      const picture = row.querySelector('picture');
      tabPane.appendChild(picture);

      row.classList.add('tabs-vertical-pane-inside');
      tabPane.appendChild(row);

      const div = row.querySelector('div');
      const button = document.createElement('button');
      button.classList.add('tabs-vertical-btn');
      button.innerHTML = `<i class='fa ${iconPlus}'></i>${div.textContent}`;
      button.addEventListener('click', (e) => {
        toggleNav(block, e.target, i - 1);
      });
      div.remove();
      row.prepend(button);

      row.querySelector('div').classList.add('tabs-vertical-content');
      tabMainContent.appendChild(tabPane);
    }
  });

  // set first tab active
  const firstTabPane = tabMainContent.querySelector('.tabs-vertical-pane');
  firstTabPane.classList.add(classActive);
  const firstI = firstTabPane.querySelector('i');
  firstI.classList.remove(iconPlus);
  firstI.classList.add(iconMinus);

  block.appendChild(tabMainContent);
}
