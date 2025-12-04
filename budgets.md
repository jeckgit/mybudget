That’s an inspiring app concept — a minimalist, aesthetically sophisticated budgeting tool that feels elegant, intuitive, and delightful to use. Below is a **comprehensive Product Requirements Document (PRD)** for your app, crafted with special attention to visual design, user experience, gamification, and emotional resonance. It’s written in the tone and structure of a professional PRD (as if for handoff between product, design, and engineering teams).

***

# Product Requirements Document (PRD) — *“Lume” Budgeting App*

**Version:** 1.0
**Date:** December 4, 2025
**Author:** Perplexity AI Assistant
**Audience:** Product, Design, Frontend Engineers, Backend Engineers, QA, Stakeholders
**Length:** ~3,000 words

***

## 1. Product Vision

### 1.1 Overview

*Lume* is a minimalist personal budgeting app designed to transform daily money management into a serene, visually beautiful ritual. Built for clarity and emotional calm, *Lume* helps users understand and control their spending without clutter, charts, or friction.

The central concept: **a daily spending allowance that adapts dynamically to the user’s activity**. If a user sets a monthly budget, *Lume* computes a gentle daily limit and visually reflects daily progress with beautiful glassmorphism effects, elegant micro-interactions, and intuitive animations.

Rather than guilt-based budgeting, *Lume* aims to cultivate mindfulness around money — showing how small choices compound, in an interface that feels peaceful, alive, and gamified without being loud.

### 1.2 Product Goals

- **Elegance:** Deliver a serene, “ambient luxury” interface using translucent layers, soft gradients, blur effects, and fine typography.
- **Simplicity:** The entire budgeting flow should fit within 2–3 core views.
- **Emotional design:** Make financial tracking emotionally gentle through color psychology, animations, and micro-interactions.
- **Gamification:** Encourage daily engagement through subtle gamified feedback loops — progress halos, streaks, and balance animations.
- **Portability:** Web-first and mobile responsive. Later PWA or native versions may build on same Supabase backend.


### 1.3 Problem Statement

Traditional budgeting apps overwhelm users with data and guilt-inducing alerts. Users often abandon them because they feel punitive, complex, and ugly. *Lume* reimagines budgeting as a calm, daily check-in oriented toward self-awareness, not perfection.

Example: Instead of notifying users of “overspending,” *Lume* quietly adjusts tomorrow’s allowance and animates a shift in the glassy ring’s hue — showing balance in continuous motion.

### 1.4 Success Metrics

- **Engagement:** >60% daily retention within first month.
- **Completion:** 90% of onboarding flows finished.
- **Sentiment:** Average app store rating >4.7.
- **PLG metric:** 20% of users share screenshots socially or via built-in “Progress Share” module.
- **Technical KPI:** Average loading time <1.5 seconds.

***

## 2. User Personas

### 2.1 Minimalist Professional

- **Age:** 25–40
- **Values:** Simplicity, aesthetics, balance.
- **Needs:** Quick daily financial overview without spreadsheets.
- **Pain points:** Overloaded apps like Mint or YNAB.
- **Goal:** Stay within a monthly budget through mindful daily tracking.


### 2.2 Student on a Budget

- **Age:** 18–24
- **Values:** Easy setup, instant clarity.
- **Needs:** Visual feedback on small daily spending decisions.
- **Pain points:** Confusing signup flows; too many categories.
- **Goal:** Understand how each coffee/lunch affects the rest of the month.


### 2.3 Creative Freelancer

- **Age:** 25–45
- **Values:** Design-driven tools, pleasant experience.
- **Needs:** Track variable income streams with serenity.
- **Goal:** Avoid financial anxiety through transparency and beauty.

***

## 3. Core Functional Requirements

### 3.1 User Accounts

- Authentication via email + magic link (Supabase Auth).
- Optional social logins (Apple, Google) — Phase 2.
- Anonymous guest mode, local-only data until signup.


### 3.2 Budget Setup

1. User sets **monthly available amount** (e.g., \$1000).
2. App auto-calculates **daily allowed spending** = monthly amount / number of days in month.
3. User may adjust frequency (monthly or bi-weekly allowance).
4. Currency auto-detected via locale but configurable.

### 3.3 Daily Spending Input

- Input is minimal: a number-only keypad (e.g., “Spent today: \$24”).
- Optional note or emoji tag (☕, 🍜, 🎬).
- The main screen updates dynamically:
    - Remaining today.
    - Month progress ring morphing with luminous gradients.
    - Animated shift in transparency—overspending produces warm hue, underspending produces cool calm blue.


### 3.4 Automatic Daily Carryover

If user overspends, tomorrow’s daily target decreases; if underspends, it slightly increases. Calculation formula:

$$
New\,daily\,budget = \frac{Remaining\,monthly\,budget}{Remaining\,days}
$$

Animation: new daily number “glides” into place with fluid interpolation.

### 3.5 Analytics View

- One clean minimalist chart: **Monthly flow**
- Bars formed by blurred glass “glow slivers.”
- Tooltip appears on hover with date and amount.
- Emphasis on *texture*, *depth*, and *glass layers*, not analytics clutter.


### 3.6 Notifications

- Purely optional mindful reminders:
    - *“A gentle reset: your next day’s allowance is ready.”*
    - *“Good job staying balanced this week.”*
- Soft haptic pulse and breathing animation when notification is tapped.

***

## 4. Design and Aesthetic Vision

### 4.1 Core Design Language

- **Style name:** *Glassy Minimalism / Inter Style.*
- **Font:** `Inter` (regular, medium, semibold). Small font sizes with generous line spacing.
- **Color palette:**
    - Primary: Neutral whites (\#FAFAFA) and frosted glass transparency.
    - Accent: Soft cyan (\#61DBFB) and mint gradients with light blur.
    - Secondary states: Warm coral for overspending, lavender blue for underspending.
- **Background:** Frosted blur panels layered over subtle gradients that shift with time-of-day.
- **Modules:** Each panel floats with 2–4px shadow spread and glass translucency of 40–60%.


### 4.2 Layout Grid

- **Mobile-first layout**: Vertical column layout with 16px padding each side.
- **Tablet / Desktop:** Adaptive scaling based on CSS Grid with central content column (max width 520px).
- **Icons:** Feather icons, limited palette, all line-based, softly glowing edges.


### 4.3 Visual Mood

*Lume* feels like breathing — soft transitions, shimmering blur edges, and gentle depth.
No sharp corners; radii 12–16px.
Every state transition uses **dissolve + parallax motion** with subtle delay; e.g., a daily balance bubble floats before dissolving into the number.

### 4.4 Typography

- Primary font: *Inter* (weight 400–600).
- Typography scale:
    - Heading: 18–22sp
    - Subheading: 14–16sp
    - Body: 12–14sp
- All-caps avoided.
- Text color contrasts lightly with background translucency — accessible but soft.

***

## 5. Motion, Animation, and Interaction Design

### 5.1 Motion Principles

Every motion expresses emotion — calm, continuity, and progress.
Use Apple’s “spring” easing curves or cubic-bezier (0.22, 1, 0.36, 1).
Animations should be short (200–400ms) but buttery smooth.

### 5.2 Examples of Key Animations

- **Loading animation:** A floating glass orb slowly illuminates from center, expanding a translucent gradient outward. Tiny particles shimmer as the logo fades in.
- **Transition between tabs:** Glass panels slide at slight parallax (10–15%), leaving a trace glow trail.
- **Daily update:** When new daily budget is computed, digits count up/down smoothly using "rolling odometer" effect.
- **Overspend pulse:** When user overspends, the circular progress subtly pulses with warm pink hue before fading back.


### 5.3 Gamified Microinteractions

- **Progress Ring:**
    - 360° ring around central daily number.
    - Underspending fills slowly with mint-blue aura; overspend glows coral.
    - Soft “success tone” (single note) when staying under.
- **Confetti moments:** After 7-day streak of spending balance, soft glass confetti animates with blur motion.
- **Ambient particles:** Background glass specks float subtly with parallax, adjusting to scroll and tilt (for mobile gyroscope APIs).


### 5.4 Transitions between Views

- Budget screen ↔ Analytics screen: fade + z-depth effect, simulating movement through glass layers.
- Onboarding flow: vertical “lift” transitions each pane upward slightly, with new text fading through blur.

***

## 6. Gamification System (Light Touch)

### 6.1 Motivation Model

The purpose of gamification is not competition but **gentle encouragement**. Points, badges, or streaks appear in tactile, subtle ways that maintain aesthetic coherence.

### 6.2 Features

- **Daily Completion Halo:** Each day, the ring fills and locks in a faint luminous stroke.
- **Calm Streaks:** Days under budget appear as “pearls” in a circular constellation.
- **Mood Calendar:** Instead of numbers, days are tinted according to performance.
- **Achievements:**
    - “Balanced Week”: 7 under-budget days.
    - “Perfect Month”: no overspends.
    - “Recovery Hero”: recovered balance after overspend.
- Achievements animate with floating crystal orbs that softly bloom for 2 seconds.

***

## 7. App Architecture

### 7.1 Technology Stack

- **Frontend:** Vue (nuxt / Vite) with Tailwind CSS (glassmorphism custom utilities).
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Functions).
- **Authentication:** Supabase Auth (email OTP).
- **Hosting:** Vercel or Supabase Edge.
- **Analytics:** Supabase events or PostHog (Phase 2).


### 7.2 Data Model

**Entities:**

- `User`
    - id (uuid)
    - email
    - settings (currency, theme)
- `Budget`
    - id
    - user_id
    - month
    - total_amount
    - daily_budget
    - created_at
- `Spending`
    - id
    - user_id
    - date
    - amount
    - note
- `Achievement`
    - id
    - user_id
    - type
    - achieved_at

**Relations:**
One user → many budgets → many spendings.

**Supabase Functions:**

- `calculate_daily_budget()`
- `update_carryover()`
- `fetch_dashboard()`


### 7.3 API Schema

`POST /api/spending`
`GET /api/dashboard`
`PUT /api/budget/update`

Minimal REST endpoints, all proxied through Supabase Edge Functions.

***

## 8. Core User Flows

### 8.1 First-Time Onboarding

1. Welcome screen: floating orb animation and short message: *“Your budget, reimagined.”*
2. Ask monthly amount → numeric keypad input.
3. Confirmation animation: *“Your daily balance begins at \$32 today.”*
4. Translucent glass surfaces animate upward revealing main dashboard.

### 8.2 Daily Check-In Flow

1. User opens app.
2. Splash animation glides in the current date and ring.
3. Taps “+ Spent today.” Minimal animation opens keypad modal.
4. After entering amount, main screen updates numbers with animated shift.
5. Haptic pulse and gentle chime confirm entry.
6. Microcopy: *“Nice work staying mindful.”*

### 8.3 Monthly Reset Flow

1. On the 1st, app automatically rolls over and recalculates.
2. Animation: prior month dissolves into frosted glass fade.
3. New month panel slides up from below with clean motion.

### 8.4 Overspend Feedback

1. If overspend detected → progress ring turns coral.
2. Text gently animates: *“Over today by +\$5. Your next day adjusts.”*
3. Background gradient warms slightly for that day.
4. Restore calm hue next morning automatically.

***

## 9. UX Details

### 9.1 Microcopy \& Tone

*Warm, non-judgmental, minimal words.*
Examples of system messages:

- *“New day, fresh balance.”*
- *“A little over today, balance rolls forward.”*
- *“Peaceful progress this week.”*

No decimals unless necessary. Currency formatting localized automatically.

### 9.2 Accessibility

- High-contrast mode toggle for dark backgrounds.
- VoiceOver / screen-reader friendly text output for all visuals.
- Motion-reduction setting to disable particle layers.


### 9.3 Empty States

- Faint ambient motion of glass particles.
- Encouraging text: *“Begin with your monthly total.”*


### 9.4 Sounds

Low-volume ambient tones triggered by state changes:

- Notification chime uses single soft piano note (A4).
- Under-limit streak → shimmering bell cluster.
- Overspend → single descending tone fading softly.

***

## 10. Visual Components

### 10.1 Dashboard Screen

**Elements:**

- Header (date, month)
- Circular daily tracker (animated glass ring)
- “Today’s allowance” and “remaining amount” text
- Spending input button
- Small icon row: analytics, achievements, settings

**Design notes:**
The central budget ring dominates; text floats within. Buttons are transparent glass rectangles with gentle gradients.

### 10.2 Analytics Screen

- Minimal bar chart with 31 vertical translucent bars.
- “Peak glow” represents highest spend day.
- Month average line soft-blends beneath bars.
- Tap/hover → tooltip card emerges from blur like condensation.


### 10.3 Achievements / Rewards Screen

- Grid of shimmering icons with subtle glass badges.
- Earned badges glow faintly; locked ones dim and frosted.
- Each badge pulse animates once on unlock.


### 10.4 Settings Screen

- Controls on gradient cards (blurred with frosted whites).
- Font size, theme (light/dark), haptic toggle, notification toggle.
- Smooth transitions with sliding gradients.

***

## 11. Technical Specifications

### 11.1 APIs

Supabase functions handle:

- Daily recalculation cron (runs at UTC midnight per user).
- Achievement detection triggers.
- Secure handling of budgets and spends.


### 11.2 State Management

- React Context or Zustand for global budget states.
- Cached daily balance in IndexedDB (for offline mode).


### 11.3 Offline Mode

User can still input spending offline; sync occurs on reconnect using timestamp merge policy.

### 11.4 Performance

- Aim <500KB initial JS load.
- Lazy-load charts and animations.
- GPU-accelerated canvas for blur/particle layers.

***

## 12. UX \& UI Prototyping Plan

Low-fidelity wireframes first (Figma).
Then design system creation with themed variants (frost, bloom, dark midnight).
Motion specs captured with After Effects prototypes, exported as Lottie JSON.

Design testing in ProtoPie for pre-dev review.

***

## 13. Loading \& UI Delight

### 13.1 App Startup

A small white orb slowly expands as background blurs from clear to frosted.
Text fades: *“Lume”* → *“Illuminating your balance.”*

Animation cutoff time <2 seconds to preserve snappiness.

### 13.2 Iconography Mood

Icons are semi-linear, softly curved, 2px lines. Each icon has frost glow with variable transparency (30–50%).
Examples:

- Piggybank outline → for budget setup.
- Halo ring → for daily tracker.
- Particle crystal → for achievements.


### 13.3 Cursor \& Gesture Feedback

- Cursor glows faintly when hovering over interactive glass layer.
- Mobile: Tactile micro-shake confirmation on long-press.

***

## 14. Design System (Tokens)

**Colors**


| Token | Value | Usage |
| :-- | :-- | :-- |
| primaryGlass | rgba(255,255,255,0.25) | Panels |
| accentMint | \#61DBFB | Streaks, progress ring |
| overspendCoral | \#FF7E79 | Alerts |
| underspendBlue | \#7CCFFF | Calm progress |
| bgGradient | linear-gradient(170deg, \#EEF7F9, \#F3EFFA) | Background |

**Corner Radius:** 16px
**Elevation Layers:** up to 8 with varied blur radius (4–12px).
**Shadows:** ultra-soft diffuse (rgba(0,0,0,0.05)).
**Haptics:** mild (10–15ms pulse).

***

## 15. Future Enhancements

- Shared budgeting (couples mode with mirrored daily view).
- AI-generated insights: “You tend to spend more on weekends.”
- Journaling integration: daily spending reflection prompts.
- Multi-currency and crypto tracking via APIs.
- Seasonal themes (spring bloom, autumn haze).

***

## 16. Risks \& Mitigation

| Risk | Impact | Mitigation |
| :-- | :-- | :-- |
| Animation-heavy UI may affect performance | Medium | Optimize GPU rendering, provide “reduced motion” toggle |
| Supabase free-tier rate limits | Low | Use caching and serverless queues |
| Overcomplicating simplicity vision | High | Continuous design review focusing on reduction |
| User confusion about carryover logic | Medium | Provide small “?” tooltip explaining daily adjustment formula |


***

## 17. Success Roadmap

| Phase | Milestone | Deliverables |
| :-- | :-- | :-- |
| Phase 1 | MVP (Core Budgeting) | Monthly -> daily budget, manual spend add |
| Phase 2 | Design Polish | Glass visuals, transitions, animations |
| Phase 3 | Gamification | Streaks, halo rings, confetti |
| Phase 4 | Multi-device \& offline sync | PWA + Supabase sync |
| Phase 5 | Launch | App Store, Chrome PWA listing |


***

## 18. Emotional Design Notes

Every visual, motion, and sound must center serenity.
*Lume* should feel like a piece of calm ambient software, not a financial spreadsheet.
Color feedback replaces red warnings with warm compassion. It teaches, not scolds.

Financial awareness becomes sensory — you *feel* balance visually through translucency and harmony.
This experience should make personal finance feel like mindfulness meditation disguised as an app.

***

## 19. Summary of Guiding Design Principles

1. **Less text, more space.**
2. **Soft light, subtle glow, glass depth.**
3. **Motion is meaning.**
4. **Reward presence, not perfection.**
5. **Every pixel breathes elegance.**

***

Would you like this PRD to include **UI screen mock descriptions with detailed component specs** (e.g., button padding, shadow layers, and animation timing curves) for a designer handoff version?
