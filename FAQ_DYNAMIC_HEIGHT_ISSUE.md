# FAQ Tab Dynamic Height Issue

## Problem Description

The FAQ tab panel needs to dynamically adjust its height based on the number of visible questions in the currently selected category. Currently, the panel has a fixed height that doesn't change when switching between categories with different numbers of questions.

**Expected Behavior:**
- When a category with fewer questions is selected (e.g., "기타" with 3 questions), the FAQ panel should be shorter
- When a category with more questions is selected (e.g., "일정 & 프로세스" with 7 questions), the FAQ panel should be taller
- The panel height should smoothly transition when switching between categories
- The 42px button area must always remain visible at the bottom when the panel is minimized
- When the FAQ tab is **active/open** (`faq-active` class), the panel should expand to `bottom: 0` showing all content
- When the FAQ tab is **minimized** (no `faq-active` class), the panel should be positioned so only the button is visible

**Current Behavior:**
- The panel has a fixed height of `calc(85vh + 42px)` regardless of content
- Switching categories doesn't adjust the panel height
- The dynamic height calculation exists but doesn't work correctly

## Category Question Counts

From `src/data/faq.js`:

1. **Services & Team** (`services`): 6 questions
2. **Request & Pricing** (`pricing`): 5 questions
3. **Schedule & Process** (`process`): 7 questions (most questions)
4. **Copyright & Trademark** (`legal`): 3 questions
5. **Other** (`other`): 3 questions (fewest questions)

## Current Implementation

### File Structure

```
src/
├── components/
│   └── BottomTabs.js          # Main component with FAQ logic
├── styles/
│   └── bottomtabs.css         # FAQ panel styling
└── data/
    └── faq.js                 # FAQ content (25 questions total)
```

### Current JavaScript (BottomTabs.js)

#### Lines 95-116: renderContent() method
```javascript
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
```

#### Lines 118-140: updateFaqPanelHeight() method (BROKEN)
```javascript
updateFaqPanelHeight() {
  const faqPanel = this.container.querySelector('.faq-panel');
  const faqContent = this.container.querySelector('.faq-content');

  if (faqPanel && faqContent) {
    // Wait for DOM to update after filtering
    setTimeout(() => {
      // Get the actual content height
      const contentHeight = faqContent.scrollHeight;

      // Add button height (42px) + padding (40px top + 30px bottom = 70px)
      const totalHeight = contentHeight + 42 + 70;

      // Update panel height
      faqPanel.style.height = `${totalHeight}px`;

      // Only update bottom position if FAQ is NOT active (minimized state)
      if (!this.container.classList.contains('faq-active')) {
        faqPanel.style.bottom = `-${totalHeight - 42}px`;
      }
    }, 10);
  }
}
```

**Problem with this approach:**
- Setting inline styles conflicts with CSS transitions
- The `bottom` calculation interferes with the CSS `bottom: 0 !important` when active
- The timing with `setTimeout` is unreliable
- The height calculation doesn't account for all padding/margins correctly

#### Lines 215-236: Category filtering click handler
```javascript
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
```

**This part works correctly** - it filters the questions and calls the broken `updateFaqPanelHeight()` method.

### Current CSS (bottomtabs.css)

#### Lines 35-42: FAQ panel default state
```css
/* FAQ panel - default state */
.bottom-tab-panel.faq-panel {
  bottom: calc(-85vh);
  height: calc(85vh + 42px);
  max-height: 95vh;
  z-index: 1;
  transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Issues:**
- Fixed `height: calc(85vh + 42px)` doesn't change based on content
- Fixed `bottom: calc(-85vh)` assumes constant height
- These should be dynamically calculated or use a different approach

#### Lines 44-48: FAQ panel active state
```css
/* FAQ panel - active */
.bottom-tabs.faq-active .faq-panel {
  bottom: 0 !important;
  z-index: 3;
}
```

**This works correctly** - when active, the panel goes to `bottom: 0` and shows all content.

## What Needs to Work

### State 1: FAQ Minimized (Button Only Visible)
- Only the 42px button should be visible at the bottom
- The panel content should be hidden below the viewport
- The panel `bottom` position should be: `-(panel height - 42px)`
- Example: If panel is 600px tall, `bottom: -558px` (keeps 42px button visible)

### State 2: FAQ Active (Full Panel Visible)
- When `.bottom-tabs` has class `faq-active`
- Panel should be at `bottom: 0`
- Full panel content visible up to its calculated height
- Panel height should match content height (varies by category)

### State 3: Category Switch (While Active)
- When user clicks different category button while FAQ is open
- Panel height should smoothly transition to new content height
- Panel stays at `bottom: 0` (remains open)
- Only visible questions change, height adjusts accordingly

## HTML Structure

```html
<div class="bottom-tabs">                          <!-- Container -->
  <div class="bottom-tab-panel faq-panel">         <!-- FAQ Panel -->
    <div class="bottom-tabs-buttons">              <!-- Button container (42px) -->
      <button class="bottom-tab-btn faq-btn">
        <span class="tab-label">FAQ</span>
        <span class="tab-arrow">▲</span>
      </button>
    </div>
    <div class="bottom-tabs-content">              <!-- Content area -->
      <div class="bottom-tab-inner faq-inner">     <!-- Inner wrapper -->
        <div class="faq-content">                  <!-- FAQ content (THIS is what we measure) -->
          <div class="faq-categories">             <!-- Category buttons (dynamic height) -->
            <button class="faq-category-btn active">Services</button>
            <button class="faq-category-btn">Pricing</button>
            <!-- etc -->
          </div>
          <div class="faq-list">                   <!-- Question list (dynamic height) -->
            <div class="faq-item" data-category="services">...</div>
            <div class="faq-item" data-category="services">...</div>
            <!-- Only visible items shown based on category -->
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## Padding/Spacing to Account For

When calculating total panel height:

1. **Button area**: 42px (`.bottom-tabs-buttons` has `height: 42px`)
2. **Content padding**: `.bottom-tab-inner` has `padding: 40px 40px 30px` (top/sides/bottom)
3. **FAQ content**:
   - `.faq-categories`: Dynamic height based on wrapped buttons + 30px margin-bottom
   - `.faq-list`: Dynamic height based on visible `.faq-item` elements

**Formula:**
```
Total Panel Height = 42px (button)
                   + 40px (top padding)
                   + faqContent.scrollHeight (categories + visible questions)
                   + 30px (bottom padding)
```

## Proposed Solution Requirements

The solution should:

1. **Calculate accurate content height**:
   - Measure the actual rendered height of `.faq-content` including all visible elements
   - Account for category buttons (they wrap on smaller screens)
   - Account for visible FAQ items based on current category filter
   - Include all padding and margins

2. **Update panel height dynamically**:
   - Set panel height to calculated total
   - Maintain smooth CSS transitions
   - Avoid inline style conflicts with CSS

3. **Update panel position correctly**:
   - When minimized: `bottom = -(totalHeight - 42px)` to keep button visible
   - When active: `bottom = 0` (let CSS handle this with `!important`)

4. **Trigger updates at the right times**:
   - After initial FAQ tab render (show services category)
   - After category button click (show different category)
   - After DOM has updated with filtered content (proper timing)

5. **Work with CSS transitions**:
   - Don't fight the CSS transition system
   - Let `transition: all 400ms` handle animation
   - Avoid rapid state changes that cause jank

## Files to Modify

### 1. `src/components/BottomTabs.js`

**Fix or replace the `updateFaqPanelHeight()` method** (lines 118-140)

**Considerations:**
- Use `requestAnimationFrame()` instead of `setTimeout()` for better timing
- Calculate height after DOM has fully updated with filtered items
- Avoid setting `bottom` when `faq-active` class is present
- Consider using CSS custom properties (CSS variables) instead of inline styles

### 2. `src/styles/bottomtabs.css`

**Option A: Keep CSS-based approach**
- Remove fixed `height` and `bottom` from `.bottom-tab-panel.faq-panel`
- Let JavaScript set these dynamically
- Keep `transition` for smooth animations
- Keep `bottom: 0 !important` for active state

**Option B: Use CSS custom properties**
- Define `--faq-panel-height` variable
- Update via JavaScript: `faqPanel.style.setProperty('--faq-panel-height', totalHeight + 'px')`
- CSS uses: `height: var(--faq-panel-height, calc(85vh + 42px))`
- More maintainable and works better with transitions

## Example Expected Behavior

### Scenario 1: Open FAQ Tab (Default Category: Services)
1. User clicks FAQ button
2. `faq-active` class added to `.bottom-tabs`
3. Panel slides up to `bottom: 0`
4. Shows Services category (6 questions)
5. Panel height = ~500px (calculated based on 6 questions)

### Scenario 2: Switch to Process Category (7 Questions)
1. User clicks "일정 & 프로세스" button
2. Filter shows 7 questions instead of 6
3. Panel height smoothly transitions from ~500px to ~580px
4. Panel stays at `bottom: 0`
5. Taller panel accommodates more questions

### Scenario 3: Switch to Other Category (3 Questions)
1. User clicks "기타" button
2. Filter shows 3 questions instead of 7
3. Panel height smoothly transitions from ~580px to ~350px
4. Panel stays at `bottom: 0`
5. Shorter panel matches fewer questions

### Scenario 4: Close FAQ Tab
1. User clicks FAQ button again
2. `faq-active` class removed from `.bottom-tabs`
3. Panel slides down to `bottom: -(panelHeight - 42px)`
4. Only 42px button remains visible
5. Panel maintains its calculated height for current category

## Testing Checklist

After implementing the fix, verify:

- [ ] FAQ opens to correct height for default "Services" category
- [ ] Switching to "Schedule & Process" (7 questions) makes panel taller
- [ ] Switching to "Other" (3 questions) makes panel shorter
- [ ] Height transitions are smooth (400ms)
- [ ] Panel stays at `bottom: 0` when switching categories while open
- [ ] Button remains visible when panel is closed
- [ ] No visual jumping or jank during transitions
- [ ] Works on mobile (responsive padding accounted for)
- [ ] Language switch maintains correct height
- [ ] Opening/closing multiple times works consistently

## Additional Notes

- The Contact panel has a fixed height and doesn't need dynamic sizing
- The FAQ panel is the only one requiring dynamic height
- The mobile responsive CSS (lines 404-407) also needs updating if approach changes
- Consider debouncing if users rapidly click categories
- Test with browser DevTools to verify calculated heights are accurate

---

## Current State

**What works:**
- ✅ Category filtering (questions show/hide correctly)
- ✅ Category button active states
- ✅ FAQ accordion (questions expand/collapse)
- ✅ Panel opens to `bottom: 0` when active
- ✅ Button offset positioning when minimized

**What doesn't work:**
- ❌ Panel height doesn't change based on category content
- ❌ Panel position when minimized is fixed, not based on content
- ❌ `updateFaqPanelHeight()` method conflicts with CSS
- ❌ Inline styles override CSS transitions improperly

---

## Recommended Solution: CSS Custom Properties Approach

This solution uses **CSS Custom Properties (CSS Variables)** to allow JavaScript to update a single value while CSS handles all positioning logic and transitions automatically.

### Implementation Steps

#### 1. Update CSS (`src/styles/bottomtabs.css`)

Replace lines 35-42 with:

```css
/* FAQ panel - default state */
.bottom-tab-panel.faq-panel {
  /* Use dynamic CSS variable with fallback */
  --panel-height: var(--faq-panel-height, calc(85vh + 42px));

  /* State 1: Minimized - Position so only 42px button shows */
  bottom: calc(-1 * (var(--panel-height) - 42px));
  height: var(--panel-height);

  max-height: 95vh;
  z-index: 1;
  transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

/* State 2: Active - Override to show full panel */
.bottom-tabs.faq-active .faq-panel {
  bottom: 0 !important;
  z-index: 3;
}
```

Also ensure `.bottom-tabs-content` allows proper measurement:

```css
.bottom-tabs-content {
  height: calc(100% - 42px);
  overflow-y: auto;
}
```

#### 2. Rewrite JavaScript Method (`src/components/BottomTabs.js`)

Replace the `updateFaqPanelHeight()` method (lines 118-140) with:

```javascript
updateFaqPanelHeight() {
  const faqPanel = this.container.querySelector('.faq-panel');
  const faqContent = this.container.querySelector('.faq-content');

  if (!faqPanel || !faqContent) return;

  // Double requestAnimationFrame ensures DOM is fully painted after filtering
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // 1. Measure actual content height
      const contentHeight = faqContent.scrollHeight;

      // 2. Calculate total: Button(42) + TopPadding(40) + Content + BottomPadding(30)
      const totalHeight = 42 + 40 + contentHeight + 30;

      // 3. Set CSS variable - triggers smooth CSS transition
      faqPanel.style.setProperty('--faq-panel-height', `${totalHeight}px`);

      // Note: No 'bottom' manipulation needed - CSS handles it automatically
    });
  });
}
```

#### 3. Add Height Update to Accordion Toggle

Update the FAQ accordion click handler (around line 201) to recalculate height when questions expand/collapse:

```javascript
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

  // NEW: Update panel height after accordion state changes
  this.updateFaqPanelHeight();
}
```

### Why This Solution Works

1. **CSS Calculates Position**: The `bottom: calc(-1 * (var(--panel-height) - 42px))` formula automatically adjusts when `--panel-height` changes. If height is 600px, bottom becomes `-558px` (keeping 42px visible).

2. **No Animation Conflicts**: JavaScript only sets one CSS variable. The browser's transition engine smoothly interpolates both `height` and `bottom` over 400ms.

3. **Accurate Measurements**: `requestAnimationFrame` x2 ensures filtered items are fully rendered before measuring. `scrollHeight` captures all content including wrapped category buttons.

4. **State Separation**: CSS handles the active state (`bottom: 0 !important`), JavaScript handles the dynamic height calculation. No conflicts.

5. **Automatic Updates**: When questions expand/collapse via accordion, height recalculates automatically.

### Expected Results

- **"Services & Team" (6 questions)**: Panel ~500-550px tall
- **"Schedule & Process" (7 questions)**: Panel ~580-620px tall
- **"Other" (3 questions)**: Panel ~350-400px tall
- **Category switch while open**: Smooth height transition, stays at `bottom: 0`
- **Panel minimized**: Only 42px button visible, perfect alignment
- **Question expand/collapse**: Panel adjusts height to fit expanded answers

---

## Request for Implementation

Please implement the CSS Custom Properties solution above, which:

1. Properly calculates FAQ panel height based on visible content
2. Updates height smoothly when switching categories
3. Maintains correct positioning (button visible when minimized, full panel when open)
4. Works with the existing CSS transition system
5. Includes proper timing/sequencing for DOM updates using `requestAnimationFrame`
6. Updates height when accordion items expand/collapse

This approach is cleaner and more reliable than inline styles as it leverages the browser's native CSS transition engine.
