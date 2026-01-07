import { router } from '../core/router.js';
import { stateManager } from '../core/state.js';

export class KeyboardHandler {
  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.init();
  }

  init() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(e) {
    // Ignore if user is typing in an input, textarea, or contenteditable element
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.isContentEditable
    ) {
      return;
    }

    const key = e.key.toLowerCase();
    const state = stateManager.getState();

    // Language switching shortcuts
    if (key === 'e') {
      e.preventDefault();
      router.switchLanguage('en');
    } else if (key === 'k') {
      e.preventDefault();
      router.switchLanguage('ko');
    } else if (key === 'l') {
      e.preventDefault();
      const newLang = state.language === 'ko' ? 'en' : 'ko';
      router.switchLanguage(newLang);
    }
    // Section navigation shortcuts
    else if (key === 'a') {
      e.preventDefault();
      const path = router.buildPath('about', state.language);
      router.navigate(path);
    } else if (key === 's') {
      e.preventDefault();
      const path = router.buildPath('services', state.language);
      router.navigate(path);
    } else if (key === 'c') {
      e.preventDefault();
      const path = router.buildPath('clients', state.language);
      router.navigate(path);
    } else if (key === 'p') {
      e.preventDefault();
      const path = router.buildPath('portfolio', state.language);
      router.navigate(path);
    }
    // Mute toggle shortcut
    else if (key === 'm') {
      e.preventDefault();
      this.toggleMute();
    }
    // Back navigation shortcut
    else if (key === 'b') {
      e.preventDefault();
      window.history.back();
    }
  }

  toggleMute() {
    // Get the audio toggle button and trigger a click
    const audioToggle = document.querySelector('.audio-toggle');
    if (audioToggle) {
      audioToggle.click();
    }
  }

  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }
}

export const keyboardHandler = new KeyboardHandler();
