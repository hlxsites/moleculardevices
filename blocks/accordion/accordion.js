function getNav(block) {
  const ul = document.createElement('ul');
  const titles = block.querySelectorAll('div:not(:first-child) > div:first-child');

  [...titles].forEach((title, i) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.textContent = title.textContent;
    a.setAttribute('aria-label', title.textContent);
    a.addEventListener('click', () => {
      toggleActives(block, i);
    });
    li.appendChild(a);
    ul.appendChild(li);
  });

  ul.querySelector('li').classList.add('active');
  return(ul);
}

function toggleActives(block, i) {
  const actives = block.querySelectorAll('.active');
  [...actives].forEach((active) => {
    active.classList.remove('active');
    let icon = active.querySelector('i');
    if (icon) {
      icon.classList.remove('fa-minus');
      icon.classList.add('fa-plus');
    }
    active = active.parentElement.children[i];
    active.classList.add('active');
    icon = active.querySelector('i');
    if (icon) {
      icon.classList.add('fa-minus');
    }
  });
}

export default function decorate(block) {
  const tabList = block.querySelector('div');
  tabList.classList.add('accordion-tab-list');

  const listViewContent = tabList.querySelector('div')
  listViewContent.classList.add('view-content');
  listViewContent.appendChild(getNav(block));
  listViewContent.querySelector('ul').classList.add('nav', 'nav-tabs');

  const tabMainContent = document.createElement('div');
  tabMainContent.classList.add('accordion-tab-main-content');

  [...block.children].forEach((row, i) => {
    if (i) {
      const tabPane = document.createElement('div');
      tabPane.classList.add('accordion-tab-pane');

      const picture = row.querySelector('picture');
      tabPane.appendChild(picture);

      row.classList.add('accordion-tab-pane-inside');
      // TODO remove fix width
      row.style.width = '1168px';
      tabPane.appendChild(row);

      let div = row.querySelector('div');
      const button = document.createElement('button');
      button.classList.add('accordion-tab-btn');
      button.innerHTML = `<i class='fa fa-plus'></i>${div.textContent}`;
      button.addEventListener('click', () => {
        toggleActives(block, i - 1);
      });
      div.remove();
      row.prepend(button);

      row.querySelector('div').classList.add('accordion-tab-content');
      tabMainContent.appendChild(tabPane);
    }
  });

  const firstTabPane = tabMainContent.querySelector('.accordion-tab-pane');
  firstTabPane.classList.add('active');
  const firstI = firstTabPane.querySelector('i');
  firstI.classList.remove('fa-plus');
  firstI.classList.add('fa-minus');

  block.appendChild(tabMainContent);
}