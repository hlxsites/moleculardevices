function getURL() {
  return encodeURIComponent(window.location.href);
}

function getTitle() {
  const h1 = document.querySelector('h1');
  return h1 ? encodeURIComponent(h1.textContent) : '';
}

function decorateLink(social, icon, url) {
  if (url) {
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.append(icon);
    social.append(link);
  }
}

function decorateIcons(element) {
  const url = getURL();
  const title = getTitle();

  element.querySelectorAll('li').forEach((social) => {
    const type = social.getAttribute('data-type');
    const icon = social.querySelector('i');
    switch (type) {
      case 'facebook':
        decorateLink(social, icon, `https://www.facebook.com/sharer/sharer.php?u=${url}`);
        break;
      case 'linkedin':
        decorateLink(social, icon, `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`);
        break;
      case 'twitter':
        decorateLink(social, icon, `https://www.twitter.com/share?&url=${url}&text=${title}`);
        break;
      case 'envelope':
        icon.classList.add('addthis-share-button');
        icon.setAttribute('data-service', 'email');
        break;
      default:
        break;
    }
  });
}

export default function decorate(block) {
  const title = block.querySelector('.social-share p').innerHTML;

  block.innerHTML = `
    <div class="share-event">
      <p>${title}</p>
      <div class="social-links blue-ico">
        <ul class="button-container"></ul>
      </div>
    </div>`;
  const socials = ['facebook', 'linkedin', 'twitter', 'envelope'];
  socials.forEach((social) => {
    const li = document.createElement('li');
    li.className = `share-${social}`;
    li.innerHTML = `<i class="fa fa-${social}"></i>`;
    li.setAttribute('data-type', social);
    block.querySelector('.social-links .button-container').append(li);
  });

  decorateIcons(block);
}
