import './styles/variables.css';
import './styles/global.css';
import './styles/animations.css';
import './styles/quadrants.css';
import './styles/content.css';
import './styles/bottomtabs.css';
import './styles/videomodal.css';
import './styles/hotkey.css';
import './styles/mobile-fixes.css'; /* Critical mobile layout fixes */

import { router } from './core/router.js';
import { stateManager } from './core/state.js';
import { GridQuadrant } from './components/GridQuadrant.js';
import { Content } from './components/Content.js';
import { LanguageToggle } from './components/LanguageToggle.js';
import { AudioToggle } from './components/AudioToggle.js';
import { CloseButton } from './components/CloseButton.js';
import { BottomTabs } from './components/BottomTabs.js';
import { initializeMarqueeHover } from './utils/marquee.js';
import { keyboardHandler } from './utils/keyboard.js';

class App {
  constructor() {
    this.quadrantGrid = new GridQuadrant('app');
    this.contentArea = new Content();
    this.languageToggle = new LanguageToggle();
    this.audioToggle = new AudioToggle();
    this.closeButton = new CloseButton();
    this.bottomTabs = new BottomTabs();

    this.mount();
    this.init();
  }

  mount() {
    const appContainer = document.getElementById('app');
    this.contentArea.mount(appContainer);
    this.closeButton.mount(appContainer);
    this.languageToggle.mount(document.body);
    this.audioToggle.mount(document.body);
    this.bottomTabs.mount(document.body);
  }

  init() {
    stateManager.subscribe((state) => {
      this.contentArea.render(state);

      // Initialize marquee hover after content renders (when clients section is active)
      if (state.currentSection === 'clients') {
        // Use a small delay to ensure DOM is ready
        setTimeout(() => {
          initializeMarqueeHover();
        }, 100);
      }
    });

    router.init();
  }
}

new App();

// Mobile quadrant height calculation using visualViewport API
// Ensures consistent 40% viewport height across Safari iOS, Chrome Android, Samsung Internet
function setQuadHeights() {
  // Only run on mobile devices
  if (window.innerWidth > 768) return;

  // Use visualViewport.height when available (more accurate for mobile browsers)
  const vv = window.visualViewport;
  const viewportH = vv ? vv.height : window.innerHeight;
  const quad40 = Math.round(viewportH * 0.4);

  // Set CSS custom property for use in quadrants.css
  document.documentElement.style.setProperty("--quad40", quad40 + "px");
}

// Run on load
setQuadHeights();

// Update on resize and orientation change
window.addEventListener("resize", setQuadHeights);
window.addEventListener("orientationchange", setQuadHeights);

// Listen to visualViewport events for mobile browser UI changes (address bar show/hide)
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", setQuadHeights);
  window.visualViewport.addEventListener("scroll", setQuadHeights);
}
