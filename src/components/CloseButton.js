import { createElement } from '../utils/dom.js';
import { router } from '../core/router.js';
import { stateManager } from '../core/state.js';

export class CloseButton {
  constructor() {
    this.element = createElement('button', 'close-button');
    this.element.innerHTML = '✕';

    this.element.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleClose();
    });
  }

  handleClose() {
    const { language } = stateManager.getState();
    const path = language === 'en' ? '/en/' : '/';
    router.navigate(path);
  }

  mount(parent) {
    parent.appendChild(this.element);
  }
}
