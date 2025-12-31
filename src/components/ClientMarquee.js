import { createElement } from '../utils/dom.js';

export class ClientMarquee {
  constructor() {
    this.element = createElement('div', 'client-marquee-container');
    this.clients = [
      'amorepacific.png',
      'cheil.png',
      'hsad.png',
      'hyundai.png',
      'innocean.png',
      'kia.png',
      'lg.png',
      'pledis.png',
      'samsung.png',
      'skhynix.png',
      'tbwa.png'
    ];
  }

  render() {
    // Create marquee track with duplicated logos for seamless loop
    const trackHTML = `
      <div class="marquee-track">
        ${this.renderLogos()}
        ${this.renderLogos()}
      </div>
    `;

    this.element.innerHTML = trackHTML;
  }

  renderLogos() {
    return this.clients
      .map(
        (client) => `
        <div class="marquee-item">
          <img src="/assets/images/clients/${client}" alt="${client.replace('.png', '')}" />
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
