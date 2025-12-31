# Developer Guide

Quick reference for the Sticks & Stones website architecture and key systems.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Routing & Language Switching](#routing--language-switching)
3. [Animation System](#animation-system)
4. [Component Architecture](#component-architecture)
5. [State Management](#state-management)
6. [Data-Driven Content](#data-driven-content)
7. [Quick Reference](#quick-reference)

---

## Architecture Overview

**Single Page Application (SPA)** - No page reloads, all navigation happens client-side.

**Tech Stack:**
- TypeScript (no frameworks)
- Vite (build tool)
- Observer pattern (custom state management)

**How it works:** `index.html` loads once → TypeScript initializes → User navigates → URL updates + animations play → No server requests

---

## Routing & Language Switching

### URL Structure

```
Korean (default):  https://stks.kr/portfolio
English:           https://stks.kr/en/portfolio
Portfolio item:    https://stks.kr/en/portfolio/lg-ces-2025
```

**Key Files:**
- Router: [src/core/router.ts](src/core/router.ts)
- State: [src/core/state.ts](src/core/state.ts)
- Language Manager: [src/core/language.ts](src/core/language.ts)
- UI Toggle: [src/components/LanguageToggle.ts](src/components/LanguageToggle.ts)

### How Language Detection Works

**Initial visit** ([router.ts](src/core/router.ts) lines 19-31):
```typescript
if (currentPath === '/' || currentPath === '') {
  const browserLang = navigator.language.toLowerCase();
  const isKorean = browserLang.startsWith('ko');

  if (!isKorean && !this.hasDetectedLanguage) {
    this.navigate('/en/', true);  // Redirect to English
  }
}
```

**URL parsing** ([router.ts](src/core/router.ts) lines 33-54):
```typescript
const hasEnPrefix = segments[0] === 'en';
const language: Language = hasEnPrefix ? 'en' : 'ko';
// First segment = 'en' → English, otherwise → Korean
```

**Switching languages** ([router.ts](src/core/router.ts) lines 92-96):
```typescript
switchLanguage(newLang: Language): void {
  const { currentSection, portfolioSlug } = stateManager.getState();
  const newPath = this.buildPath(currentSection, newLang, portfolioSlug);
  this.navigate(newPath);
}
```

---

## Animation System

**⚠️ CRITICAL**: RK specifically requested smooth animations. Handle with care.

### Timing Constants

**[src/utils/transitions.ts](src/utils/transitions.ts):**
```typescript
export const TRANSITION_TIMINGS = {
  MAIN: 600,          // Main quadrant expansion
  CLOSE: 400,         // Close button transition
  CONTENT_FADE: 300,  // Content opacity fade
  CONTENT_DELAY: 400, // Delay before content appears
}
```

### Key Animation Files

1. **[src/utils/transitions.ts](src/utils/transitions.ts)** - Timing constants (CRITICAL)
2. **[src/styles/animations.css](src/styles/animations.css)** - All animation definitions
3. **[src/styles/variables.css](src/styles/variables.css)** - CSS custom properties
4. **[src/styles/quadrant.css](src/styles/quadrant.css)** - Quadrant expansions

### How Animations Trigger

**State change** ([router.ts](src/core/router.ts) line 84-89):
```typescript
stateManager.setState({
  appState: route.section ? 'expanding' : 'idle',  // Triggers .stateExpanding class
});
```

**CSS transitions** ([animations.css](src/styles/animations.css)):
```css
.center-circle {
  transform: translate(-50%, -50%) scale(1);
  transition: transform var(--duration-main) var(--timing-main);
}

.stateExpanding .center-circle {
  transform: translate(-50%, -50%) scale(0);  /* Scales down in 600ms */
}
```

**Animation sequence:**
1. User clicks quadrant → Router navigates
2. State updates `appState: 'expanding'`
3. `.stateExpanding` class added
4. CSS transitions fire (600ms main, 400ms delay, 300ms fade)

---

## Component Architecture

### Main Components

| Component | File | Purpose |
|-----------|------|---------|
| **QuadrantGrid** | [QuadrantGrid.ts](src/components/QuadrantGrid.ts) | 4-quadrant home layout |
| **ContentArea** | [ContentArea.ts](src/components/ContentArea.ts) | Content renderer |
| **LanguageToggle** | [LanguageToggle.ts](src/components/LanguageToggle.ts) | Language switcher |
| **CloseButton** | [CloseButton.ts](src/components/CloseButton.ts) | Close button |
| **PortfolioGrid** | [PortfolioGrid.ts](src/components/PortfolioGrid.ts) | Portfolio grid with filters |
| **PortfolioModal** | [PortfolioModal.ts](src/components/PortfolioModal.ts) | Portfolio detail modal |
| **ServicesGrid** | [ServicesGrid.ts](src/components/ServicesGrid.ts) | Services image grid |
| **BottomTabs** | [BottomTabs.ts](src/components/BottomTabs.ts) | Contact/FAQ tabs |

### Quadrant Layout

```
┌─────────────┬─────────────┐
│   ABOUT     │  SERVICES   │
│  (red bg)   │  (navy bg)  │
├─────────────┼─────────────┤
│  PORTFOLIO  │   CLIENTS   │
│  (navy bg)  │  (red bg)   │
└─────────────┴─────────────┘
       Center Logo
```

---

## State Management

### Observer Pattern

**Subscribe to state** ([state.ts](src/core/state.ts)):
```typescript
const unsubscribe = stateManager.subscribe((state) => {
  this.render();  // Re-render on state change
});
```

**Update state:**
```typescript
stateManager.setState({ language: 'en' });
// All subscribers automatically notified
```

**State structure:**
```typescript
{
  currentSection: 'about' | 'services' | 'portfolio' | 'clients' | null,
  selectedSection: Section | null,
  language: 'ko' | 'en',
  appState: 'idle' | 'expanding' | 'expanded',
  portfolioSlug?: string
}
```

---

## Data-Driven Content

**Why:** Non-developers (AEs) need to update content without touching code.

### Data Files

1. **[src/data/content.ts](src/data/content.ts)** - Page content (About, Services, etc.)
2. **[src/data/portfolio.ts](src/data/portfolio.ts)** - Portfolio projects (14 items)
3. **[src/data/faq.ts](src/data/faq.ts)** - FAQ questions/answers

### Portfolio Structure

```typescript
{
  id: 'lg-ces-2025',                    // URL slug + image filename base
  title: { ko: '한글', en: 'English' }, // Localized
  client: 'LG GMG',
  date: '2025-01-07',
  mediaType: 'video, online',           // Filter categories
  mission: { ko: '...', en: '...' },
  solution: { ko: '...', en: '...' },
  videoUrl?: 'https://youtube.com/...' // Optional
}
```

### Using Data in Components

```typescript
import { languageManager } from '../core/language';
import { stateManager } from '../core/state';

const { language } = stateManager.getState();
const title = languageManager.getContent(item.title, language);
```

### Portfolio Images

**Path:** `public/assets/portfolio/`

**Naming:**
```
thumbnails/01_lg-ces-2025.jpg           ← Grid thumbnail
full/01_lg-ces-2025.jpg                 ← Modal single image
full/01_lg-ces-2025_01.jpg              ← Carousel image 1
full/01_lg-ces-2025_02.jpg              ← Carousel image 2
```

Pattern: `{order}_{id}.jpg` or `{order}_{id}_{slide}.jpg`

---

## Quick Reference

### File Structure

```
src/
├── main.ts                    ← Entry point
├── core/
│   ├── router.ts             ← Routing + URL parsing
│   ├── state.ts              ← State management
│   └── language.ts           ← Language detection
├── components/               ← All UI components
├── data/                     ← Content data files
│   ├── content.ts
│   ├── portfolio.ts
│   └── faq.ts
├── utils/
│   ├── transitions.ts        ← ANIMATION TIMINGS (CRITICAL)
│   ├── portfolio.ts          ← Image path utilities
│   └── dom.ts
├── types/                    ← TypeScript interfaces
└── styles/
    ├── animations.css        ← ANIMATION DEFINITIONS (CRITICAL)
    ├── variables.css
    ├── quadrant.css
    └── content.css
```

### Development

```bash
npm install         # Install dependencies
npm run dev         # Start dev server (localhost:5173)
npm run build       # Build for production (outputs to dist/)
```

### Deployment

1. `npm run build`
2. Upload `dist/` contents to server
3. Configure server to serve `index.html` for all routes:

```nginx
# Nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Modifying Animations

1. Edit [src/utils/transitions.ts](src/utils/transitions.ts) - Change timing constants
2. Update [src/styles/variables.css](src/styles/variables.css) if needed
3. Test all quadrants
4. **Get RK approval before deploying**

### Adding a New Section

1. Update `Section` type in [src/types/content.types.ts](src/types/content.types.ts)
2. Add to `validSections` in [src/core/router.ts](src/core/router.ts) (line 42)
3. Add data to [src/data/content.ts](src/data/content.ts)
4. Update [src/components/ContentArea.ts](src/components/ContentArea.ts)
5. Update [src/components/QuadrantGrid.ts](src/components/QuadrantGrid.ts)
6. Add styles

### Debugging

**Routing:** Check `stateManager.getState()` in console
**Animations:** Inspect `.stateExpanding` class + CSS timing variables
**Content:** Verify `language` in state + data file structure
**Build:** Clear `dist/` and rebuild: `rm -rf dist && npm run build`

---

## Key Takeaways

1. **SPA** - No page reloads, client-side routing
2. **Routing** - [src/core/router.ts](src/core/router.ts) handles everything
3. **State** - Observer pattern, components subscribe to changes
4. **Language** - URL-based (`/en/` prefix for English, none for Korean)
5. **Animations** - 600ms main, 400ms delay (CRITICAL - RK priority)
6. **Data files** - AEs edit content, devs never hardcode
7. **No frameworks** - Pure TypeScript with custom state management
8. **Portfolio images** - Must match `id` with number prefix pattern

---

**For AE content updates:** See [AEGUIDE.md](AEGUIDE.md)
**Questions?** Review the code - it's well-structured and uses clear patterns!
