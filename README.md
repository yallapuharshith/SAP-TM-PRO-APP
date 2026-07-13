# SAP TM Master Pro

Production-grade frontend foundation for a premium SAP S/4HANA Transportation Management learning platform.

## Stack

- React 19
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- Lucide React
- LocalStorage

## Quick Start

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. Ensure your default branch is `main`.
3. In GitHub, open repository `Settings` -> `Pages`.
4. Under `Build and deployment`, choose `Source: GitHub Actions`.
5. Push to `main` (or run the `Deploy to GitHub Pages` workflow manually from `Actions`).

After deployment, your site URL will be:

`https://<your-github-username>.github.io/<your-repo-name>/`

Notes:

- The app uses `HashRouter` so all routes work on GitHub Pages.
- Vite base path is automatically set for GitHub Actions builds.

## Routes

- /
- /study
- /exam
- /analytics
- /settings

## Architecture

- Reusable layout shell with Sidebar, Navbar, PageContainer
- Reusable cards and placeholders for dashboard metrics
- Data layer isolated in `src/data` for scalable JSON question banks
- Hooks for theme and sidebar state
- PWA baseline with web manifest and service worker
