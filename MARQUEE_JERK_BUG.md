# Bug: Marquee Animation Jerks on Loop Restart

## Problem Description

The client logo marquee on the About page displays an infinite scrolling animation of client logos. However, when the animation completes its cycle and restarts, there's a visible jerk or jump - the logos snap back to the beginning instead of creating a seamless infinite loop.

**Expected Behavior:**
- The marquee should scroll continuously in a perfectly seamless loop
- When the animation reaches the end of the first set of logos, it should transition smoothly to the duplicated set without any visible jump
- The user should not be able to tell where the loop restarts

**Actual Behavior:**
- The marquee scrolls smoothly for the duration of the animation
- When the animation completes and restarts, there's a visible jerk/jump
- The logos snap back to the starting position, breaking the illusion of infinite scroll

## Technical Context

### Application Architecture

This is a single-page application (SPA) with a client logo marquee component:
- **Component**: `ClientMarquee.js` - Renders logo elements
- **Styles**: `content.css` - Contains marquee animation CSS
- **Assets**: Client logos located in `public/assets/images/clients/`

### How the Marquee Works

1. The component renders two identical sets of 11 client logos
2. CSS animation translates the container from `translateX(0%)` to `translateX(-50%)`
3. When the animation reaches -50%, it should seamlessly loop back because the second set of logos is now in the position where the first set started
4. The animation is set to `infinite` so it repeats continuously

### Current Implementation

**File: `src/components/ClientMarquee.js`**

```javascript
export class ClientMarquee {
  constructor() {
    this.element = createElement('div', 'client-marquee-container');
    this.clients = [
      'amorepacific.png',
      'cheil.png',
      'hsad.png',
      'hyundai.png',
      'innocean.png',
      'kia.png',
      'lg.png',
      'pledis.png',
      'samsung.png',
      'skhynix.png',
      'tbwa.png'
    ];
  }

  render() {
    // Create marquee track with duplicated logos for seamless loop
    const trackHTML = `
      <div class="marquee-track">
        ${this.renderLogos()}
        ${this.renderLogos()}
      </div>
    `;

    this.element.innerHTML = trackHTML;
  }

  renderLogos() {
    return this.clients
      .map(
        (client) => `
        <div class="marquee-item">
          <img src="/assets/images/clients/${client}" alt="${client.replace('.png', '')}" />
        </div>
      `
      )
      .join('');
  }

  mount(parent) {
    parent.appendChild(this.element);
    this.render();
  }
}
```

**File: `src/styles/content.css`**

```css
/* Client Marquee */
.client-marquee-container {
  width: 100%;
  overflow: hidden;
  background: transparent;
  padding: 60px 0;
  margin: 80px 0;
}

.marquee-track {
  display: flex;
  animation: marquee-scroll 35s linear infinite;
  will-change: transform;
}

.client-marquee-container:hover .marquee-track {
  animation-play-state: paused;
}

.marquee-item {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  padding: 0 40px;
}

.marquee-item img {
  max-width: 160px;
  max-height: 80px;
  width: auto;
  height: auto;
  object-fit: contain;
  filter: grayscale(100%) !important;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.marquee-item img:hover {
  opacity: 1;
}

@keyframes marquee-scroll {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
}
```

## Why the Current Implementation Doesn't Work

### Issue 1: Inconsistent Logo Widths
The logos have different intrinsic widths (Samsung logo might be wider than LG logo, etc.). Even though we set `max-width: 160px`, each image uses `width: auto` and `object-fit: contain`, meaning they maintain their aspect ratios and can have different actual widths.

This means:
- The first set of logos has a total width of X pixels
- The second set should have the same total width X pixels
- BUT if there's any rounding error, flexbox calculation issue, or browser rendering difference, the widths might not match exactly
- When the animation reaches -50%, it might not line up perfectly with where the second set begins

### Issue 2: Padding and Spacing Calculation
We're using `padding: 0 40px` on each `.marquee-item`. This creates:
- 40px left padding on first logo
- 40px right padding on last logo of first set
- 40px left padding on first logo of second set

At the loop point (when translateX reaches -50%), the spacing between the last logo of the first set and the first logo of the second set is 80px (40px + 40px). However, the spacing between other logos is also 80px (40px + 40px). This should be consistent, but there might be subtle rendering differences.

### Issue 3: Transform Percentage Calculation
Using `translateX(-50%)` assumes that:
1. Both sets of logos are exactly the same width
2. The container width is exactly twice the width of one set
3. There's no rounding errors in the browser's calculation

In practice, browsers can have sub-pixel rendering issues that cause slight misalignments.

## Hypotheses for Why It's Jerking

### Hypothesis 1: Variable Image Widths Creating Misalignment
Different logos have different natural widths. Even with `max-width` and `object-fit: contain`, the actual rendered widths vary. This means the total width of the first set might not exactly match the total width of the second set due to:
- Different aspect ratios of the images
- Sub-pixel rendering differences
- Browser rounding

### Hypothesis 2: Flexbox Shrinking/Growing Behavior
Even though we set `flex-shrink: 0`, there might be subtle flexbox layout issues causing the items to not be perfectly aligned at the loop point.

### Hypothesis 3: Animation Timing vs Layout Calculation
The animation might complete (reach 100%) before the browser has finished laying out the elements, causing a momentary flash where the old position is visible before the animation restarts.

### Hypothesis 4: Transform Not Perfectly Aligned
When `translateX(-50%)` is applied, it might not land exactly at the pixel position where the second set of logos begins, causing a visible jump of a few pixels.

## Reference Solutions

From [Stack Overflow: Infinite Scrolling Marquee](https://stackoverflow.com/questions/78912182/how-can-i-make-an-infinite-scrolling-marquee-i-cant-get-my-items-to-repeat):

### Solution Approach 1: Calculate Exact Width
Instead of using percentages, calculate the exact pixel width of the logo set and use that in the animation.

```css
@keyframes marquee-scroll {
  0% {
    transform: translateX(0px);
  }
  100% {
    transform: translateX(-2640px); /* Exact width of one set */
  }
}
```

**Pros:**
- More precise than percentages
- Avoids sub-pixel rendering issues

**Cons:**
- Need to calculate the exact width dynamically
- Width might change based on viewport or image loading

### Solution Approach 2: Add More Duplicates
Instead of just 2 sets of logos, use 3 or more sets to create a larger "buffer" that makes the transition less noticeable.

```javascript
${this.renderLogos()}
${this.renderLogos()}
${this.renderLogos()}
```

Then adjust animation:
```css
transform: translateX(-33.333%);
```

### Solution Approach 3: Use JavaScript for Infinite Scroll
Instead of pure CSS animation, use JavaScript to:
1. Continuously move the container
2. When the first logo moves completely out of view, append it to the end
3. Reset the container position

This is the "true" infinite scroll approach used by many marquee libraries.

### Solution Approach 4: Ensure Fixed Width Items
Make all `.marquee-item` elements have a fixed width instead of relying on the image's natural width:

```css
.marquee-item {
  width: 240px; /* Fixed width including padding */
  flex-shrink: 0;
}
```

This ensures consistent spacing and makes the -50% calculation more reliable.

## Files Involved

### Component Files
- **`src/components/ClientMarquee.js`**: Renders the logo elements and structure

### Style Files
- **`src/styles/content.css`**: Contains `.client-marquee-container`, `.marquee-track`, `.marquee-item`, and `@keyframes marquee-scroll`

### Asset Files
- **`public/assets/images/clients/`**: Contains 11 client logo PNG files

## What We Need Help With

1. **Why is there still a visible jerk despite duplicating the logos?**
2. **Should we use fixed widths for marquee items instead of auto widths?**
3. **Is there a better approach than CSS animations for infinite marquees?**
4. **Should we calculate the exact pixel width and use that in the transform?**
5. **Would using more than 2 duplicate sets help hide the transition?**

## Debugging Steps Taken

1. ✅ Created component with duplicated logo sets
2. ✅ Used `translateX(-50%)` to loop back to second set
3. ✅ Removed `gap` property and used `padding` on items instead
4. ✅ Set `flex-shrink: 0` to prevent flexbox shrinking
5. ✅ Used `linear` animation timing
6. ❌ Still experiencing jerk on loop restart

## Additional Notes

- The marquee uses 11 client logos with different aspect ratios
- All logos are grayscale PNG files
- The marquee should pause on hover (`animation-play-state: paused`)
- Animation duration is 35 seconds for smooth, slow scrolling
- The app needs to work across modern browsers (Chrome, Firefox, Safari, Edge)

## Example Test Case

1. Navigate to `/about` page
2. Scroll down to the "Our clients" section
3. Watch the marquee scroll for at least one complete cycle (35 seconds)
4. Observe the moment when the animation restarts - there should be NO visible jump

**Current behavior**: Visible jerk/jump when animation restarts
**Expected behavior**: Seamless infinite scroll with no visible restart

## Request

Please help identify why the marquee is jerking on loop restart and suggest a solution that:
1. Creates a perfectly seamless infinite scroll effect
2. Works with variable-width images
3. Maintains the grayscale styling and hover pause functionality
4. Works reliably across different browsers
5. Doesn't require major architectural changes if possible

## Potential Solutions to Try

Based on research, here are potential fixes to explore:

### Option A: Fixed Width Items
Set a consistent width for all `.marquee-item` elements:

```css
.marquee-item {
  width: 240px; /* 160px image + 80px padding */
  flex-shrink: 0;
}
```

Calculate the exact width needed and update animation:
- 11 logos × 240px = 2640px for one set
- Total track width = 5280px (two sets)
- Animation should translateX(-2640px)

### Option B: JavaScript-Based Infinite Scroll
Replace CSS animation with JavaScript:
1. Use `requestAnimationFrame` for smooth animation
2. Continuously move the container left
3. When first logo is completely hidden, move it to the end
4. Reset transform to maintain position

### Option C: Triple the Content
Use 3 sets of logos instead of 2:

```javascript
${this.renderLogos()}
${this.renderLogos()}
${this.renderLogos()}
```

Then animate to -33.333% instead of -50%.

### Option D: Ensure Perfect Pixel Alignment
Use JavaScript to measure the actual rendered width of one logo set and use that exact pixel value in the CSS animation dynamically.
