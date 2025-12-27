# MySaldo

> A minimalist, aesthetically sophisticated budgeting app designed to transform daily money management into a serene ritual.

MySaldo (concept name: _Lume_) is a Nuxt 4 application that focuses on **daily spending allowances** rather than strict monthly buckets. It features a beautiful glassmorphism UI/UX, gentle gamification, and a privacy-focused architecture on top of Supabase.

## ✨ Features

- **Daily Budgeting**: Automatically calculates your daily spending limit based on your monthly budget.
- **Glassmorphism Design**: A premium, "ambient luxury" interface with translucent layers and soft animations.
- **Internationalization**: Fully localized in English, German (Deutsch), French (Français), and Spanish (Español).
- **Dark Mode**: Native support for dark and light themes.
- **Data Privacy**: Built on Supabase with Row Level Security (RLS).
- **PWA Ready**: Mobile-first design.

## 🛠 Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com)
- **Database & Auth**: [Supabase](https://supabase.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) (v4 with Vite) + Custom Glassmorphism
- **Icons**: [Lucide Vue Next](https://lucide.dev)
- **Charts**: [ECharts](https://echarts.apache.org) / vue-echarts
- **Utilities**: [VueUse](https://vueuse.org)

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- pnpm (recommended) or npm/yarn

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd mysaldo-nuxt
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Environment Setup:**

    Copy the example environment file:

    ```bash
    cp .env.example .env
    ```

    Update `.env` with your Supabase credentials:

    ```env
    SUPABASE_URL=your-project-url
    SUPABASE_KEY=your-anon-key
    ```

4.  **Start Development Server:**
    ```bash
    pnpm dev
    ```
    The app will be available at `http://localhost:3000`.

## 📦 Build & Deployment

### Production Build

Build the application for production:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

### Docker

This project includes a `Dockerfile` and `docker-stack.yml` for containerized deployment.

```bash
# Build the image
docker build -t mybudget .

# Run container
docker run -p 3000:3000 mybudget
```

## 📄 License

[MIT](LICENSE)
