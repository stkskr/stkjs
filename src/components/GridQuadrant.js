import { stateManager } from '../core/state.js';
import { router } from '../core/router.js';
import { siteContent } from '../data/content.js';
import { languageManager } from '../core/language.js';
import { createElement, setHTML } from '../utils/dom.js';
import { ModalVideo } from './ModalVideo.js';
import { audioManager } from '../utils/audio.js';

export class GridQuadrant {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.isAnimating = false;
    this.quadrants = new Map();
    this.blueSubText = createElement('span');
    this.whiteSubText = createElement('span');
    this.videoModal = new ModalVideo();
    this.resizeTimeout = null;
    this.init();
  }

  init() {
    const sections = ['about', 'services', 'portfolio', 'clients'];
    const imageMap = {
      about: 'about',
      services: 'services',
      portfolio: 'portfolio',
      clients: 'clientssay',
    };

    // Preload all GIF images to prevent flash on hover
    this.preloadImages(imageMap);

    sections.forEach((section) => {
      const quadrant = createElement('div', `quadrant ${section}`);
      quadrant.dataset.section = section;

      const staticImg = createElement('img', 'static-img');
      const imageName = imageMap[section];
      const ext = imageName === 'services' ? 'png' : 'jpg';
      staticImg.src = `/assets/images/${imageName}.${ext}`;
      staticImg.alt = section;

      const hoverImg = createElement('img', 'hover-img');
      hoverImg.src = `/assets/images/${imageName}.gif`;
      hoverImg.alt = section;

      quadrant.appendChild(staticImg);
      quadrant.appendChild(hoverImg);

      quadrant.addEventListener('click', () => {
        if (!this.isAnimating && !quadrant.classList.contains('selected')) {
          this.handleQuadrantClick(section);
        }
      });
      this.quadrants.set(section, quadrant);
      this.container.appendChild(quadrant);
    });

    const blueSub = createElement('div', 'sub-quadrant blue-sub');
    blueSub.appendChild(this.blueSubText);
    this.container.appendChild(blueSub);

    const whiteSub = createElement('div', 'sub-quadrant white-sub');
    whiteSub.appendChild(this.whiteSubText);
    this.container.appendChild(whiteSub);

    const centerCircle = createElement('div', 'center-circle');
    const logoGif = createElement('img', 'logo-gif');
    logoGif.src = '/assets/images/logo.gif';
    logoGif.alt = 'STKS Logo';

    centerCircle.appendChild(logoGif);
    this.centerCircle = centerCircle;

    centerCircle.addEventListener('click', () => {
      const { currentSection } = stateManager.getState();

      // Only open video modal when on home page (no section selected)
      if (!currentSection) {
        this.videoModal.open('https://www.youtube.com/watch?v=OCWZ5-vivHk');
      } else {
        // Navigate to home when clicked from a section
        const { language } = stateManager.getState();
        const path = language === 'en' ? '/en/' : '/';
        router.navigate(path);
      }
    });

    this.container.appendChild(centerCircle);
    this.videoModal.mount(document.body);

    // Prevent transition glitches during resize
    window.addEventListener('resize', () => {
      this.container.classList.add('no-transition');
      if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
      this.resizeTimeout = window.setTimeout(() => {
        this.container.classList.remove('no-transition');
      }, 150);
    });

    stateManager.subscribe((state) => this.render(state));
  }

  preloadImages(imageMap) {
    // Preload all GIF images (quadrants + logo)
    const sections = ['about', 'services', 'portfolio', 'clients'];
    sections.forEach((section) => {
      const img = new Image();
      img.src = `/assets/images/${imageMap[section]}.gif`;
    });

    // Preload logo GIF
    const logoImg = new Image();
    logoImg.src = '/assets/images/logo.gif';
  }

  handleQuadrantClick(section) {
    const { language } = stateManager.getState();
    const path = router.buildPath(section, language);
    router.navigate(path);
  }

  render(state) {
    const { currentSection, language, appState } = state;

    this.container.className = 'container';
    document.body.className = '';

    // Apply no-transition class ONLY if we are in 'expanded' state (initial load)
    if (appState === 'expanded') {
      this.container.classList.add('no-transition');
    }

    if ((appState === 'expanding' || appState === 'expanded') && currentSection) {
      this.container.classList.add('stateExpanding');
      this.container.classList.add(`${currentSection}Selected`);
      document.body.classList.add('stateExpanding');
      document.body.classList.add(`${currentSection}Selected`);

      // Play audio for the section (only when expanding, not when already expanded)
      if (appState === 'expanding') {
        audioManager.play(currentSection);
      }

      // Move circle to opposite corner based on selected quadrant
      const oppositeCorners = {
        about: { top: '100%', left: '100%' },      // bottom-right
        services: { top: '100%', left: '0%' },     // bottom-left
        portfolio: { top: '0%', left: '100%' },    // top-right
        clients: { top: '0%', left: '0%' }         // top-left
      };

      if (oppositeCorners[currentSection]) {
        this.centerCircle.style.top = oppositeCorners[currentSection].top;
        this.centerCircle.style.left = oppositeCorners[currentSection].left;
      }

      // Force reflow for Safari to recognize overflow-y: auto immediately
      void this.container.offsetHeight;

      // Remove no-transition class after initial render so future navigations animate
      if (appState === 'expanded') {
        requestAnimationFrame(() => {
          this.container.classList.remove('no-transition');
        });
      }

      requestAnimationFrame(() => {
        this.container.style.overflowY = 'auto';
      });
    } else {
      // Reset overflow and scroll position when returning to homepage
      this.container.style.overflowY = '';
      this.container.scrollTop = 0;

      // Stop audio when returning to home
      audioManager.stop();

      // Reset circle to center
      this.centerCircle.style.top = '50%';
      this.centerCircle.style.left = '50%';
    }

    const sections = ['about', 'services', 'portfolio', 'clients'];
    sections.forEach((section) => {
      const element = this.quadrants.get(section);
      if (element) {
        if (section === currentSection) {
          element.classList.add('selected');
        } else {
          element.classList.remove('selected');
        }
      }
    });

    if (currentSection) {
      const subtitle = siteContent[currentSection].subtitle;
      const lines = languageManager.getContent(subtitle, language);
      const subtitleHTML = lines.join('<br>');

      setHTML(this.blueSubText, subtitleHTML);
      setHTML(this.whiteSubText, subtitleHTML);
    }
  }
}
