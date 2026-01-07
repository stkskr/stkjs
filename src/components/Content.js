import { siteContent } from '../data/content.js';
import { languageManager } from '../core/language.js';
import { createElement } from '../utils/dom.js';
import { GridPortfolio } from './GridPortfolio.js';
import { ModalPortfolio } from './ModalPortfolio.js';
import { GridServices } from './GridServices.js';
import { QuoteCarousel } from './QuoteCarousel.js';
import { TeamProfiles } from './TeamProfiles.js';
import { ClientMarquee } from './ClientMarquee.js';
import { SpaceGallery } from './SpaceGallery.js';
import { TestimonialsGrid } from './TestimonialsGrid.js';

export class Content {
  constructor() {
    this.element = createElement('div', 'content-box');
    this.innerElement = createElement('div', 'content-inner');
    this.element.appendChild(this.innerElement);
    this.portfolioModal = new ModalPortfolio();
    this.portfolioGrid = new GridPortfolio(this.portfolioModal);
    this.servicesGrid = new GridServices();
    this.quoteCarousel = new QuoteCarousel();
    this.teamProfiles = new TeamProfiles();
    this.clientMarquee = new ClientMarquee();
    this.spaceGallery = new SpaceGallery();
    this.testimonialsGrid = new TestimonialsGrid();
  }

  render(state) {
    if (!state.currentSection) {
      this.innerElement.innerHTML = '';
      return;
    }

    const section = state.currentSection;
    const language = state.language;

    if (section === 'portfolio') {
      this.renderPortfolio(language);
    } else if (section === 'services') {
      this.renderServices(language);
    } else if (section === 'about') {
      this.renderAbout(language);
    } else if (section === 'clients') {
      this.renderClients(language);
    } else {
      this.renderStandardContent(section, language);
    }
  }

  renderAbout(language) {
    const content = siteContent.about;
    const body = languageManager.getContent(content.body, language);
    const lines = body.split('\n');

    this.innerElement.innerHTML = `
      <div class="about-content">
        <h2 class="about-title">${lines[0]}</h2>
        <p class="about-subtitle">${lines[1]}</p>

        <div class="about-video">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/OCWZ5-vivHk?modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&controls=0&playsinline=1"
            title="Sticks & Stones Introduction"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>

        <a href="/assets/files/SticksandStones_CompanyBrochure.pdf" download class="company-download-btn">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="download-arrow" d="M10 3V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path class="download-arrow" d="M6 10L10 14L14 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path class="download-tray" d="M3 17H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>${language === 'ko' ? '회사소개서 Download' : 'Download Company Profile'}</span>
        </a>
      </div>
    `;

    // Add "Meet our team" title
    const teamTitleDiv = createElement('div', 'team-section-title');
    teamTitleDiv.innerHTML = `<h2>Meet our team</h2>`;
    this.innerElement.appendChild(teamTitleDiv);

    // Add team profiles after the title
    this.teamProfiles.mount(this.innerElement);

    // Add "Clients say" title
    const clientsTitleDiv = createElement('div', 'team-section-title');
    clientsTitleDiv.innerHTML = `<h2>Clients say</h2>`;
    this.innerElement.appendChild(clientsTitleDiv);

    // Add quote carousel after clients title
    this.quoteCarousel.mount(this.innerElement);

    // Add "Our clients" title
    const clientLogosTitleDiv = createElement('div', 'team-section-title');
    clientLogosTitleDiv.innerHTML = `<h2>Our clients</h2>`;
    this.innerElement.appendChild(clientLogosTitleDiv);

    // Add client marquee
    this.clientMarquee.mount(this.innerElement);

    // Add "Our space" title
    const spaceTitleDiv = createElement('div', 'team-section-title');
    spaceTitleDiv.innerHTML = `<h2>Our space</h2>`;
    this.innerElement.appendChild(spaceTitleDiv);

    // Add space gallery
    this.spaceGallery.mount(this.innerElement);

    // Add CTA after space gallery
    const ctaDiv = createElement('div');
    ctaDiv.innerHTML = this.renderCallToAction(language);
    this.innerElement.appendChild(ctaDiv);
    this.attachCTAListeners();
  }

  renderStandardContent(section, language) {
    const content = siteContent[section];
    const body = languageManager.getContent(content.body, language);

    this.innerElement.innerHTML = `
      <div class="standard-content">
        <p>${body}</p>
      </div>
      ${this.renderCallToAction(language)}
    `;
    this.attachCTAListeners();
  }

  renderServices(language) {
    this.innerElement.innerHTML = '';
    this.servicesGrid.render();
    this.innerElement.appendChild(this.servicesGrid.getElement());

    // Add CTA after services grid
    const ctaDiv = createElement('div');
    ctaDiv.innerHTML = this.renderCallToAction(language);
    this.innerElement.appendChild(ctaDiv);
    this.attachCTAListeners();
  }

  renderPortfolio(language) {
    this.innerElement.innerHTML = '';
    this.portfolioGrid.render(language);
    this.innerElement.appendChild(this.portfolioGrid.getElement());

    // Add CTA after portfolio grid
    const ctaDiv = createElement('div');
    ctaDiv.innerHTML = this.renderCallToAction(language);
    this.innerElement.appendChild(ctaDiv);
    this.attachCTAListeners();
  }

  renderClients(language) {
    this.innerElement.innerHTML = '';

    // Add quote carousel
    this.quoteCarousel.mount(this.innerElement);

    // Add testimonials grid
    this.testimonialsGrid.render(language);
    this.testimonialsGrid.mount(this.innerElement);

    // Add CTA after testimonials
    const ctaDiv = createElement('div');
    ctaDiv.innerHTML = this.renderCallToAction(language);
    this.innerElement.appendChild(ctaDiv);
    this.attachCTAListeners();
  }

  renderCallToAction(language) {
    return `
      <div class="cta-section">
        <h2 class="cta-heading">Have a project?</h2>
        <button class="cta-button">Let's talk</button>
      </div>
    `;
  }

  attachCTAListeners() {
    // Attach click handlers to all Let's Talk buttons
    const ctaButtons = this.element.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Dispatch custom event to open contact tab
        window.dispatchEvent(new CustomEvent('openContactTab'));
      });
    });
  }

  mount(parent) {
    parent.appendChild(this.element);
    this.portfolioModal.mount(document.body);
  }
}
