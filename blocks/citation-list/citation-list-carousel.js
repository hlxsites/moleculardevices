let currentSlide = 0;
let touchStartX = 0;
let touchEndX = 0;
let isMoving = false;

function slide(direction, carousel, cards, cardWidth) {
  currentSlide += direction;

  const numOfOriginalCards = cards.length - 1;
  if (currentSlide < 0) {
    currentSlide = numOfOriginalCards;
    carousel.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
  } else if (currentSlide > numOfOriginalCards) {
    currentSlide = 0;
    carousel.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
  } else {
    carousel.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
  }
}

function handleSwipe(carousel, cards) {
  const cardWidth = cards[0].offsetWidth;
  const threshold = 50; // Change this value to adjust the sensitivity of the swipe
  if (touchStartX - touchEndX > threshold) {
    slide(1, carousel, cards, cardWidth);
  } else if (touchEndX - touchStartX > threshold) {
    slide(-1, carousel, cards, cardWidth);
  } else {
    carousel.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
  }
}

function handleTouchStart(e) {
  e.preventDefault();
  touchStartX = e.touches[0].clientX;
  isMoving = true;
}

function handleTouchMove(e, carousel, cards) {
  if (!isMoving) return;
  touchEndX = e.touches[0].clientX;
  const sensitivityMultiplier = 10; // Adjust this value to increase or decrease sensitivity
  const diffX = (touchStartX - touchEndX) * sensitivityMultiplier;
  const cardWidth = cards[0].offsetWidth;
  carousel.style.transform = `translateX(${-currentSlide * cardWidth - diffX}px)`;
}

function handleTouchEnd(e, carousel, cards) {
  isMoving = false;
  handleSwipe(carousel, cards);
}

function addMobileCarousel(carousel, cards) {
  carousel.addEventListener('touchstart', (e) => {
    handleTouchStart(e);
  });
  carousel.addEventListener('touchend', (e) => {
    handleTouchEnd(e, carousel, cards);
  });
  carousel.addEventListener('touchmove', (e) => {
    handleTouchMove(e, carousel, cards);
  });
}

export default function addCarouselForMobile(carousel) {
  const cards = carousel.querySelectorAll('.flex-item');
  addMobileCarousel(carousel, cards);
}
