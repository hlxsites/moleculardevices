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
      row.classList.add('accordion-tab-pane');
      tabMainContent.appendChild(row);
    }
  });

  tabMainContent.querySelector('.accordion-tab-pane').classList.add('active');
  block.appendChild(tabMainContent);
}