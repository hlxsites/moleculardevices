export default async function decorate(block) {
  block.classList.add('accordion-tab-wrapper');
  const accordionTabList = block.querySelector('div');
  accordionTabList.classList.add('accordion-tab-list');
  const viewContent = accordionTabList.querySelector('div');
  viewContent.classList.add('view-content');
  const list = document.createElement('ul');
  list.classList.add('nav', 'nav-tabs');
  const viewsElementContainer = document.createElement('div');
  viewsElementContainer.classList.add('views-element-container', 'accordion-tab-main-content');
  [...block.children].forEach((row, i) => {
    if (i !== 0) {
      const titleDiv = row.querySelector('div');
      const title = titleDiv.textContent;
      const li = document.createElement('li');
      const a = document.createElement('a');
      const picture = row.querySelector('picture');
      a.href = `#${i}`;
      a.textContent = title;
      li.appendChild(a);
      list.appendChild(li);
      row.classList.add('accordion-tab-pane', 'tab-pane', 'fade');
      if (i === 1) {
        li.classList.add('active');
        row.classList.add('in', 'active');
      }
      titleDiv.remove();
      const tabContent = row.querySelector('div');
      tabContent.classList.add('accordion-tab-content', 'accordion-tab-pane-inside');
      const button = document.createElement('button');
      button.classList.add('accordion-tab-btn');
      const icon = document.createElement('i');
      icon.classList.add('fa', 'fa-plus');
      button.append(icon);
      button.textContent = title;
      const learnMore = document.createElement('a');
      learnMore.classList.add('gradiantBlueBtn', 'btn', 'mt-30');
      learnMore.href = '/applications/3d-cell-models';
      const span = document.createElement('span');
      span.classList.add('btn_bdr');
      learnMore.append(span);
      learnMore.textContent = 'Learn More';
      tabContent.prepend(button);
      tabContent.append(learnMore);
      row.prepend(picture);
      viewsElementContainer.appendChild(row);
    }
  });
  viewContent.append(list);
  block.appendChild(viewsElementContainer);
}
