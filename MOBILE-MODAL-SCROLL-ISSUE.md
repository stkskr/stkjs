# Mobile Portfolio Modal Scrolling Issues - Troubleshooting Guide

## Problem Statement

On mobile devices, scrolling within the portfolio modal is extremely glitchy and unreliable:
- **Some browsers:** Touching the modal selects/interacts with the page content behind the modal instead of scrolling the modal content
- **Some browsers:** Modal content cannot be scrolled at all - touch events don't register
- **General behavior:** Scrolling by tapping and dragging is a nightmare - unpredictable and frustrating

This makes it impossible for users to read the full project details, see all carousel images, or access content below the fold.

---

## Current Implementation Analysis

### Modal Structure (ModalPortfolio.js)

#### HTML Structure (lines 32-69)
```html
<div class="portfolio-modal">        <!-- Fixed overlay -->
  <div class="modal-content">        <!-- Centered container -->
    <div class="modal-header">       <!-- Fixed header -->
      <!-- Navigation buttons, language toggle, close button -->
    </div>
    <div class="modal-body">         <!-- Scrollable content -->
      <!-- Images, title, mission, solution, meta info -->
    </div>
  </div>
</div>
```

#### Scroll Locking Mechanism (lines 132-150)
```javascript
lockScroll() {
  this.savedScrollY = window.scrollY || window.pageYOffset;
  document.body.style.position = "fixed";
  document.body.style.top = `-${this.savedScrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
}

unlockScroll() {
  const y = this.savedScrollY || 0;
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  window.scrollTo(0, y);
  this.savedScrollY = 0;
}
```

**When Called:**
- `lockScroll()` when modal opens (line 221)
- `unlockScroll()` when modal closes (line 294)

---

### Desktop CSS (content.css, lines 541-731)

#### Portfolio Modal Overlay
```css
.portfolio-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;          /* CRITICAL: Disabled when not active */
  transition: opacity 300ms ease;
  padding: 40px 20px;
}

.portfolio-modal.active {
  opacity: 1;
  pointer-events: auto;          /* Enabled when active */
}
```

#### Modal Content Container
```css
.modal-content {
  width: 90%;
  max-width: 1200px;
  max-height: calc(100vh - 80px);
  background: white;
  border-radius: 8px;
  position: relative;
  transform: scale(0.9);
  transition: transform 300ms ease, height 400ms ease;
  will-change: height;
  display: flex;
  flex-direction: column;
  overflow: hidden;             /* CRITICAL: Parent doesn't scroll */
}
```

#### Modal Body (Scrollable Area)
```css
.modal-body {
  padding: 40px;
  transition: opacity 300ms ease;
  overflow-y: auto;              /* CRITICAL: This is where scrolling happens */
  flex: 1 1 auto;
  min-height: 0;                 /* CRITICAL: Allows flex item to shrink */
  -webkit-overflow-scrolling: touch;  /* iOS momentum scrolling */
  position: relative;
}
```

---

### Mobile CSS Overrides (mobile-fixes.css)

#### Lines 106-115: Modal Width Fix
```css
@media (max-width: 768px) {
  .portfolio-modal {
    width: 100% !important;
    max-width: 100vw;
  }

  .video-modal {
    width: 100% !important;
    max-width: 100vw;
  }
}
```

#### Lines 161-170: Modal Content Constraints
```css
@media (max-width: 768px) {
  .modal-content {
    max-height: calc(100dvh - 150px) !important;
    width: 95% !important;
    max-width: calc(100vw - 20px) !important;
    /* Ensure flexbox layout for scrollable body */
    display: flex !important;
    flex-direction: column !important;
    /* Prevent the modal itself from scrolling */
    overflow: hidden !important;
  }
}
```

#### Lines 397-406: Modal Body Scrolling
```css
@media (max-width: 768px) {
  .modal-body {
    padding: 15px !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    /* Enable momentum scrolling on iOS */
    touch-action: pan-y !important;     /* CRITICAL: Allow vertical panning only */
  }
}
```

---

## Root Causes of Scroll Issues

### Issue 1: Body Scroll Lock Prevents Modal Scrolling (Mobile Safari)

**The Problem:**
```javascript
lockScroll() {
  document.body.style.position = "fixed";  // Locks entire body
  // ...
}
```

On iOS Safari:
- When `body` is `position: fixed`, the entire document becomes non-scrollable
- This includes the modal content, even though `.modal-body` has `overflow-y: auto`
- iOS interprets the fixed body as "nothing can scroll" and ignores the modal's overflow
- Touch events on the modal try to scroll the body (which is locked), causing selection of background content

**Why It Happens:**
- iOS has aggressive touch handling to prevent double-tap zooming and scrolling
- Fixed-position body is treated as a signal to disable all scrolling
- The modal is inside the body, so it inherits the scroll lock

### Issue 2: Pointer Events and Touch Target Confusion

**The Problem:**
```css
.portfolio-modal {
  pointer-events: none;  /* Default state */
}

.portfolio-modal.active {
  pointer-events: auto;  /* Active state */
}
```

On some mobile browsers:
- `pointer-events: auto` on the overlay doesn't always properly capture touch events
- Touch events "fall through" to the background page content
- The modal is technically interactive, but the browser prioritizes background elements

**Why It Happens:**
- Z-index stacking contexts can interfere with touch event propagation
- `pointer-events` behaves differently across browsers for touch vs mouse
- Backdrop elements (the dark overlay) may not properly block touch events

### Issue 3: Overflow Scrolling Chain (iOS)

**The Problem:**
```css
.modal-content {
  overflow: hidden;    /* Parent prevents scroll */
}

.modal-body {
  overflow-y: auto;    /* Child should scroll */
  -webkit-overflow-scrolling: touch;
}
```

On iOS:
- When `.modal-body` reaches the end of its scroll (top or bottom), iOS tries to scroll the parent
- Since parent (`.modal-content`) has `overflow: hidden`, it tries to scroll the next parent
- Eventually reaches the fixed `body`, which triggers rubber-band bounce or content selection
- This is called "scroll chaining" and it's a major iOS gotcha

**Why It Happens:**
- iOS doesn't respect `overflow: hidden` as a scroll boundary
- `-webkit-overflow-scrolling: touch` exacerbates the issue with momentum
- No proper way to prevent scroll chaining without JavaScript intervention

### Issue 4: Touch-Action Conflicts

**Current Setting:**
```css
.modal-body {
  touch-action: pan-y !important;  /* Allow vertical panning only */
}
```

**The Problem:**
- `touch-action: pan-y` is correct in theory (only vertical scrolling)
- BUT if applied at the wrong level (e.g., on `.portfolio-modal` or `.modal-content`), it can block all touches
- OR if overridden by child elements (images, carousel buttons), can create dead zones

### Issue 5: Height Calculation with dvh

**Current Setting:**
```css
.modal-content {
  max-height: calc(100dvh - 150px) !important;
}
```

**The Problem:**
- `dvh` (dynamic viewport height) changes as mobile browser UI shows/hides
- On scroll, if the address bar disappears, `dvh` increases
- This can cause the modal content height to change mid-scroll
- Height changes during scroll = jarring experience and scroll position loss

### Issue 6: Flexbox min-height: 0 Not Applied on Mobile

**Desktop CSS:**
```css
.modal-body {
  flex: 1 1 auto;
  min-height: 0;  /* Allows flex item to shrink below content size */
}
```

**The Problem:**
- On some mobile browsers, flexbox children don't properly shrink
- Without `min-height: 0`, the `.modal-body` tries to fit all its content without scrolling
- This causes the `.modal-content` to expand beyond the viewport
- Result: Content overflows and scrolling breaks

### Issue 7: Background Page Still Scrollable

**The Problem:**
Even with `document.body.style.position = "fixed"`, some browsers allow:
- Scroll events to propagate to background elements
- Touch events to select text or links behind the modal
- Pinch-zoom gestures affecting the background page

**Why It Happens:**
- Fixed positioning doesn't completely disable touch event handling
- Some browsers (Samsung Internet, UC Browser) have aggressive touch optimizations
- Event capturing isn't perfect across all mobile platforms

---

## Hypotheses for "Selects Site Behind Modal"

### Hypothesis 1: Overlay Click-Through (Z-Index Issue)

**Theory:** The dark overlay (`.portfolio-modal`) doesn't properly capture touch events, allowing touches to "fall through" to background elements.

**Test:**
```javascript
const modal = document.querySelector('.portfolio-modal.active');
modal.addEventListener('touchstart', (e) => {
  console.log('Touch target:', e.target.className);
  console.log('Modal z-index:', getComputedStyle(modal).zIndex);
}, { passive: true });
```

**Expected Result:**
- If touch target is NOT the modal, overlay, or modal-content, then click-through is happening
- Check if z-index is actually 1000 or if something else is higher

**Fix to Try:**
```css
.portfolio-modal {
  z-index: 9999 !important;
  isolation: isolate;  /* Creates new stacking context */
}

.portfolio-modal.active {
  pointer-events: auto !important;
  touch-action: none !important;  /* Block all touch gestures on overlay */
}

.modal-content {
  pointer-events: auto !important;
  touch-action: pan-y !important;  /* Allow vertical pan on content */
}
```

### Hypothesis 2: Body Still Scrollable Despite Fixed Position

**Theory:** `position: fixed` on body doesn't fully prevent scrolling on all mobile browsers.

**Test:**
```javascript
// After modal opens
console.log('Body position:', document.body.style.position);
console.log('Body overflow:', getComputedStyle(document.body).overflow);
console.log('HTML overflow:', getComputedStyle(document.documentElement).overflow);
```

**Expected Result:**
- Body should be `position: fixed`
- But some browsers might still allow scrolling if `overflow` isn't explicitly set

**Fix to Try:**
```javascript
lockScroll() {
  this.savedScrollY = window.scrollY || window.pageYOffset;

  // Lock both body and html
  document.body.style.position = "fixed";
  document.body.style.top = `-${this.savedScrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";  // ADD THIS

  document.documentElement.style.overflow = "hidden";  // ADD THIS
  document.documentElement.style.position = "fixed";  // ADD THIS
  document.documentElement.style.width = "100%";
  document.documentElement.style.height = "100%";
}

unlockScroll() {
  const y = this.savedScrollY || 0;

  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  document.body.style.overflow = "";  // ADD THIS

  document.documentElement.style.overflow = "";  // ADD THIS
  document.documentElement.style.position = "";
  document.documentElement.style.width = "";
  document.documentElement.style.height = "";

  window.scrollTo(0, y);
  this.savedScrollY = 0;
}
```

### Hypothesis 3: Scroll Chaining to Background

**Theory:** When `.modal-body` reaches scroll end, iOS tries to scroll parent elements, eventually reaching the background page.

**Test:**
```javascript
const modalBody = document.querySelector('.modal-body');
let startY = 0;

modalBody.addEventListener('touchstart', (e) => {
  startY = e.touches[0].clientY;
}, { passive: true });

modalBody.addEventListener('touchmove', (e) => {
  const currentY = e.touches[0].clientY;
  const deltaY = currentY - startY;

  const atTop = modalBody.scrollTop === 0;
  const atBottom = modalBody.scrollTop + modalBody.clientHeight >= modalBody.scrollHeight;

  console.log('Scroll position:', {
    scrollTop: modalBody.scrollTop,
    atTop,
    atBottom,
    deltaY,
    tryingToScrollUp: deltaY > 0,
    tryingToScrollDown: deltaY < 0
  });

  // If at boundary and trying to scroll beyond, log warning
  if ((atTop && deltaY > 0) || (atBottom && deltaY < 0)) {
    console.warn('BOUNDARY REACHED - SCROLL CHAIN LIKELY');
  }
});
```

**Fix to Try:**
Prevent scroll chaining with JavaScript:
```javascript
// In ModalPortfolio constructor
this.preventScrollChaining = (e) => {
  const modalBody = e.currentTarget;
  const scrollTop = modalBody.scrollTop;
  const scrollHeight = modalBody.scrollHeight;
  const clientHeight = modalBody.clientHeight;

  const atTop = scrollTop === 0;
  const atBottom = scrollTop + clientHeight >= scrollHeight;

  // Calculate touch delta
  if (!this.touchStartY) {
    this.touchStartY = e.touches[0].clientY;
    return;
  }

  const deltaY = e.touches[0].clientY - this.touchStartY;
  const scrollingUp = deltaY > 0;
  const scrollingDown = deltaY < 0;

  // Prevent default if trying to scroll beyond boundaries
  if ((atTop && scrollingUp) || (atBottom && scrollingDown)) {
    e.preventDefault();
  }
};

// In attachCarouselListeners or similar
const modalBody = this.element.querySelector('.modal-body');
modalBody.addEventListener('touchstart', (e) => {
  this.touchStartY = e.touches[0].clientY;
}, { passive: true });

modalBody.addEventListener('touchmove', this.preventScrollChaining, { passive: false });

modalBody.addEventListener('touchend', () => {
  this.touchStartY = null;
}, { passive: true });
```

### Hypothesis 4: Modal Content Overflow Not Scrolling

**Theory:** The `.modal-body` doesn't have enough content to trigger scrolling, OR it's sized incorrectly and content overflows without scroll bars.

**Test:**
```javascript
const modalContent = document.querySelector('.modal-content');
const modalBody = document.querySelector('.modal-body');

console.log('Modal Content:', {
  offsetHeight: modalContent.offsetHeight,
  scrollHeight: modalContent.scrollHeight,
  computedMaxHeight: getComputedStyle(modalContent).maxHeight
});

console.log('Modal Body:', {
  offsetHeight: modalBody.offsetHeight,
  scrollHeight: modalBody.scrollHeight,
  clientHeight: modalBody.clientHeight,
  isScrollable: modalBody.scrollHeight > modalBody.clientHeight
});
```

**Expected Result:**
- If `modalBody.scrollHeight <= modalBody.clientHeight`, then content fits without scrolling (not an overflow issue)
- If `modalBody.scrollHeight > modalBody.clientHeight` but scrolling doesn't work, it's a CSS/event issue

**Fix to Try:**
```css
@media (max-width: 768px) {
  .modal-body {
    padding: 15px !important;
    overflow-y: scroll !important;  /* Force scroll bar even if not needed */
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    overscroll-behavior: contain !important;  /* Prevent scroll chaining */
    touch-action: pan-y !important;
    position: relative !important;
    height: 100% !important;  /* Ensure it fills parent */
  }
}
```

### Hypothesis 5: Carousel Buttons Blocking Touch Events

**Theory:** Carousel navigation buttons (`.modal-carousel-prev`, `.modal-carousel-next`) or carousel indicators have large touch areas that intercept scroll gestures.

**Test:**
Check button positioning and size:
```javascript
const buttons = document.querySelectorAll('.modal-carousel-prev, .modal-carousel-next');
buttons.forEach(btn => {
  const rect = btn.getBoundingClientRect();
  console.log('Button:', {
    width: rect.width,
    height: rect.height,
    top: rect.top,
    left: rect.left,
    zIndex: getComputedStyle(btn).zIndex,
    pointerEvents: getComputedStyle(btn).pointerEvents
  });
});
```

**Fix to Try:**
```css
.modal-carousel-prev,
.modal-carousel-next {
  pointer-events: auto !important;  /* Ensure buttons are interactive */
  touch-action: manipulation !important;  /* Standard button touch behavior */
  z-index: 20 !important;  /* Above content but below header */
}

/* Make sure carousel doesn't block scrolling */
.modal-carousel-container {
  pointer-events: none !important;  /* Allow touches to pass through */
}

.modal-carousel-container * {
  pointer-events: auto !important;  /* But make children (buttons, images) interactive */
}
```

---

## Recommended Fixes (Priority Order)

### Fix 1: Improve Scroll Lock with overscroll-behavior (HIGHEST PRIORITY)

**Concept:** Use modern CSS property `overscroll-behavior` to prevent scroll chaining + improve body lock.

**mobile-fixes.css:**
```css
@media (max-width: 768px) {
  /* Prevent scroll chaining on modal body */
  .modal-body {
    padding: 15px !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    overscroll-behavior: contain !important;  /* CRITICAL: Prevent scroll chain */
    touch-action: pan-y !important;
    position: relative !important;
  }

  /* Ensure modal content doesn't interfere */
  .modal-content {
    max-height: 85vh !important;  /* Use static vh instead of dvh */
    width: 95% !important;
    max-width: calc(100vw - 20px) !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
    touch-action: pan-y !important;
  }

  /* Ensure overlay captures all touches */
  .portfolio-modal {
    touch-action: none !important;  /* Block gestures on overlay */
    overscroll-behavior: contain !important;
  }

  .portfolio-modal.active {
    pointer-events: auto !important;
  }
}
```

**ModalPortfolio.js:**
```javascript
lockScroll() {
  this.savedScrollY = window.scrollY || window.pageYOffset;

  // More aggressive lock for mobile
  document.body.style.position = "fixed";
  document.body.style.top = `-${this.savedScrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";
  document.body.style.touchAction = "none";  // Prevent all touch gestures

  // Also lock HTML element
  document.documentElement.style.overflow = "hidden";
  document.documentElement.style.touchAction = "none";
}

unlockScroll() {
  const y = this.savedScrollY || 0;

  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  document.body.style.overflow = "";
  document.body.style.touchAction = "";

  document.documentElement.style.overflow = "";
  document.documentElement.style.touchAction = "";

  window.scrollTo(0, y);
  this.savedScrollY = 0;
}
```

### Fix 2: Add Scroll Chaining Prevention with JavaScript

**ModalPortfolio.js (add to constructor or attachCarouselListeners):**
```javascript
// Prevent scroll chaining to background
setupScrollLock() {
  const modalBody = this.element.querySelector('.modal-body');
  if (!modalBody) return;

  let startY = 0;
  let startScrollTop = 0;

  modalBody.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    startScrollTop = modalBody.scrollTop;
  }, { passive: true });

  modalBody.addEventListener('touchmove', (e) => {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    const scrollTop = modalBody.scrollTop;
    const scrollHeight = modalBody.scrollHeight;
    const clientHeight = modalBody.clientHeight;

    const atTop = scrollTop <= 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

    const scrollingUp = deltaY > 0;
    const scrollingDown = deltaY < 0;

    // Prevent overscroll
    if ((atTop && scrollingUp) || (atBottom && scrollingDown)) {
      e.preventDefault();
    }
  }, { passive: false });
}

// Call this after modal opens
openBySlug(id, language) {
  // ... existing code ...

  this.setupScrollLock();
}
```

### Fix 3: Use Sentinel Elements to Block Background Interaction

**Concept:** Create a full-screen transparent element that captures all touches before they reach the background.

**ModalPortfolio.js (in render method):**
```javascript
render() {
  this.element.innerHTML = `
    <div class="modal-overlay-blocker"></div>  <!-- ADD THIS -->
    <div class="modal-content">
      <!-- rest of modal content -->
    </div>
  `;

  // Add event listener to blocker
  const blocker = this.element.querySelector('.modal-overlay-blocker');
  blocker.addEventListener('touchstart', (e) => {
    // Prevent touches on blocker from reaching background
    e.stopPropagation();
  }, { passive: true });

  blocker.addEventListener('click', () => {
    this.close();
  });
}
```

**CSS:**
```css
.modal-overlay-blocker {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;  /* Behind modal content, but above background */
  background: transparent;
  pointer-events: auto;
  touch-action: none;
}
```

### Fix 4: Force GPU Acceleration and Remove will-change

**Concept:** `will-change: height` can cause rendering issues on mobile. Use `transform: translateZ(0)` instead.

**mobile-fixes.css:**
```css
@media (max-width: 768px) {
  .modal-content {
    will-change: auto !important;  /* Remove will-change */
    transform: translateZ(0) !important;  /* Force GPU layer */
  }

  .modal-body {
    transform: translateZ(0) !important;  /* Separate layer for scrolling */
  }
}
```

### Fix 5: Disable Pointer Events on Background Elements

**Concept:** When modal is open, explicitly disable interaction with all background elements.

**ModalPortfolio.js:**
```javascript
lockScroll() {
  // ... existing code ...

  // Disable interaction with background content
  const app = document.getElementById('app');
  if (app) {
    app.style.pointerEvents = 'none';
    app.style.touchAction = 'none';
  }
}

unlockScroll() {
  // ... existing code ...

  // Re-enable interaction
  const app = document.getElementById('app');
  if (app) {
    app.style.pointerEvents = '';
    app.style.touchAction = '';
  }
}
```

### Fix 6: Simplify Height Calculation (Remove dvh)

**Concept:** `dvh` changes during scroll as browser UI shows/hides. Use static `vh` for predictable behavior.

**mobile-fixes.css:**
```css
@media (max-width: 768px) {
  .modal-content {
    max-height: 85vh !important;  /* Static, not dynamic */
    /* OR use fixed pixel value */
    max-height: calc(100vh - 100px) !important;
  }
}
```

---

## Testing Strategy

### Phase 1: Verify Scroll Lock

On mobile device with modal open:
```javascript
// Try to scroll background
document.body.scrollTop = 500;  // Should not work

// Check styles
console.log('Body position:', document.body.style.position);  // Should be "fixed"
console.log('HTML overflow:', document.documentElement.style.overflow);  // Should be "hidden"
```

### Phase 2: Test Scroll Chaining

On mobile, in modal body:
1. Scroll to the very top
2. Try to pull down (overscroll up)
3. Check if background page scrolls or rubber-bands

Expected: Only modal body should rubber-band, not background

### Phase 3: Test Touch Targets

On mobile, tap various areas:
- Dark overlay background (should close modal)
- Modal content white area (should NOT close modal)
- Text in modal body (should select text, not interact with background)
- Images (should not trigger background page actions)

### Phase 4: Browser-Specific Testing

Test on:
1. **Safari iOS (iPhone)** - Most strict touch handling
2. **Chrome iOS (iPhone)** - Uses Safari engine but different touch optimizations
3. **Chrome Android** - Different touch handling than iOS
4. **Samsung Internet** - Has aggressive touch optimizations
5. **Firefox Android** - Different scroll behavior

For each browser, test:
- Can you scroll modal body smoothly?
- Does scrolling reach end properly?
- Can you select text in modal?
- Does background page stay locked?

---

## Success Criteria

The issue is RESOLVED when:
1. Modal content scrolls smoothly on all mobile browsers
2. Scrolling stays within modal - doesn't affect background page
3. Background page is completely uninteractive when modal is open
4. No accidental text selection or link activation on background
5. Overscroll (rubber-band) effect stays within modal
6. Scroll position is maintained when switching carousel images
7. Modal can be closed by tapping the dark overlay

---

## Related Files

- `src/components/ModalPortfolio.js` (lines 132-150) - Scroll lock/unlock logic
- `src/styles/content.css` (lines 541-731) - Desktop modal & scroll styles
- `src/styles/mobile-fixes.css` (lines 106-115, 161-170, 397-406) - Mobile modal overrides

---

## Additional Resources

- MDN: [overscroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior)
- MDN: [touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)
- CSS-Tricks: [Prevent Scroll Chaining](https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/)
- iOS WebKit: [Scroll behavior](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)
