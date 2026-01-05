import { createElement } from '../utils/dom.js';
import { audioManager } from '../utils/audio.js';
import { stateManager } from '../core/state.js';

export class AudioToggle {
  constructor() {
    this.element = createElement('div', 'audio-toggle');
    this.isMuted = audioManager.getMuteState();
    this.init();
  }

  init() {
    // Create speaker icon SVG
    const speakerIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    speakerIcon.classList.add('audio-icon');
    speakerIcon.setAttribute('width', '18');
    speakerIcon.setAttribute('height', '18');
    speakerIcon.setAttribute('viewBox', '0 0 24 24');
    speakerIcon.setAttribute('fill', 'none');
    speakerIcon.setAttribute('stroke', 'currentColor');
    speakerIcon.setAttribute('stroke-width', '2');
    speakerIcon.setAttribute('stroke-linecap', 'round');
    speakerIcon.setAttribute('stroke-linejoin', 'round');

    this.speakerIcon = speakerIcon;
    this.updateIcon();

    // Append icon only
    this.element.appendChild(speakerIcon);

    // Add click handler to toggle
    this.element.addEventListener('click', () => {
      this.toggle();
    });
  }

  updateIcon() {
    // Clear existing paths
    this.speakerIcon.innerHTML = '';

    if (this.isMuted) {
      // Muted icon (speaker with X)
      this.speakerIcon.innerHTML = `
        <path d="M11 5L6 9H2v6h4l5 4V5z"/>
        <line x1="23" y1="9" x2="17" y2="15"/>
        <line x1="17" y1="9" x2="23" y2="15"/>
      `;
    } else {
      // Unmuted icon (speaker with waves)
      this.speakerIcon.innerHTML = `
        <path d="M11 5L6 9H2v6h4l5 4V5z"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
      `;
    }
  }

  toggle() {
    this.setMuted(!this.isMuted);
  }

  setMuted(muted) {
    this.isMuted = muted;
    audioManager.toggleMute();
    this.updateIcon();
  }

  mount(parent) {
    parent.appendChild(this.element);
  }

  unmount() {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
