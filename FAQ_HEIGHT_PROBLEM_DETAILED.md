# FAQ Panel Dynamic Height - Detailed Problem Analysis

## The Core Problem

The FAQ panel needs to **dynamically adjust its height** based on how many questions are visible in the currently selected category. The panel should be taller when showing 7 questions and shorter when showing 3 questions.

**Current Status**: Despite implementing CSS Custom Properties and JavaScript height calculations, the panel height is NOT changing when switching between categories.

---

## Visual Demonstration of Expected Behavior

### Scenario 1: Category with 3 Questions (e.g., "Other")
```
┌─────────────────────────────────┐
│         FAQ Button ↑            │ ← 42px button (always visible)
├─────────────────────────────────┤
│  Categories: [Other (active)]   │
│  ┌─────────────────────────┐   │
│  │ Q1: Question 1          │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Q2: Question 2          │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Q3: Question 3          │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
Total Height: ~400px
```

### Scenario 2: Category with 7 Questions (e.g., "Schedule & Process")
```
┌─────────────────────────────────┐
│         FAQ Button ↑            │ ← 42px button (always visible)
├─────────────────────────────────┤
│ Categories: [Process (active)]  │
│  ┌─────────────────────────┐   │
│  │ Q1: Question 1          │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Q2: Question 2          │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Q3: Question 3          │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Q4: Question 4          │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Q5: Question 5          │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Q6: Question 6          │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Q7: Question 7          │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
Total Height: ~620px
```

**The height should visibly change when switching from "Other" to "Schedule & Process".**

---

## The Technical Setup

### HTML Structure
```html
<div class="bottom-tabs">                      <!-- Root container -->
  <div class="bottom-tab-panel faq-panel">     <!-- FAQ Panel - THIS needs dynamic height -->

    <div class="bottom-tabs-buttons">          <!-- Button area: 42px tall -->
      <button class="bottom-tab-btn faq-btn">
        FAQ ▲
      </button>
    </div>

    <div class="bottom-tabs-content">          <!-- Content wrapper -->
      <div class="bottom-tab-inner faq-inner"> <!-- Inner wrapper with padding: 40px top, 30px bottom -->
        <div class="faq-content">              <!-- Actual FAQ content -->

          <div class="faq-categories">         <!-- Category buttons (variable height due to wrapping) -->
            <button class="faq-category-btn active">Services</button>
            <button class="faq-category-btn">Pricing</button>
            <!-- ... more buttons -->
          </div>

          <div class="faq-list">               <!-- Question list -->
            <div class="faq-item" data-category="services" style="display: block;">
              <!-- Question 1 -->
            </div>
            <div class="faq-item" data-category="services" style="display: block;">
              <!-- Question 2 -->
            </div>
            <div class="faq-item" data-category="pricing" style="display: none;">
              <!-- Hidden question from different category -->
            </div>
            <!-- ... more questions -->
          </div>

        </div>
      </div>
    </div>

  </div>
</div>
```

---

## Current Implementation (What We Have)

### CSS (src/styles/bottomtabs.css, lines 36-48)
```css
.bottom-tab-panel.faq-panel {
  /* CSS variable with default fallback */
  --faq-panel-height: calc(85vh + 42px);

  /* Height uses the CSS variable */
  height: var(--faq-panel-height);

  /* Bottom position calculated to keep 42px button visible */
  bottom: calc(-1 * (var(--faq-panel-height) - 42px));

  max-height: 95vh;
  z-index: 1;
  transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

/* When FAQ is active (open), override bottom position */
.bottom-tabs.faq-active .faq-panel {
  bottom: 0 !important;
  z-index: 3;
}
```

**How this SHOULD work**:
- JavaScript sets `--faq-panel-height` to a pixel value (e.g., `450px`)
- CSS `height` property uses that variable
- CSS `bottom` property auto-calculates based on that variable
- When the variable changes, both `height` and `bottom` transition smoothly

### JavaScript (src/components/BottomTabs.js, lines 118-144)
```javascript
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
```

**This method is called**:
1. After initial FAQ render (line 113)
2. After category button click (line 238)
3. After accordion toggle (line 215)

---

## Why It's Not Working - Debugging Checklist

### Issue 1: JavaScript Not Running
**Check**: Is `updateFaqPanelHeight()` actually being called?
- Open browser DevTools Console
- Look for `"FAQ Panel Height Update:"` logs
- If you see NO logs → JavaScript not executing
- If you see logs → Check the values

### Issue 2: Wrong Element Being Measured
**Check**: Is `.faq-inner` the correct element?
- Console should show `contentHeight` value
- This should change when switching categories
- If `contentHeight` is SAME for all categories → Wrong element or measurement issue

**Possible fixes**:
- Maybe we need to measure `.faq-content` instead
- Maybe `scrollHeight` doesn't update immediately after filtering
- Maybe we need to force a reflow before measuring

### Issue 3: CSS Variable Not Being Set
**Check**: Is the CSS variable actually being set on the element?
- Inspect `.faq-panel` element in DevTools
- Look at element styles (not computed styles)
- Should see: `style="--faq-panel-height: 450px;"` (or similar)
- If missing → `setProperty()` failing

### Issue 4: CSS Not Using the Variable
**Check**: Is CSS reading the variable value?
- Inspect `.faq-panel` element
- Look at **Computed** tab in DevTools
- Check `height` property
- Should show pixel value like `450px`
- If shows `calc(85vh + 42px)` → CSS variable not being read

### Issue 5: Transition Overriding Changes
**Check**: Is the transition preventing instant changes?
- Try temporarily removing: `transition: all 400ms`
- See if height changes immediately without transition
- If yes → Transition timing issue
- If no → Deeper problem

### Issue 6: `display: none` Affecting Measurements
**Check**: Are hidden FAQ items affecting `scrollHeight`?
- Hidden items with `display: none` should NOT contribute to `scrollHeight`
- But maybe they are due to layout quirks
- Try measuring after a longer delay

---

## Detailed Debugging Steps

### Step 1: Verify JavaScript Execution
1. Open the website
2. Click FAQ button to open panel
3. Open DevTools Console (F12)
4. Should see log: `FAQ Panel Height Update: { contentHeight: XXX, totalHeight: YYY, variable: "ZZZpx" }`
5. Click "기타" (Other) category button
6. Should see ANOTHER log with DIFFERENT numbers

**Expected**:
- Services (6 questions): `contentHeight` ≈ 400-500px
- Other (3 questions): `contentHeight` ≈ 300-350px

**If contentHeight is the SAME**: Measurement is broken.

### Step 2: Inspect Element Styles
1. Right-click FAQ panel
2. Inspect element
3. Find `.bottom-tab-panel.faq-panel` in Elements tab
4. Look at element.style in Styles panel
5. Should see: `--faq-panel-height: 450px;` (or similar)

**If missing**: JavaScript isn't setting the variable.

### Step 3: Check Computed Styles
1. With `.faq-panel` selected in Elements
2. Switch to **Computed** tab
3. Find `height` property
4. Should show a pixel value like `450px`
5. Should NOT show `calc(85vh + 42px)`

**If showing calc()**: CSS variable not working.

### Step 4: Check Bottom Position
1. Still in Computed tab
2. Find `bottom` property
3. Should show negative pixel value like `-408px`
4. When you switch categories, this should change

**If not changing**: CSS calc() formula not recalculating.

### Step 5: Test Without Transition
1. Temporarily edit CSS in DevTools
2. Remove `transition: all 400ms` from `.faq-panel`
3. Click different category buttons
4. See if height changes instantly

**If height NOW changes**: Transition was blocking it (weird but possible).
**If height STILL doesn't change**: Problem is elsewhere.

---

## Possible Root Causes

### Cause A: `scrollHeight` Returns 0 or Wrong Value
**Why**: Element might be hidden or not painted when measured
**Fix**:
- Add longer delay before measurement
- Force reflow: `faqInner.offsetHeight` before measuring `scrollHeight`
- Measure a different element

### Cause B: CSS Variable Syntax Error
**Why**: Browser doesn't support nested `calc()` with CSS variables
**Fix**:
- Simplify CSS to avoid nested calc
- Set height directly instead of using variable

### Cause C: Specificity or Override Issue
**Why**: Another CSS rule is overriding the height
**Fix**:
- Use `!important` on height (temporary debug)
- Check for conflicting rules

### Cause D: JavaScript Timing Issue
**Why**: Element not ready when measuring
**Fix**:
- Increase `requestAnimationFrame` nesting (try 3x)
- Add manual delay with `setTimeout()`

### Cause E: Browser Caching
**Why**: Old CSS/JS still loaded
**Fix**:
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Check Network tab that new files loaded

---

## Alternative Approaches to Try

### Approach 1: Direct Inline Styles (Bypass CSS Variables)
Instead of setting CSS variable, set height and bottom directly:

```javascript
updateFaqPanelHeight() {
  const faqPanel = this.container.querySelector('.faq-panel');
  const faqInner = this.container.querySelector('.faq-inner');

  if (!faqPanel || !faqInner) return;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const contentHeight = faqInner.scrollHeight;
      const totalHeight = 42 + contentHeight;

      // Set inline styles directly
      faqPanel.style.height = `${totalHeight}px`;

      // Only set bottom if not active
      if (!this.container.classList.contains('faq-active')) {
        faqPanel.style.bottom = `-${totalHeight - 42}px`;
      }

      console.log('Direct style update:', { contentHeight, totalHeight });
    });
  });
}
```

**Pros**: Simpler, no CSS variable complexity
**Cons**: Might conflict with CSS transitions

### Approach 2: Measure After Visible Delay
Add explicit delay to ensure DOM is ready:

```javascript
updateFaqPanelHeight() {
  const faqPanel = this.container.querySelector('.faq-panel');
  const faqInner = this.container.querySelector('.faq-inner');

  if (!faqPanel || !faqInner) return;

  // Force reflow
  void faqInner.offsetHeight;

  setTimeout(() => {
    const contentHeight = faqInner.scrollHeight;
    const totalHeight = 42 + contentHeight;

    faqPanel.style.setProperty('--faq-panel-height', `${totalHeight}px`);

    console.log('Delayed measurement:', { contentHeight, totalHeight });
  }, 50); // 50ms delay
}
```

### Approach 3: Measure Different Element
Maybe `.faq-inner` isn't the right element. Try `.faq-content`:

```javascript
updateFaqPanelHeight() {
  const faqPanel = this.container.querySelector('.faq-panel');
  const faqContent = this.container.querySelector('.faq-content');

  if (!faqPanel || !faqContent) return;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const contentHeight = faqContent.scrollHeight;

      // Add padding manually: 40px top + 30px bottom
      const totalHeight = 42 + 40 + contentHeight + 30;

      faqPanel.style.setProperty('--faq-panel-height', `${totalHeight}px`);

      console.log('Measuring faq-content:', { contentHeight, totalHeight });
    });
  });
}
```

### Approach 4: Calculate From Visible Items
Manually count and measure visible FAQ items:

```javascript
updateFaqPanelHeight() {
  const faqPanel = this.container.querySelector('.faq-panel');
  const visibleItems = this.container.querySelectorAll('.faq-item[style*="display: block"], .faq-item:not([style*="display: none"])');

  if (!faqPanel || visibleItems.length === 0) return;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Sum up heights of visible items
      let itemsHeight = 0;
      visibleItems.forEach(item => {
        itemsHeight += item.offsetHeight;
      });

      // Add category buttons height
      const categoriesEl = this.container.querySelector('.faq-categories');
      const categoriesHeight = categoriesEl ? categoriesEl.offsetHeight : 0;

      // Total: button(42) + padding(70) + categories + items
      const totalHeight = 42 + 70 + categoriesHeight + itemsHeight;

      faqPanel.style.setProperty('--faq-panel-height', `${totalHeight}px`);

      console.log('Manual calculation:', {
        visibleItems: visibleItems.length,
        itemsHeight,
        categoriesHeight,
        totalHeight
      });
    });
  });
}
```

---

## What to Report Back

After trying these debugging steps, please provide:

1. **Console logs**: What do you see when clicking FAQ and changing categories?
2. **Element inspection**: Is `--faq-panel-height` being set on the element?
3. **Computed height**: What value shows in Computed tab for `height`?
4. **Which approach worked**: Did any of the 4 alternative approaches fix it?

This information will help identify the exact root cause.

---

## Expected Console Output (If Working)

When opening FAQ tab:
```
FAQ Panel Height Update: {
  contentHeight: 487,
  totalHeight: 529,
  variable: "529px"
}
```

When clicking "Other" (3 questions):
```
FAQ Panel Height Update: {
  contentHeight: 312,
  totalHeight: 354,
  variable: "354px"
}
```

When clicking "Schedule & Process" (7 questions):
```
FAQ Panel Height Update: {
  contentHeight: 582,
  totalHeight: 624,
  variable: "624px"
}
```

**The `contentHeight` and `totalHeight` values should CHANGE** when switching categories.

If they don't change, the measurement is broken.
