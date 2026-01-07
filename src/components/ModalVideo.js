import { createElement } from '../utils/dom.js';

export class ModalVideo {
  constructor() {
    this.modalElement = createElement('div', 'video-modal');
    this.isOpen = false;
    this.init();
  }

  init() {
    this.modalElement.innerHTML = `
      <div class="video-modal-overlay"></div>
      <div class="video-modal-content">
        <iframe
          src=""
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>
    `;

    // Click overlay to close
    const overlay = this.modalElement.querySelector('.video-modal-overlay');
    overlay.addEventListener('click', () => this.close());

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  open(videoUrl) {
    const iframe = this.modalElement.querySelector('iframe');
    // Convert regular YouTube URL to embed URL with autoplay
    const videoId = this.extractVideoId(videoUrl);
    const timestamp = this.extractTimestamp(videoUrl);
    const timestampParam = timestamp ? `&start=${timestamp}` : '';
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1${timestampParam}`;

    this.modalElement.classList.add('active');
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  close() {
    const iframe = this.modalElement.querySelector('iframe');
    iframe.src = ''; // Stop video playback

    this.modalElement.classList.remove('active');
    this.isOpen = false;
    document.body.style.overflow = '';
  }

  extractVideoId(url) {
    // Handle both youtube.com/watch?v=ID and youtu.be/ID formats
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/);
    return match ? match[1] : '';
  }

  extractTimestamp(url) {
    // Extract timestamp from &t=XXX or ?t=XXX parameter
    const match = url.match(/[?&]t=(\d+)/);
    return match ? match[1] : null;
  }

  mount(parent) {
    parent.appendChild(this.modalElement);
  }
}
