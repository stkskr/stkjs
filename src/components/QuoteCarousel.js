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
    this.prevBtn.type = 'button'; // Explicit type for Safari
    this.prevBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    this.prevBtn.setAttribute('aria-label', 'Previous quote');

    this.nextBtn = createElement('button', 'quote-carousel-next');
    this.nextBtn.type = 'button'; // Explicit type for Safari
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

    // Navigation button handlers using Pointer Events for consistent mobile/desktop behavior
    const onPrev = (e) => {
      // Only handle primary pointer (no right click, no multi-touch chaos)
      if (e.pointerType && e.isPrimary === false) return;

      e.preventDefault();
      e.stopPropagation();
      this.moveToSlide(this.currentIndex - 1);
    };

    const onNext = (e) => {
      // Only handle primary pointer (no right click, no multi-touch chaos)
      if (e.pointerType && e.isPrimary === false) return;

      e.preventDefault();
      e.stopPropagation();
      this.moveToSlide(this.currentIndex + 1);
    };

    // Prefer Pointer Events for unified touch/mouse/pen handling
    if (window.PointerEvent) {
      // pointerup feels like "tap", works consistently across devices
      this.prevBtn.addEventListener('pointerup', onPrev, { passive: false });
      this.nextBtn.addEventListener('pointerup', onNext, { passive: false });

      // Prevent ghost clicks in iOS by swallowing click events
      this.prevBtn.addEventListener('click', (e) => e.preventDefault());
      this.nextBtn.addEventListener('click', (e) => e.preventDefault());
    } else {
      // Fallback for older browsers without Pointer Events
      this.prevBtn.addEventListener('click', onPrev);
      this.nextBtn.addEventListener('click', onNext);
    }

    // Add hover listeners for visual feedback
    this.prevBtn.addEventListener('mouseenter', () => {
      this.prevBtn.classList.add('hovered');
    });
    this.prevBtn.addEventListener('mouseleave', () => {
      this.prevBtn.classList.remove('hovered');
    });

    this.nextBtn.addEventListener('mouseenter', () => {
      this.nextBtn.classList.add('hovered');
    });
    this.nextBtn.addEventListener('mouseleave', () => {
      this.nextBtn.classList.remove('hovered');
    });
  }

  updateSlideWidth() {
    // Use getBoundingClientRect for subpixel precision (fixes iOS hairline gaps)
    const rect = this.element.getBoundingClientRect();
    this.slideWidth = rect.width; // Keep fractional width, don't round yet
  }

  setSlideWidths() {
    // Force each slide to exact measured width to eliminate flex rounding ambiguity
    const rect = this.element.getBoundingClientRect();
    const w = rect.width;
    const slides = this.track.querySelectorAll('.quote-slide');
    slides.forEach(slide => {
      slide.style.width = `${w}px`;
      slide.style.minWidth = `${w}px`;
      slide.style.maxWidth = `${w}px`;
    });
    this.slideWidth = w;
  }

  applyTransform() {
    // Snap transform to device pixels to prevent subpixel drift on iOS
    const dpr = window.devicePixelRatio || 1;
    const rawX = this.currentIndex * this.slideWidth;
    const snappedX = Math.round(rawX * dpr) / dpr;
    this.track.style.transform = `translate3d(-${snappedX}px, 0, 0)`;
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

    // Set explicit widths on all slides for subpixel precision
    this.setSlideWidths();

    // Start at the middle set (set index 1)
    this.currentIndex = this.slideCount;
    this.track.style.transition = 'none';
    this.applyTransform();

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
      this.applyTransform();
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
      this.applyTransform();
      // Force reflow
      this.track.offsetHeight;
      this.track.style.transition = '';
      // Now move to previous slide from here
      index = this.currentIndex - 1;
    }

    this.isTransitioning = true;
    this.currentIndex = index;
    this.applyTransform();

    // Guaranteed unlock that handles all edge cases
    const unlock = () => {
      this.isTransitioning = false;
      clearTimeout(this._transitionFallback);
    };

    // Fallback unlock even if transitionend never fires (700ms = 500ms transition + 200ms buffer)
    clearTimeout(this._transitionFallback);
    this._transitionFallback = setTimeout(unlock, 700);

    // Use once: true so handlers cannot stack if something goes wrong
    this.track.addEventListener('transitionend', unlock, { once: true });
    this.track.addEventListener('transitioncancel', unlock, { once: true });
    // iOS Safari sometimes prefers the prefixed event
    this.track.addEventListener('webkitTransitionEnd', unlock, { once: true });
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

    // Use ResizeObserver for better mobile Safari support
    this.resizeObserver = new ResizeObserver(() => {
      this.setSlideWidths();
      this.track.style.transition = 'none';
      this.applyTransform();
      requestAnimationFrame(() => {
        this.track.style.transition = '';
      });
    });
    this.resizeObserver.observe(this.element);
  }

  unmount() {
    this.stopAutoScroll();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
