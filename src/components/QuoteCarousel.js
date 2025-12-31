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

    this.element.appendChild(this.track);
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
      <span class="quote-icon">"</span>
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
