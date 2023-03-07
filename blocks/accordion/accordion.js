const liId = 'li-of-';

function toggleTab(block, li) {
  let isActive = false;
  if (li.closest('.active')) {
    isActive = true;
  }
  let active = block.querySelector('li.active');
  if (active) {
    active.classList.remove('active');
  }
  active = block.querySelector('div.active');
  if (active) {
    active.classList.remove('active');
  }
  if (!isActive) {
    active = block.querySelector(`#${li.id}`);
    if (active) {
      active.classList.add('active');
    }
    const id = `${li.id.substr(liId.length)}`;
    active = document.getElementById(`${li.id.substr(liId.length)}`);
    if (active) {
      active.parentElement.parentElement.parentElement.parentElement.classList.add('active');
    }
  }
}

export default async function decorate(block) {
  block.classList.add('accordion-tab-wrapper');
  const accordionTabList = block.querySelector('div');
  accordionTabList.classList.add('accordion-tab-list');
  const viewContent = accordionTabList.querySelector('div');
  viewContent.classList.add('view-content');
  const ul = document.createElement('ul');
  ul.classList.add('nav', 'nav-tabs');
  const viewsElementContainer = document.createElement('div');
  viewsElementContainer.classList.add('views-element-container', 'accordion-tab-main-content');

  [...block.children].forEach((row, i) => {
    if (i !== 0) {
      const h3 = row.querySelector('h3');
      const id = h3.id;
      const titleDiv = row.querySelector('div');
      const title = titleDiv.textContent;
      const li = document.createElement('li');
      li.id = `${liId}${id}`;
      const a = document.createElement('a');
      const picture = row.querySelector('picture');
      a.textContent = title;
      a.setAttribute('aria-label', title);
      a.addEventListener('click', () => {
        toggleTab(block, li);
      });
      li.appendChild(a);
      ul.appendChild(li);
      titleDiv.remove();
      const button = document.createElement('button');
      button.classList.add('accordion-tab-btn');
      const icon = document.createElement('i');
      icon.classList.add('fa', 'fa-plus');
      button.append(icon);
      button.textContent = title;
      button.addEventListener('click', () => {
        toggleTab(block, li);
      });
      const tabPane = document.createElement('div');
      tabPane.classList.add('accordion-tab-pane');
      const tabPaneInside = document.createElement('div');
      tabPaneInside.classList.add('accordion-tab-pane-inside');
      if (window.innerWidth >= 768) {
        tabPaneInside.style.width = `${Math.round(window.innerWidth * 0.55)}px`;
      } else {
        tabPaneInside.style.width = `${Math.round(window.innerWidth * 0.95)}px`;
      }
      row.classList.add('accordion-tab-content');
      tabPane.prepend(picture);
      tabPane.append(tabPaneInside);
      tabPaneInside.prepend(button);
      tabPaneInside.append(row);
      if (i === 1) {
        li.classList.add('active');
        tabPane.classList.add('active');
      }
      viewsElementContainer.appendChild(tabPane);
    }
  });

  viewContent.append(ul);
  block.appendChild(viewsElementContainer);
}