# Auto-Scroll to Reveal Tooltip - Debug Analysis

## Problem Statement
The auto-scroll functionality for team profile tooltips is not working. When hovering over a profile card near the bottom of the viewport, the tooltip should trigger a smooth scroll to ensure the full tooltip content is visible. Currently, the scroll does not occur.

## Current Implementation

### JavaScript Logic (`src/components/TeamProfiles.js` lines 70-93)

```javascript
const triggerScrollReveal = () => {
  const reveal = card.querySelector('.profile-reveal');
  if (!reveal) return;

  // Wait for CSS transition to complete (300ms) plus small buffer
  setTimeout(() => {
    const rect = reveal.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // If the bottom of the popup is below the viewport edge
    if (rect.bottom > viewportHeight) {
      const extraSpace = 40; // Safety buffer
      const scrollDistance = rect.bottom - viewportHeight + extraSpace;

      window.scrollBy({
        top: scrollDistance,
        behavior: 'smooth'
      });
    }
  }, 350);
};

card.addEventListener('mouseenter', triggerScrollReveal);
card.addEventListener('click', triggerScrollReveal);
```

### CSS Styling (`src/styles/content.css` lines 1158-1185)

```css
.profile-reveal {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 20px;
  opacity: 0;
  visibility: hidden;
  transform-origin: top center;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  text-align: left;
  font-size: 0.85rem;
  line-height: 1.7;
  color: #555;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #eee;
  border-radius: 4px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  width: 280px;
  pointer-events: none;
  z-index: 2000;
}

.team-member:hover .profile-reveal {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
```

## Potential Issues

### 1. **Hidden Element Has Zero Height**
The `.profile-reveal` element has `visibility: hidden` and `opacity: 0` in its default state. When `getBoundingClientRect()` is called:
- The element is still in the DOM (not `display: none`)
- **BUT** its dimensions might not be fully calculated if the content hasn't rendered yet
- The `rect.bottom` value might be returning `0` or an incorrect value

**Test**: Add `console.log(rect, rect.bottom, viewportHeight)` inside the setTimeout to see actual values.

### 2. **Timing Issue - Transition Hasn't Started**
The CSS uses only `opacity` and `visibility` transitions (both 0.3s), but:
- There's **no height/max-height animation** currently
- The element should be instantly at full height once hover occurs
- The 350ms delay might be **too long** or **not synchronized** with the actual rendering

**Hypothesis**: The element might be fully rendered immediately (no height animation), but `getBoundingClientRect()` is being called when the element is still `visibility: hidden`, which could affect calculations.

### 3. **No Height Animation = Instant Layout**
Looking at the CSS, the `.profile-reveal` element does NOT have any `max-height` transition. It goes from:
- Hidden: `opacity: 0, visibility: hidden`
- Visible: `opacity: 1, visibility: visible`

This means the element's **layout box is always present** (position: absolute), just invisible. The `rect.bottom` should be calculable immediately on hover, **before** the opacity transition completes.

**Implication**: The 350ms delay is likely waiting for a transition that doesn't affect layout. The element's bounding box should be measurable at `0ms`.

### 4. **Transform Affects getBoundingClientRect()**
The element uses `transform: translateX(-50%)` which can affect coordinate calculations:
- `getBoundingClientRect()` returns coordinates relative to the viewport
- Transforms are applied **after** layout
- This should be fine, but could cause subtle pixel differences

### 5. **Pointer Events Interference**
The element has `pointer-events: none` when hidden, which becomes `auto` on hover. This shouldn't affect `getBoundingClientRect()`, but it's worth noting.

### 6. **Event Timing on Mouseenter**
The `mouseenter` event fires as soon as the mouse crosses the boundary of `.team-member`. At this point:
- The `:hover` pseudo-class is applied
- CSS transitions **start** but haven't completed
- The element's layout should be instantly available

## Diagnostic Steps

### Step 1: Add Console Logging
```javascript
const triggerScrollReveal = () => {
  const reveal = card.querySelector('.profile-reveal');
  if (!reveal) {
    console.log('❌ Reveal element not found');
    return;
  }

  console.log('🔍 Reveal element found, waiting for layout...');

  setTimeout(() => {
    const rect = reveal.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    console.log('📏 Measurements:', {
      'rect.bottom': rect.bottom,
      'rect.height': rect.height,
      'rect.top': rect.top,
      'viewportHeight': viewportHeight,
      'isOffBottom': rect.bottom > viewportHeight,
      'scrollDistance': rect.bottom - viewportHeight + 40
    });

    if (rect.bottom > viewportHeight) {
      const extraSpace = 40;
      const scrollDistance = rect.bottom - viewportHeight + extraSpace;

      console.log('✅ Scrolling by:', scrollDistance);

      window.scrollBy({
        top: scrollDistance,
        behavior: 'smooth'
      });
    } else {
      console.log('❌ No scroll needed - tooltip is within viewport');
    }
  }, 350);
};
```

### Step 2: Test Without Delay
Try changing the timeout to `0` to see if the element is immediately measurable:

```javascript
setTimeout(() => {
  // ... measurement logic
}, 0); // or just remove setTimeout entirely
```

### Step 3: Check Computed Styles
Verify the element is actually visible after hover:

```javascript
setTimeout(() => {
  const computedStyle = window.getComputedStyle(reveal);
  console.log('Computed styles:', {
    opacity: computedStyle.opacity,
    visibility: computedStyle.visibility,
    display: computedStyle.display,
    height: computedStyle.height
  });

  const rect = reveal.getBoundingClientRect();
  // ... rest of logic
}, 350);
```

### Step 4: Use TransitionEnd Event
Instead of a fixed timeout, listen for the actual transition completion:

```javascript
const triggerScrollReveal = () => {
  const reveal = card.querySelector('.profile-reveal');
  if (!reveal) return;

  const handleTransitionEnd = (e) => {
    if (e.propertyName === 'opacity') {
      const rect = reveal.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (rect.bottom > viewportHeight) {
        const scrollDistance = rect.bottom - viewportHeight + 40;
        window.scrollBy({
          top: scrollDistance,
          behavior: 'smooth'
        });
      }

      reveal.removeEventListener('transitionend', handleTransitionEnd);
    }
  };

  reveal.addEventListener('transitionend', handleTransitionEnd);
};
```

## Likely Root Cause

Based on the code analysis, the most likely issue is:

**The `visibility: hidden` state prevents accurate `getBoundingClientRect()` calculations.**

Even though the element is in the DOM with `position: absolute`, browsers may optimize rendering by not calculating the full layout box for invisible elements. When `setTimeout` fires at 350ms, the element might still be transitioning or the browser hasn't committed the layout changes yet.

## Recommended Fixes

### Option 1: Remove the Timeout, Use Immediate Calculation
Since there's no height animation, the layout should be instantly available:

```javascript
const triggerScrollReveal = () => {
  const reveal = card.querySelector('.profile-reveal');
  if (!reveal) return;

  // Force a reflow to ensure layout is calculated
  void reveal.offsetHeight;

  const rect = reveal.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  if (rect.bottom > viewportHeight) {
    const scrollDistance = rect.bottom - viewportHeight + 40;
    window.scrollBy({
      top: scrollDistance,
      behavior: 'smooth'
    });
  }
};
```

### Option 2: Add a Max-Height Transition to the CSS
Make the height animation explicit so the timing is predictable:

```css
.profile-reveal {
  /* ... existing styles ... */
  max-height: 0;
  overflow: hidden;
  transition: opacity 0.3s ease,
              visibility 0.3s ease,
              max-height 0.3s ease;
}

.team-member:hover .profile-reveal {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  max-height: 500px; /* Large enough for content */
}
```

Then adjust the JavaScript timeout to match:

```javascript
setTimeout(() => {
  // ... calculation logic
}, 300); // Match the transition duration exactly
```

### Option 3: Use requestAnimationFrame Chaining
Ensure the browser has fully rendered the visible state:

```javascript
const triggerScrollReveal = () => {
  const reveal = card.querySelector('.profile-reveal');
  if (!reveal) return;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const rect = reveal.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (rect.bottom > viewportHeight) {
        const scrollDistance = rect.bottom - viewportHeight + 40;
        window.scrollBy({
          top: scrollDistance,
          behavior: 'smooth'
        });
      }
    });
  });
};
```

## Next Steps

1. Add console logging to see actual measurements
2. Test with `timeout: 0` to see if timing is the issue
3. Verify the element is actually receiving hover state
4. Check if the condition `rect.bottom > viewportHeight` is ever true
5. Ensure there are no CSS issues preventing the element from being positioned correctly

## Additional Considerations

- **Z-index conflicts**: Verify nothing is overlapping the tooltip
- **Parent container scroll**: If `.content-box` or `.content-inner` has `overflow: hidden`, it might prevent scrolling
- **Smooth scroll support**: Some browsers might not support `behavior: 'smooth'` - add a fallback
- **Multiple rapid hovers**: The timeout might stack if user hovers multiple times quickly - consider debouncing
