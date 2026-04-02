# Contributing to closedNote

Thanks for taking the time to contribute! closedNote is an open source project and contributions of all kinds are welcome.

## Getting Started

1. Fork the repo
2. Clone your fork:
```bash
   git clone https://github.com/your-username/closedNote.git
   cd closedNote
```
3. Install dependencies:
```bash
   npm install
```
4. Copy the environment file and fill in your Supabase keys:
```bash
   cp .env.example .env.local
```
5. Run the development server:
```bash
   npm run dev
```

## How to Contribute

### Reporting Bugs
- Check the [open issues](https://github.com/aboderinsamuel/closedNote/issues) first to avoid duplicates
- Open a new issue with a clear title, steps to reproduce, and expected vs actual behavior

### Suggesting Features
- Open an issue with the `enhancement` label
- Explain the problem you're trying to solve, not just the solution

### Submitting Code
1. Create a new branch from `main`:
```bash
   git checkout -b feature/your-feature-name
```
2. Make your changes
3. Run tests and make sure they pass:
```bash
   npm test
```
4. Run the linter:
```bash
   npm run lint
```
5. Commit with a clear message:
```bash
   git commit -m "feat: add your feature description"
```
6. Push and open a pull request against `main`

## Commit Message Convention

Use conventional commits where possible:

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation changes
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `test:` — adding or updating tests
- `chore:` — maintenance tasks

## Project Structure
```
app/          # Next.js App Router pages and API routes
components/   # React components
lib/          # Utility functions and shared logic
supabase/     # Database migrations
__tests__/    # Test files
```

## Code Style

- TypeScript is required — avoid `any` types where possible
- Follow the existing ESLint configuration (`npm run lint`)
- Keep components small and focused

## Questions?

Open an issue or reach out via [LinkedIn](https://www.linkedin.com/in/samuelaboderin).
