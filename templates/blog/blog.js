/* eslint-disable import/no-cycle */
import {
  div, img, h3, p, h5, strong, i, a,
  article,
  button,
} from '../../scripts/dom-helpers.js';
import ffetch from '../../scripts/ffetch.js';
import { createHubSpotForm, loadHubSpotScript } from '../../blocks/forms/forms.js';
import { decorateModal } from '../../blocks/modal/modal.js';
import { decorateLinks, getData, sortDataByDate } from '../../scripts/scripts.js';
import { getMetadata } from '../../scripts/lib-franklin.min.js';

export async function getLatestNewsletter() {
  const resources = await ffetch('/query-index.json')
    .sheet('resources')
    .filter((resource) => resource.type === 'Newsletter')
    .limit(1)
    .all();
  return resources[0]?.gatedURL || '';
}

const formType = 'lab-notes';
const formID = `${formType}-form`;
const formConfig = {
  formType,
  latestNewsletter: await getLatestNewsletter(),
  redirectUrl: null,
};

export async function newsletterModal(metaCMP = '') {
  formConfig.cmp = metaCMP;
  const leftColumn = div({ class: 'col col-left' },
    img({ src: '/images/spectra-lab-notes.png', alt: 'Spectra' }),
    p("Each month, we'll share trends our customers are setting in science and breakthroughs we're enabling together with promises of a brighter, healthier future."),
  );

  const rightColumn = div({ class: 'col col-right' },
    div({ class: 'iframe-wrapper' },
      div(
        h3('Join our journey'),
        h3('of scientific discovery'),
        div({ class: 'hubspot-form', id: formID }),
      ),
    ),
  );

  const modalBody = div({ class: 'modal-form' },
    div({ class: 'columns columns-2-cols' },
      leftColumn,
      rightColumn),
  );

  loadHubSpotScript(createHubSpotForm.bind(null, formConfig));
  await decorateModal(modalBody, 'newsletter-inner-wrapper', true);
}

export async function getBlogAndPublications() {
  let data = [];
  const { fullArticle, blogs } = await getData();
  data = [...fullArticle, ...blogs];
  return sortDataByDate(data);
}

function parseMarkdownToHTML(text) {
  const processedText = text
    .trim()
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  const lines = processedText.split('\n');
  let htmlResult = '';
  let inList = false;

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    if (trimmedLine.startsWith('* ')) {
      if (!inList) {
        htmlResult += '<ul>';
        inList = true;
      }
      const content = trimmedLine.replace(/^\*\s+/, '');
      htmlResult += `<li>${content}</li>`;
    } else {
      if (inList) {
        htmlResult += '</ul>';
        inList = false;
      }
      htmlResult += `<p>${trimmedLine}</p>`;
    }
  });

  if (inList) htmlResult += '</ul>';
  return htmlResult;
}

let isSummaryGenerated = false;
let isSummaryVisible = true;

export async function summarizeContentHandler() {
  const sections = document.querySelectorAll('main > .section:not(.hero-container, .social-share-container, .recent-blogs-carousel-container)');
  const summaryEl = document.querySelector('.ai-summary-result');
  const summarizeCTA = document.querySelector('.summarize-cta');

  if (!summaryEl || !summarizeCTA) {
    // eslint-disable-next-line no-console
    console.error('Summary elements were not found.');
    return;
  }

  // Toggle the existing summary without making another API request.
  if (isSummaryGenerated) {
    isSummaryVisible = !isSummaryVisible;

    summaryEl.style.display = isSummaryVisible ? 'block' : 'none';
    summarizeCTA.textContent = isSummaryVisible ? 'Hide Summary' : 'Show Summary';
    return;
  }

  try {
    summarizeCTA.disabled = true;
    summaryEl.textContent = 'Summarizing...';

    const configResponse = await fetch('/config.json');
    if (!configResponse.ok) throw new Error(`Config request failed: ${configResponse.status}`);

    const config = await configResponse.json();
    const apiKey = config?.public?.custom?.aikey;
    if (!apiKey) throw new Error('Groq API key is missing from config.json.');

    const finalText = Array.from(sections)
      .map((section) => section.textContent.trim())
      .filter(Boolean)
      .join(' ');

    if (!finalText) throw new Error('No blog content was found to summarize.');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: `Summarize this blog post in exactly 3 concise bullet points. Use only information from the article:\n\n${finalText}`,
          },
        ],
      }),
    },
    );

    const data = await response.json();

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error('Groq API error:', data);
      throw new Error(data?.error?.message || `Groq API request failed with status ${response.status}`,
      );
    }

    const summary = data?.choices?.[0]?.message?.content;
    if (!summary) throw new Error('Groq returned an empty summary.');

    summaryEl.innerHTML = parseMarkdownToHTML(summary);

    isSummaryGenerated = true;
    isSummaryVisible = true;
    summarizeCTA.textContent = 'Hide Summary';
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Blog summarization failed:', error);
    summaryEl.textContent = 'Unable to generate the summary right now. Please try again.';

    // Allow another attempt after a failed request.
    isSummaryGenerated = false;
    isSummaryVisible = true;
    summarizeCTA.textContent = 'Retry Summary';
  } finally {
    summarizeCTA.disabled = false;
  }
}

export default async function decorate() {
  const newsletterMetaData = getMetadata('newsletter-modal');
  const newsletterCMP = getMetadata('newsletter-form-cmp');
  const hasNewsletterMetaData = newsletterMetaData.toLowerCase() === 'hide';

  const spectraNewsletter = document.querySelector('.spectra-newsletter-column > div');
  if (spectraNewsletter) {
    // const sidebarIframeID = 'newsletter-sidebar';
    const sidebar = div(
      { class: 'spectra-newsletter' },
      h3('Join our journey of scientific discovery'),
      h5('Each month, we’ll share trends our customers are setting in science and breakthroughs we’re enabling together with promises of a brighter, healthier future.'),
      div({
        class: 'contact-quote-request hubspot-form',
        id: `${formConfig.formType}-form`,
      }),
    );

    loadHubSpotScript(createHubSpotForm.bind(null, formConfig));
    spectraNewsletter.appendChild(sidebar);
  }

  if (!hasNewsletterMetaData) {
    setTimeout(() => newsletterModal(newsletterCMP), 1000);
  }

  // add social share block
  const blogCarousel = document.querySelector('.recent-blogs-carousel');
  if (blogCarousel) {
    const blogCarouselSection = blogCarousel.parentElement;
    const socialShareSection = div(div({ class: 'social-share' }));
    blogCarouselSection.parentElement.insertBefore(socialShareSection, blogCarouselSection);
  }

  // add article sentence
  const isArticlePage = getMetadata('blog-type') === 'Article';
  const signatureCTA = 'Inspired by what you’ve read? Let’s connect!';
  const contactURL = 'https://www.moleculardevices.com/contact?region=americas#get-in-touch';

  if (isArticlePage) {
    const publisher = getMetadata('publisher');
    const gatedUrl = getMetadata('article-url');
    const creditParagraph = article({ class: 'credit-paragraph' },
      p(strong(
        i('This article was originally published on', a({ href: gatedUrl }, ` ${publisher}`), ' and reprinted here with permission.'),
      )),
      p(a({ href: contactURL, class: 'button primary' }, signatureCTA)),
    );
    setTimeout(() => {
      const block = document.querySelector('.hero-container + .section');
      decorateLinks(creditParagraph);
      block.append(creditParagraph);
    }, 1000);
  }

  /* added cta */
  const summarizeCTA = button({ class: 'summarize-cta button' }, '✨ Summarize with AI');
  const result = div({ class: 'ai-summary-result text-left' });
  summarizeCTA.addEventListener('click', summarizeContentHandler);

  setTimeout(() => {
    const block = document.querySelector('.hero-container + .section');
    block.prepend(div({ class: 'default-content-wrapper text-right', style: 'margin-bottom: 1rem;' }, summarizeCTA, result));
  }, 1000);
}
