# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `pnpm dev` - Start development server in test mode (port 9527)
- `pnpm dev:prod` - Start development server in production mode
- `pnpm build` - Build for production
- `pnpm build:test` - Build for test environment
- `pnpm preview` - Preview production build (port 9725)

### Code Quality
- `pnpm lint` - Run ESLint with auto-fix
- `pnpm typecheck` - Run TypeScript type checking without emitting files
- `pnpm commit` - Interactive commit with conventional commit format

### Code Generation & Maintenance
- `pnpm gen-route` - Generate route files using elegant-router
- `pnpm cleanup` - Clean up project files
- `pnpm update-pkg` - Update package versions

## Project Architecture

### Monorepo Structure
This is a pnpm monorepo with packages in `/packages/` directory:
- `@sa/axios` - HTTP client utilities
- `@sa/hooks` - Vue composables and hooks
- `@sa/materials` - Reusable UI components
- `@sa/utils` - Utility functions
- `@sa/color` - Color palette management
- `@sa/scripts` - CLI scripts and commands

### Tech Stack
- **Frontend**: Vue 3 + TypeScript + Vite 7
- **UI Library**: Naive UI
- **Styling**: UnoCSS + SCSS
- **State Management**: Pinia
- **Routing**: Vue Router with elegant-router for automatic route generation
- **Build Tool**: Vite with custom plugins setup
- **Code Quality**: ESLint + TypeScript

### Key Directories

#### `/src/layouts/`
Contains layout components with flexible layout system:
- `base-layout` - Main admin layout with sidebar, header, tabs
- `blank-layout` - Simple layout for login/error pages
- Layout modules in `/modules/` for header, sidebar, menu, breadcrumb, etc.

#### `/src/router/`
- `elegant/` - Auto-generated routes using elegant-router
- `routes/` - Route definitions and builtin routes
- `guard/` - Navigation guards for auth, progress, titles

#### `/src/store/modules/`
Pinia stores for:
- `app` - Application settings and locale
- `auth` - Authentication and user data
- `route` - Route management and permissions
- `tab` - Tab navigation state
- `theme` - Theme configuration and UI settings

#### `/src/views/`
- `_builtin/` - Built-in pages (login, 403, 404, 500, iframe)
- Business pages organized by feature

#### `/src/service/`
- `api/` - API endpoint definitions
- `request/` - HTTP client configuration and interceptors

### Route System
Uses elegant-router for automatic route generation:
- Routes defined in `/src/views/` directory structure
- Auto-generates route imports and type definitions
- Supports both static frontend routes and dynamic backend routes
- Route files generated in `/src/router/elegant/`

### Theme System
Comprehensive theming with:
- Dark/light mode support
- Multiple color schemes
- UnoCSS integration with theme variables
- Configurable layout modes (vertical, horizontal, mix)
- Theme settings stored in Pinia

### Internationalization
- Built-in i18n support with vue-i18n
- Locale files in `/src/locales/langs/`
- Supports English and Chinese
- Naive UI components automatically localized

### Environment Configuration
- Development server runs on port 9527
- Preview server on port 9725
- Environment variables prefixed with `VITE_`
- Proxy configuration for API requests during development

## Important Notes

### File Route Generation
Always run `pnpm gen-route` after:
- Adding new pages in `/src/views/`
- Modifying route structure
- This updates auto-generated route files

### Code Standards
- Uses SoybeanJS ESLint configuration
- Strict TypeScript checking enabled
- Pre-commit hooks run typecheck and lint
- Vue component naming follows PascalCase
- Single-word component names allowed for: index, App, Register, [id], [url]

### Git Workflow
- Use `pnpm commit` for conventional commits
- Pre-commit hooks ensure code quality
- Commit messages follow conventional commit format