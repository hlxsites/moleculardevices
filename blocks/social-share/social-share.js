function getURLFromMetaData() {
  let url = '';
  const metaElem = document.querySelector('head meta[property="hlx:proxyUrl"]');
  if (metaElem) {
    url = metaElem.getAttribute('content');
  }
  return url;
}

function createSocialIcon(iconClassesArray, url) {
  const item = document.createElement('li');
  const icon = document.createElement('i');

  iconClassesArray.forEach((iconClass) => {
    icon.classList.add('fa', iconClass);
  });

  if (url) {
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.append(icon);
    item.append(link);
  } else {
    item.append(icon);
  }
  return item;
}

export default async function decorate(block) {
  const url = getURLFromMetaData();

  const shareEvent = document.createElement('div');
  shareEvent.classList.add('share-event');
  const shareTitle = document.createElement('h4');
  shareTitle.innerHTML = block.querySelector('.social-share p').innerHTML;

  const socialLinks = document.createElement('div');
  socialLinks.classList.add('social-links', 'blue-ico');
  const icons = document.createElement('ul');

  const facebookIconClasses = ['fa', 'fa-facebook'];
  const facebook = createSocialIcon(facebookIconClasses, `https://www.facebook.com/share.php?u=${url}`);
  icons.append(facebook);

  const linkedInIconClasses = ['fa', 'fa-linkedin'];
  const linkedIn = createSocialIcon(linkedInIconClasses, `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=`);
  icons.append(facebook, linkedIn);

  const twitterIconClasses = ['fa', 'fa-twitter'];
  const twitter = createSocialIcon(twitterIconClasses, `https://twitter.com/intent/tweet?text=&url=${url}`);
  icons.append(twitter);

  const googleIconClasses = ['fa', 'fa-envelope', 'addthis-share-button'];
  const google = createSocialIcon(googleIconClasses);
  google.setAttribute('data-service', 'email');
  icons.append(google);

  shareEvent.append(shareTitle);
  shareEvent.append(socialLinks);
  socialLinks.append(icons);

  block.innerHTML = '';
  block.append(shareEvent);
}
