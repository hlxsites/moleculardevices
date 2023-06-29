import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

class LeadershipModal {
  constructor(leaderCardItems) {
    this.curSlide = 0;
    this.maxSlide = leaderCardItems.length - 1;
    this.leaderCardItems = leaderCardItems;
    this.modalFooterContent = `
    <div class="leader-profiles-modal-carousel-nav">
      <div class="prev-item">
        <a href="javascript:void(0)" data-slide="prev"><i class="fa fa-chevron-circle-left"></i></a>
      </div>
      <div class="next-item">
        <a href="javascript:void(0)" data-slide="next"><i class="fa fa-chevron-circle-right"></i></a>
      </div>
    </div>
    `;

    this.modal = '';
    this.modalBody = '';
    this.modalFooter = '';
    this.modalOverlay = '';
    this.modalCarouselItems = '';
  }

  static removeActiveClassFromArr(arr, className) {
    [...arr].forEach((item) => {
      item.classList.remove(className);
    });
  }

  static getTextFromArrTag(arr, tag, ind = null) {
    return arr[ind].querySelector(tag).textContent;
  }

  static hideModal(modal, modalBody, modalOverlay) {
    modal.classList.remove('show');
    modalOverlay.classList.remove('show');
    modalBody.querySelector('.active').classList.remove('active');

    [...modalBody.children].forEach((slide) => {
      slide.classList.remove('leader-profiles-transition');
    });

    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0';
  }

  static imgHeightWidth() {
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const allImages = entry.target.querySelectorAll('img');
        allImages.forEach((image) => {
          const PictureEl = image.closest('.leader-profiles-card-image');
          if (PictureEl) {
            PictureEl.style.minHeight = `${
              PictureEl.clientWidth < PictureEl.clientHeight
                ? PictureEl.clientWidth
                : PictureEl.clientHeight
            }px`;
            image.width = PictureEl.clientWidth;
            image.height = PictureEl.clientHeight;
          }
        });
      });
    });
    imgObserver.observe(document.body);
    const allImages = document.querySelectorAll('.leader-profiles-card-image img');
    allImages.forEach((image) => {
      imgObserver.observe(image);
    });
  }

  static createModalHTML() {
    const modal = document.createElement('div');
    const modalWrapper = document.createElement('div');
    const modalHeader = document.createElement('div');
    const modalBody = document.createElement('div');
    const modalFooter = document.createElement('div');
    const modalOverlay = document.createElement('div');
    const closeIcon = document.createElement('button');

    closeIcon.innerHTML = '&times;';

    modal.classList.add('leader-profiles-modal');
    modalWrapper.classList.add('leader-profiles-modal-wrapper');
    modalHeader.classList.add('leader-profiles-modal-header');
    modalBody.classList.add('leader-profiles-modal-body');
    modalFooter.classList.add('leader-profiles-modal-footer');
    modalOverlay.classList.add('leader-profiles-modal-overlay');
    closeIcon.classList.add('leader-profiles-modal-close');

    modal.appendChild(closeIcon);
    modal.appendChild(modalWrapper);
    modalWrapper.appendChild(modalHeader);
    modalWrapper.appendChild(modalBody);
    modalWrapper.appendChild(modalFooter);
    document.body.appendChild(modal);
    document.body.appendChild(modalOverlay);

    modalOverlay.addEventListener(
      'click',
      LeadershipModal.hideModal.bind(null, modal, modalBody, modalOverlay),
      false,
    );
    closeIcon.addEventListener(
      'click',
      LeadershipModal.hideModal.bind(null, modal, modalBody, modalOverlay),
      false,
    );
  }

  createModalCarousel() {
    LeadershipModal.createModalHTML();

    this.modal = document.querySelector('.leader-profiles-modal');
    this.modalBody = document.querySelector('.leader-profiles-modal-body');
    this.modalFooter = document.querySelector('.leader-profiles-modal-footer');

    let prevText;
    let nextText;
    const startPoint = 0;
    const endPoint = Number(this.leaderCardItems.length - 1);

    this.leaderCardItems.forEach((leaderCard, index) => {
      const cardContent = document.createElement('div');
      const cardWrapper = document.createElement('div');

      if (index === startPoint) {
        prevText = LeadershipModal.getTextFromArrTag(this.leaderCardItems, 'h2', endPoint);
        nextText = LeadershipModal.getTextFromArrTag(this.leaderCardItems, 'h2', index + 1);
      } else if (index === endPoint) {
        prevText = LeadershipModal.getTextFromArrTag(this.leaderCardItems, 'h2', index - 1);
        nextText = LeadershipModal.getTextFromArrTag(this.leaderCardItems, 'h2', startPoint);
      } else {
        prevText = LeadershipModal.getTextFromArrTag(this.leaderCardItems, 'h2', index - 1);
        nextText = LeadershipModal.getTextFromArrTag(this.leaderCardItems, 'h2', index + 1);
      }

      cardContent.classList.add('leader-profiles-modal-carousel-content');
      cardWrapper.classList.add('leader-profiles-modal-carousel-item');

      cardContent.innerHTML = leaderCard.innerHTML;
      cardWrapper.innerHTML += `
        <div class="leader-profiles-modal-pagination">
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
      this.modalBody.appendChild(cardWrapper);
    });
    this.modalFooter.innerHTML = this.modalFooterContent;
  }

  showModalCard(index) {
    this.modalCarouselItems = this.modalBody.children;
    this.modalOverlay = document.querySelector('.leader-profiles-modal-overlay');

    this.curSlide = index;
    [...this.modalCarouselItems].forEach((slide, indx) => {
      slide.style.transform = `translateX(${100 * (indx - this.curSlide)}%)`;
      setTimeout(() => {
        slide.classList.add('leader-profiles-transition');
      }, 100);
    });

    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '17px';
    this.modal.classList.add('show');
    this.modalOverlay.classList.add('show');
    document.getElementById(index).classList.add('active');

    if (this.modal && this.modal.getAttribute('data-modal-status') !== 'loaded') {
      const modalNavObserver = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          entries.forEach((entry) => {
            modalNavObserver.disconnect();
            entry.target.addEventListener('click', () => {
              this.modalNavHandler(entry.target);
            });
          });
        }
      });
      const modalSlides = document.querySelectorAll('[data-slide]');
      modalSlides.forEach((item) => modalNavObserver.observe(item));
      this.modal.setAttribute('data-modal-status', 'loaded');
    }
  }

  modalNavHandler(dataSlide) {
    const direction = dataSlide.dataset.slide;
    const activeID = Number(this.modalBody.querySelector('.active').id);
    LeadershipModal.removeActiveClassFromArr(this.modalCarouselItems, 'active');

    if (direction === 'prev') {
      if (activeID === 0) {
        document.getElementById(this.maxSlide).classList.add('active');
      } else {
        document.getElementById(activeID - 1).classList.add('active');
      }
      if (this.curSlide === 0) {
        this.curSlide = this.maxSlide;
      } else {
        this.curSlide -= 1;
      }
    } else {
      if (activeID === this.maxSlide) {
        document.getElementById(0).classList.add('active');
      } else {
        document.getElementById(activeID + 1).classList.add('active');
      }
      if (this.curSlide === this.maxSlide) {
        this.curSlide = 0;
      } else {
        this.curSlide += 1;
      }
    }

    [...this.modalCarouselItems].forEach((carouselItems, indx) => {
      carouselItems.style.transform = `translateX(${100 * (indx - this.curSlide)}%)`;
    });
  }

  init() {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        this.createModalCarousel();
        observer.disconnect(entries);
      }
    });
    observer.observe(document.body);

    const modalObserver = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        entries.forEach((entry, index) => {
          entry.target.addEventListener('click', () => {
            this.showModalCard(index);
          });
          modalObserver.disconnect(entry.target);
        });
      }
    });
    this.leaderCardItems.forEach((item) => modalObserver.observe(item));
  }
}

// prettier-ignore
export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.innerHTML = row.innerHTML;
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'leader-profiles-card-image';
      else div.className = 'leader-profiles-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);

  const leaderCardItems = document.querySelectorAll('.leader-profiles ul li');
  const modal = new LeadershipModal(leaderCardItems);
  modal.init();
  LeadershipModal.imgHeightWidth();
  window.addEventListener('resize', LeadershipModal.imgHeightWidth);
}
