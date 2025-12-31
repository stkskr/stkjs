# Troubleshooting Guide - Sticks & Stones Website

This document contains solutions to common issues encountered during development and deployment of the Sticks & Stones website.

---

## Table of Contents
1. [Initial Page Load Animation](#initial-page-load-animation)
2. [Auto-Scroll for Team Profile Tooltips](#auto-scroll-for-team-profile-tooltips)
3. [Team Profile Grid Centering](#team-profile-grid-centering)
4. [Quote Carousel Issues](#quote-carousel-issues)
5. [Portfolio Modal Image Sizing](#portfolio-modal-image-sizing)

---

## Initial Page Load Animation

### Problem
When loading a page directly (e.g., `/about` or `/portfolio`), the content animates into view with an expanding animation. This should only happen when navigating between sections, not on direct page load.

### Root Cause
The router was setting `appState: 'expanding'` for all page loads with a section, including initial page loads. This triggered the CSS transition animations even when the user directly navigated to a URL.

### Solution
**File**: `src/core/router.js`

Added an `isInitialLoad` flag to detect the first route handling:

```javascript
class Router {
  constructor() {
    this.hasDetectedLanguage = false;
    this.isInitialLoad = true; // Track initial page load
  }

  handleRoute() {
    const route = this.parseRoute(window.location.pathname);

    // On initial load with a section, skip animation by using 'expanded' state
    const appState = route.section
      ? (this.isInitialLoad ? 'expanded' : 'expanding')
      : 'idle';

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
}
```

**File**: `src/components/GridQuadrant.js`

Updated to handle both `'expanding'` and `'expanded'` states:

```javascript
if ((appState === 'expanding' || appState === 'expanded') && currentSection) {
  this.container.classList.add('stateExpanding');
  // ... rest of logic
}
```

### Behavior After Fix
- **Direct page load** (e.g., typing `/about` in browser): Content appears immediately without animation
- **Navigation between sections** (e.g., clicking from home to about): Content animates smoothly

---

## Auto-Scroll for Team Profile Tooltips

### Problem
When hovering over team profile cards near the bottom of the viewport, tooltips extend beyond the visible area. The page should automatically scroll to reveal the full tooltip content, but scrolling wasn't working.

### Root Cause
The app uses a custom `.container` element with `overflow-y: hidden` by default (only becomes scrollable with `.stateExpanding` class). Using `window.scrollBy()` had no effect because the window itself wasn't scrollable - the container was.

### Diagnostic Steps
1. **Logged measurements**: Added console logging to verify tooltip positioning was detected correctly
2. **Checked overflow properties**: Found that `.container` has `overflow-y: hidden` in default state
3. **Tested with container scroll**: Changed from `window.scrollBy()` to `container.scrollBy()`

### Solution
**File**: `src/components/TeamProfiles.js`

Target the `.container` element directly instead of `window`:

```javascript
const triggerScrollReveal = () => {
  const reveal = card.querySelector('.profile-reveal');
  if (!reveal) return;

  requestAnimationFrame(() => {
    void reveal.offsetHeight; // Force reflow

    const rect = reveal.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    if (rect.bottom > viewportHeight && rect.height > 0) {
      const extraSpace = 20;
      const scrollDistance = rect.bottom - viewportHeight + extraSpace;

      // Find the scrollable container (.container element)
      const container = document.querySelector('.container');
      if (container) {
        // Custom easing animation for smooth scroll
        const startPos = container.scrollTop;
        const startTime = performance.now();
        const duration = 600;

        const easeInOutQuad = (t) => {
          return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        };

        const animateScroll = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = easeInOutQuad(progress);

          container.scrollTop = startPos + (scrollDistance * eased);

          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          }
        };

        requestAnimationFrame(animateScroll);
      }
    }
  });
};
```

### Key Improvements
1. **Correct scroll target**: Uses `document.querySelector('.container')` instead of `window`
2. **Force reflow**: `void reveal.offsetHeight` ensures layout is calculated before measuring
3. **Custom easing**: Ease-in-out quad for smooth, natural motion (600ms duration)
4. **Gentle buffer**: Only 20px extra space to avoid over-scrolling

---

## Team Profile Grid Centering

### Problem
Team profile grid with 7 members (4 in first row, 3 in second row) appeared left-justified. The bottom row of 3 profiles needed to be centered within the 4-column layout.

### Root Cause
CSS Grid with `repeat(4, 1fr)` creates equal columns, but incomplete rows align to the start by default. Manual `grid-column` assignments didn't work as expected.

### Solution Attempts
1. ❌ **Grid with `justify-items: center`**: Only centered items within their cells, not the row itself
2. ❌ **Manual `nth-child` grid-column assignments**: Conflicted with flexbox auto-centering
3. ✅ **Switched to Flexbox with `justify-content: center`**: Natural centering for incomplete rows

**File**: `src/styles/content.css`

```css
.team-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center; /* Centers all items, including incomplete rows */
  gap: 80px 30px;
  max-width: 1400px;
  margin: 60px auto;
  padding: 0 20px;
}

.team-member {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  width: calc((100% - (30px * 3)) / 4); /* Maintain 4 columns */
  min-width: 280px;
  max-width: 320px;
  min-height: 320px;
  z-index: 1;
}

/* Responsive breakpoints */
@media (max-width: 1200px) {
  .team-member {
    width: calc((100% - (30px * 2)) / 3); /* 3 columns */
  }
}

@media (max-width: 900px) {
  .team-member {
    width: calc((100% - 30px) / 2); /* 2 columns */
  }
}

@media (max-width: 600px) {
  .team-member {
    width: 100%; /* 1 column */
  }
}
```

### Why Flexbox Works Better
- `justify-content: center` naturally centers all flex items, including incomplete rows
- `calc()` widths maintain exact column sizing across all screen sizes
- No need for manual positioning with `nth-child` selectors
- Responsive breakpoints simply adjust the width calculation

---

## Quote Carousel Issues

### Problem
Quote carousel needed auto-scroll functionality with pause-on-hover and smooth transitions between slides.

### Solution
**File**: `src/components/QuoteCarousel.js`

Implemented auto-scroll with proper cleanup:

```javascript
export class QuoteCarousel {
  constructor() {
    this.element = createElement('div', 'quote-carousel-container');
    this.currentIndex = 0;
    this.slideInterval = 3500; // 3.5 seconds
    this.autoScrollTimer = null;
  }

  startAutoScroll() {
    this.stopAutoScroll(); // Clear any existing timer
    this.autoScrollTimer = setInterval(() => {
      this.nextSlide();
    }, this.slideInterval);
  }

  stopAutoScroll() {
    if (this.autoScrollTimer) {
      clearInterval(this.autoScrollTimer);
      this.autoScrollTimer = null;
    }
  }

  mount(parent) {
    parent.appendChild(this.element);
    this.render();

    // Pause on hover
    this.element.addEventListener('mouseenter', () => this.stopAutoScroll());
    this.element.addEventListener('mouseleave', () => this.startAutoScroll());

    this.startAutoScroll();
  }
}
```

### Key Features
- Auto-scrolls every 3.5 seconds
- Pauses when user hovers over carousel
- Resumes when mouse leaves
- Proper cleanup prevents memory leaks

---

## Portfolio Modal Image Sizing

### Problem
Modal images (both single and carousel) could become excessively large, breaking layout and causing poor UX.

### Solution
**File**: `src/styles/content.css`

Added `max-height` constraints:

```css
.modal-image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  max-height: 550px; /* Prevent overly large images */
  object-fit: contain;
}

.modal-carousel-item img {
  max-width: 100%;
  max-height: 550px; /* Consistent with single images */
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}
```

### Placeholder Updates
Updated placeholders to match:

```css
.modal-image-placeholder {
  width: 100%;
  height: 550px; /* Match max-height */
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## Z-Index Stacking Issues

### Problem
Team profile tooltips were appearing behind other profile cards or page elements.

### Solution
**File**: `src/styles/content.css`

Implemented dynamic z-index elevation:

```css
.team-member {
  position: relative;
  z-index: 1; /* Base level */
}

.team-member:hover,
.team-member:active {
  z-index: 1001 !important; /* Elevate on interaction */
}

.profile-reveal {
  position: absolute;
  z-index: 2000; /* Always on top within card */
  /* ... other styles */
}
```

### Stacking Hierarchy
1. **Base**: `z-index: 1` (default team member)
2. **Hovered card**: `z-index: 1001` (entire card elevates)
3. **Tooltip**: `z-index: 2000` (always top-most)

This ensures the active profile and its tooltip are always visible above all other content.

---

## Common Development Tips

### Browser DevTools
- **Check scroll container**: Use Elements panel to verify which element has `overflow: auto`
- **Inspect z-index**: Use the Layers panel to visualize stacking contexts
- **Monitor transitions**: Use Performance panel to debug janky animations

### Console Logging
Temporary debugging logs are helpful:

```javascript
console.log('📏 Measurements:', {
  'rect.bottom': rect.bottom,
  'rect.height': rect.height,
  'viewportHeight': viewportHeight,
});
```

Remember to remove them before deployment!

### CSS Debugging
Use temporary border colors to visualize layout:

```css
.team-grid { border: 2px solid red; }
.team-member { border: 2px solid blue; }
.profile-reveal { border: 2px solid green; }
```

---

## Known Issues

### None Currently Tracked

If you encounter a new issue, document it here with:
1. **Problem description**
2. **Steps to reproduce**
3. **Root cause** (if known)
4. **Solution or workaround**

---

## Additional Resources

- [MDN: CSS Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)
- [MDN: requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [Easing Functions Cheat Sheet](https://easings.net/)
- [CSS Stacking Context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context)
