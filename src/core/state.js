class StateManager {
  constructor() {
    this.state = {
      currentSection: null,
      selectedSection: null,
      language: 'ko',
      appState: 'idle',
      portfolioSlug: undefined,
    };
    this.listeners = new Set();
  }

  getState() {
    return { ...this.state };
  }

  setState(partial) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.getState()));
  }
}

export const stateManager = new StateManager();
