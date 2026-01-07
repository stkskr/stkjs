import { portfolioData } from '../data/portfolio.js';
import { languageManager } from '../core/language.js';
import { createElement } from '../utils/dom.js';
import { getThumbnailPath } from '../utils/portfolio.js';

const categoryMap = {
  'video': '영상',
  'online': '온라인',
  'branding': '브랜딩',
  'sns': 'SNS',
  'ooh': 'OOH',
  'script': '스크립트'
};

export class GridPortfolio {
  constructor(modal) {
    this.container = createElement('div', 'portfolio-container');
    this.filterContainer = createElement('div', 'portfolio-filters');
    this.gridElement = createElement('div', 'portfolio-grid');
    this.modal = modal;
    this.currentCategory = 'all';
    this.currentLanguage = 'ko';

    // Handle filter button layout on resize
    window.addEventListener('resize', () => this.handleFilterLayout());
  }

  render(language) {
    this.currentLanguage = language;
    this.renderFilters();
    this.renderGrid();
  }

  renderFilters() {
    const categories = ['all', '영상', '온라인', '브랜딩', 'SNS', 'OOH', '스크립트'];
    const labelsKo = {
      'all': 'ALL',
      '영상': '영상',
      '온라인': '온라인',
      '브랜딩': '브랜딩',
      'SNS': 'SNS',
      'OOH': 'OOH',
      '스크립트': '스크립트'
    };
    const labelsEn = {
      'all': 'ALL',
      '영상': 'Video',
      '온라인': 'Online',
      '브랜딩': 'Branding',
      'SNS': 'SNS',
      'OOH': 'OOH',
      '스크립트': 'Script'
    };

    const labels = this.currentLanguage === 'ko' ? labelsKo : labelsEn;

    this.filterContainer.innerHTML = '';

    categories.forEach(category => {
      const btn = createElement('button', 'portfolio-filter-btn');
      if (category === this.currentCategory) {
        btn.classList.add('active');
      }
      btn.textContent = labels[category];
      btn.addEventListener('click', () => this.filterByCategory(category));
      this.filterContainer.appendChild(btn);
    });

    // Handle layout after buttons are rendered
    requestAnimationFrame(() => this.handleFilterLayout());
  }

  handleFilterLayout() {
    const buttons = Array.from(this.filterContainer.querySelectorAll('.portfolio-filter-btn'));
    if (buttons.length === 0) return;

    const allButton = buttons[0];
    const otherButtons = buttons.slice(1);
    const containerWidth = this.filterContainer.offsetWidth;

    // Reset all buttons first
    buttons.forEach(btn => {
      btn.style.flex = '0 0 auto';
      btn.style.width = '';
    });

    // Calculate total width needed for all buttons in one row
    let totalWidth = 0;
    buttons.forEach(btn => {
      totalWidth += btn.offsetWidth + 8; // Include gap
    });

    // If all buttons fit on one row, we're done
    if (totalWidth <= containerWidth) {
      return;
    }

    // Calculate width for 3 buttons (to check if 3 can fit)
    const threeButtonWidth = buttons.slice(0, 3).reduce((sum, btn) => sum + btn.offsetWidth + 8, 0);

    // If 3 buttons can't fit, use ALL + 2-2-2 layout
    if (threeButtonWidth > containerWidth) {
      allButton.style.flex = '1 0 100%';

      // Make remaining 6 buttons equal width (33.333% each for 2-2-2 layout)
      const buttonWidth = `calc(${100 / 3}% - ${8 * 2 / 3}px)`;
      otherButtons.forEach(btn => {
        btn.style.flex = `0 0 ${buttonWidth}`;
        btn.style.width = buttonWidth;
      });
    }
  }

  filterByCategory(category) {
    this.currentCategory = category;
    this.renderFilters();
    this.renderGrid();
  }

  renderGrid() {
    const filteredData = this.currentCategory === 'all'
      ? portfolioData
      : portfolioData.filter(item => {
          const mediaTypes = item.mediaType.toLowerCase().split(',').map(t => t.trim());
          const mappedCategories = mediaTypes.map(type => categoryMap[type]).filter(Boolean);
          return mappedCategories.includes(this.currentCategory);
        });

    // Fade out
    this.gridElement.style.opacity = '0';

    // After fade out, replace content and fade in
    setTimeout(() => {
      this.gridElement.innerHTML = '';

      filteredData.forEach(item => {
        const originalIndex = portfolioData.indexOf(item);
        const itemElement = createElement('div', 'portfolio-item');
        itemElement.classList.add('portfolio-item-enter');
        itemElement.dataset.index = originalIndex.toString();

        const thumbnailPath = getThumbnailPath(item.id);
        const img = createElement('img');
        img.src = thumbnailPath;
        img.alt = languageManager.getContent(item.title, this.currentLanguage);
        itemElement.appendChild(img);

        itemElement.addEventListener('click', () => {
          this.modal.open(originalIndex, this.currentLanguage);
        });

        this.gridElement.appendChild(itemElement);
      });

      // Fade in grid
      requestAnimationFrame(() => {
        this.gridElement.style.opacity = '1';

        // Stagger the drop animation for each item
        const items = this.gridElement.querySelectorAll('.portfolio-item-enter');
        items.forEach((item, index) => {
          setTimeout(() => {
            item.classList.remove('portfolio-item-enter');
          }, index * 30); // 30ms stagger delay per item
        });
      });
    }, 200);
  }

  getElement() {
    this.container.innerHTML = '';
    this.container.appendChild(this.filterContainer);
    this.container.appendChild(this.gridElement);
    return this.container;
  }
}
