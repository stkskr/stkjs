import { portfolioData } from '../data/portfolio.js';
import { languageManager } from '../core/language.js';
import { createElement } from '../utils/dom.js';
import { getFullImages } from '../utils/portfolio.js';
import { stateManager } from '../core/state.js';
import { router } from '../core/router.js';
import { extractVideoId, extractTimestamp, getYoutubeThumbnail, resolveYoutubeThumbnail, activateYoutubeFacade } from '../utils/youtube.js';

export class ModalPortfolio {
  constructor() {
    this.element = createElement('div', 'portfolio-modal');
    this.currentIndex = -1;
    this.language = 'ko';
    this.render();

    // Subscribe to state changes
    stateManager.subscribe((state) => {
      if (state.portfolioSlug && state.currentSection === 'portfolio') {
        this.openBySlug(state.portfolioSlug, state.language);
      } else if (!state.portfolioSlug && this.element.classList.contains('active')) {
        // Close modal without navigating
        this.element.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  render() {
    this.element.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-nav">
            <button class="modal-nav-btn prev-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="modal-nav-btn next-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="modal-language-toggle">
            <svg class="modal-globe-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span class="modal-lang-options">
              <span class="modal-lang-option modal-lang-en">EN</span>
              <span class="modal-lang-separator">|</span>
              <span class="modal-lang-option modal-lang-kr">KR</span>
            </span>
          </div>
          <button class="modal-close">✕</button>
        </div>
        <div class="modal-body"></div>
      </div>
    `;

    const closeBtn = this.element.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => this.close());

    const prevBtn = this.element.querySelector('.prev-btn');
    prevBtn.addEventListener('click', () => this.navigate(-1));

    const nextBtn = this.element.querySelector('.next-btn');
    nextBtn.addEventListener('click', () => this.navigate(1));

    // Language toggle handler
    const langToggle = this.element.querySelector('.modal-language-toggle');
    if (langToggle) {
      langToggle.addEventListener('click', () => {
        const newLang = this.language === 'ko' ? 'en' : 'ko';
        this.switchLanguage(newLang);
      });
    }

    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) {
        this.close();
      }
    });

    // Arrow key navigation handler
    this.handleKeyDown = (e) => {
      // Only handle keys when modal is active
      if (!this.element.classList.contains('active')) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.navigate(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.navigate(1);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
      }
    };

    document.addEventListener('keydown', this.handleKeyDown);
  }

  navigate(direction) {
    const newIndex = this.currentIndex + direction;
    if (newIndex >= 0 && newIndex < portfolioData.length) {
      const item = portfolioData[newIndex];
      const newPath = router.buildPath('portfolio', this.language, item.id);
      router.navigate(newPath);
    }
  }

  updateNavigationButtons() {
    const prevBtn = this.element.querySelector('.prev-btn');
    const nextBtn = this.element.querySelector('.next-btn');

    prevBtn.disabled = this.currentIndex <= 0;
    nextBtn.disabled = this.currentIndex >= portfolioData.length - 1;
  }

  updateLanguageToggle() {
    // Bold the current language
    const enOption = this.element.querySelector('.modal-lang-en');
    const krOption = this.element.querySelector('.modal-lang-kr');

    if (enOption && krOption) {
      if (this.language === 'en') {
        enOption.classList.add('active');
        krOption.classList.remove('active');
      } else {
        krOption.classList.add('active');
        enOption.classList.remove('active');
      }
    }
  }

  switchLanguage(newLang) {
    this.language = newLang;
    router.switchLanguage(newLang);
  }

  openBySlug(id, language) {
    const index = portfolioData.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.currentIndex = index;
      this.language = language;
      const item = portfolioData[index];

      const modalBody = this.element.querySelector('.modal-body');
      const modalContent = this.element.querySelector('.modal-content');

      // If modal is already open, animate the content change
      const wasActive = this.element.classList.contains('active');
      if (wasActive) {
        this.animateContentChange(modalBody, modalContent, item, language);
      } else {
        const content = this.renderModalContent(item, language);
        modalBody.innerHTML = content;
        this.element.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.attachCarouselListeners();
      }

      this.updateNavigationButtons();
      this.updateLanguageToggle();
    }
  }

  animateContentChange(modalBody, modalContent, item, language) {
    // Stop any playing YouTube videos before changing content
    const iframe = modalBody.querySelector('.youtube-facade iframe');
    if (iframe) {
      iframe.src = '';
    }

    // Get current height
    const currentHeight = modalContent.offsetHeight;

    // Fade out current content
    modalBody.style.opacity = '0';

    setTimeout(() => {
      // Update content while invisible to measure new height
      const content = this.renderModalContent(item, language);
      modalBody.innerHTML = content;
      this.attachCarouselListeners();

      // Measure new height with new content
      const newHeight = modalContent.offsetHeight;

      // Set current height explicitly
      modalContent.style.height = `${currentHeight}px`;

      // Force reflow
      void modalContent.offsetHeight;

      // Animate to new height FIRST
      requestAnimationFrame(() => {
        modalContent.style.height = `${newHeight}px`;

        // Wait for height animation to mostly complete, then fade in content
        setTimeout(() => {
          modalBody.style.opacity = '1';
        }, 200);

        // Remove explicit height after all transitions complete
        setTimeout(() => {
          modalContent.style.height = '';
        }, 400);
      });
    }, 150);
  }

  open(index, language) {
    const item = portfolioData[index];
    const newPath = router.buildPath('portfolio', language, item.id);
    router.navigate(newPath);
  }

  close() {
    // Stop any playing YouTube videos
    const iframe = this.element.querySelector('.youtube-facade iframe');
    if (iframe) {
      // Remove the iframe src to stop playback
      iframe.src = '';
    }

    this.element.classList.remove('active');
    document.body.style.overflow = '';
    // Navigate back to portfolio page without slug
    const { language } = stateManager.getState();
    const newPath = router.buildPath('portfolio', language);
    router.navigate(newPath);
  }

  destroy() {
    // Clean up event listener when component is destroyed
    if (this.handleKeyDown) {
      document.removeEventListener('keydown', this.handleKeyDown);
    }
  }

  getMediaTypeLabels(mediaType, language) {
    const typeMap = {
      all: { ko: 'ALL', en: 'ALL' },
      video: { ko: '영상', en: 'Video' },
      online: { ko: '온라인', en: 'Online' },
      branding: { ko: '브랜딩', en: 'Branding' },
      sns: { ko: 'SNS', en: 'SNS' },
      ooh: { ko: 'OOH', en: 'OOH' },
      script: { ko: '스크립트', en: 'Script' },
    };

    const types = mediaType.split(',').map(t => t.trim());
    return types.map(t => typeMap[t.toLowerCase()]?.[language] || t).join(', ');
  }

  renderModalContent(item, language) {
    const title = languageManager.getContent(item.title, language);
    const mission = languageManager.getContent(item.mission, language);
    const solution = languageManager.getContent(item.solution, language);
    const mediaTypeLabel = this.getMediaTypeLabels(item.mediaType, language);

    const missionLabel = language === 'ko' ? 'Mission' : 'Mission';
    const solutionLabel = language === 'ko' ? 'Solution' : 'Solution';
    const clientLabel = language === 'ko' ? 'Client' : 'Client';
    const mediaLabel = language === 'ko' ? 'Media Type' : 'Media Type';

    // Render media content (video or images)
    let mediaContent = '';

    if (item.videoUrl) {
      // Use YouTube facade for lazy loading
      const videoId = extractVideoId(item.videoUrl);
      const timestamp = extractTimestamp(item.videoUrl);
      const thumbnailUrl = getYoutubeThumbnail(videoId);
      mediaContent = `
        <div class="modal-video-container youtube-facade" data-video-id="${videoId}" data-video-timestamp="${timestamp || ''}" data-video-title="${title}">
          <img src="${thumbnailUrl}" alt="${title}" loading="eager" decoding="async" />
          <button class="youtube-play-btn" aria-label="Play video">
            <svg width="68" height="48" viewBox="0 0 68 48">
              <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
              <path d="M 45,24 27,14 27,34" fill="#fff"></path>
            </svg>
          </button>
        </div>
      `;
    } else {
      // Get full images (carousel or single)
      const images = getFullImages(item.id);

      if (images.length === 1) {
        // Single image
        mediaContent = `
          <div class="modal-image-container">
            <img src="${images[0]}" alt="${title}" />
          </div>
        `;
      } else {
        // Carousel
        mediaContent = `
          <div class="modal-carousel-container">
            <div class="modal-carousel">
              ${images.map((img, idx) => `
                <div class="modal-carousel-item ${idx === 0 ? 'active' : ''}">
                  <img src="${img}" alt="${title} ${idx + 1}" />
                </div>
              `).join('')}
            </div>
            ${images.length > 1 ? `
              <button class="modal-carousel-prev" aria-label="Previous image">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button class="modal-carousel-next" aria-label="Next image">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div class="modal-carousel-indicators">
                ${images.map((_, idx) => `
                  <button class="modal-carousel-indicator ${idx === 0 ? 'active' : ''}" data-index="${idx}"></button>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `;
      }
    }

    return `
      ${mediaContent}
      <h2 class="modal-title">${title}</h2>
      <div class="modal-info">
        <div class="modal-info-item">
          <h3>${missionLabel}</h3>
          <p>${mission}</p>
        </div>
        <div class="modal-info-item">
          <h3>${solutionLabel}</h3>
          <p>${solution}</p>
        </div>
      </div>
      <div class="modal-meta">
        <div class="modal-meta-item">
          <span class="modal-meta-label">${clientLabel}:</span>
          <span>${item.client}</span>
        </div>
        <div class="modal-meta-item">
          <span class="modal-meta-label">${mediaLabel}:</span>
          <span>${mediaTypeLabel}</span>
        </div>
      </div>
    `;
  }

  attachCarouselListeners() {
    // Handle YouTube facade clicks and thumbnail resolution
    const youtubeFacades = this.element.querySelectorAll('.youtube-facade');
    console.log('[ModalPortfolio] attachCarouselListeners called, facades:', youtubeFacades.length);

    youtubeFacades.forEach((youtubeFacade, index) => {
      const videoId = youtubeFacade.dataset.videoId;
      const thumbnailImg = youtubeFacade.querySelector('img');

      console.log(`[ModalPortfolio] facade ${index}`, { videoId, hasImg: !!thumbnailImg });

      // Resolve the best available thumbnail quality
      if (videoId && thumbnailImg) {
        console.log('[ModalPortfolio] resolving thumbnail for', videoId);

        resolveYoutubeThumbnail(videoId, (url, quality, w, h) => {
          console.log('[ModalPortfolio] resolved thumbnail', { videoId, url, quality, w, h });
          thumbnailImg.src = url;
          youtubeFacade.dataset.thumbnailQuality = quality;
        });
      }

      const playBtn = youtubeFacade.querySelector('.youtube-play-btn');
      if (playBtn) {
        playBtn.addEventListener('click', () => {
          const timestamp = youtubeFacade.dataset.videoTimestamp || null;
          const title = youtubeFacade.dataset.videoTitle;
          activateYoutubeFacade(youtubeFacade, videoId, title, timestamp);
        });
      }
    });

    const carouselContainer = this.element.querySelector('.modal-carousel-container');
    if (!carouselContainer) return;

    const items = carouselContainer.querySelectorAll('.modal-carousel-item');
    const indicators = carouselContainer.querySelectorAll('.modal-carousel-indicator');
    const prevBtn = carouselContainer.querySelector('.modal-carousel-prev');
    const nextBtn = carouselContainer.querySelector('.modal-carousel-next');

    if (items.length <= 1) return;

    let currentIndex = 0;

    const showSlide = (index, explicitDirection = null) => {
      // Prevent sliding to the same index
      if (index === currentIndex) return;

      // Determine direction: use explicit if provided, otherwise calculate
      let direction;
      if (explicitDirection) {
        direction = explicitDirection;
      } else {
        // Detect wrap-around cases
        const isWrappingForward = currentIndex === items.length - 1 && index === 0;
        const isWrappingBackward = currentIndex === 0 && index === items.length - 1;

        if (isWrappingForward) {
          direction = 'next';
        } else if (isWrappingBackward) {
          direction = 'prev';
        } else {
          direction = index > currentIndex ? 'next' : 'prev';
        }
      }

      const currentItem = items[currentIndex];
      const nextItem = items[index];

      // Remove all animation classes from all items first
      items.forEach((item) => {
        item.classList.remove('exit-next', 'exit-prev', 'enter-next', 'enter-prev');
      });

      // Add exit animation to current item
      if (currentItem) {
        currentItem.classList.remove('active');
        // Use requestAnimationFrame to ensure the class removal is processed
        requestAnimationFrame(() => {
          currentItem.classList.add(`exit-${direction}`);
        });
      }

      // Add enter animation to next item
      if (nextItem) {
        nextItem.classList.add('active');
        requestAnimationFrame(() => {
          nextItem.classList.add(`enter-${direction}`);
        });
      }

      // Clean up animation classes after transition completes
      setTimeout(() => {
        items.forEach((item) => {
          item.classList.remove('exit-next', 'exit-prev', 'enter-next', 'enter-prev');
        });
      }, 450);

      indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
      });
      currentIndex = index;
    };

    prevBtn?.addEventListener('click', () => {
      const newIndex = (currentIndex - 1 + items.length) % items.length;
      showSlide(newIndex, 'prev');
    });

    nextBtn?.addEventListener('click', () => {
      const newIndex = (currentIndex + 1) % items.length;
      showSlide(newIndex, 'next');
    });

    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        showSlide(index);
      });
    });
  }

  mount(parent) {
    parent.appendChild(this.element);
  }
}
