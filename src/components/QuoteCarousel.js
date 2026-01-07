import { quotesData } from '../data/quotes.js';
import { languageManager } from '../core/language.js';
import { createElement } from '../utils/dom.js';
import { stateManager } from '../core/state.js';

export class QuoteCarousel {
  constructor() {
    this.element = createElement('div', 'quote-carousel-container');
    this.track = createElement('div', 'carousel-track');
    this.currentIndex = 0;
    this.slideInterval = 3500;
    this.autoScroll = null;
    this.language = 'ko';

    // Create navigation buttons
    this.prevBtn = createElement('button', 'quote-carousel-prev');
    this.prevBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    this.prevBtn.setAttribute('aria-label', 'Previous quote');

    this.nextBtn = createElement('button', 'quote-carousel-next');
    this.nextBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    this.nextBtn.setAttribute('aria-label', 'Next quote');

    this.element.appendChild(this.track);
    this.element.appendChild(this.prevBtn);
    this.element.appendChild(this.nextBtn);
    this.setupEventListeners();

    // Subscribe to state changes for language updates
    stateManager.subscribe((state) => {
      if (state.language !== this.language) {
        this.language = state.language;
        this.render();
      }
    });
  }

  setupEventListeners() {
    // Pause auto-scroll on hover
    this.element.addEventListener('mouseenter', () => {
      this.stopAutoScroll();
    });

    this.element.addEventListener('mouseleave', () => {
      this.startAutoScroll();
    });

    // Navigation button click handlers
    this.prevBtn.addEventListener('click', () => {
      this.moveToSlide(this.currentIndex - 1);
    });

    this.nextBtn.addEventListener('click', () => {
      this.moveToSlide(this.currentIndex + 1);
    });
  }

  render() {
    // Clear existing slides
    this.track.innerHTML = '';

    // Create slides for each quote
    quotesData.forEach((quoteData) => {
      const slide = this.createSlide(quoteData);
      this.track.appendChild(slide);
    });

    // Reset to first slide
    this.currentIndex = 0;
    this.moveToSlide(0);
  }

  createSlide(quoteData) {
    const slide = createElement('div', 'quote-slide');

    const quoteText = languageManager.getContent(quoteData.quote, this.language);
    const roleText = languageManager.getContent(quoteData.role, this.language);

    const quoteBox = createElement('div', 'quote-box-dark');
    quoteBox.innerHTML = `
      <svg class="quote-icon" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m21.301 4c.411 0 .699.313.699.663 0 .248-.145.515-.497.702-1.788.948-3.858 4.226-3.858 6.248 3.016-.092 4.326 2.582 4.326 4.258 0 2.007-1.738 4.129-4.308 4.129-3.24 0-4.83-2.547-4.83-5.307 0-5.98 6.834-10.693 8.468-10.693zm-10.833 0c.41 0 .699.313.699.663 0 .248-.145.515-.497.702-1.788.948-3.858 4.226-3.858 6.248 3.016-.092 4.326 2.582 4.326 4.258 0 2.007-1.739 4.129-4.308 4.129-3.241 0-4.83-2.547-4.83-5.307 0-5.98 6.833-10.693 8.468-10.693z" fill-rule="nonzero"/></svg>
      <p class="quote-text">${quoteText}</p>
    `;

    const authorBox = createElement('div', 'author-box-light');
    authorBox.innerHTML = `
      <h4 class="author-name">${quoteData.author}</h4>
      <p class="author-role">${roleText}</p>
    `;

    slide.appendChild(quoteBox);
    slide.appendChild(authorBox);

    return slide;
  }

  moveToSlide(index) {
    const slideCount = quotesData.length;

    // Loop around if needed
    if (index < 0) {
      index = slideCount - 1;
    } else if (index >= slideCount) {
      index = 0;
    }

    this.track.style.transform = `translateX(-${index * 100}%)`;
    this.currentIndex = index;
  }

  autoAdvance() {
    this.moveToSlide(this.currentIndex + 1);
  }

  startAutoScroll() {
    this.stopAutoScroll();
    this.autoScroll = setInterval(() => this.autoAdvance(), this.slideInterval);
  }

  stopAutoScroll() {
    if (this.autoScroll) {
      clearInterval(this.autoScroll);
      this.autoScroll = null;
    }
  }

  mount(parent) {
    parent.appendChild(this.element);
    this.render();
    this.startAutoScroll();
  }

  unmount() {
    this.stopAutoScroll();
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
