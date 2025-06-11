# HaveSome Stratfu

A static website for Wakfu dungeon strategies, built with Vite, Vike, React, and Tailwind CSS.

## Features

- 📱 Responsive design
- ⚡ Fast page loads with client-side routing
- 🔍 Global dungeon search
- 📱 Mobile-friendly layout
- 🎨 Dark mode support

## Development

### Prerequisites

- Node.js 18+
- pnpm

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/havesome-stratfu.git
   cd havesome-stratfu
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is configured to deploy to GitHub Pages. Follow these steps to deploy:

1. Create a new GitHub repository named `havesome-stratfu`
2. Push your code to the `main` branch
3. Go to your repository settings > Pages
4. Under "Build and deployment", select "GitHub Actions"
5. The site will be deployed to `https://your-username.github.io/havesome-stratfu/`

### Manual Deployment

To deploy manually:

1. Build the project:
   ```bash
   pnpm build
   ```

2. The built files will be in the `dist` directory.

## License

MIT

## Built With

- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [Vike](https://vike.dev/) - The successor to Next.js
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - TypeScript is a typed superset of JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components

## Project Structure

- `/pages` - Page components
- `/components` - Reusable React components
- `/public` - Static files
- `/scripts` - Build and data processing scripts
- `/layouts` - Layout components

### `/pages/+config.ts`

Such `+` files are [the interface](https://vike.dev/config) between Vike and your code. It defines:

* A default [`<Layout>` component](https://vike.dev/Layout) (that wraps your [`<Page>` components](https://vike.dev/Page)).
* A default [`title`](https://vike.dev/title).
* Global [`<head>` tags](https://vike.dev/head-tags).

### Routing

[Vike's built-in router](https://vike.dev/routing) lets you choose between:

* [Filesystem Routing](https://vike.dev/filesystem-routing) (the URL of a page is determined based on where its `+Page.jsx` file is located on the filesystem)
* [Route Strings](https://vike.dev/route-string)
* [Route Functions](https://vike.dev/route-function)

### `/pages/_error/+Page.jsx`

The [error page](https://vike.dev/error-page) which is rendered when errors occur.

### `/pages/+onPageTransitionStart.ts` and `/pages/+onPageTransitionEnd.ts`

The [`onPageTransitionStart()` hook](https://vike.dev/onPageTransitionStart), together with [`onPageTransitionEnd()`](https://vike.dev/onPageTransitionEnd), enables you to implement page transition animations.

### SSR

SSR is enabled by default. You can [disable it](https://vike.dev/ssr) for all your pages or only for some pages.

### HTML Streaming

You can enable/disable [HTML streaming](https://vike.dev/stream) for all your pages, or only for some pages while still using it for others.

## shadcn/ui

Beautifully designed components that you can copy and paste into your apps. Accessible. Customizable. Open Source.

### Configuration

see [shadcn/ui theming](https://ui.shadcn.com/docs/theming)

Base Configuration can be found in `components.json` file.

> \[!NOTE]
> changes to the `components.json` file **will not** be reflected in existing components. Only new components will be affected.

### Add Components to Your Project

**Example:** add a component to your project.
`pnpm shadcn add button`

use the `<Button />` component in your project:
`import { Button } from "@/components/ui/button";`

more [shadcn/ui components](https://ui.shadcn.com/docs/components/accordion)

