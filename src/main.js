import './styles/variables.css';
import './styles/global.css';
import './styles/animations.css';
import './styles/quadrants.css';
import './styles/content.css';
import './styles/bottomtabs.css';
import './styles/videomodal.css';

import { router } from './core/router.js';
import { stateManager } from './core/state.js';
import { GridQuadrant } from './components/GridQuadrant.js';
import { Content } from './components/Content.js';
import { LanguageToggle } from './components/LanguageToggle.js';
import { CloseButton } from './components/CloseButton.js';
import { BottomTabs } from './components/BottomTabs.js';

class App {
  constructor() {
    this.quadrantGrid = new GridQuadrant('app');
    this.contentArea = new Content();
    this.languageToggle = new LanguageToggle();
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
    this.bottomTabs.mount(document.body);
  }

  init() {
    stateManager.subscribe((state) => {
      this.contentArea.render(state);
    });

    router.init();
  }
}

new App();
