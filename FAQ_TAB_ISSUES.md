# FAQ Tab Issues

## Problem 1: Tab Movement and Positioning Not Working

### Problem Description

The FAQ and Contact tab buttons are no longer sliding to their offset positions when minimized or animating to center when maximized. The tabs should have smooth sliding animations based on their state, but this behavior has stopped working.

**Expected Behavior:**
- When **minimized** (tabs closed):
  - Contact button should be offset to the **LEFT** (translateX(-50%))
  - FAQ button should be offset to the **RIGHT** (translateX(50%))
  - This creates a visual separation showing two distinct tab options

- When **maximized** (tab opened):
  - The active tab button should slide to **CENTER** (translateX(0))
  - The inactive tab should remain in its offset position
  - Smooth transition animation between positions

**Actual Behavior:**
- Tab buttons are not moving to their offset positions
- Both tabs appear to be centered or not translating at all
- The visual separation between Contact and FAQ tabs is missing
- Opening/closing tabs doesn't trigger the sliding animation

### Technical Context

#### Application Architecture

The bottom tabs system consists of two independent panels:
- **Contact Panel**: Located at bottom-left when minimized, centers when active
- **FAQ Panel**: Located at bottom-right when minimized, centers when active

Each panel has:
1. A button at the top (`bottom-tab-btn`)
2. Content area below the button (`bottom-tabs-content`)
3. State classes that control positioning (`contact-active`, `faq-active`)

#### How Tab Positioning Should Work

The positioning is controlled by CSS transforms and state classes:

1. **Default/Minimized State** (no active class):
   ```css
   /* Contact button offset to LEFT */
   .contact-panel .bottom-tab-btn {
     transform: translateX(-50%);
   }

   /* FAQ button offset to RIGHT */
   .faq-panel .bottom-tab-btn {
     transform: translateX(50%);
   }
   ```

2. **Active/Maximized State** (with `.contact-active` or `.faq-active`):
   ```css
   /* Contact button centered when active */
   .bottom-tabs.contact-active .contact-panel .bottom-tab-btn {
     transform: translateX(0);
   }

   /* FAQ button centered when active */
   .bottom-tabs.faq-active .faq-panel .bottom-tab-btn {
     transform: translateX(0);
   }
   ```

3. **Transition**:
   ```css
   transform: translateX(-50%);
   transition: transform 400ms cubic-bezier(0.4, 0, 0.2, 1);
   ```

### Current CSS (What We Have Now)

**File: `src/styles/bottomtabs.css`**

Lines 59-87 contain the tab positioning logic:

```css
/* Tab Buttons - At top of panel */
.bottom-tabs-buttons {
  display: flex;
  justify-content: center;
  height: 42px;
  position: relative;
  z-index: 2;
}

/* Contact button offset to LEFT when minimized */
.contact-panel .bottom-tab-btn {
  transform: translateX(-50%);
  transition: transform 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Contact button centered when active */
.bottom-tabs.contact-active .contact-panel .bottom-tab-btn {
  transform: translateX(0);
}

/* FAQ button offset to RIGHT when minimized */
.faq-panel .bottom-tab-btn {
  transform: translateX(50%);
  transition: transform 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* FAQ button centered when active */
.bottom-tabs.faq-active .faq-panel .bottom-tab-btn {
  transform: translateX(0);
}
```

### Why It's Not Working

**Possible Issues:**

1. **CSS Specificity Conflict**: Another CSS rule might be overriding the transform
2. **Class Not Being Applied**: The `.contact-active` or `.faq-active` classes might not be added to the `.bottom-tabs` container
3. **Transition Being Overridden**: The transition might be disabled by another rule
4. **Transform Being Reset**: Some other CSS might be setting `transform: none` or similar

### Debugging Steps Needed

1. **Check if state classes are applied**:
   - Open browser DevTools
   - Click Contact or FAQ button
   - Inspect the `.bottom-tabs` container
   - Verify that `.contact-active` or `.faq-active` is added

2. **Check computed styles**:
   - Inspect `.contact-panel .bottom-tab-btn`
   - Look at computed `transform` value
   - Should be `translateX(-50%)` when minimized
   - Should be `translateX(0px)` when active

3. **Check for conflicting CSS**:
   - Search for other `transform` rules affecting `.bottom-tab-btn`
   - Look for `!important` declarations that might override
   - Check if any other classes are being added that affect positioning

4. **Verify JavaScript is working**:
   - Check `BottomTabs.js` `openTab()` method
   - Ensure `this.container.classList.add('contact-active')` is executing
   - Verify the `.bottom-tabs` element is the correct container

### Files Involved

- **`src/styles/bottomtabs.css`**: Lines 59-87 (tab positioning CSS)
- **`src/components/BottomTabs.js`**: Lines 50-71 (`openTab()` and `closeTab()` methods)

---

## Problem 2: Category Buttons Not Filtering FAQ Questions

### Problem Description

When clicking on category buttons (Services & Team, Request & Pricing, etc.), the FAQ list is not being filtered to show only questions from that category. All questions remain visible regardless of which category button is clicked.

**Expected Behavior:**
- Clicking "서비스 & 팀 소개" should show **only** the 6 questions in the `services` category
- Clicking "의뢰 & 비용 안내" should show **only** the 5 questions in the `pricing` category
- Clicking "일정 & 프로세스" should show **only** the 7 questions in the `process` category
- Clicking "저작권 & 상표권" should show **only** the 3 questions in the `legal` category
- Clicking "기타" should show **only** the 3 questions in the `other` category
- The active category button should have the blue background (`#2c3e50`)
- Non-active category buttons should have white background

**Actual Behavior:**
- Clicking category buttons does nothing
- All 25 questions are always visible
- Category buttons don't visually change to active state
- No filtering occurs

### Technical Context

#### How Category Filtering Should Work

1. **Each FAQ item has a `data-category` attribute**:
   ```html
   <div class="faq-item" data-category="services">...</div>
   <div class="faq-item" data-category="pricing">...</div>
   ```

2. **Category buttons have a `data-category` attribute**:
   ```html
   <button class="faq-category-btn active" data-category="services">서비스 & 팀 소개</button>
   <button class="faq-category-btn" data-category="pricing">의뢰 & 비용 안내</button>
   ```

3. **JavaScript should**:
   - Listen for clicks on `.faq-category-btn`
   - Get the `data-category` value from the clicked button
   - Hide all `.faq-item` elements
   - Show only `.faq-item[data-category="selected-category"]`
   - Update `.active` class on category buttons

4. **CSS for showing/hiding**:
   ```css
   .faq-item {
     display: block; /* or whatever the default is */
   }

   .faq-item.hidden {
     display: none;
   }
   ```

### Current Implementation

**File: `src/components/BottomTabs.js`**

#### Rendering (Lines 152-189)

The FAQ content is rendered with categories and questions:

```javascript
renderFaqContent() {
  const categories = ['services', 'pricing', 'process', 'legal', 'other'];

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
```

#### Event Handling (Lines 191-213)

Currently, there is **NO event listener** for category button clicks. The only event listener is for FAQ accordion (question expand/collapse):

```javascript
mount(parent) {
  parent.appendChild(this.container);

  // Add FAQ accordion functionality after mounting
  this.container.addEventListener('click', (e) => {
    const target = e.target;
    const questionBtn = target.closest('.faq-question');

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
    }
  });
}
```

### Why It's Not Working

**The category filtering functionality has never been implemented.**

There is:
- ✅ HTML structure with `data-category` attributes
- ✅ Category buttons rendered
- ❌ **NO event listener for category button clicks**
- ❌ **NO JavaScript logic to filter FAQ items**
- ❌ **NO CSS classes to hide/show items based on category**

### What Needs to Be Added

#### 1. Add Event Listener for Category Buttons

In `BottomTabs.js` `mount()` method, add:

```javascript
// Add category filtering functionality
this.container.addEventListener('click', (e) => {
  const categoryBtn = e.target.closest('.faq-category-btn');

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
  }
});
```

#### 2. Add CSS for Hidden State (Optional)

In `bottomtabs.css`, add:

```css
.faq-item.hidden {
  display: none;
}
```

#### 3. Initialize Filter on First Load

When the FAQ tab is first opened, only "services" questions should be visible (since "Services & Team" is the default active category).

Add to the end of `renderFaqContent()`:

```javascript
// After rendering, hide all non-services items by default
setTimeout(() => {
  const allFaqItems = this.container.querySelectorAll('.faq-item');
  allFaqItems.forEach(item => {
    if (item.dataset.category !== 'services') {
      item.style.display = 'none';
    }
  });
}, 0);
```

### Files Involved

- **`src/components/BottomTabs.js`**: Lines 191-213 (mount method needs category click handler)
- **`src/data/faq.js`**: Contains all FAQ data with categories (already correct)
- **`src/styles/bottomtabs.css`**: May need `.hidden` class for cleaner hiding (optional)

---

## Summary

### Issue 1: Tab Positioning
- **Status**: Previously working, now broken
- **Symptoms**: Tabs not sliding to offset positions when minimized/maximized
- **Likely Cause**: CSS override or JavaScript state class not being applied
- **Fix Needed**: Debug why transform is not working, check class application

### Issue 2: Category Filtering
- **Status**: Never implemented
- **Symptoms**: All FAQ questions always visible, categories don't filter
- **Cause**: No event listener or filtering logic exists
- **Fix Needed**: Add click handler for category buttons and filtering logic

---

## Request for Help

Please help identify and fix:

1. **Tab positioning issue**: Why are the Contact and FAQ tab buttons no longer sliding to their offset positions? The CSS rules appear correct but aren't taking effect.

2. **Category filtering**: Implement the category button click functionality to show/hide FAQ items based on the selected category.

Both features are critical for the FAQ tab user experience.
