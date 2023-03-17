const iconPlus = 'fa-plus';
const iconMinus = 'fa-minus';
const classActive = 'active';

function toggleItem(item, on) {
  if (item) {
    const icon = item.querySelector('i');
    if (on) {
      item.classList.add(classActive);
      const tabContent = item.querySelector('.accordion-tab-content');
      if (tabContent) {
        tabContent.style.height = 'auto';
        const height = `${(item.clientHeight - 67)}px`;
        tabContent.style.height = '0px';
        setTimeout(() => {
          tabContent.style.height = height;
        }, 0);
      }
      if (icon) icon.classList.replace(iconPlus, iconMinus);
    } else {
      item.classList.remove(classActive);
      const tabContent = item.querySelector('.accordion-tab-content');
      if (tabContent) {
        setTimeout(() => {
          tabContent.style.height = '0px';
        }, 0);
      }
      if (icon) icon.classList.replace(iconMinus, iconPlus);
    }
  }
}

function toggleNav(target, i) {
  const block = target.closest('.accordion.block');
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
      toggleNav(e.target, i);
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
    if (i) {
      const tabPane = document.createElement('div');
      tabPane.classList.add('accordion-tab-pane');

      const picture = row.querySelector('picture');
      tabPane.appendChild(picture);

      row.classList.add('accordion-tab-pane-inside');
      tabPane.appendChild(row);

      const div = row.querySelector('div');
      const button = document.createElement('button');
      button.classList.add('accordion-tab-btn');
      button.innerHTML = `<i class='fa ${iconPlus}'></i>${div.textContent}`;
      button.addEventListener('click', (e) => {
        toggleNav(e.target, i - 1);
      });
      div.remove();
      row.prepend(button);

      const tabContent = row.querySelector('div');
      tabContent.classList.add('accordion-tab-content');
      if (i === 1) {
        setTimeout(() => {
          const height = `${(tabContent.clientHeight)}px`;
          tabContent.style.height = height;
        }, 0);
      } else {
        tabContent.style.height = '0px';
      }
      tabMainContent.appendChild(tabPane);
    }
  });

  const firstTabPane = tabMainContent.querySelector('.accordion-tab-pane');
  firstTabPane.classList.add(classActive);
  const firstI = firstTabPane.querySelector('i');
  firstI.classList.remove(iconPlus);
  firstI.classList.add(iconMinus);
  const firstTabContent = firstTabPane.querySelector('.accordion-tab-content');
  firstTabContent.style.height = 'auto';
  const height = `${(firstTabPane.clientHeight - 67)}px`;
  setTimeout(() => {
    firstTabContent.style.height = height;
  }, 0);

  block.appendChild(tabMainContent);
}
