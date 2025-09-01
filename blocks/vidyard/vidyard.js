export default async function decorate(block) {
  const classNames = block.classList.value;
  const matches = classNames.match(/\btop-[^\s"]+/g);
  const paddingTopValue = matches ? matches[0].replace(/\D/g, '') : null;

  const style = document.createElement('style');
  style.innerHTML = `
  .vidyard-player-container div[class^="vidyard-div-"] {
    padding-bottom: ${paddingTopValue}% !important;
  }
`;
  document.head.appendChild(style);
}
