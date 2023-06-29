/* eslint-disable no-plusplus */
import { createOptimizedPicture, getMetadata } from '../../scripts/lib-franklin.js';
import {
  detectStore, formatDate, isVideo, videoButton,
} from '../../scripts/scripts.js';
import { div, img } from '../../scripts/dom-helpers.js';

function addMetadata(container) {
  const metadataContainer = document.createElement('div');
  metadataContainer.classList.add('metadata');

  const publishDate = formatDate(getMetadata('publication-date'), { month: 'long' });

  const publishDateContainer = document.createElement('div');
  publishDateContainer.innerHTML = `
    <i class="fa fa-calendar"></i>
    <span class="blog-publish-date">${publishDate}</span>
  `;
  metadataContainer.appendChild(publishDateContainer);

  const author = getMetadata('author');
  if (author) {
    const authorContainer = document.createElement('div');
    authorContainer.innerHTML = `
      <i class="fa fa-user"></i>
      <span class="blog-author">${author}</span>
    `;
    metadataContainer.appendChild(authorContainer);
  }

  container.appendChild(metadataContainer);
}

async function addBlockSticker(container) {
  const stickerContainer = document.createElement('div');
  stickerContainer.classList.add('sticker');
  const sticker = document.createElement('a');
  sticker.href = '/lab-notes';

  const stickerPicture = document.createElement('picture');
  stickerPicture.innerHTML = `
    <source type="image/webp" srcset="/images/lab-notes-hero-sticker.webp">
    <img loading="lazy" alt="Molecular Devices Lab Notes" type="image/png" src="/images/lab-notes-hero-sticker.png">
  `;
  sticker.appendChild(stickerPicture);
  stickerContainer.appendChild(sticker);
  container.appendChild(stickerContainer);
}

async function loadBreadcrumbs(breadcrumbsContainer) {
  const breadCrumbsModule = await import('../breadcrumbs/breadcrumbs-create.js');
  breadCrumbsModule.default(breadcrumbsContainer);
}

export function buildHero(block) {
  const inner = document.createElement('div');
  inner.classList.add('hero-inner');
  const container = document.createElement('div');
  container.classList.add('container');

  if (detectStore()) {
    const buttonContainer = document.querySelector('.button-container');
    if (buttonContainer) {
      buttonContainer.parentElement.removeChild(buttonContainer);
    }
  }

  let picture = block.querySelector('picture');
  if (picture) {
    const originalHeroBg = picture.lastElementChild;
    const optimizedHeroBg = createOptimizedPicture(
      originalHeroBg.src,
      originalHeroBg.getAttribute('alt'),
      true,
      [
        { media: '(min-width: 600px)', width: '2000' },
        { width: '1200' },
      ],
    );

    picture.replaceWith(optimizedHeroBg);
    picture = optimizedHeroBg;
    picture.classList.add('hero-background');
    inner.prepend(picture.parentElement);
  } else {
    inner.classList.add('white-bg');
  }

  const rows = block.children.length;
  [...block.children].forEach((row, i) => {
    if (i === (rows - 1)) {
      if (row.childElementCount > 1) {
        container.classList.add('two-column');
        [...row.children].forEach((column, y) => {
          const image = column.querySelector('img');
          if (y === 1 && image && block.classList.contains('hero')) {
            container.classList.add('right-image');
            image.addEventListener('click', () => {
              const downloadForm = document.querySelector('.download-form');
              if (downloadForm) downloadForm.scrollIntoView(true);
            });
          }
          [...column.querySelectorAll('a')].forEach((link) => {
            const url = new URL(link);
            if (isVideo(url)) {
              const videoContainer = link.closest('div');
              videoContainer.classList.add('video-column');
              const videoIcon = div({ class: 'video-icon' }, img({ src: '/images/play_icon.png' }));
              videoContainer.appendChild(videoIcon);
              videoButton(videoContainer, videoContainer.querySelector('img'), url);
              link.remove();
            }
          });
          container.appendChild(column);
        });
      } else {
        if (row.querySelector('h1:last-child')) inner.classList.add('short');
        container.appendChild(row);
      }
    } else {
      row.remove();
    }
  });

  function buildOrderingForm(options, variants) {
    let selectedOption = null;
    let selectedVariant = null;

    function checkOptionValidity() {
      if (selectedOption === 'Product Options') {
        const variantsList = document.getElementById('variantsList');
        variantsList.classList.add('not-allowed');
      }
      else if (selectedOption !== 'Product Options') {
        const variantsList = document.getElementById('variantsList');
        variantsList.classList.add('allowed');
      }
    }

    function openDropdownMenu(dropdownId) {
      const dropdown = document.getElementById(dropdownId);
      if (dropdown && optionsList.innerHTML !== 'Product Options') {
        dropdown.classList.toggle('show');
        if (dropdownId === 'variantsDropdown') {
          dropdown.style.left = '550px';
        }
      } else if (dropdownId === 'optionsDropdown') {
        dropdown.classList.toggle('show');
      }
      checkOptionValidity();
    }

    function handleOptionSelection(option) {
      selectedOption = option;
      checkOptionValidity(selectedOption);
      updateDropdownInnerHTML();
    }

    function handleVariantSelection(variant) {
      selectedVariant = variant;
      updateVariantsDropdownLabel();
    }

    function updateDropdownInnerHTML() {
      if (optionsList) {
        optionsList.innerHTML = selectedOption;
      }
    }

    function updateVariantsDropdownLabel() {
      if (variantsList) {
        variantsList.innerHTML = selectedVariant;
      }
    }

    window.onclick = function CloseDropDownMenu(event) {
      if (!event.target.matches('.drop-down')) {
        const dropdowns = document.getElementsByClassName('product-options-content');
        let i;
        for (i = 0; i < dropdowns.length; i++) {
          const openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
          }
        }
      }
    };

    const orderContainer = document.createElement('div');
    orderContainer.classList.add('order-container');
    container.appendChild(orderContainer);

    // Options dropdown
    const optionsList = document.createElement('button');
    optionsList.innerHTML = 'Product Options';
    optionsList.onclick = () => openDropdownMenu('optionsDropdown');
    optionsList.classList.add('drop-down');
    orderContainer.appendChild(optionsList);

    const optionsContent = document.createElement('div');
    optionsContent.classList.add('product-options-content');
    optionsContent.id = 'optionsDropdown';
    orderContainer.appendChild(optionsContent);

    for (let i = 0; i < options.length; i++) {
      const option = document.createElement('a');
      option.innerHTML = options[i];
      option.classList.add('option');
      option.addEventListener('click', () => handleOptionSelection(options[i]));
      optionsContent.appendChild(option);
    }
    // Variants dropdown
    const variantsList = document.createElement('button');
    variantsList.innerHTML = 'Select Variation';
    variantsList.id = 'variantsList';
    variantsList.onclick = () => openDropdownMenu('variantsDropdown');
    variantsList.classList.add('drop-down');
    orderContainer.appendChild(variantsList);

    const variantsContent = document.createElement('div');
    variantsContent.classList.add('product-options-content');
    variantsContent.id = 'variantsDropdown';
    orderContainer.appendChild(variantsContent);

    for (let i = 0; i < variants.length; i++) {
      const variant = document.createElement('a');
      variant.innerHTML = variants[i];
      variant.classList.add('option');
      variant.addEventListener('click', () => handleVariantSelection(variants[i]));
      variantsContent.appendChild(variant);
    }

    const priceLabel = document.createElement('label');
    priceLabel.classList.add('price-label');
    priceLabel.innerHTML = 'PRICE';
    orderContainer.appendChild(priceLabel);

    const quantityLabel = document.createElement('label');
    quantityLabel.classList.add('quantity-label');
    quantityLabel.innerHTML = 'QUANTITY';
    orderContainer.appendChild(quantityLabel);

    const price = document.createElement('span');
    price.classList.add('price');
    price.innerHTML = '$ 0.00';
    orderContainer.appendChild(price);

    const quantityContainer = document.createElement('div');
    quantityContainer.classList.add('quantity-container');
    orderContainer.appendChild(quantityContainer);

    const decreaseButton = document.createElement('a');
    decreaseButton.classList.add('quantity-button');
    decreaseButton.innerHTML = '-';
    quantityContainer.appendChild(decreaseButton);

    const quantityNumber = document.createElement('span');
    quantityNumber.classList.add('quantity-number');
    quantityNumber.innerHTML = '0';
    quantityContainer.appendChild(quantityNumber);

    const increaseButton = document.createElement('a');
    increaseButton.classList.add('quantity-button');
    increaseButton.innerHTML = '+';
    quantityContainer.appendChild(increaseButton);

    increaseButton.addEventListener('click', () => {
      let currentQuantity = parseInt(quantityNumber.innerHTML, 10);
      currentQuantity++;
      quantityNumber.innerHTML = currentQuantity;
    });

    decreaseButton.addEventListener('click', () => {
      let currentQuantity = parseInt(quantityNumber.innerHTML, 10);
      if (currentQuantity > 0) {
        currentQuantity--;
        quantityNumber.innerHTML = currentQuantity;
      }
    });
    const addToCart = document.createElement('button');
    addToCart.classList.add('add-to-cart');
    addToCart.innerHTML = 'Add to cart';
    orderContainer.appendChild(addToCart);
  }

  // check if block containt Orange Buttons
  const orangeButtons = block.classList.contains('orange-buttons');
  if (orangeButtons) {
    if (detectStore()) {
      const options = ['Product Options', 'Option 1', 'Option 2'];
      const variants = ['Select Variant', 'Variant 1', 'Variant 2'];
      buildOrderingForm(options, variants);
    }
  }

  const breadcrumbs = document.createElement('div');
  breadcrumbs.classList.add('breadcrumbs');

  block.appendChild(inner);
  inner.appendChild(breadcrumbs);
  inner.appendChild(container);

  if (block.classList.contains('blog')) {
    addMetadata(container);
    addBlockSticker(breadcrumbs);
    block.parentElement.appendChild(container);
  }

  loadBreadcrumbs(breadcrumbs);
}

export default async function decorate(block) {
  buildHero(block);
}
