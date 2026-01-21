# UI System & Components

MySaldo uses an **Atomic Design** approach with a heavy focus on **Glassmorphism**.

## Design Tokens

- **Blur**: `backdrop-blur-xl` to `backdrop-blur-3xl`.
- **Transparency**: `white/40` backdrops in light mode, `black/60` in dark mode.
- **Borders**: Soft translucent borders (`border-white/40`) to define layers.
- **Typography**: Bold, high-contrast headings with wide tracking for a premium feel.

## Atoms

- **[GlassButton.vue](file:///Users/eckholdjorg/Documents/Projects/budget/app/components/GlassButton.vue)**: Flexible button with glass effect. Supports variants: `primary`, `secondary`, `ghost`, `danger`.
- **[GlassCard.vue](file:///Users/eckholdjorg/Documents/Projects/budget/app/components/GlassCard.vue)**: Container for all UI elements. Variants: `glass`, `white`, `featured`.
- **[NumberPad.vue](file:///Users/eckholdjorg/Documents/Projects/budget/app/components/NumberPad.vue)**: Custom numeric input optimized for mobile.

## Molecules & Organisms

- **[AddExpenseModal.vue](file:///Users/eckholdjorg/Documents/Projects/budget/app/components/AddExpenseModal.vue)**: Multi-step modal for adding transactions. Handles swipe-to-close.
- **[DaySelector.vue](file:///Users/eckholdjorg/Documents/Projects/budget/app/components/DaySelector.vue)**: Vertical infinite-ish scroll list of days with rollover budget calculations.
- **[HaloRing.vue](file:///Users/eckholdjorg/Documents/Projects/budget/app/components/HaloRing.vue)**: Radial progress indicator used for budget visualization.

## Pages & Routing

- `/dashboard`: Overview of current day and monthly progress.
- `/analytics`: Spending trends and category breakdown.
- `/profile`: User settings and account management.
- `/onboarding`: Initial setup flow for new users.
