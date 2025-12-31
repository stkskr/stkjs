import { stateManager } from '../core/state.js';
import { router } from '../core/router.js';
import { createElement } from '../utils/dom.js';

export class LanguageToggle {
  constructor() {
    this.element = createElement('div', 'language-toggle');
    this.scrollContainer = null;

    // Create globe icon and both language options
    this.element.innerHTML = `
      <svg class="globe-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" stroke-width="2"/>
      </svg>
      <span class="lang-options">
        <span class="lang-option lang-en">EN</span>
        <span class="lang-separator">|</span>
        <span class="lang-option lang-kr">KR</span>
      </span>
    `;

    this.element.addEventListener('click', () => {
      const currentLang = stateManager.getState().language;
      const newLang = currentLang === 'ko' ? 'en' : 'ko';
      this.handleLanguageChange(newLang);
    });

    stateManager.subscribe((state) => this.render(state));

    // Add scroll listener to handle color changes
    this.setupScrollListener();
  }

  setupScrollListener() {
    // Listen to scroll on both window and container
    window.addEventListener('scroll', () => {
      this.updateScrollState();
    }, true); // Use capture phase to catch all scroll events
  }

  updateScrollState() {
    // Get the container element
    const container = document.querySelector('.container.stateExpanding');

    // If scrolled past the header, add scrolled class
    // Use a threshold slightly before 50vh to trigger color change as soon as white content appears
    const threshold = (window.innerHeight / 2) - 35; // 35px before the content area
    const scrollY = container ? container.scrollTop : window.scrollY;

    if (scrollY > threshold) {
      this.element.classList.add('scrolled');
    } else {
      this.element.classList.remove('scrolled');
    }
  }

  handleLanguageChange(lang) {
    router.switchLanguage(lang);
  }

  render(state) {
    // Bold the current language
    const enOption = this.element.querySelector('.lang-en');
    const krOption = this.element.querySelector('.lang-kr');

    if (state.language === 'en') {
      enOption.classList.add('active');
      krOption.classList.remove('active');
    } else {
      krOption.classList.add('active');
      enOption.classList.remove('active');
    }

    // Update scroll state when state changes (e.g., when navigating to/from sections)
    this.updateScrollState();

    // When entering a section, attach scroll listener to the container
    if (state.currentSection) {
      // Wait for container to be updated with stateExpanding class
      setTimeout(() => {
        const container = document.querySelector('.container.stateExpanding');
        if (container && container !== this.scrollContainer) {
          this.scrollContainer = container;
          container.addEventListener('scroll', () => {
            this.updateScrollState();
          });
        }
      }, 50);
    } else {
      this.scrollContainer = null;
    }
  }

  mount(parent) {
    parent.appendChild(this.element);
  }
}
