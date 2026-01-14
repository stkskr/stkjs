# Mobile Quadrant Height Inconsistency - Safari vs Chrome

## Problem Statement

On mobile devices (max-width: 768px), the expanded quadrant layout shows inconsistent heights between Safari and Chrome/Samsung Internet:

- **Safari iOS**: Main quadrant takes up exactly 50% of viewport height (correct behavior)
- **Chrome Android / Samsung Internet**: Main quadrant appears to take up more than 50% of viewport height (incorrect)

This causes the sub-quadrant to be positioned incorrectly and the overall stacked layout to not match the design.

## Expected Behavior

When a quadrant is selected on mobile (≤768px):
- Main quadrant (selected): 40% of viewport height
- Sub-quadrant: 40% of viewport height
- Together: 80% of viewport height (leaving 20% for content below)

## Current Implementation

### CSS Location
- **File**: `src/styles/quadrants.css`
- **Lines**: 180-204 (mobile media query)

### Current Code
```css
@media (max-width: 768px) {
  /* EXPANDED STATE: Selected quad takes 40% of viewport */
  .quadrant.selected {
    width: 100% !important;
    /* Use svh (small viewport height) which excludes browser UI consistently */
    height: 40svh !important;
    top: 0 !important;
    left: 0 !important;
  }

  /* Sub-quadrant stacks below selected quad */
  .aboutSelected .blue-sub,
  .clientsSelected .blue-sub,
  .servicesSelected .white-sub,
  .portfolioSelected .white-sub {
    left: 0 !important;
    /* Use svh (small viewport height) which excludes browser UI consistently */
    top: 40svh !important;
    width: 100% !important;
    height: 40svh !important;
  }

  /* Adjust sub-quadrant text size */
  .sub-quadrant {
    font-size: 3vw;
    padding: 20px;
  }
}
```

### Desktop Implementation (for reference)
```css
/* Desktop: Selected Quadrant Stays Top-Left */
.quadrant.selected {
  width: 50% !important;
  height: 50dvh !important;
  top: 0 !important;
  left: 0 !important;
  z-index: var(--z-selected) !important;
}
```

## Viewport Height Units Explained

### Traditional Units
- **`vh`** (viewport height): 1vh = 1% of initial viewport height
  - **Problem**: Doesn't account for browser UI (address bar, toolbars)
  - **Result**: On mobile, `100vh` can be taller than visible screen when address bar is shown

### New Viewport Units (Viewport Large/Small/Dynamic)

#### `lvh` (Large Viewport Height)
- Viewport height when browser UI is **hidden** (smallest browser UI)
- Most screen space available
- Example: `100lvh` = full height with address bar hidden

#### `svh` (Small Viewport Height) ✅ Currently Using
- Viewport height when browser UI is **shown** (maximum browser UI)
- Least screen space available
- Example: `100svh` = full height with address bar visible
- **Most conservative** - ensures content fits even with UI present

#### `dvh` (Dynamic Viewport Height) ⚠️ Previous Attempt
- Viewport height that **changes dynamically** as browser UI shows/hides
- Adapts to current state
- Example: `100dvh` changes as user scrolls (address bar appears/disappears)
- **Problem**: Chrome doesn't implement this correctly or consistently

### Browser Support Matrix

| Unit | Safari iOS | Chrome Android | Samsung Internet | Firefox Android |
|------|-----------|----------------|------------------|-----------------|
| `vh` | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| `svh` | ✅ Yes (iOS 15+) | ✅ Yes (Chrome 108+) | ⚠️ Partial | ✅ Yes (Firefox 101+) |
| `dvh` | ✅ Yes (iOS 15+) | ⚠️ Buggy | ⚠️ Buggy | ⚠️ Partial |
| `lvh` | ✅ Yes (iOS 15+) | ✅ Yes (Chrome 108+) | ⚠️ Partial | ✅ Yes (Firefox 101+) |

**Sources**:
- Can I Use: [Large, Small, Dynamic viewport units](https://caniuse.com/viewport-unit-variants)
- MDN: [CSS Values and Units - Viewport-percentage lengths](https://developer.mozilla.org/en-US/docs/Web/CSS/length#viewport-percentage_lengths)

## Previous Attempts

### Attempt 1: `dvh` with `vh` fallback (FAILED)
```css
.quadrant.selected {
  height: 40vh !important;
  height: 40dvh !important;
}
```
**Result**: Chrome ignored or miscalculated `dvh`, causing inconsistent behavior

### Attempt 2: `svh` only (CURRENT - STILL FAILING)
```css
.quadrant.selected {
  height: 40svh !important;
}
```
**Result**: Still showing inconsistency between Safari and Chrome

## Hypotheses for the Issue

### Hypothesis 1: `svh` Browser Support/Implementation
**Theory**: Chrome or Samsung Internet may not fully support `svh` or implement it differently than Safari.

**Test**:
1. Use browser DevTools to inspect computed values
2. Check if Chrome is actually applying `svh` or falling back
3. Compare `getComputedStyle()` values between browsers

**Fix to Try**:
```css
.quadrant.selected {
  height: 40vh !important;
  height: calc(var(--vh, 1vh) * 40) !important;
}
```
With JavaScript:
```javascript
// Set custom property based on actual viewport
const setVh = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};
window.addEventListener('resize', setVh);
setVh();
```

### Hypothesis 2: Box-Sizing or Padding Issues
**Theory**: Chrome and Safari calculate box dimensions differently with borders/padding.

**Test**:
1. Inspect computed height with DevTools
2. Check if borders, padding, or margins differ
3. Verify `box-sizing` is consistent

**Fix to Try**:
```css
.quadrant.selected {
  box-sizing: border-box !important;
  height: 40svh !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
}
```

### Hypothesis 3: Chrome Calculates Viewport Differently
**Theory**: Chrome includes different UI elements in viewport calculation (e.g., counts bottom navigation bar differently).

**Test**:
1. Log `window.innerHeight` on both browsers
2. Log `visualViewport.height` if available
3. Compare at different scroll positions

**Fix to Try**: Use `lvh` (large viewport height) instead
```css
.quadrant.selected {
  height: 40lvh !important;
}
```

### Hypothesis 4: Flexbox/Positioning Conflicts
**Theory**: Parent container constraints or flexbox settings override the height.

**Test**:
1. Inspect parent container `.stateExpanding` settings
2. Check if `min-height` or `max-height` rules exist
3. Verify no conflicting CSS

**Fix to Try**:
```css
.quadrant.selected {
  height: 40svh !important;
  min-height: 40svh !important;
  max-height: 40svh !important;
  flex-shrink: 0 !important;
}
```

### Hypothesis 5: CSS Cascade/Specificity Issues
**Theory**: Another rule with higher specificity is overriding mobile styles on Chrome.

**Test**:
1. Use DevTools to check which styles are applied
2. Look for crossed-out rules
3. Check media query order

**Fix to Try**: Increase specificity
```css
@media (max-width: 768px) {
  body .quadrant.selected {
    height: 40svh !important;
  }
}
```

### Hypothesis 6: Mobile-Fixes.css Override
**Theory**: Rules in `mobile-fixes.css` might be overriding quadrant styles.

**Test**:
Check `src/styles/mobile-fixes.css` lines 160-162:
```css
/* Selected quadrants: Use dvh */
.quadrant.selected {
  height: 40dvh !important;
}
```

**Fix**: Ensure this matches the quadrants.css implementation or remove it.

### Hypothesis 7: Safe Area Insets
**Theory**: Chrome applies safe-area-inset-top/bottom differently, affecting viewport calculations.

**Test**:
```javascript
console.log('Safe area top:', getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)'));
console.log('Safe area bottom:', getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)'));
```

**Fix to Try**:
```css
.quadrant.selected {
  height: calc(40svh - env(safe-area-inset-top, 0px)) !important;
}
```

## Debugging Strategy

### Phase 1: Log Actual Measurements
Add temporary logging to see what browsers are calculating:

```javascript
// Add to main.js or state manager when quadrant is selected
const logViewportInfo = () => {
  const quad = document.querySelector('.quadrant.selected');
  if (quad) {
    console.log('=== Viewport Debug ===');
    console.log('window.innerHeight:', window.innerHeight);
    console.log('visualViewport.height:', window.visualViewport?.height);
    console.log('Quadrant computed height:', getComputedStyle(quad).height);
    console.log('Quadrant offsetHeight:', quad.offsetHeight);
    console.log('Quadrant clientHeight:', quad.clientHeight);
    console.log('40svh computed:', getComputedStyle(document.documentElement).fontSize); // Can't directly compute svh
  }
};

// Run after expansion animation
setTimeout(logViewportInfo, 1000);
```

### Phase 2: Visual Debug Markers
Add temporary borders to see actual dimensions:

```css
.quadrant.selected {
  border: 5px solid red !important;
}

.aboutSelected .blue-sub,
.clientsSelected .blue-sub,
.servicesSelected .white-sub,
.portfolioSelected .white-sub {
  border: 5px solid blue !important;
}
```

### Phase 3: Try Different Viewport Units
Test each unit systematically:

```css
/* Test 1: Use lvh */
.quadrant.selected {
  height: 40lvh !important;
}

/* Test 2: Use fixed calculation */
.quadrant.selected {
  height: calc(var(--viewport-height) * 0.4) !important;
}

/* Test 3: Use absolute pixels (calculate from JS) */
.quadrant.selected {
  height: var(--quadrant-height-px) !important;
}
```

### Phase 4: JavaScript-Based Solution
If CSS viewport units fail, calculate in JavaScript:

```javascript
// In state manager or component that handles quadrant selection
const updateMobileQuadrantHeights = () => {
  if (window.innerWidth <= 768) {
    const vh = window.innerHeight * 0.01;
    const quadrantHeight = vh * 40; // 40% of viewport

    document.documentElement.style.setProperty('--mobile-quadrant-height', `${quadrantHeight}px`);

    // Alternative: Directly set on elements
    const selected = document.querySelector('.quadrant.selected');
    if (selected) {
      selected.style.height = `${quadrantHeight}px`;
    }

    const subs = document.querySelectorAll('.aboutSelected .blue-sub, .clientsSelected .blue-sub, .servicesSelected .white-sub, .portfolioSelected .white-sub');
    subs.forEach(sub => {
      sub.style.height = `${quadrantHeight}px`;
      sub.style.top = `${quadrantHeight}px`;
    });
  }
};

// Call on expansion and resize
window.addEventListener('resize', updateMobileQuadrantHeights);
document.addEventListener('quadrantSelected', updateMobileQuadrantHeights);
```

## Recommended Fixes (Priority Order)

### Fix 1: Check mobile-fixes.css Override (HIGHEST PRIORITY)
File: `src/styles/mobile-fixes.css` around line 160

**Check if this exists and conflicts**:
```css
.quadrant.selected {
  height: 40dvh !important;
}
```

**If found**: Change to match quadrants.css or remove entirely.

### Fix 2: Use lvh Instead of svh
Large viewport height might be more consistently implemented:

```css
.quadrant.selected {
  height: 40lvh !important;
}

.aboutSelected .blue-sub,
.clientsSelected .blue-sub,
.servicesSelected .white-sub,
.portfolioSelected .white-sub {
  top: 40lvh !important;
  height: 40lvh !important;
}
```

### Fix 3: JavaScript-Calculated Heights
Most reliable cross-browser solution:

**quadrants.css**:
```css
.quadrant.selected {
  height: var(--mobile-quadrant-height, 40svh) !important;
}

.aboutSelected .blue-sub,
.clientsSelected .blue-sub,
.servicesSelected .white-sub,
.portfolioSelected .white-sub {
  top: var(--mobile-quadrant-height, 40svh) !important;
  height: var(--mobile-quadrant-height, 40svh) !important;
}
```

**JavaScript** (add to state manager):
```javascript
const setMobileQuadrantHeight = () => {
  if (window.innerWidth <= 768) {
    const height = window.innerHeight * 0.4;
    document.documentElement.style.setProperty('--mobile-quadrant-height', `${height}px`);
  }
};

window.addEventListener('resize', setMobileQuadrantHeight);
window.addEventListener('orientationchange', setMobileQuadrantHeight);
setMobileQuadrantHeight();
```

### Fix 4: Use Flexbox Instead of Fixed Heights
Let the container split automatically:

```css
@media (max-width: 768px) {
  .stateExpanding .container {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .quadrant.selected {
    flex: 0 0 40%;
    height: auto !important;
  }

  .aboutSelected .blue-sub,
  .clientsSelected .blue-sub,
  .servicesSelected .white-sub,
  .portfolioSelected .white-sub {
    flex: 0 0 40%;
    height: auto !important;
    top: auto !important;
  }
}
```

### Fix 5: Hybrid Fallback Approach
Provide multiple fallbacks in order of preference:

```css
.quadrant.selected {
  /* Fallback 1: Traditional vh */
  height: 40vh !important;
  /* Fallback 2: Small viewport height (excludes UI) */
  height: 40svh !important;
  /* Fallback 3: JS-calculated if available */
  height: var(--mobile-quadrant-height, 40svh) !important;
}
```

## Testing Checklist

After implementing a fix, test on:
- [ ] Safari iOS (iPhone) - Portrait
- [ ] Safari iOS (iPhone) - Landscape
- [ ] Chrome Android - Portrait
- [ ] Chrome Android - Landscape
- [ ] Samsung Internet - Portrait
- [ ] Samsung Internet - Landscape
- [ ] Safari iOS (iPad) - Portrait
- [ ] Safari iOS (iPad) - Landscape

**Verify**:
- [ ] Main quadrant is exactly 40% of visible viewport height
- [ ] Sub-quadrant is exactly 40% of visible viewport height
- [ ] Both quadrants together take 80% of viewport
- [ ] Heights remain consistent when scrolling (address bar shows/hides)
- [ ] Heights remain consistent when rotating device
- [ ] No visual jumps or layout shifts during expansion animation

## Success Criteria

The issue is RESOLVED when:
1. On Safari iOS, main quadrant = 40% viewport (already working)
2. On Chrome Android, main quadrant = 40% viewport (currently broken)
3. On Samsung Internet, main quadrant = 40% viewport (currently broken)
4. Heights are visually identical across all three browsers
5. Sub-quadrant positions correctly below main quadrant on all browsers
6. Layout remains stable when browser UI shows/hides during scroll

## Related Files

- `src/styles/quadrants.css` - Main quadrant styling (lines 180-204)
- `src/styles/mobile-fixes.css` - Mobile-specific overrides (check lines 155-165)
- `src/core/state.js` - State manager (handles quadrant selection)
- `src/main.js` - App initialization (could add viewport height JS here)

## Additional Resources

- MDN: [Viewport-percentage lengths](https://developer.mozilla.org/en-US/docs/Web/CSS/length#viewport-percentage_lengths)
- CSS-Tricks: [The Large, Small, and Dynamic Viewport Units](https://css-tricks.com/the-large-small-and-dynamic-viewports/)
- Can I Use: [Viewport unit variants](https://caniuse.com/viewport-unit-variants)
- Web.dev: [viewport units](https://web.dev/viewport-units/)
