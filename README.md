# English Website

A modern, accessible English learning platform built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🎯 Interactive learning components
- 🌙 Dark/light theme toggle
- 📱 Fully responsive design
- ♿ WCAG AA accessibility compliant
- 🚀 Optimized performance
- 🔒 Security best practices
- 🧪 Comprehensive testing setup

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Testing:** Vitest + Testing Library
- **Linting:** ESLint + Prettier
- **Git Hooks:** Husky + lint-staged

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd english-website

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run test         # Run tests
npm run test:coverage # Run tests with coverage
npm run format       # Format code with Prettier
```

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configs
├── styles/             # Global styles
└── tests/              # Test files
```

## Design System

Design tokens are centralized in `src/lib/design-tokens.ts` and mapped to Tailwind CSS variables in `tailwind.config.js`.

### Customizing Design Tokens

1. Edit `src/lib/design-tokens.ts`
2. Update `tailwind.config.js` if needed
3. Restart development server

### Adding Assets

1. Place images in `public/assets/`
2. Use Next.js `Image` component for optimization
3. Update asset paths in components

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Manual Build

```bash
npm run build
npm run start
```

## Contributing

1. Follow the coding standards in `.eslintrc.json`
2. Run tests before committing
3. Use conventional commit messages
4. Ensure accessibility compliance

## License

MIT License - see LICENSE file for details.