# Testimonials Feature - Code Reference

This document contains all the relevant code for the testimonials grid feature on the Clients page.

## 1. Data Structure

### `/src/data/testimonials.js`

```javascript
export const testimonials = [
  {
    quote: {
      ko: '해외의 감도와 한국적 맥락을 모두 이해하는, 보기 드문 감각의 팀입니다.',
      en: 'Sticks elevates brands to global success, while preserving key regional nuances.',
    },
    author: {
      ko: 'Sam Seoul 이해승 이사님',
      en: 'Innocean Kim Jeong Hwan, NEXT Group',
    },
  },
  {
    quote: {
      ko: '브랜드를 이해하는 실력과 매력적으로 표현하는 센스를 겸비한 팀',
      en: 'Detailed, precise word choices. I knew we met the right partner.',
    },
    author: {
      ko: 'TBWA 오혜주 수석국장',
      en: 'SK Planet Yun Tae Gu, Director',
    },
  },
  {
    quote: {
      ko: '각 나라마다의 독특한 문화코드를 심어 클라이언트의 사업을 성공으로 이끕니다.',
      en: 'A rare team with creative sensibility fluent in global style, yet grounded in Korean insight.',
    },
    author: {
      ko: 'Innocean 김정환 NEXT 그룹장',
      en: 'Sam Seoul Lee Hae-seung',
    },
  },
  {
    quote: {
      ko: '단어의 작은 뉘앙스 차이조차 놓치지 않는 섬세함. 일하는 내내 좋은 파트너를 만났다는 즐거움을 느끼게 해주었습니다.',
      en: 'Sticks & Stones\' multi-angle analysis of client challenges was a huge help in getting internal approval.',
    },
    author: {
      ko: 'SK Planet 윤태구 국장',
      en: 'TBWA Hong Min-ji',
    },
  },
  {
    quote: {
      ko: '클라이언트의 고민을 다각도로 점검해주셔서 내부 설득에 큰 도움이 되었어요.',
      en: 'Working with Sticks & Stones always adds excitement to every project!',
    },
    author: {
      ko: 'TBWA 홍민지 부장',
      en: 'Dexter Krema Song Eun Hye, Senior Director',
    },
  },
  {
    quote: {
      ko: '스틱스앤스톤스와 함께하는 작업은 늘 즐겁다!',
      en: 'A team that pairs brand insight with an instinct for magnetic expression.',
    },
    author: {
      ko: 'Dexter Krema 송은혜 차장',
      en: 'TBWA Oh Hye-joo',
    },
  },
  {
    quote: {
      ko: '세심한 제안과 열정적 지원으로, 프로젝트 내내 든든한 파트너십을 느낄 수 있었습니다.',
      en: 'Detail까지 챙겨주시는 세심함과 Customized Solution을 제시해 주시는 완벽함.',
    },
    author: {
      ko: 'Innocean 이유진 매니저',
      en: 'SK Chemical 강양리 대리',
    },
  },
  {
    quote: {
      ko: '프로젝트 기간 내내 문제를 함께 고민하고 해결하려는 열정과 파트너십에 감명 받았습니다.',
      en: 'Throughout the project, I was impressed by their passion for solving challenges together.',
    },
    author: {
      ko: 'SK Planet 박지연 플래너',
      en: 'SK Planet Park Ji-yeon, Planner',
    },
  },
];
```

## 2. Component

### `/src/components/TestimonialsGrid.js`

```javascript
import { createElement } from '../utils/dom.js';
import { languageManager } from '../core/language.js';
import { testimonials } from '../data/testimonials.js';

export class TestimonialsGrid {
  constructor() {
    this.element = createElement('div', 'testimonials-section');
    this.language = 'ko';
  }

  render(language) {
    this.language = language;

    const grid = createElement('div', 'testimonials-grid');

    testimonials.forEach((testimonial) => {
      const card = createElement('div', 'testimonial-card');

      // Laurel icon
      const laurelDiv = createElement('div', 'testimonial-laurel');
      laurelDiv.innerHTML = `
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 256 256" enable-background="new 0 0 256 256" xml:space="preserve">
          <path fill="currentColor" d="M94,13.3c-14.7,1.8-24,8.9-26.7,20c-0.4,1.7-0.7,5.2-0.7,7.9V46l-3.8,5c-4.6,6.2-8.3,12.3-11.8,19.7c-1.5,3.1-2.8,5.8-2.9,5.9c-0.3,0.4-3.5-3.6-5-6.4c-1.3-2.5-1.5-3.3-1.6-6.4c0-3.4,0-3.6,1.3-4.3c1.2-0.7,1.4-0.7,2.6,0.2c1.1,0.8,1.4,1.5,1.6,3.6c0.3,2.5,1.5,5.7,2.2,5.7c0.2,0,0.6-1,1-2.2c0.3-1.2,1.4-4.1,2.4-6.6c3-7,3.5-9.4,3.2-14.1c-0.2-4.3-1.7-9.1-3.2-10.8c-1.7-1.7-3.8-1.2-7.5,1.9C38.6,42.6,33.4,49.1,31,55c-4.1,9.8-0.7,20.3,9,28.1c1.9,1.5,3.8,3,4,3.3c0.5,0.4,0.4,1.4-0.5,5c-2.6,10.4-3.8,22.8-3.2,32.9c0.2,3.3,0.3,6,0.2,6.1c0,0.1-1.4-0.1-3-0.6c-7.6-2-14.7-7.7-13.4-10.9c1-2.5,3.5-2.4,6.2,0.5c1.9,2,6,4.4,7.4,4.4c0.3,0,0.2-1.2-0.3-3.5c-0.5-1.9-1.4-5.6-2-8.3c-0.6-2.7-1.9-6.3-2.7-8c-1.9-4-6.1-8.5-10-10.9c-5.2-3-6.9-2.3-8.7,4c-5.8,20.1,0,34.8,15.6,39.8c2.1,0.7,5.8,1.3,8.1,1.5l4.2,0.3l1.1,4.5c1.8,7.6,5,16.1,8.5,23.1l3.4,6.8l-2.5,0.2c-5.8,0.6-12.4-1.1-16.6-4.3c-2.7-2-3.3-3.8-1.9-5.4c1.2-1.3,2.6-1.1,5.4,0.8c2.7,1.8,6.9,3.2,8.9,3c1.2-0.1,1.1-0.2-2.2-4.7c-6.5-8.5-11.6-12.7-18-14.9c-2.7-1-4.1-1.1-9.8-1.1c-6.5,0-6.6,0-7.6,1.2c-0.8,1-0.9,1.6-0.6,4.2c1.4,12.8,8.2,23.3,18.5,28.3c5,2.4,8.4,3.2,15.3,3.5c5,0.2,7,0,10.7-0.7c2.5-0.5,4.9-1.1,5.3-1.2c0.5-0.2,1.6,0.8,3.8,3.6c6,7.8,18.7,19.8,24.9,23.6c1,0.6,1.8,1.3,1.8,1.6c0,0.7-5.4,3-9.2,4c-6.8,1.7-18.1,1.6-19.9-0.2c-1-1-1.1-2.6-0.4-3.8c0.4-0.6,1.9-0.7,8.2-0.8c4.8,0,8.7-0.2,10.1-0.7c2.4-0.6,3.9-1.4,2.6-1.4c-0.4,0-3.8-1.7-7.7-3.9c-9.9-5.4-13.6-6.7-20.1-7c-6-0.2-10,0.5-15.5,3c-5.3,2.5-5.8,3.7-3.3,8.3c5,9.5,15,17.3,24.7,19.3c4.7,1,12.7,0.7,17.6-0.8c4.8-1.3,12.3-5,16.8-8.3c2-1.5,4.1-2.7,4.6-2.7c0.5,0,2.8,0.9,5.1,2c2.3,1,5.1,2.3,6.3,2.8c1.2,0.5,3.2,1.3,4.5,1.9l2.4,1l-5.9,2.9c-6.5,3.1-12.8,7-15.2,9.7c-2,2.1-2.1,4.3-0.3,5.9c1.9,1.6,3.1,1.4,6.7-1.5c1.8-1.4,5.2-3.7,7.6-5c4.7-2.6,16.4-7.6,17.8-7.6c1.4,0,13.1,5,17.8,7.6c2.4,1.3,5.8,3.6,7.6,5c3.6,2.9,4.9,3.1,6.7,1.5c1.9-1.6,1.8-3.8-0.3-5.9c-2.5-2.6-9.3-6.9-15.4-9.7c-3-1.4-5.5-2.7-5.5-2.9c0-0.1,1.3-0.8,3-1.4c1.6-0.6,5.7-2.4,9.1-3.9l6.2-2.8l1.4,1c6.6,4.9,13.7,8.7,19.8,10.4c5.5,1.6,13,1.8,18.2,0.5c10.5-2.5,19.4-9.8,24.6-19.9c1.8-3.6,1.3-5-2.6-6.9c-5.6-2.8-8.6-3.5-15.5-3.5c-6,0-6.7,0.1-10.4,1.5c-2.1,0.9-7.1,3.2-11,5.3c-3.9,2.1-7.3,3.9-7.7,3.9c-1.2,0,0.2,0.8,2.6,1.4c1.5,0.4,5.3,0.7,10.1,0.7c6.3,0,7.8,0.2,8.2,0.8c0.7,1.1,0.5,2.8-0.4,3.8c-1.8,1.8-13.1,2-19.9,0.2c-3.7-0.9-9.2-3.2-9.2-3.9c0-0.2,1.2-1.2,2.7-2.3c7.3-5,18-15.2,24-23c2.2-2.9,3.2-3.9,3.8-3.6c0.4,0.1,2.8,0.7,5.3,1.2c3.7,0.8,5.7,0.9,10.7,0.7c6.9-0.3,10.3-1,15.1-3.4c10-5,16.6-14.4,18.5-26.7c1-6.8,0-7.7-9-7.3c-4.5,0.1-6.7,0.5-9,1.3c-6.2,2.2-11.3,6.4-17.7,14.8c-3.4,4.4-3.5,4.5-2.2,4.7c2,0.2,6.1-1.2,8.9-3c2.8-1.9,4.2-2.1,5.4-0.8c1.4,1.6,0.8,3.4-1.9,5.4c-4.2,3.2-10.9,4.9-16.6,4.3l-2.5-0.2l3.4-6.8c3.5-7,6.7-15.5,8.5-23.1l1.1-4.5l3.8-0.3c16.7-1.2,26.3-11.1,26.4-26.9c0-6.4-2.4-17.4-4.3-19.3c-0.5-0.5-1.5-0.9-2.2-0.9c-2,0-7,3.2-10.1,6.5c-3.5,3.7-5.4,7.6-6.9,14c-0.7,2.8-1.6,6.6-2.1,8.4c-0.6,2.3-0.7,3.5-0.3,3.5c1.4,0,5.5-2.5,7.4-4.4c2.8-2.9,4.8-3,6.1-0.4c1.6,3-5.7,8.9-13.3,10.9c-1.6,0.4-3,0.7-3,0.6c-0.1-0.1,0-2.6,0.2-5.6c0.7-11.1-0.9-25.8-4.1-36.9c-0.2-0.8,0.4-1.6,3.5-4c7.8-6.2,11.5-12.7,11.5-20.1c0-4.3-0.6-6.7-2.7-10.9c-2.8-5.5-7-10.4-13.3-15.6c-5.3-4.4-7.5-3.7-9.6,3.1c-1.8,5.7-1.5,10.5,1,16.8c1,2.5,2.4,6.2,3,8.2c0.7,2,1.5,3.7,1.7,3.7c0.7,0,2.2-4,2.2-6c0-3.1,2.3-4.7,4.6-3.2c1.1,0.8,1.2,1,1,4.2c-0.2,2.7-0.6,4-1.8,6.3c-1.7,3.1-4.9,6.9-5.2,6c-0.1-0.3-1.6-3.5-3.4-7.1c-3.3-6.7-8.3-14.8-12.4-19.9l-2.2-2.9l-0.2-6.4c-0.2-5.4-0.4-7-1.5-9.7c-2.4-6.2-6.1-10.1-12.5-13.2c-6-2.9-13.5-4.3-22.7-4.3c-5,0-6.8,0.6-7.6,2.4c-0.7,1.6-0.5,2.8,1.5,9c3.7,11.6,9,19.2,16.3,23.7c4.8,2.8,8.1,3.7,15.2,3.8l6.2,0.1l3.2,4.5c1.8,2.5,4.5,6.4,5.9,8.9c2.4,4,6.9,12.9,6.9,13.7c0,1-4.3-3.3-9-8.7c-7.7-9-11.9-11.9-19.8-13.3c-4.1-0.7-11-0.6-12.7,0.3c-1.1,0.6-2,3-1.6,4.2c0.1,0.4,1.5,2.1,3,3.7c1.5,1.6,4.5,5.4,6.7,8.6c9,12.9,14.7,16.1,28.1,16.1c3.5,0,7-0.1,7.7-0.3c1.2-0.3,1.3-0.2,1.8,1.4c2.2,8.1,4,21.8,3.7,29.4l-0.1,4.3l-1.6-5c-3.9-12.4-6.2-17.3-10.1-21.3c-4.6-4.7-12.7-6.8-14.9-3.9c-0.9,1.2-1,1.5-0.4,4.5c0.3,1.8,0.7,7.6,1,12.8c0.2,5.2,0.7,10.4,1,11.4c2,6.8,7.6,11.1,18.4,13.9l4.8,1.2l-0.6,2.5c-1.8,7.7-4.3,14.5-8.1,22.2l-2.9,6l-0.3-10c-0.2-8.9-0.4-10.3-1.3-12.8c-2-5.1-6-9-12.3-12.2c-3.5-1.7-4.8-1.9-6.2-0.5c-1.2,1.1-1.4,1.8-1.7,6.9c-0.1,2.1-0.8,6.6-1.5,10c-0.7,3.6-1.2,7.9-1.2,10.2c0,3.6,0.1,4.3,1.6,7.1c2,3.8,5.4,6.8,11.3,9.6c2.2,1.1,4.2,2,4.3,2.1c0.4,0.3-4,5.7-8.7,10.5c-5,5.2-14.2,13-14.4,12.2c-0.1-0.2,0.6-2.1,1.5-4c2-4.3,3.4-8.8,3.9-12.1c0.7-5.3-1.7-12.1-6.5-18.5c-3-3.9-4.3-4.8-6.5-4c-1.2,0.4-1.8,1.2-3.1,4c-0.9,1.9-3.3,5.9-5.5,8.9c-2.1,3-4.5,6.8-5.4,8.5c-1.4,2.8-1.5,3.5-1.5,7.4c0,4,0.1,4.6,1.8,7.9c1,1.9,3,5.1,4.4,7c1.4,1.9,2.6,3.5,2.6,3.7c0,0.6-20.4,8.9-21.9,8.9c-1.5,0-22-8.3-22-8.9c0-0.1,1.2-1.8,2.6-3.7c3.9-5,6-9.7,6.3-13.7c0.3-5-0.7-7.6-6.5-16.2c-2.8-4-5.6-8.7-6.3-10.3c-1-2.2-1.7-3-2.8-3.5c-2.1-0.9-3.7,0-6.7,4c-5.1,6.8-7.2,13.3-6.3,19.6c0.5,3.3,2.3,8.6,4.4,12.6c0.5,1,0.9,2.1,0.8,2.4c-0.3,0.8-9.4-6.8-14.5-12.1c-4.7-4.9-9.1-10.2-8.7-10.5c0.1-0.1,2-1,4.3-2.1c5.9-2.9,9.3-5.8,11.3-9.6c1.5-2.8,1.6-3.5,1.6-7.1c0-2.4-0.6-7-1.5-11.5c-0.8-4.1-1.4-8.9-1.4-10.4c0-1.6-0.3-3.5-0.7-4.2c-1.2-2.4-2.9-2.5-7-0.5c-6.6,3.3-10.9,7.9-12.8,13.7c-0.9,2.8-1,4.2-1,12.2l0,9l-1.6-2.9c-3.3-5.8-7.8-17.4-9.5-24.9l-0.7-3l1.2-0.3c10.2-2.2,16.5-5.4,19.6-10c2.5-3.5,2.9-5.7,3.3-16.1c0.2-5.2,0.7-11,1-12.8c0.5-3,0.5-3.3-0.3-4.5c-1.9-2.5-7.5-1.7-12.5,1.8c-4.8,3.3-8.4,10-11.9,21.7c-0.8,2.9-1.7,5.6-2,6c-0.7,1.1,0-14.6,0.8-20.5c0.7-4.5,2.8-13.6,3.2-14.1c0-0.1,2.1,0,4.4,0.3c7.3,0.8,14.6-0.3,19.9-3c3.9-2,7.7-5.9,12.6-12.9c2.2-3,5.2-6.9,6.7-8.6c1.5-1.7,2.9-3.4,3.1-3.8c0.4-1.1-0.5-3.6-1.6-4.2c-1.7-0.9-8.5-1-12.7-0.3c-7.9,1.4-12.1,4.2-19.9,13.4c-4.9,5.6-8.8,9.5-8.8,8.5c0-0.9,4.8-10.2,7.3-14.4c1.5-2.5,4.1-6.3,5.8-8.6l3.1-4.2l3.9,0.2c14.2,0.9,25.7-7.2,31.7-22.3c1.6-4,3.9-11.5,3.9-12.8c0-0.5-0.5-1.5-1.1-2.2c-1.1-1.3-1.2-1.3-7-1.4C100,12.9,95.8,13.1,94,13.3z"/>
        </svg>
      `;

      const quoteText = languageManager.getContent(testimonial.quote, language);
      const authorText = languageManager.getContent(testimonial.author, language);

      const contentDiv = createElement('div', 'testimonial-content');

      const quoteP = createElement('p', 'testimonial-quote');
      quoteP.textContent = quoteText;

      const authorP = createElement('p', 'testimonial-author');
      authorP.textContent = authorText;

      contentDiv.appendChild(quoteP);
      contentDiv.appendChild(authorP);

      card.appendChild(laurelDiv);
      card.appendChild(contentDiv);

      grid.appendChild(card);
    });

    this.element.innerHTML = '';
    this.element.appendChild(grid);
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
```

## 3. Styles

### `/src/styles/content.css` (Testimonials Section)

```css
/* ===================================
   Testimonials Grid
   =================================== */

.testimonials-section {
  width: 100%;
  max-width: 1000px;
  margin: 100px auto;
  padding: 0 60px;
}

.testimonials-grid {
  display: flex;
  flex-direction: column;
  gap: 35px;
}

.testimonial-card {
  display: flex;
  align-items: flex-start;
  gap: 22px;
  padding: 15px 0;
  transition: background-color 0.2s ease;
  cursor: default;
}

/* Alternating subtle background colors */
.testimonial-card:nth-child(odd) {
  background-color: rgba(0, 0, 0, 0.015);
}

.testimonial-card:nth-child(even) {
  background-color: rgba(0, 0, 0, 0.008);
}

.testimonial-laurel {
  width: 42px;
  height: 42px;
  color: #888;
  flex-shrink: 0;
  opacity: 0.7;
  transition: opacity 0.2s ease, color 0.2s ease;
  margin-top: 2px;
}

.testimonial-card:hover .testimonial-laurel {
  opacity: 1;
  color: #444;
}

.testimonial-laurel svg {
  width: 100%;
  height: 100%;
}

.testimonial-content {
  flex: 1;
  min-width: 0;
}

.testimonial-quote {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #2a2a2a;
  margin: 0 0 6px 0;
  font-weight: 400;
}

.testimonial-author {
  font-size: 0.85rem;
  color: #555;
  margin: 0;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .testimonials-section {
    max-width: 900px;
    padding: 0 40px;
  }
}

@media (max-width: 900px) {
  .testimonials-section {
    padding: 0 30px;
    margin: 70px auto;
  }

  .testimonials-grid {
    gap: 30px;
  }

  .testimonial-card {
    padding: 12px 0;
  }

  .testimonial-laurel {
    width: 38px;
    height: 38px;
  }

  .testimonial-quote {
    font-size: 0.9rem;
    line-height: 1.55;
  }

  .testimonial-author {
    font-size: 0.8rem;
  }
}
```

## 4. Integration

### `/src/components/Content.js` (relevant section)

```javascript
import { TestimonialsGrid } from './TestimonialsGrid.js';

export class Content {
  constructor() {
    // ... other components
    this.testimonialsGrid = new TestimonialsGrid();
  }

  renderClients(language) {
    this.innerElement.innerHTML = '';

    // Add quote carousel
    this.quoteCarousel.mount(this.innerElement);

    // Add testimonials grid
    this.testimonialsGrid.render(language);
    this.testimonialsGrid.mount(this.innerElement);

    // Add CTA after testimonials
    const ctaDiv = createElement('div');
    ctaDiv.innerHTML = this.renderCallToAction(language);
    this.innerElement.appendChild(ctaDiv);
  }
}
```

## Features

- **Bilingual Support**: Korean and English content switching
- **Alternating Background Colors**: Subtle visual rhythm with `nth-child` selectors
- **Hover Effects**: Laurel icon darkens on hover
- **Responsive Design**: Adapts layout for mobile devices
- **Clean Typography**: Carefully chosen font sizes and line heights
- **Accessibility**: Proper semantic HTML structure

## Assets Required

- `/public/assets/images/laurel.svg` - Laurel wreath icon (included in component as inline SVG)
