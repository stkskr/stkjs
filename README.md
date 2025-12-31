# STKS Website

A TypeScript-based single-page application with internationalization (Korean/English) and animated navigation.

## Features

- **Quadrant Navigation**: Four-section grid layout (About, Services, Portfolio, Clients)
- **Smooth Animations**: Carefully crafted CSS transitions matching the original mockup
- **Internationalization**: Full Korean and English language support
- **Clean URLs**: `/about` (Korean) and `/en/about` (English)
- **Auto Language Detection**: Automatically redirects non-Korean browsers to English version
- **Data-Driven Content**: Easy content updates via data files

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type check
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── data/               # Content and portfolio data
│   ├── content.ts      # Site text (Korean/English)
│   └── portfolio.ts    # Portfolio items
├── styles/             # CSS files
│   ├── variables.css   # Design tokens
│   ├── global.css      # Base styles
│   ├── animations.css  # Animation definitions
│   ├── quadrants.css   # Grid layout
│   └── content.css     # Content area styles
├── types/              # TypeScript type definitions
├── core/               # Core systems (router, state, language)
├── components/         # UI components
├── utils/              # Utility functions
└── main.ts             # Application entry point
```

## Editing Content

### Site Text (src/data/content.ts)

Update text for each section in both Korean and English:

```typescript
about: {
  title: { ko: '회사 소개', en: 'About' },
  subtitle: {
    ko: ['Line 1', 'Line 2'],  // Each array item = new line
    en: ['Line 1', 'Line 2']
  },
  body: { ko: '...', en: '...' }
}
```

### Portfolio Items (src/data/portfolio.ts)

Add new portfolio items:

```typescript
{
  id: 'unique-id',
  thumbnailPath: '/assets/portfolio/thumbnails/image.jpg',
  modalImagePath: '/assets/portfolio/full/image.jpg',
  title: { ko: '한글 제목', en: 'English Title' },
  date: '2024-03-15',  // ISO format
  client: { ko: '고객사', en: 'Client Name' },
  mediaType: 'image',  // or 'video'
  mission: { ko: '미션', en: 'Mission' },
  solution: { ko: '솔루션', en: 'Solution' }
}
```

## Animation Details

All animations use CSS transitions only (no JavaScript animations) to ensure smooth 60fps performance:

- **Main transitions**: 600ms with cubic-bezier(0.4, 0, 0.2, 1)
- **Close button**: 400ms ease
- **Content fade**: 300ms ease with 400ms delay
- **GPU accelerated**: Uses transform3d for optimal performance

## URL Structure

- Korean: `/`, `/about`, `/services`, `/portfolio`, `/clients`
- English: `/en/`, `/en/about`, `/en/services`, `/en/portfolio`, `/en/clients`

## Language Toggle

Click "EN | KR" in the top-left corner to switch languages. The toggle maintains the current page (e.g., switching from `/services` to `/en/services`).

## Deployment

This project is configured for Vercel deployment:

```bash
vercel --prod
```

The `vercel.json` file includes:
- SPA rewrites (all routes → index.html)
- Asset caching headers for optimal performance
