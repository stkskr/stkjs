export class LanguageManager {
  detectBrowserLanguage() {
    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('ko') ? 'ko' : 'en';
  }

  getContent(content, lang) {
    return content[lang];
  }

  formatDate(isoDate, lang) {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat(lang === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }
}

export const languageManager = new LanguageManager();
