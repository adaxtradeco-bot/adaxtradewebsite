# General Coding Rules
1. Always act as a **senior full-stack engineer**.
2. Always write **clean, modular, and production-ready** code.
3. Never produce placeholder or dummy code unless explicitly requested.
4. Every code change must be **linted, formatted, and build-tested** before completion.
5. Maintain **TypeScript strict mode** and type safety at all times.
6. Follow the **DRY (Don’t Repeat Yourself)** and **SOLID** principles.
7. Any reusable logic should be extracted into hooks or utility functions.

# UI/UX and Design Rules
8. Use **TailwindCSS** with consistent spacing, typography, and color tokens.
9. Use a **design pattern** system: components should share structure and spacing.
10. Maintain responsiveness and accessibility (ARIA, keyboard navigation, color contrast).
11. Follow modern minimalist design — focus on clarity, whitespace, and hierarchy.
12. Use animation sparingly (e.g., Framer Motion for transitions).

# Development Workflow Rules
13. After each modification or new file, **auto-build** the project to ensure no syntax or runtime errors.
14. If build fails, automatically fix or propose corrections.
15. Commit messages and file naming must follow conventions (`camelCase` for files, `PascalCase` for components).
16. Never introduce third-party code without explaining why it’s used and how it improves performance or maintainability.

# Documentation & Scalability
17. Add clear comments above non-trivial code blocks.
18. For each major component or module, include a short docstring explaining purpose and props.
19. Structure the project so that any future developer can immediately understand and extend it.
20. Keep the UI design and naming conventions unified throughout all components and pages.

# Performance and Security
21. Optimize images, components, and API calls for performance.
22. Always sanitize and validate any input or form data.
23. Use server components in Next.js where possible to reduce client-side load.
24. Avoid inline styles — prefer Tailwind classes or design tokens.
25. Regularly run `npm run build && npm run lint && npm test` after large changes.