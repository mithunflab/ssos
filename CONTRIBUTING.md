# Contributing to Clienter

Thank you for considering contributing to Clienter! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/clienter.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Commit: `git commit -m "Add your feature"`
7. Push: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

See [SETUP.md](./SETUP.md) for complete setup instructions.

## Code Style

- Use TypeScript for all new files
- Follow existing code formatting (Prettier)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components focused and reusable

## Component Guidelines

- Use `'use client'` for client components
- Keep server components when possible
- Follow React hooks rules
- Properly type all props with TypeScript

## Database Changes

If you modify the database schema:

1. Update `supabase/schema.sql`
2. Update TypeScript types in `src/types/database.ts`
3. Document the changes in your PR
4. Test with a fresh Supabase project

## Testing

Before submitting:

1. Test the app locally with `npm run dev`
2. Verify authentication flows work
3. Test CRUD operations
4. Check mobile responsiveness
5. Verify no TypeScript errors: `npm run type-check`

## Pull Request Guidelines

### PR Title Format

- `feat: Add feature description`
- `fix: Fix bug description`
- `docs: Update documentation`
- `style: Code style changes`
- `refactor: Refactor code`
- `test: Add tests`

### PR Description Should Include

- What changes were made
- Why the changes were necessary
- How to test the changes
- Screenshots (for UI changes)
- Breaking changes (if any)

## Feature Requests

Open an issue with:

- Clear description of the feature
- Use case / user story
- Why it would be valuable
- Possible implementation approach

## Bug Reports

Include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/error messages
- Environment (OS, browser, Node version)

## Questions?

Open an issue with the "question" label.

## Code of Conduct

- Be respectful and constructive
- Welcome newcomers
- Focus on what's best for the project
- Accept constructive criticism gracefully

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
