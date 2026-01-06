import { stateManager } from './state.js';

class Router {
  constructor() {
    this.hasDetectedLanguage = false;
    this.isInitialLoad = true;
  }

  init() {
    // Disable automatic scroll restoration - we'll handle it manually
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    this.handleInitialLanguageDetection();
    window.addEventListener('popstate', () => this.handleRoute());
    this.handleRoute();
  }

  handleInitialLanguageDetection() {
    const currentPath = window.location.pathname;

    if (currentPath === '/' || currentPath === '') {
      const browserLang = navigator.language.toLowerCase();
      const isKorean = browserLang.startsWith('ko');

      if (!isKorean && !this.hasDetectedLanguage) {
        this.hasDetectedLanguage = true;
        this.navigate('/en/', true);
      }
    }
  }

  parseRoute(path) {
    const segments = path.split('/').filter(Boolean);

    const hasEnPrefix = segments[0] === 'en';
    const language = hasEnPrefix ? 'en' : 'ko';

    const sectionIndex = hasEnPrefix ? 1 : 0;
    const sectionStr = segments[sectionIndex];

    const validSections = ['about', 'services', 'portfolio', 'clients'];
    const section = validSections.includes(sectionStr)
      ? sectionStr
      : null;

    // Check for portfolio item slug (e.g., /portfolio/samsung-brand-identity)
    const portfolioSlug =
      section === 'portfolio' && segments[sectionIndex + 1]
        ? segments[sectionIndex + 1]
        : undefined;

    return { section, language, portfolioSlug };
  }

  buildPath(section, language, portfolioSlug) {
    const prefix = language === 'en' ? '/en' : '';
    if (!section) return `${prefix}/`;
    if (section === 'portfolio' && portfolioSlug) {
      return `${prefix}/${section}/${portfolioSlug}`;
    }
    return `${prefix}/${section}`;
  }

  navigate(path, replace = false) {
    const route = this.parseRoute(path);

    if (replace) {
      history.replaceState(route, '', path);
    } else {
      history.pushState(route, '', path);
    }

    this.handleRoute();
  }

  handleRoute() {
    const route = this.parseRoute(window.location.pathname);
    const currentState = stateManager.getState();

    // Check if we're just changing language (same section, different language)
    const isLanguageChangeOnly =
      currentState.currentSection === route.section &&
      currentState.language !== route.language &&
      !this.isInitialLoad;

    // Check if we're just changing portfolio slug (same section, same language, different portfolio item)
    const isPortfolioSlugChangeOnly =
      currentState.currentSection === 'portfolio' &&
      route.section === 'portfolio' &&
      currentState.language === route.language &&
      currentState.portfolioSlug !== route.portfolioSlug &&
      !this.isInitialLoad;

    // On initial load with a section, skip animation by using 'expanded' state
    // On language change only, use 'expanded' to avoid re-triggering animations/audio
    // On portfolio slug change only, use 'expanded' to avoid re-triggering audio
    let appState;
    if (route.section) {
      if (this.isInitialLoad) {
        appState = 'expanded';
      } else if (isLanguageChangeOnly || isPortfolioSlugChangeOnly) {
        appState = 'expanded'; // Use expanded state to prevent audio replay
      } else {
        appState = 'expanding';
      }
    } else {
      appState = 'idle';
    }

    stateManager.setState({
      currentSection: route.section,
      language: route.language,
      appState: appState,
      portfolioSlug: route.portfolioSlug,
    });

    // After first route, subsequent navigations should animate
    if (this.isInitialLoad) {
      this.isInitialLoad = false;
    }
  }

  switchLanguage(newLang) {
    const { currentSection, portfolioSlug } = stateManager.getState();
    const newPath = this.buildPath(currentSection, newLang, portfolioSlug);
    this.navigate(newPath);
  }
}

export const router = new Router();
