const liId = 'li-of-';

function toggleTab(block, li) {
  let isActive = false;
  let activeContent;
  let activeContainer;
  let icon;
  let activeLi;
  let activeDiv;

  if (li.closest('.active')) {
    isActive = true;
  }

  // remove active class from old active elements
  activeLi = block.querySelector('li.active');
  if (activeLi) {
    activeLi.classList.remove('active');
  }

  activeDiv = block.querySelector('div.active');
  if (activeDiv) {

    // switch toggle icon
    icon = activeDiv.querySelector('i');
    icon.classList.remove('fa-minus');
    icon.classList.add('fa-plus');

    if (window.innerWidth <= 767) {
      const activeTabContent = activeDiv.querySelector('.accordion-tab-content');
      activeTabContent.style.height = '0px';
      setTimeout(function () {
        activeDiv.classList.remove('active');
      }, 500);
    } else {
      activeDiv.classList.remove('active');
    }
  }

  // add active class to new active elements
  if (!isActive) {
    activeLi = block.querySelector(`#${li.id}`);

    if (activeLi) {
      activeLi.classList.add('active');
    }

    activeDiv = document.getElementById(`${li.id.substr(liId.length)}`);
    if (activeDiv) {
      activeContent = activeDiv.parentElement.parentElement;
      activeContainer = activeContent.parentElement.parentElement;
      activeContainer.classList.add('active');

      // switch toggle icon
      icon = activeContainer.querySelector('i');
      icon.classList.remove('fa-plus');
      icon.classList.add('fa-minus');

      // mobile view active content height must be inline for css transition property
      activeContent.style.height = 'auto';
      const height = `${(activeContent.clientHeight + 20)}px`;
      activeContent.style.height = '0px';
      setTimeout(function () {
        activeContent.style.height = height;
      }, 0);

    }

  }
}

export default async function decorate(block) {
    
  // build the block structure
  block.classList.add('accordion-tab-wrapper');
  const accordionTabList = block.querySelector('div');
  accordionTabList.classList.add('accordion-tab-list');
  const viewContent = accordionTabList.querySelector('div');
  viewContent.classList.add('view-content');
  const ul = document.createElement('ul');
  ul.classList.add('nav', 'nav-tabs');
  const viewsElementContainer = document.createElement('div');
  viewsElementContainer.classList.add('views-element-container', 'accordion-tab-main-content');

  // manipulate block rows
  [...block.children].forEach((row, i) => {

    // first row is for list, content starts from second row
    if (i !== 0) {

      // build list item
      const h3 = row.querySelector('h3');
      const { id } = h3;
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

      // build toggle button for mobile view
      const button = document.createElement('button');
      button.classList.add('accordion-tab-btn');
      const icon = document.createElement('i');
      icon.classList.add('fa', 'fa-plus');
      button.textContent = title;
      button.prepend(icon);
      button.addEventListener('click', () => {
        toggleTab(block, li);
      });

      // build content tab
      const tabPane = document.createElement('div');
      tabPane.classList.add('accordion-tab-pane');
      const tabPaneInside = document.createElement('div');
      tabPaneInside.classList.add('accordion-tab-pane-inside');

      // tab-pane-inside requires inline width for fixed width transition
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

      // first row active at page load
      if (i === 1) {
        li.classList.add('active');
        tabPane.classList.add('active');
        setTimeout(function () {
          row.style.height = `${tabPaneInside.clientHeight - button.clientHeight - 48}px`;
        }, 0);
        icon.classList.remove('fa-plus');
        icon.classList.add('fa-minus');
      }
      viewsElementContainer.appendChild(tabPane);
    }

  });

  viewContent.append(ul);
  block.appendChild(viewsElementContainer);
}
