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

    // Listen for custom event to open contact tab from anywhere
    window.addEventListener('openContactTab', () => this.openTab('contact'));
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

      // Update contact panel height after content renders
      setTimeout(() => {
        this.updateContactPanelHeight();
      }, 0);
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
    // Skip on mobile - use fixed viewport heights
    if (window.innerWidth <= 768) return;

    const faqPanel = this.container.querySelector('.faq-panel');
    const faqMeasureContainer = this.container.querySelector('.faq-measure-container');

    if (!faqPanel || !faqMeasureContainer) return;

    // Double requestAnimationFrame ensures DOM is fully painted after filtering
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // 1. Measure actual content height from the measure container
        const contentHeight = faqMeasureContainer.scrollHeight;

        // 2. Calculate total: Button(42px) + Content + Bottom Buffer(30px)
        const totalHeight = 42 + contentHeight + 70;

        // 3. Set CSS variable - triggers smooth CSS transition
        faqPanel.style.setProperty('--faq-panel-height', `${totalHeight}px`);
      });
    });
  }

  updateContactPanelHeight() {
    // Skip on mobile - use fixed viewport heights
    if (window.innerWidth <= 768) return;

    const contactPanel = this.container.querySelector('.contact-panel');
    const contactMeasureContainer = this.container.querySelector('.contact-measure-container');

    if (!contactPanel || !contactMeasureContainer) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Measure actual content height from the measure container
        const contentHeight = contactMeasureContainer.scrollHeight;

        // Calculate total: Button(42px) + Content + Bottom Buffer(30px)
        const totalHeight = 42 + contentHeight + 70;

        // Set CSS variable for smooth transition
        contactPanel.style.setProperty('--contact-panel-height', `${totalHeight}px`);
      });
    });
  }

  setupResizeObserver() {
    // Skip on mobile - use fixed viewport heights
    if (window.innerWidth <= 768) return;

    // Track the last set height to prevent redundant updates
    this.lastFaqHeight = 0;
    this.lastContactHeight = 0;

    // Create ResizeObserver to automatically update panel heights when content changes
    this.resizeObserver = new ResizeObserver((entries) => {
      // Wrap in requestAnimationFrame to avoid "ResizeObserver loop limit exceeded" error
      window.requestAnimationFrame(() => {
        for (const entry of entries) {
          const element = entry.target;

          /* CRITICAL FIX: Use scrollHeight of the inner content.
             contentRect.height is the *observed* box, which is affected by
             the parent's height and clipping. scrollHeight is the *natural* size.
          */
          const contentHeight = element.scrollHeight;
          const totalHeight = 42 + contentHeight + 70; // Button + Content + Bottom Buffer

          // Determine which panel this observer is watching
          if (element.classList.contains('faq-measure-container')) {
            // Only update if the change is significant (> 1px difference)
            if (Math.abs(this.lastFaqHeight - totalHeight) > 1) {
              this.lastFaqHeight = totalHeight;
              const faqPanel = this.container.querySelector('.faq-panel');
              if (faqPanel) {
                faqPanel.style.setProperty('--faq-panel-height', `${totalHeight}px`);
              }
            }
          } else if (element.classList.contains('contact-measure-container')) {
            // Only update if the change is significant (> 1px difference)
            if (Math.abs(this.lastContactHeight - totalHeight) > 1) {
              this.lastContactHeight = totalHeight;
              const contactPanel = this.container.querySelector('.contact-panel');
              if (contactPanel) {
                contactPanel.style.setProperty('--contact-panel-height', `${totalHeight}px`);
              }
            }
          }
        }
      });
    });

    // Observe FAQ and Contact measure containers
    const faqMeasureContainer = this.container.querySelector('.faq-measure-container');
    const contactMeasureContainer = this.container.querySelector('.contact-measure-container');

    if (faqMeasureContainer) {
      this.resizeObserver.observe(faqMeasureContainer);
    }
    if (contactMeasureContainer) {
      this.resizeObserver.observe(contactMeasureContainer);
    }

    // Clean up observer on window resize if switching to mobile
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768 && this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      } else if (window.innerWidth > 768 && !this.resizeObserver) {
        this.setupResizeObserver();
      }
    });
  }

  renderContactContent() {
    return `
      <div class="contact-measure-container">
        <div class="contact-content">
          <div class="contact-info">
            <h2>Contact</h2>

            <div class="contact-section">
              <h3>Phone:</h3>
              <p>02-793-7857</p>
            </div>

            <div class="contact-section">
              <h3>Email:</h3>
              <div class="copyable-container">
                <p>talk@stks.kr</p>
                <button class="copy-btn" data-copy="talk@stks.kr" aria-label="Copy email">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span class="copy-tooltip"></span>
                </button>
              </div>
            </div>

            <div class="contact-section">
              <h3>Office:</h3>
              <div class="copyable-container">
                <p>${this.language === 'ko'
                  ?'서울 용산구<br>녹사평대로26길 42<br>스틱스앤스톤스 빌딩'
                  : '42, Noksapyeong-daero 26-gil, <br>Yongsan-gu, Seoul, <br>Republic of Korea'}</p>
                <button class="copy-btn" data-copy="${this.language === 'ko' ? '서울 용산구 녹사평대로26길 42 스틱스앤스톤스 빌딩' : '42, Noksapyeong-daero 26-gil, Yongsan-gu, Seoul, Republic of Korea'}" aria-label="Copy address">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span class="copy-tooltip"></span>
                </button>
              </div>
            </div>

            <div class="contact-section">
              <p class="contact-tagline">${this.language === 'ko'
                ? 'Words that stick, boosting brands. <br> 글로벌 브랜딩과 마케팅에 특화된 영어 전문 카피라이팅 회사, 스틱스앤스톤스 서울.'
                : 'Words that stick, boosting brands. <br> A specialized English copywriting agency for global branding and marketing, Sticks & Stones Seoul.'
              }</p>
            </div>

            <div class="contact-section">
              <p>${this.language === 'ko'
                ?'(주)스틱스앤스톤스 119-88-00409<br>대표자: Richard King Kim'
                : 'Sticks and Stones 119-88-00409<br>CEO: Richard King Kim'}</p>
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
      <div class="faq-measure-container">
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
      </div>
    `;
  }

  mount(parent) {
    parent.appendChild(this.container);

    // Set up ResizeObserver for automatic height updates (desktop only)
    this.setupResizeObserver();

    // Add copy functionality - works for both button and container clicks
    this.container.addEventListener('click', (e) => {
      const copyableContainer = e.target.closest('.copyable-container');
      if (copyableContainer) {
        const copyBtn = copyableContainer.querySelector('.copy-btn');
        if (copyBtn) {
          const textToCopy = copyBtn.dataset.copy;
          const tooltip = copyBtn.querySelector('.copy-tooltip');

          navigator.clipboard.writeText(textToCopy).then(() => {
            // Show tooltip with language-specific message
            tooltip.textContent = this.language === 'ko' ? '복사 완료!' : 'Copied!';
            tooltip.classList.add('show');

            // Hide tooltip after 2 seconds
            setTimeout(() => {
              tooltip.classList.remove('show');
            }, 2000);
          }).catch(err => {
            console.error('Failed to copy:', err);
          });
        }
      }
    });

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

        // Update panel height after accordion animation completes (250ms transition + buffer)
        setTimeout(() => {
          this.updateFaqPanelHeight();
        }, 300);
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
