function getNav(block) {
  const ul = document.createElement('ul');
  const titles = block.querySelectorAll('div:not(:first-child) > div:first-child');

  [...titles].forEach((title, i) => {
    ul.insertAdjacentHTML('beforeend', `<li><a aria-label='${title.textContent}'>${title.textContent}</a></li>`);
  });

  ul.querySelector('li').classList.add('active');
  return(ul);
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
      row.style.width = '1168px';
      tabPane.appendChild(row);

      let div = row.querySelector('div');
      const button = document.createElement('button');
      button.classList.add('accordion-tab-btn');
      button.innerHTML = `<i class='fa fa-plus'></i>${div.textContent}`;
      div.remove();
      row.prepend(button);

      row.querySelector('div').classList.add('accordion-tab-content');
      tabMainContent.appendChild(tabPane);
    }
  });

  tabMainContent.querySelector('.accordion-tab-pane').classList.add('active');
  block.appendChild(tabMainContent);
}