# Technology Stack & Development Setup

## Core Technologies

### Frontend Framework
- **Next.js 14.0.4** - React framework with App Router
- **React 18** - Component-based UI library
- **TypeScript 5** - Static type checking and enhanced developer experience

### Styling & UI
- **Tailwind CSS 3.3.0** - Utility-first CSS framework
- **Framer Motion 12.23.24** - Animation and motion library
- **next-themes 0.4.6** - Dark/light theme management
- **Lucide React 0.548.0** - Icon library with consistent design

### Database & Backend
- **PostgreSQL** - Primary database (production)
- **SQLite** - Development database
- **Prisma 5.22.0** - Type-safe database ORM and query builder
- **@vercel/blob 2.0.0** - File storage and media management

### Authentication & Security
- **bcryptjs 2.4.3** - Password hashing
- **jsonwebtoken 9.0.2** - JWT token management
- **Zod 4.1.12** - Runtime type validation and schema parsing

### State Management & Forms
- **Zustand 5.0.9** - Lightweight state management
- **React Hook Form 7.65.0** - Form handling and validation
- **@dnd-kit** - Drag and drop functionality for page builder

### Development Tools
- **ESLint 8** - Code linting and style enforcement
- **Prettier 3.1.1** - Code formatting
- **Husky 8.0.3** - Git hooks for pre-commit validation
- **lint-staged 15.2.0** - Run linters on staged files

### Testing Framework
- **Vitest 1.0.4** - Fast unit testing framework
- **@vitejs/plugin-react 5.1.0** - React support for Vite
- **@vitest/coverage-v8 1.0.4** - Code coverage reporting

## Development Commands

### Core Development
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build with Prisma generation
npm run start        # Start production server using custom server.js
npm run start:next   # Start Next.js production server
```

### Code Quality
```bash
npm run lint         # Run ESLint checks
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format code with Prettier
npm run test         # Run test suite
npm run test:coverage # Run tests with coverage report
```

### Database Operations
```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to database
npm run db:seed      # Seed database with initial data
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:reset     # Reset database and re-seed
npm run db:seed-admin # Create admin user
```

### Internationalization
```bash
npm run translations:import # Import translation files
```

## Environment Configuration

### Required Environment Variables
```bash
# Database
POSTGRES_PRISMA_URL=         # PostgreSQL connection string
DATABASE_URL=                # Alternative database URL

# Authentication
JWT_SECRET=                  # JWT signing secret
ADMIN_PASSWORD=              # Default admin password

# File Storage
BLOB_READ_WRITE_TOKEN=       # Vercel Blob storage token

# Application
NEXT_PUBLIC_BASE_URL=        # Application base URL
NODE_ENV=                    # Environment (development/production)
```

### Development Setup
1. **Node.js 18+** - Required runtime environment
2. **PostgreSQL** - Production database
3. **Git** - Version control with Husky hooks configured

## Build System & Deployment

### Build Process
1. **Prisma Generation** - Database client generation
2. **TypeScript Compilation** - Type checking and compilation
3. **Next.js Build** - Static generation and optimization
4. **Asset Optimization** - Image and CSS optimization

### Production Server
- **Custom Express Server** (`server.js`) - Enhanced routing and middleware
- **Static File Serving** - Optimized asset delivery
- **API Route Handling** - Backend endpoint management

### Deployment Targets
- **Vercel** - Recommended platform with automatic deployments
- **Docker** - Containerized deployment with provided Dockerfile
- **Traditional Hosting** - Node.js hosting with PM2 ecosystem configuration

## Performance Optimizations

### Frontend Optimizations
- **Server-Side Rendering** - Improved initial page load
- **Static Generation** - Pre-built pages for better performance
- **Image Optimization** - Next.js automatic image optimization
- **Code Splitting** - Automatic bundle splitting for faster loads

### Database Optimizations
- **Connection Pooling** - Prisma connection management
- **Query Optimization** - Efficient database queries
- **Indexing Strategy** - Optimized database indexes for common queries

### Caching Strategy
- **Static Asset Caching** - Long-term caching for images and CSS
- **API Response Caching** - Intelligent caching for dynamic content
- **Build-time Optimization** - Pre-computation of static content

## Development Workflow

### Code Quality Pipeline
1. **Pre-commit Hooks** - Automatic linting and formatting
2. **TypeScript Checking** - Compile-time error detection
3. **Test Execution** - Automated test running
4. **Build Verification** - Ensure production build success

### Git Workflow
- **Conventional Commits** - Standardized commit messages
- **Branch Protection** - Quality gates before merging
- **Automated Formatting** - Consistent code style enforcement

### Debugging Tools
- **Prisma Studio** - Visual database management
- **Next.js DevTools** - Development debugging
- **TypeScript Language Server** - Enhanced IDE support
- **React Developer Tools** - Component debugging

## Security Measures

### Authentication Security
- **Password Hashing** - bcrypt with salt rounds
- **JWT Tokens** - Stateless authentication
- **Role-based Access** - Granular permission system

### Input Validation
- **Zod Schemas** - Runtime type validation
- **SQL Injection Prevention** - Prisma ORM protection
- **XSS Protection** - Input sanitization

### Infrastructure Security
- **Environment Variables** - Secure configuration management
- **HTTPS Enforcement** - Secure communication
- **CORS Configuration** - Cross-origin request protection