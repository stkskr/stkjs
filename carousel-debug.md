# Portfolio Modal Carousel Issue

## Problem
The carousel images in the portfolio modal are not displaying for items with multiple images (e.g., innisfree with 3 images, SEVENTEEN with 2 images).

## Expected Behavior
- Carousel should display the first image on load
- Clicking prev/next buttons should slide between images with animation
- Indicators should show which image is active

## Current Behavior
- Carousel container appears but images are not visible
- Need to debug why images aren't showing

---

## Relevant Code

### 1. ModalPortfolio.js - Carousel Rendering
```javascript
renderModalContent(item, language) {
  // ... other code ...

  if (item.videoUrl) {
    // Video rendering (works fine)
  } else {
    // Get full images (carousel or single)
    const images = getFullImages(item.id);

    if (images.length === 1) {
      // Single image (works fine)
      mediaContent = `
        <div class="modal-image-container">
          <img src="${images[0]}" alt="${title}" />
        </div>
      `;
    } else {
      // Carousel - THIS IS THE ISSUE
      mediaContent = `
        <div class="modal-carousel-container">
          <div class="modal-carousel">
            ${images.map((img, idx) => `
              <div class="modal-carousel-item ${idx === 0 ? 'active' : ''}">
                <img src="${img}" alt="${title} ${idx + 1}" />
              </div>
            `).join('')}
          </div>
          ${images.length > 1 ? `
            <button class="modal-carousel-prev" aria-label="Previous image">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="modal-carousel-next" aria-label="Next image">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="modal-carousel-indicators">
              ${images.map((_, idx) => `
                <button class="modal-carousel-indicator ${idx === 0 ? 'active' : ''}" data-index="${idx}"></button>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }
  }

  return `
    ${mediaContent}
    <div class="modal-info">...</div>
    <div class="modal-meta">...</div>
  `;
}
```

### 2. ModalPortfolio.js - Carousel Animation Logic
```javascript
attachCarouselListeners() {
  const carouselContainer = this.element.querySelector('.modal-carousel-container');
  if (!carouselContainer) return;

  const items = carouselContainer.querySelectorAll('.modal-carousel-item');
  const indicators = carouselContainer.querySelectorAll('.modal-carousel-indicator');
  const prevBtn = carouselContainer.querySelector('.modal-carousel-prev');
  const nextBtn = carouselContainer.querySelector('.modal-carousel-next');

  if (items.length <= 1) return;

  let currentIndex = 0;

  const showSlide = (index) => {
    const direction = index > currentIndex ? 'next' : 'prev';
    const currentItem = items[currentIndex];
    const nextItem = items[index];

    // Add exit animation to current item
    if (currentItem) {
      currentItem.classList.add(`exit-${direction}`);
      currentItem.classList.remove('active');
    }

    // Add enter animation to next item
    if (nextItem) {
      nextItem.classList.add(`enter-${direction}`, 'active');
    }

    // Clean up animation classes after transition
    setTimeout(() => {
      items.forEach((item) => {
        item.classList.remove('exit-next', 'exit-prev', 'enter-next', 'enter-prev');
      });
    }, 400);

    indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === index);
    });
    currentIndex = index;
  };

  prevBtn?.addEventListener('click', () => {
    const newIndex = (currentIndex - 1 + items.length) % items.length;
    showSlide(newIndex);
  });

  nextBtn?.addEventListener('click', () => {
    const newIndex = (currentIndex + 1) % items.length;
    showSlide(newIndex);
  });

  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      showSlide(index);
    });
  });
}
```

### 3. CSS - Carousel Container
```css
/* Modal Carousel */
.modal-carousel-container {
  width: 100%;
  margin-bottom: 40px;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f5f5;
}

.modal-carousel-container::before {
  content: '';
  display: block;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 aspect ratio placeholder */
}

.modal-carousel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.modal-carousel-item {
  display: none;
  width: 100%;
  height: 100%;
}

.modal-carousel-item.active {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
}

.modal-carousel-item.exit-next,
.modal-carousel-item.exit-prev {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
}

.modal-carousel-item img {
  width: 100%;
  height: auto;
  max-height: 70vh;
  object-fit: contain;
  display: block;
}

/* Carousel slide animations */
.modal-carousel-item.enter-next {
  animation: slideInFromRight 0.4s ease-out;
}

.modal-carousel-item.enter-prev {
  animation: slideInFromLeft 0.4s ease-out;
}

.modal-carousel-item.exit-next {
  animation: slideOutToLeft 0.4s ease-out;
}

.modal-carousel-item.exit-prev {
  animation: slideOutToRight 0.4s ease-out;
}

@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInFromLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutToLeft {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

@keyframes slideOutToRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.modal-carousel-container:has(.modal-carousel-item.active img[src]) {
  background: transparent;
}

.modal-carousel-container:has(.modal-carousel-item.active img[src])::before {
  display: none;
}
```

### 4. CSS - Carousel Controls
```css
.modal-carousel-prev,
.modal-carousel-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: background 200ms ease;
}

.modal-carousel-prev:hover,
.modal-carousel-next:hover {
  background: rgba(0, 0, 0, 0.7);
}

.modal-carousel-prev {
  left: 20px;
}

.modal-carousel-next {
  right: 20px;
}

.modal-carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.modal-carousel-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: background 200ms ease;
}

.modal-carousel-indicator.active {
  background: white;
}
```

---

## Test Cases

### innisfree-brand-slogan
- **ID**: `innisfree-brand-slogan`
- **Images**: 3 images
  - `/assets/portfolio/slider/14_innisfree-brand-slogan_01.jpg`
  - `/assets/portfolio/slider/14_innisfree-brand-slogan_02.jpg`
  - `/assets/portfolio/slider/14_innisfree-brand-slogan_03.jpg`

### seventeen-album
- **ID**: `seventeen-album`
- **Images**: 2 images
  - `/assets/portfolio/slider/12_seventeen-album_01.jpg`
  - `/assets/portfolio/slider/12_seventeen-album_02.jpg`

---

## Questions for Debugging

1. **Are the images loading at all?** Check browser console for 404 errors
2. **Is the HTML structure correct?** Inspect the DOM to see if carousel items are being created
3. **Are the CSS classes being applied?** Check if `.active` class is on the first item
4. **Is there a positioning conflict?** The carousel uses absolute positioning - could this be causing issues?
5. **Is the placeholder interfering?** The `::before` pseudo-element creates a 16:9 placeholder - does it need adjustment?

---

## Suspected Issues

1. **Absolute positioning conflict**: Both `.modal-carousel` and `.modal-carousel-item.active` use absolute positioning, which might be causing layout issues
2. **Height calculation**: The carousel container uses a `::before` placeholder with `padding-bottom: 56.25%` - when images load, the container might not be sizing correctly
3. **Display logic**: Items with `.active` class should show, but the combination of `display: flex` + `position: absolute` might need adjustment

---

## Possible Solutions to Test

1. **Remove absolute positioning from .modal-carousel when images load**
2. **Adjust height/sizing after images load**
3. **Check if images are actually being fetched** (network tab)
4. **Verify the `getFullImages()` utility is returning correct paths**
