import { createElement } from '../utils/dom.js';

const serviceImages = [
  'onlinevideo.png',
  'brandstory.png',
  'naming.png',
  'slogan.png',
  'ceoscript.png',
  'website.png'
];

export class GridServices {
  constructor() {
    this.container = createElement('div', 'services-container');
    this.gridElement = createElement('div', 'services-grid');
  }

  render() {
    this.gridElement.innerHTML = '';

    serviceImages.forEach(imageName => {
      const item = createElement('div', 'service-item');
      const img = createElement('img');
      img.src = `/assets/images/${imageName}`;
      img.alt = imageName.replace('.png', '');
      item.appendChild(img);
      this.gridElement.appendChild(item);
    });
  }

  getElement() {
    this.container.innerHTML = '';
    this.container.appendChild(this.gridElement);
    return this.container;
  }
}
