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

    // Add tap to toggle on mobile (only one open at a time)
    const isMobile = () => window.innerWidth <= 768;

    // Track touch movement to distinguish tap from scroll
    let touchStartY = 0;
    let touchStartTime = 0;
    let isTouchMoving = false;

    const handleTouchStart = (e) => {
      if (isMobile()) {
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        isTouchMoving = false;
      }
    };

    const handleTouchMove = (e) => {
      if (isMobile()) {
        const touchMoveY = e.touches[0].clientY;
        const moveDistance = Math.abs(touchMoveY - touchStartY);

        // If moved more than 5px, consider it scrolling (stricter threshold)
        if (moveDistance > 5) {
          isTouchMoving = true;
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (isMobile()) {
        const touchDuration = Date.now() - touchStartTime;

        // Very strict: Only trigger if it's a quick tap (< 200ms) with minimal movement
        if (!isTouchMoving && touchDuration < 200) {
          e.preventDefault();
          e.stopPropagation();

          const isCurrentlyActive = card.classList.contains('mobile-active');

          // Close all other profiles first
          const allCards = this.element.querySelectorAll('.team-member');
          allCards.forEach(otherCard => {
            otherCard.classList.remove('mobile-active');
          });

          // If this card wasn't active, open it (accordion behavior)
          if (!isCurrentlyActive) {
            card.classList.add('mobile-active');
          }
        }
      }
    };

    // Touch event listeners for mobile
    card.addEventListener('touchstart', handleTouchStart, { passive: true });
    card.addEventListener('touchmove', handleTouchMove, { passive: true });
    card.addEventListener('touchend', handleTouchEnd, { passive: false });

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
