# AI Usage Report

This file documents how I used AI during development of this project.

## Project Planning and Delivery Strategy
- I planned this project architecture-first, with strong emphasis on clean architecture, organization, separation of concerns, and maintainable patterns.
- I broke the work into multiple GitHub issues and reflected that structure in the branch strategy used during development.
- I kept decision ownership on core topics: system structure, feature boundaries, linting/testing gates, and tradeoffs between speed and maintainability.
- The objective was to keep the codebase organized so new features could be added with lower time cost and lower risk.
- I treated architecture and quality checks as delivery accelerators, not overhead, because they reduce regressions and rework.
- I also intentionally used these patterns to increase leverage for collaborators:
  - AI tools can produce better output when the project has clear conventions and modular structure.
  - Junior developers can deliver faster and safer when good patterns already exist.
- If this were a production product, this approach would help keep long-term maintenance cost low while preserving delivery speed.

## Goal of AI Usage
- Speed up delivery while preserving code quality and test coverage.
- Use AI as a coding assistant and reviewer, not as an autonomous decision maker.
- Keep architecture and product decisions under my control.

## How I Used AI
- To accelerate project setup for Django (backend) and Next.js (frontend).
- To transform requirements/UML into concrete model and API proposals.
- To implement repetitive or boilerplate-heavy tasks faster (views, wiring, tests, CI, Docker).
- To iterate UI implementation from visual references (login/signup/home/editor layouts).
- To troubleshoot runtime/test issues and propose targeted fixes.
- To increase and validate backend/frontend test coverage.
- I also used GitHub Copilot to help draft GitHub issues and write PR summaries.

## Chronological Log Strategy (Used as Source for This Report)
- My initial approach was to keep `AI_USAGE_LOG.md` as a detailed diary of day-to-day usage, including requests, decisions, and outcomes.
- The intent was to preserve raw usage history so AI could later transform that history into a final concise report.
- After finishing the project, I used that history as context to produce this final version focused on evaluation criteria.
- In short: first pass = full activity log, final pass = curated report for submission.

## Concrete Examples of AI Usage
- Backend design and domain modeling:
  - Interpret UML and convert it into Django models while keeping `django.contrib.auth.models.User` as the user source.
  - Refine category behavior into shared defaults now, while keeping the model open for future user-specific categories.
- API and architecture decisions:
  - Discuss alternatives (for example, class-based approaches) and intentionally rejected added complexity when not justified.
- Frontend implementation from references:
  - Translate visual references into the screens.
- Testing and quality:
  - Create and expand backend/frontend tests, fix unstable tests, and target specific uncovered lines in coverage reports.
  - Resolve test tooling issues (Vitest setup, matcher/runtime issues, timer-related test flakiness).

## Decision Ownership (What I Decided)
- I defined the product behavior and UX details (flows, defaults, redirects, styling adjustments).
- I reviewed and accepted/rejected AI suggestions before keeping changes.
- I requested refactors to match my architecture preferences (cleaner separation of concerns).
- I constrained AI output when complexity was not justified.

## Where AI Helped Most (Mapped to Evaluation Criteria)
- Functionality:
  - Faster end-to-end implementation of the flows and frontend/backend wiring.
- Code Quality:
  - Faster test creation/coverage improvements, endpoint validation, and code organization refactors.
- Creativity:
  - Rapid exploration of implementation alternatives and UI iterations from design references.
- Time Management:
  - Reduced time spent on repetitive coding/debugging and improved focus on priority features.

## Time Invested
- Friday, February 20, 2026: about 3 hours.
- Saturday, February 21, 2026: about 5 hours.
- Sunday, February 22, 2026: about 8 hours.
- Monday, February 23, 2026: about 2 hour.
- Tuesday, February 24, 2026: about 2 hours.
- Total: about 20 hours.

## Boundaries I Applied
- I used AI suggestions as drafts and reviewed all relevant changes.
- I prioritized maintainability and tests before accepting implementation details.
- I preserved flexibility for future features (for example, category model evolution).
