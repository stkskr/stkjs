import { stateManager } from '../core/state.js';
import { createElement } from '../utils/dom.js';
import { faqData, faqCategoryLabels } from '../data/faq.js';
import { languageManager } from '../core/language.js';

export class BottomTabs {
  constructor() {
    this.container = createElement('div', 'bottom-tabs');
    this.activeTab = null;
    this.language = 'ko';
    this.init();
    stateManager.subscribe((state) => this.handleStateChange(state));
  }

  init() {
    this.container.innerHTML = `
      <div class="bottom-tab-panel faq-panel">
        <div class="bottom-tabs-buttons">
          <button class="bottom-tab-btn faq-btn" data-tab="faq">
            <span class="tab-label">FAQ</span>
            <span class="tab-arrow">▲</span>
          </button>
        </div>
        <div class="bottom-tabs-content">
          <div class="bottom-tab-inner faq-inner"></div>
        </div>
      </div>

      <div class="bottom-tab-panel contact-panel">
        <div class="bottom-tabs-buttons">
          <button class="bottom-tab-btn contact-btn" data-tab="contact">
            <span class="tab-label">Contact</span>
            <span class="tab-arrow">▲</span>
          </button>
        </div>
        <div class="bottom-tabs-content">
          <div class="bottom-tab-inner contact-inner"></div>
        </div>
      </div>
    `;

    // Add event listeners
    const contactBtn = this.container.querySelector('.contact-btn');
    const faqBtn = this.container.querySelector('.faq-btn');

    contactBtn.addEventListener('click', () => this.openTab('contact'));
    faqBtn.addEventListener('click', () => this.openTab('faq'));
  }

  openTab(tab) {
    if (this.activeTab === tab) {
      this.closeTab();
      return;
    }

    this.activeTab = tab;
    this.container.classList.add('active');
    this.container.classList.remove('contact-active', 'faq-active');

    if (tab) {
      this.container.classList.add(`${tab}-active`);
      this.renderContent(tab);
      this.updateArrows();
    }
  }

  closeTab() {
    this.activeTab = null;
    this.container.classList.remove('active', 'contact-active', 'faq-active');
    this.updateArrows();
  }

  updateArrows() {
    const contactBtn = this.container.querySelector('.contact-btn');
    const faqBtn = this.container.querySelector('.faq-btn');

    const contactArrow = contactBtn?.querySelector('.tab-arrow');
    const faqArrow = faqBtn?.querySelector('.tab-arrow');

    if (contactArrow) {
      contactArrow.textContent = this.activeTab === 'contact' ? '▼' : '▲';
    }
    if (faqArrow) {
      faqArrow.textContent = this.activeTab === 'faq' ? '▼' : '▲';
    }
  }

  handleStateChange(state) {
    this.language = state.language;
    if (this.activeTab) {
      this.renderContent(this.activeTab);
    }
  }

  renderContent(tab) {
    if (tab === 'contact') {
      const inner = this.container.querySelector('.contact-inner');
      inner.innerHTML = this.renderContactContent();
    } else if (tab === 'faq') {
      const inner = this.container.querySelector('.faq-inner');
      inner.innerHTML = this.renderFaqContent();

      // Initialize category filter to show only first category (services)
      setTimeout(() => {
        const allFaqItems = this.container.querySelectorAll('.faq-item');
        allFaqItems.forEach(item => {
          if (item.dataset.category !== 'services') {
            item.style.display = 'none';
          }
        });

        // Update panel height based on initial content
        this.updateFaqPanelHeight();
      }, 0);
    }
  }

  updateFaqPanelHeight() {
    const faqPanel = this.container.querySelector('.faq-panel');
    const faqInner = this.container.querySelector('.faq-inner');

    if (!faqPanel || !faqInner) return;

    // Double requestAnimationFrame ensures DOM is fully painted after filtering
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // 1. Measure actual content height (the inner wrapper with padding)
        const contentHeight = faqInner.scrollHeight;

        // 2. Calculate total: Button(42px) + Content (already includes padding)
        const totalHeight = 42 + contentHeight;

        // 3. Set CSS variable - triggers smooth CSS transition
        faqPanel.style.setProperty('--faq-panel-height', `${totalHeight}px`);

        // Debug logging
        console.log('FAQ Panel Height Update:', {
          contentHeight,
          totalHeight,
          variable: faqPanel.style.getPropertyValue('--faq-panel-height')
        });
      });
    });
  }

  renderContactContent() {
    return `
      <div class="contact-content">
        <div class="contact-info">
          <h2>Contact</h2>

          <div class="contact-section">
            <h3>Phone:</h3>
            <p>02-793-7857</p>
          </div>

          <div class="contact-section">
            <h3>Email:</h3>
            <p>talk@stks.kr</p>
          </div>

          <div class="contact-section">
            <h3>Office:</h3>
            <p>서울 용산구<br>녹사평대로26길 42<br>스틱스앤스톤스 빌딩</p>
          </div>

          <div class="contact-section">
            <p class="contact-tagline">${this.language === 'ko'
              ? 'Words that stick, boosting brands. 글로벌 브랜딩과 마케팅에 특화된 영어 전문 카피라이팅 회사, 스틱스앤스톤스 서울.'
              : 'Words that stick, boosting brands. A specialized English copywriting agency for global branding and marketing, Sticks & Stones Seoul.'
            }</p>
          </div>

          <div class="contact-section">
            <p>(주)스틱스앤스톤스 119-88-00409<br>대표자: Richard King Kim</p>
          </div>
        </div>

        <div class="contact-map">
          <iframe
            src="https://www.google.com/maps?q=서울특별시+용산구+녹사평대로26길+42&output=embed"
            width="100%"
            height="100%"
            style="border:0;"
            allowfullscreen=""
            loading="lazy">
          </iframe>
        </div>
      </div>
    `;
  }

  renderFaqContent() {
    // Get categories in order
    const categories = ['services', 'pricing', 'process', 'legal', 'other'];

    // Get localized FAQs
    const faqs = faqData.map(faq => ({
      category: faq.category,
      question: languageManager.getContent(faq.question, this.language),
      answer: languageManager.getContent(faq.answer, this.language),
    }));

    return `
      <div class="faq-content">
        <div class="faq-categories">
          ${categories.map((category, index) => `
            <button class="faq-category-btn ${index === 0 ? 'active' : ''}" data-category="${category}">
              ${languageManager.getContent(faqCategoryLabels[category], this.language)}
            </button>
          `).join('')}
        </div>

        <div class="faq-list">
          ${faqs.map((faq, index) => `
            <div class="faq-item ${index === 0 ? 'open' : ''}" data-category="${faq.category}">
              <button class="faq-question">
                <span class="faq-q-icon">Q</span>
                <span class="faq-q-text">${faq.question}</span>
                <span class="faq-toggle">${index === 0 ? '▲' : '▼'}</span>
              </button>
              <div class="faq-answer">
                <p>${faq.answer}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  mount(parent) {
    parent.appendChild(this.container);

    // Add FAQ accordion functionality after mounting
    this.container.addEventListener('click', (e) => {
      const target = e.target;
      const questionBtn = target.closest('.faq-question');
      const categoryBtn = target.closest('.faq-category-btn');

      // Handle FAQ accordion toggle
      if (questionBtn) {
        const faqItem = questionBtn.closest('.faq-item');
        const toggle = questionBtn.querySelector('.faq-toggle');
        const isOpen = faqItem.classList.contains('open');

        if (isOpen) {
          faqItem.classList.remove('open');
          toggle.textContent = '▼';
        } else {
          faqItem.classList.add('open');
          toggle.textContent = '▲';
        }

        // Update panel height after accordion state changes
        this.updateFaqPanelHeight();
      }

      // Handle category filtering
      if (categoryBtn) {
        const selectedCategory = categoryBtn.dataset.category;

        // Update active button
        const allCategoryBtns = this.container.querySelectorAll('.faq-category-btn');
        allCategoryBtns.forEach(btn => btn.classList.remove('active'));
        categoryBtn.classList.add('active');

        // Filter FAQ items
        const allFaqItems = this.container.querySelectorAll('.faq-item');
        allFaqItems.forEach(item => {
          if (item.dataset.category === selectedCategory) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });

        // Update FAQ panel height based on visible content
        this.updateFaqPanelHeight();
      }
    });
  }
}
