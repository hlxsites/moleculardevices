function getNav(block) {
  const ul = document.createElement('ul');
  const titles = block.querySelectorAll('div:not(:first-child) > div:first-child');
  [...titles].forEach((title, i) => {
    const li = document.createElement('li');
    if(!i) {
      li.classList.add('active');
    }
    const a = document.createElement('a');
    a.textContent = title.textContent;
    a.setAttribute('aria-label', title.textContent);
    li.appendChild(a);
    ul.appendChild(li);
  });
  return(ul);
}

export default function decorate(block) {
  const tabList = document.createElement('div');
  tabList.classList.add('accordion-tab-list');
  let listViewContent;
  const ul = getNav(block);
  ul.classList.add('nav', 'nav-tabs');

  const viewContent = document.createElement('div');
  viewContent.classList.add('view-content');

  const viewsElContainer = document.createElement('div');
  viewsElContainer.classList.add('views-element-container');
  viewsElContainer.appendChild(viewContent);

  const tabMainContent = document.createElement('div');
  tabMainContent.classList.add('accordion-tab-main-content');
  tabMainContent.appendChild(viewsElContainer);

  [...block.children].forEach((row, i) => {
    if(!i) {

      row.classList.add('views-element-container');
      listViewContent = row.querySelector('div');
      listViewContent.classList.add('view-content');

      listViewContent.appendChild(ul);
      tabList.appendChild(row);

    } else {

      row.classList.add('accordion-tab-pane');
      if(i === 1) {
        row.classList.add('active');
      }
      viewContent.appendChild(row);

    }
  });

  block.appendChild(tabList);
  block.appendChild(tabMainContent);
}