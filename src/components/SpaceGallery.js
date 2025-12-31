import { createElement } from '../utils/dom.js';

export class SpaceGallery {
  constructor() {
    this.element = createElement('div', 'space-gallery-container');
    this.spaceImages = [
      'bag.jpg',
      'cards.jpg',
      'discussion.jpg',
      'doorlogo.jpg',
      'lighting.jpg',
      'notepad.jpg'
    ];
  }

  render() {
    // Create grid for desktop and marquee for mobile
    const gridHTML = `
      <div class="space-grid">
        ${this.renderImages()}
      </div>
      <div class="space-marquee">
        <div class="space-marquee-track">
          ${this.renderMarqueeImages()}
          ${this.renderMarqueeImages()}
        </div>
      </div>
    `;

    this.element.innerHTML = gridHTML;
  }

  renderImages() {
    return this.spaceImages
      .map(
        (image) => `
        <div class="space-item">
          <img src="/assets/images/space/${image}" alt="Office space" />
        </div>
      `
      )
      .join('');
  }

  renderMarqueeImages() {
    return this.spaceImages
      .map(
        (image) => `
        <div class="space-marquee-item">
          <img src="/assets/images/space/${image}" alt="Office space" />
        </div>
      `
      )
      .join('');
  }

  mount(parent) {
    parent.appendChild(this.element);
    this.render();
  }
}
