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
    this.isTransitioning = false;
    this.slideCount = quotesData.length;
    // Maintain 3 full sets of slides for seamless infinite scrolling
    this.setsCount = 3;
    this.slideWidth = 0; // Will be calculated on mount

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

  updateSlideWidth() {
    // Get the precise width of the container in pixels
    this.slideWidth = Math.round(this.element.offsetWidth);
  }

  render() {
    // Clear existing slides
    this.track.innerHTML = '';

    // Create multiple sets of slides for seamless infinite scrolling
    for (let set = 0; set < this.setsCount; set++) {
      quotesData.forEach((quoteData) => {
        const slide = this.createSlide(quoteData);
        this.track.appendChild(slide);
      });
    }

    // Update slide width and position
    this.updateSlideWidth();

    // Start at the middle set (set index 1)
    this.currentIndex = this.slideCount;
    this.track.style.transition = 'none';
    this.track.style.transform = `translate3d(-${this.currentIndex * this.slideWidth}px, 0, 0)`;

    // Re-enable transitions after a frame
    requestAnimationFrame(() => {
      this.track.style.transition = '';
    });
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
    // Prevent rapid clicks during transition
    if (this.isTransitioning) return;

    // Update slide width in case of resize
    this.updateSlideWidth();

    // Check if we need to reposition BEFORE starting the transition
    const totalSlides = this.slideCount * this.setsCount;

    // If trying to move beyond the last set, wrap to middle set first
    if (index >= this.slideCount * 2) {
      const offsetInSet = index % this.slideCount;
      this.track.style.transition = 'none';
      this.currentIndex = this.slideCount + offsetInSet;
      this.track.style.transform = `translate3d(-${this.currentIndex * this.slideWidth}px, 0, 0)`;
      // Force reflow
      this.track.offsetHeight;
      this.track.style.transition = '';
      // Now move to next slide from here
      index = this.currentIndex + 1;
    }
    // If trying to move before the first set, wrap to middle set first
    else if (index < 0) {
      const offsetInSet = ((index % this.slideCount) + this.slideCount) % this.slideCount;
      this.track.style.transition = 'none';
      this.currentIndex = this.slideCount + offsetInSet;
      this.track.style.transform = `translate3d(-${this.currentIndex * this.slideWidth}px, 0, 0)`;
      // Force reflow
      this.track.offsetHeight;
      this.track.style.transition = '';
      // Now move to previous slide from here
      index = this.currentIndex - 1;
    }

    this.isTransitioning = true;
    this.currentIndex = index;
    this.track.style.transform = `translate3d(-${this.currentIndex * this.slideWidth}px, 0, 0)`;

    // Listen for transition end to reset flag
    const handleTransitionEnd = () => {
      this.isTransitioning = false;
      this.track.removeEventListener('transitionend', handleTransitionEnd);
    };

    this.track.addEventListener('transitionend', handleTransitionEnd);
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

    // Handle window resize to recalculate slide width
    this.resizeHandler = () => {
      this.updateSlideWidth();
      this.track.style.transition = 'none';
      this.track.style.transform = `translate3d(-${this.currentIndex * this.slideWidth}px, 0, 0)`;
      requestAnimationFrame(() => {
        this.track.style.transition = '';
      });
    };
    window.addEventListener('resize', this.resizeHandler);
  }

  unmount() {
    this.stopAutoScroll();
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
