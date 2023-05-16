import ffetch from "../../scripts/ffetch.js";
import { getMetadata } from "../../scripts/lib-franklin.js";
import { createCard } from "../card/card.js";

export default async function decorate(block) {
  const relatedProductsMeta = getMetadata('related-products');
  const relatedProductsTitles = relatedProductsMeta.split(',').map(item => item.trim());
  const relatedCategoriesMeta = getMetadata('related-categories');
  const relatedCategoriesTitles = relatedCategoriesMeta.split(',').map(item => item.trim());

  const products = await ffetch('/query-index.json')
    .sheet('products')
    .filter((product) => relatedProductsTitles.includes(product.h1))
    .all();

  const cardRenderer = await createCard({
    descriptionLength: 75,
    c2aLinkStyle: true,
    defaultButtonText: 'Details',
  });

  products.forEach(product => {
    product.type = product.category;
    block.append(cardRenderer.renderItem(product));
  });

  return block;
}
