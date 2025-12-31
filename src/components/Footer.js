import { createElement } from '../utils/dom.js';

export class Footer {
  constructor() {
    this.element = createElement('div', 'site-footer');
    this.render();
  }

  render() {
    this.element.innerHTML = `
      <p>© ${new Date().getFullYear()} Sticks & Stones. All rights reserved.</p>
    `;
  }

  mount(parent) {
    parent.appendChild(this.element);
  }
}
