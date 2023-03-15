/* jshint esversion: 6 */
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

/* ================ Leadership Block Handler================ */
function removeActiveClassFromArr(arr, className) {
  [...arr].forEach((carouselItem) => {
    carouselItem.classList.remove(className);
  });
}

function getTextFromArrTag(arr, tag, ind = null) {
  return arr[ind].querySelector(tag).textContent;
}

function hideLeadershipModal() {
  const modal = document.querySelector('.leadership-modal');
  const modalBody = modal.querySelector('.leadership-modal-body');
  const modalOverlay = document.querySelector('.leadership-modal-overlay');

  // removeClassObserver.observe(modal);
  modal.classList.remove('show');
  modalOverlay.classList.remove('show');
  modalBody.querySelector('.active').classList.remove('active');

  [...modalBody.children].forEach((slide) => {
    slide.classList.remove('tranform-transition');
  });

  document.body.style.overflow = 'auto';
  document.body.style.paddingRight = '0';
}

function createLeadershipModalHTML() {
  const modal = document.createElement('div');
  const modalWrapper = document.createElement('div');
  const modalHeader = document.createElement('div');
  const modalBody = document.createElement('div');
  const modalFooter = document.createElement('div');
  const modalOverlay = document.createElement('div');
  const closeIcon = document.createElement('button');

  closeIcon.innerHTML = '&times;';

  modal.classList.add('leadership-modal');
  modalWrapper.classList.add('leadership-modal-wrapper');
  modalHeader.classList.add('leadership-modal-header');
  modalBody.classList.add('leadership-modal-body');
  modalFooter.classList.add('leadership-modal-footer');
  modalOverlay.classList.add('leadership-modal-overlay');
  closeIcon.classList.add('leadership-modal-close');

  modal.appendChild(closeIcon);
  modal.appendChild(modalWrapper);
  modalWrapper.appendChild(modalHeader);
  modalWrapper.appendChild(modalBody);
  modalWrapper.appendChild(modalFooter);
  document.body.appendChild(modal);
  document.body.appendChild(modalOverlay);

  modalOverlay.addEventListener('click', hideLeadershipModal, false);
  closeIcon.addEventListener('click', hideLeadershipModal, false);
}

function createModalCarousel(leaderCardItems, modalFooterContent) {
  const modal = document.querySelector('.leadership-modal');
  const modalBody = modal.querySelector('.leadership-modal-body');
  const modalFooter = modal.querySelector('.leadership-modal-footer');

  let prevText;
  let nextText;
  const startPoint = 0;
  const endPoint = Number(leaderCardItems.length - 1);

  leaderCardItems.forEach((leaderCard, index) => {
    const cardContent = document.createElement('div');
    const cardWrapper = document.createElement('div');

    if (index === startPoint) {
      prevText = getTextFromArrTag(leaderCardItems, 'h2', endPoint);
      nextText = getTextFromArrTag(leaderCardItems, 'h2', index + 1);
    } else if (index === endPoint) {
      prevText = getTextFromArrTag(leaderCardItems, 'h2', index - 1);
      nextText = getTextFromArrTag(leaderCardItems, 'h2', startPoint);
    } else {
      prevText = getTextFromArrTag(leaderCardItems, 'h2', index - 1);
      nextText = getTextFromArrTag(leaderCardItems, 'h2', index + 1);
    }

    cardContent.classList.add('leadership-modal-carousel-content');
    cardWrapper.classList.add('leadership-modal-carousel-item');

    cardContent.innerHTML = leaderCard.innerHTML;
    cardWrapper.innerHTML += `
      <div class="leadership-modal-pagination">
      <div class="prev-item">
        <a href="javascript:void(0)" data-slide="prev"><i class="fa fa-arrow-circle-left"></i> <span>${prevText}</span></a>
      </div>
      <div class="next-item">
        <a href="javascript:void(0)" data-slide="next"><span>${nextText}</span> <i class="fa fa-arrow-circle-right"></i></a>
      </div>
    </div>
      `;
    cardWrapper.id = index;

    cardWrapper.appendChild(cardContent);
    modalBody.appendChild(cardWrapper);
  });
  modalFooter.innerHTML = modalFooterContent;
}

let curSlide = 0;
function showModalCard(index) {
  const modal = document.querySelector('.leadership-modal');
  const modalCarouselItems = document.querySelector('.leadership-modal-body').children;
  const modalOverlay = document.querySelector('.leadership-modal-overlay');

  curSlide = index;
  [...modalCarouselItems].forEach((slide, indx) => {
    slide.style.transform = `translateX(${100 * (indx - curSlide)}%)`;
    setTimeout(() => {
      slide.classList.add('tranform-transition');
    }, 100);
  });

  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = '17px';
  modal.classList.add('show');
  modalOverlay.classList.add('show');
  document.getElementById(index).classList.add('active');
}

function modalNavHandler(maxSlide, slideItem) {
  const modalCarouselItems = document.querySelector('.leadership-modal-body').children;
  const direction = slideItem.dataset.slide;
  const activeID = Number(document.querySelector('.leadership-modal-wrapper').querySelector('.active').id);
  removeActiveClassFromArr(modalCarouselItems, 'active');

  if (direction === 'prev') {
    if (activeID === 0) {
      document.getElementById(maxSlide).classList.add('active');
    } else {
      document.getElementById(activeID - 1).classList.add('active');
    }
    if (curSlide === 0) {
      curSlide = maxSlide;
    } else {
      curSlide -= 1;
    }
  }
  if (direction === 'next') {
    if (activeID === maxSlide) {
      document.getElementById(0).classList.add('active');
    } else {
      document.getElementById(activeID + 1).classList.add('active');
    }
    if (curSlide === maxSlide) {
      curSlide = 0;
    } else {
      curSlide += 1;
    }
  }

  [...modalCarouselItems].forEach((carouselItems, indx) => {
    carouselItems.style.transform = `translateX(${100 * (indx - curSlide)}%)`;
  });
}
/* ================ Leadership Block Handler ================ */

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

  /* ================ Leadership Block ================ */
  const leaderCardItems = document.querySelectorAll('.leaders ul li');
  const modalFooterContent = `
    <div class="leadership-modal-carousel-nav">
      <div class="prev-item">
        <a href="javascript:void(0)" data-slide="prev"><i class="fa fa-chevron-circle-left"></i></a>
      </div>
      <div class="next-item">
        <a href="javascript:void(0)" data-slide="next"><i class="fa fa-chevron-circle-right"></i></a>
      </div>
    </div>
    `;
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      createLeadershipModalHTML();
      createModalCarousel(leaderCardItems, modalFooterContent);
    }
  });
  observer.observe(document.body);

  const modalObserver = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      modalObserver.disconnect();
      entries.forEach((entry, index) => {
        entry.target.addEventListener('click', () => {
          showModalCard(index);
        });
      });
    }
  });
  leaderCardItems.forEach((item) => modalObserver.observe(item));

  const modalNavObserver = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      const modalCarouselItems = document.querySelector('.leadership-modal-body').children;
      const maxSlide = modalCarouselItems.length - 1;
      modalNavObserver.disconnect();
      entries.forEach((entry) => {
        entry.target.addEventListener('click', () => {
          modalNavHandler(maxSlide, entry.target);
        });
      });
    }
  });

  setTimeout(() => {
    const modalSlides = document.querySelectorAll('[data-slide]');
    modalSlides.forEach((item) => modalNavObserver.observe(item));
  }, 100);

  /* ================ Leadership Block ================ */
}
