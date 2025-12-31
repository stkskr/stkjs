# Bug: Unwanted Animation on Direct Page Load

## Problem Description

When a user loads a page directly by typing the URL (e.g., `http://localhost:5179/about` or `http://localhost:5179/en/portfolio`) or by refreshing the page, they see an unwanted animation where the quadrant grid animates into the expanded state.

**Expected Behavior:**
- When clicking to navigate from the homepage to a section (e.g., clicking "About" from `/`), the quadrants should animate smoothly into the expanded state
- When loading a page directly via URL (e.g., typing `/about` in the address bar or refreshing), the page should appear instantly in its final expanded state without any animation

**Actual Behavior:**
- Both navigation from homepage AND direct page loads show the expanding animation
- This creates a jarring experience when users refresh the page or share direct links

## Technical Context

### Application Architecture

This is a single-page application (SPA) with:
- **Router**: Handles URL parsing and navigation (`src/core/router.js`)
- **State Manager**: Central state management (`src/core/state.js`)
- **Grid Quadrant Component**: Manages the 4-quadrant homepage grid and handles expansion animations (`src/components/GridQuadrant.js`)

### How Navigation Works

1. User navigates to a URL (either by clicking or direct load)
2. Router parses the URL and extracts:
   - Section (`about`, `services`, `portfolio`, `clients`, or `null` for homepage)
   - Language (`ko` or `en`)
   - Portfolio slug (if applicable)
3. Router sets the app state including `appState: 'expanding'`
4. Components subscribe to state changes and re-render
5. When `appState === 'expanding'`, CSS classes are applied that trigger animations

### Current State Values

The `appState` can be:
- `'idle'`: Homepage (4 quadrants visible, no section selected)
- `'expanding'`: Transition animation is playing (quadrants animating to expanded state)
- `'expanded'`: **NEW STATE WE ADDED** - Final expanded state without animation

## Attempted Solution

### Changes Made

**File: `src/core/router.js`**

Added an `isInitialLoad` flag to track the first route:

```javascript
class Router {
  constructor() {
    this.hasDetectedLanguage = false;
    this.isInitialLoad = true; // Track if this is the first route handling
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

**Logic:**
1. If it's the initial load (`this.isInitialLoad === true`) and there's a section, use `appState: 'expanded'`
2. If it's a subsequent navigation with a section, use `appState: 'expanding'`
3. After handling the first route, set `isInitialLoad = false`

**File: `src/components/GridQuadrant.js`**

Updated to treat both `'expanding'` and `'expanded'` states the same way:

```javascript
render(state) {
  const { currentSection, language, appState } = state;

  this.container.className = 'container';
  document.body.className = '';

  if ((appState === 'expanding' || appState === 'expanded') && currentSection) {
    this.container.classList.add('stateExpanding');
    this.container.classList.add(`${currentSection}Selected`);
    document.body.classList.add('stateExpanding');
    document.body.classList.add(`${currentSection}Selected`);

    // Force reflow for Safari to recognize overflow-y: auto immediately
    void this.container.offsetHeight;
    requestAnimationFrame(() => {
      this.container.style.overflowY = 'auto';
    });
  } else {
    // Reset overflow and scroll position when returning to homepage
    this.container.style.overflowY = '';
    this.container.scrollTop = 0;
  }
  // ... rest of render logic
}
```

## Current Status

**The fix is not working.** The animation still plays on direct page loads.

## Hypotheses for Why It's Not Working

### Hypothesis 1: CSS Transitions Are Still Triggered
Even though we're setting `appState: 'expanded'` on initial load, the CSS classes `stateExpanding` and `${currentSection}Selected` are being added to elements that start with no classes. The browser may be interpreting this as a state change and triggering transitions anyway.

**Potential CSS Issue:**
The CSS might be using transitions that fire whenever the class is added, regardless of whether it's the initial render or a state change.

### Hypothesis 2: Timing Issue with Class Application
The classes might be applied in a way that the browser sees as an animation-triggering event, even on initial render.

### Hypothesis 3: Animation CSS is Always Active
The animation might be defined globally and always triggers when the `stateExpanding` class is present, with no way to distinguish between "skip animation" and "play animation."

## Files Involved

### Core Logic Files
- **`src/core/router.js`**: Router that handles URL parsing and sets app state
- **`src/core/state.js`**: State management (simple pub/sub pattern)
- **`src/main.js`**: App initialization and component mounting

### Component Files
- **`src/components/GridQuadrant.js`**: Manages the 4-quadrant grid and expansion logic
- **`src/components/Content.js`**: Renders section content (About, Portfolio, etc.)

### Style Files
- **`src/styles/global.css`**: Contains `.container` and body styles
- **`src/styles/animations.css`**: Contains transition/animation definitions
- **`src/styles/quadrants.css`**: Contains quadrant grid layout and states

## Relevant CSS Classes

```css
/* From src/styles/global.css */
.container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100dvh;
  background: var(--color-content-white);
  overflow-x: hidden;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.container.stateExpanding {
  overflow-y: auto;
}

/* These classes are dynamically added based on which section is selected */
.aboutSelected { /* ... */ }
.servicesSelected { /* ... */ }
.portfolioSelected { /* ... */ }
.clientsSelected { /* ... */ }
```

The animation likely happens through CSS transitions defined in `src/styles/animations.css` or `src/styles/quadrants.css`.

## What We Need Help With

1. **Why is the animation still playing on initial load despite setting `appState: 'expanded'`?**
2. **Is there a better way to conditionally skip CSS transitions on initial render?**
3. **Should we use a different approach, such as:**
   - Adding a separate class like `no-transition` on initial load?
   - Using JavaScript to disable transitions temporarily?
   - Checking `document.readyState` or using a `DOMContentLoaded` event?
4. **Is the `isInitialLoad` flag being reset too early or too late?**

## Debugging Steps Taken

1. ✅ Added `isInitialLoad` flag to router
2. ✅ Created `'expanded'` state as distinct from `'expanding'`
3. ✅ Updated GridQuadrant component to handle both states
4. ❌ Animation still plays on direct page load

## Additional Notes

- The app uses Vite as the build tool
- The state management is a simple custom pub/sub pattern (not Redux or similar)
- All CSS transitions are likely defined declaratively in CSS files, not via JavaScript
- The app needs to work across modern browsers (Chrome, Firefox, Safari, Edge)

## Example URLs to Test

- Homepage: `http://localhost:5179/`
- Direct load (should NOT animate): `http://localhost:5179/about`
- Navigate from homepage (should animate): Click "About" from `/` → should animate
- Refresh on section page (should NOT animate): Refresh while on `/about` → should appear instantly

## Request

Please help identify why the animation is still triggering on initial page load and suggest a solution that:
1. Skips the animation when loading `/about` directly or refreshing the page
2. Preserves the animation when navigating from the homepage to a section
3. Works reliably across different browsers
4. Doesn't require major architectural changes if possible
