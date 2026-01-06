import { teamData } from '../data/team.js';
import { languageManager } from '../core/language.js';
import { createElement } from '../utils/dom.js';
import { stateManager } from '../core/state.js';

export class TeamProfiles {
  constructor() {
    this.element = createElement('div', 'team-grid');
    this.language = 'ko';

    // Subscribe to state changes for language updates
    stateManager.subscribe((state) => {
      if (state.language !== this.language) {
        this.language = state.language;
        this.render();
      }
    });
  }

  render() {
    // Clear existing profiles
    this.element.innerHTML = '';

    // Create profile card for each team member
    teamData.forEach((member) => {
      const profileCard = this.createProfileCard(member);
      this.element.appendChild(profileCard);
    });
  }

  createProfileCard(member) {
    const card = createElement('div', 'team-member');

    const name = typeof member.name === 'string' ? member.name : languageManager.getContent(member.name, this.language);
    const role = languageManager.getContent(member.role, this.language);
    const education = languageManager.getContent(member.education, this.language);
    const experience = languageManager.getContent(member.experience, this.language);

    // Build education HTML
    const educationHTML = education.map(edu =>
      `<strong>${edu.school}</strong><br>${edu.degree}`
    ).join('<br>');

    // Build experience HTML
    const experienceHTML = experience.map(exp =>
      `<li>${exp}</li>`
    ).join('');

    card.innerHTML = `
      <div class="diamond-wrapper">
        <div class="initial-overlay">${member.initial}</div>
        <div class="diamond-shape">
          <img src="${member.image}" alt="${name}" class="diamond-image">
        </div>
      </div>
      <div class="member-info">
        <h3 class="name">${name}</h3>
        <p class="role">${role}</p>
        <div class="profile-reveal">
          <div class="edu-section">
            ${educationHTML}
          </div>
          <ul class="exp-list">
            ${experienceHTML}
          </ul>
        </div>
      </div>
    `;

    // Auto-scroll logic for tooltip visibility
    const triggerScrollReveal = () => {
      const reveal = card.querySelector('.profile-reveal');
      if (!reveal) return;

      // Use requestAnimationFrame to ensure hover styles are applied
      requestAnimationFrame(() => {
        // Force a reflow to ensure the layout box is fully calculated
        void reveal.offsetHeight;

        const rect = reveal.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        console.log('📏 Tooltip measurements:', {
          'rect.bottom': rect.bottom,
          'rect.height': rect.height,
          'rect.top': rect.top,
          'viewportHeight': viewportHeight,
          'isOffBottom': rect.bottom > viewportHeight,
          'scrollDistance': rect.bottom - viewportHeight + 40
        });

        // If the bottom of the popup is below the viewport edge
        if (rect.bottom > viewportHeight && rect.height > 0) {
          const extraSpace = 100; // Small buffer
          const scrollDistance = rect.bottom - viewportHeight + extraSpace;

          console.log('✅ Scrolling by:', scrollDistance);

          // Find the scrollable container (.container element)
          const container = document.querySelector('.container');
          if (container) {
            // Animate scroll with custom easing for gentler movement
            const startPos = container.scrollTop;
            const startTime = performance.now();
            const duration = 600; // Smooth duration

            // Ease-in-out: slow start, fast middle, slow end
            const easeInOutQuad = (t) => {
              return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            };

            const animateScroll = (currentTime) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const eased = easeInOutQuad(progress);

              container.scrollTop = startPos + (scrollDistance * eased);

              if (progress < 1) {
                requestAnimationFrame(animateScroll);
              }
            };

            requestAnimationFrame(animateScroll);
          }
        } else {
          console.log('❌ No scroll needed - tooltip is within viewport');
        }
      });
    };

    card.addEventListener('mouseenter', triggerScrollReveal);
    card.addEventListener('click', triggerScrollReveal);

    return card;
  }

  mount(parent) {
    parent.appendChild(this.element);
    this.render();
  }

  unmount() {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
