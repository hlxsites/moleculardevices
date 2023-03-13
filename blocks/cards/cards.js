import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.innerHTML = row.innerHTML;
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);



  /* ================ Leadership Modal ================ */
  /* HELPER */
  function removeActiveClassFromArr(arr, className) {
    [...arr].forEach((carouselItem) => {
      carouselItem.classList.remove(className);
    })
  }

  function removeClassFromElement(element, className) {
    element.classList.remove(className);
    document.body.style.overflow = "auto";
    document.body.style.paddingRight = "0";
  }

  function getTextFromArrTag(arr, tag, ind = null) {
    return arr[ind].querySelector(tag).textContent;
  }
  /* HELPER */

  function createModalHTML() {
    const body = document.body;
    const modal = document.createElement("div");
    const modalWrapper = document.createElement("div");
    const modalHeader = document.createElement("div");
    const modalBody = document.createElement("div");
    const modalFooter = document.createElement("div");
    const modalOverlay = document.createElement("div");
    const closeIcon = document.createElement("button");

    closeIcon.innerHTML = '&times;';
    // closeIcon.innerHTML = '<i class=\'fa fa-times\'></i>';

    modal.classList.add("modal", "leadership-modal");
    modalWrapper.classList.add("modal-wrapper");
    modalHeader.classList.add("modal-header");
    modalBody.classList.add("modal-body");
    modalFooter.classList.add("modal-footer");
    modalOverlay.classList.add("modal-overlay");
    closeIcon.classList.add("modal-close");

    modal.appendChild(closeIcon);
    modal.appendChild(modalWrapper);
    modalWrapper.appendChild(modalHeader);
    modalWrapper.appendChild(modalBody);
    modalWrapper.appendChild(modalFooter);
    body.appendChild(modal);
    body.appendChild(modalOverlay);

    modalOverlay.addEventListener("click", removeClassFromElement.bind(null, modal, 'show'), false);
    modalOverlay.addEventListener("click", removeClassFromElement.bind(null, modalOverlay, 'show'), false);

    closeIcon.addEventListener("click", removeClassFromElement.bind(null, modal, 'show'), false);
    closeIcon.addEventListener("click", removeClassFromElement.bind(null, modalOverlay, 'show'), false);
  }
  createModalHTML();

  function createModalCarousel(leaderCardItems, modalFooterContent) {
    const modal = document.querySelector('.modal');
    // const modalHeader = modal.querySelector('.modal-header');
    const modalBody = modal.querySelector('.modal-body');
    const modalFooter = modal.querySelector(".modal-footer");

    leaderCardItems.forEach((leaderCard, index) => {
      const cardWrapper = document.createElement('div');
      cardWrapper.classList.add('modal-carousel-item');

      cardWrapper.innerHTML = leaderCard.innerHTML;
      cardWrapper.id = index;

      if (index === 0) {
        cardWrapper.classList.add('modal-carousel-item', 'active');
      }
      modalBody.appendChild(cardWrapper);
    })
    modalFooter.innerHTML = modalFooterContent;
  }

  const leaderCardItems = document.querySelectorAll('.leaders ul li');
  const modalCarouselItems = document.querySelector(".modal-body").children;
  const itemsLength = Number(leaderCardItems.length - 1);

  const modalFooterContent = `
    <div class="modal-carousel-nav">
      <div class="prev-item">
        <a href="javascript:void(0)"><i class="fa fa-arrow-circle-left"></i></a>
      </div>
      <div class="next-item">
        <a href="javascript:void(0)"><i class="fa fa-arrow-circle-right"></i></a>
      </div>
    </div>
    <div class="modal-pagination">
      <div class="prev-item">
        <a href="javascript:void(0)"><i class="fa fa-arrow-circle-left"></i> <span>${getTextFromArrTag(leaderCardItems, "h2", leaderCardItems.length - 1)}</span></a>
      </div>
      <div class="next-item">
        <a href="javascript:void(0)"><span>${getTextFromArrTag(leaderCardItems, "h2", 1)}</span> <i class="fa fa-arrow-circle-right"></i></a>
      </div>
    </div>
    `;

  createModalCarousel(leaderCardItems, modalFooterContent);

  document.querySelector(".modal-pagination .prev-item > a").addEventListener("click", prevCarouselHandler, false);
  document.querySelector(".modal-pagination .next-item > a").addEventListener("click", nextCarouselHandler, false);

  document.querySelector(".modal-carousel-nav .prev-item > a").addEventListener("click", prevCarouselHandler, false);
  document.querySelector(".modal-carousel-nav .next-item > a").addEventListener("click", nextCarouselHandler, false);

  function updatePrevNextBtn(ind) {

    const startPoint = 0;;
    const endPoint = Number(leaderCardItems.length - 1);

    if (ind === startPoint) {
      document.querySelector(".modal-pagination .prev-item > a > span").textContent = getTextFromArrTag(leaderCardItems, "h2", endPoint);
      document.querySelector(".modal-pagination .next-item > a > span").textContent = getTextFromArrTag(leaderCardItems, "h2", ind + 1);
    } else if (ind === endPoint) {
      document.querySelector(".modal-pagination .prev-item > a > span").textContent = getTextFromArrTag(leaderCardItems, "h2", ind - 1);
      document.querySelector(".modal-pagination .next-item > a > span").textContent = getTextFromArrTag(leaderCardItems, "h2", startPoint);
    }
    else {
      document.querySelector(".modal-pagination .prev-item > a > span").textContent = getTextFromArrTag(leaderCardItems, "h2", ind - 1);
      document.querySelector(".modal-pagination .next-item > a > span").textContent = getTextFromArrTag(leaderCardItems, "h2", ind + 1);
    }
  }

  function showModalCard(index) {
    const modal = document.querySelector(".modal");
    const modalOverlay = document.querySelector(".modal-overlay");

    updatePrevNextBtn(index);

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = "17px";
    modal.classList.add("show");
    modalOverlay.classList.add("show");
    document.getElementById(index).classList.add('active');
  }

  leaderCardItems.forEach((leaderCard, index) => {
    leaderCard.onclick = function () {
      removeActiveClassFromArr(modalCarouselItems, "active");
      showModalCard(index);
    };
  });

  function prevCarouselHandler() {
    const activeID = Number(this.parentElement.parentElement.parentElement.previousElementSibling.querySelector(".active").id);
    removeActiveClassFromArr(modalCarouselItems, "active");

    if (activeID === 0) {
      updatePrevNextBtn(itemsLength);
      document.getElementById(itemsLength).classList.add("active");
    }
    else {
      updatePrevNextBtn(activeID - 1);
      document.getElementById(activeID - 1).classList.add("active");
    }
  }

  function nextCarouselHandler() {
    const activeID = Number(this.parentElement.parentElement.parentElement.previousElementSibling.querySelector(".active").id);
    removeActiveClassFromArr(modalCarouselItems, "active");

    if (activeID === itemsLength) {
      updatePrevNextBtn(0);
      document.getElementById(0).classList.add("active");
    }
    else {
      updatePrevNextBtn(activeID + 1);
      document.getElementById(activeID + 1).classList.add("active");
    }
  }
  /* ================ Leadership Modal ================ */
}