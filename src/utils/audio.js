class AudioManager {
  constructor() {
    this.currentAudio = null;
    this.isMuted = localStorage.getItem('audioMuted') === 'true';
    this.audioFiles = {
      about: '/assets/audio/About.mp3',
      services: '/assets/audio/Services.mp3',
      portfolio: '/assets/audio/Porforlio.mp3',
      clients: '/assets/audio/ClientsSay.mp3',
    };
  }

  play(section) {
    // Stop any currently playing audio
    this.stop();

    // Don't play if muted
    if (this.isMuted) {
      return;
    }

    const audioSrc = this.audioFiles[section];
    if (audioSrc) {
      this.currentAudio = new Audio(audioSrc);
      this.currentAudio.volume = 0.7;
      this.currentAudio.play().catch((error) => {
        console.log('Audio playback failed:', error);
      });
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('audioMuted', this.isMuted);

    // Stop current audio if we're muting
    if (this.isMuted) {
      this.stop();
    }

    return this.isMuted;
  }

  getMuteState() {
    return this.isMuted;
  }
}

export const audioManager = new AudioManager();
