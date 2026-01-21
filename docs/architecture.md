# System Architecture

MySaldo (Lume) is built on a "Zero-Friction" philosophy, prioritizing instant feedback and visual stability.

## Technical Stack

- **Framework**: Nuxt 4 (Vue 3 + Nitro)
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **State Management**: Vue Composition API (useState) + Custom Composables
- **Styling**: Tailwind CSS v4 (Glassmorphism design system)
- **Internationalization**: `@nuxtjs/i18n` (EN, DE, ES, FR)

## Core Logic: "Adaptive Smart Start"

The app uses a unique budget calculation logic called **Adaptive Smart Start** (implemented in `useBudget.ts`).

- The budget period is monthly, but the "start day" is dynamic.
- If a user starts tracking mid-month, the app "skips" the previous days to avoid overwhelming them with "unspent" budget they didn't actually have.
- The daily target adapts based on remaining money and remaining days.

## Data Persistence & Sync

- **Optimistic UI**: All mutations (add/edit/delete transactions) update the local state (`useState`) immediately.
- **Background Sync**: Mutations are pushed to Supabase in the background.
- **Rollback**: If a server sync fails, the UI state is rolled back (planned refactoring for more robust error handling).
- **Row Level Security (RLS)**: Security is enforced at the database level. Each table has `user_id` checks.

## State Management (`useStorage.ts`)

The `useStorage` composable acts as the primary data hub. It synchronizes:

1. `profiles`: Global configuration (currency, language, theme).
2. `transactions`: All spending and income records.
3. `categories`: Default and custom spending categories.
4. `months`: Month-specific budget overrides.
