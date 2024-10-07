# Feature Implementation Checklist
## Template for Test-Driven Development

---

## Feature Information

**Feature Name:** [Feature Name]
**User Story:** [Link to user story in docs/user-stories.md]
**Issue:** [GitHub issue #]
**Assignee:** [Developer name]
**Sprint:** [Week # of roadmap]
**Started:** [Date]
**Completed:** [Date]

---

## Pre-Implementation

### Planning & Design
- [ ] **User story reviewed** - Understand requirements and acceptance criteria
- [ ] **Dependencies identified** - Check `docs/DEPENDENCIES.md` for blockers
- [ ] **Design reviewed** - UI/UX mockups or wireframes reviewed
- [ ] **Architecture decision made** - Document in ADR if significant
- [ ] **API endpoints defined** - Update `docs/04-api-specification.yaml`
- [ ] **Database changes identified** - Plan migrations if needed
- [ ] **Test strategy defined** - Know what tests to write

### Environment Setup
- [ ] **Branch created** - Follow naming: `feature/POS-###-description`
- [ ] **Development environment running** - All services up
- [ ] **Database migrated** - Schema up to date
- [ ] **Dependencies installed** - `npm install` successful

---

## Phase 1: Test-Driven Development (RED)

### Write Failing Tests First

#### Unit Tests
- [ ] **Business logic tests** - Test pure functions
- [ ] **Service layer tests** - Test service methods
- [ ] **Validation tests** - Test Zod schemas
- [ ] **Utility function tests** - Test helpers
- [ ] **Component tests** - Test Svelte components
- [ ] **Store tests** - Test Svelte stores (if applicable)

**Test File Locations:**
- `[feature-name].test.ts` - Unit tests
- `[component-name].test.ts` - Component tests

**Test Coverage Target:** 80%+ (90%+ for critical features)

#### Integration Tests
- [ ] **API endpoint tests** - Test tRPC procedures
- [ ] **Database operation tests** - Test Drizzle queries
- [ ] **Service integration tests** - Test service interactions
- [ ] **Auth/permission tests** - Test authorization

**Test File Locations:**
- `[feature-name].integration.test.ts`

#### E2E Tests (if applicable)
- [ ] **User workflow tests** - Test complete user journeys
- [ ] **Critical path tests** - Test essential functionality

**Test File Locations:**
- `e2e/[feature-name].spec.ts`

### Verify Tests Fail
- [ ] **Run tests** - `npm run test`
- [ ] **Confirm RED** - Tests fail as expected
- [ ] **Tests are meaningful** - Not just placeholder tests

---

## Phase 2: Implementation (GREEN)

### Backend Implementation

#### Database Changes
- [ ] **Schema defined** - Drizzle schema created
- [ ] **Migration created** - `npm run db:migrate:create`
- [ ] **Migration tested** - Applied and rolled back successfully
- [ ] **Indexes added** - Performance optimizations
- [ ] **Constraints defined** - Foreign keys, unique constraints
- [ ] **Seed data updated** - Test data for development

**Files:**
- `packages/database/src/schema/[table-name].ts`
- `packages/database/drizzle/[timestamp]_[migration-name].sql`

#### API Layer
- [ ] **Input validation** - Zod schemas defined
- [ ] **tRPC procedures** - Queries/mutations implemented
- [ ] **Error handling** - TRPCError with proper codes
- [ ] **Authorization** - Role-based access control
- [ ] **Logging** - Request/response logging
- [ ] **Rate limiting** - Applied if needed

**Files:**
- `packages/api/src/routers/[feature-name].router.ts`
- `packages/api/src/schemas/[feature-name].schema.ts`

#### Business Logic
- [ ] **Service layer** - Core business logic
- [ ] **Data transformation** - DTOs and mappers
- [ ] **Calculations** - Pure functions for calculations
- [ ] **Validations** - Business rule validations

**Files:**
- `packages/shared/src/services/[feature-name].service.ts`
- `packages/shared/src/utils/[utility-name].ts`

### Frontend Implementation

#### Components
- [ ] **UI components** - Svelte components created
- [ ] **TypeScript props** - Interface defined
- [ ] **Svelte 5 runes** - Use `$state`, `$derived`, `$effect`
- [ ] **Styling** - Tailwind CSS applied
- [ ] **Responsive design** - Mobile, tablet, desktop
- [ ] **Loading states** - Skeleton/spinner for async
- [ ] **Error states** - Error messages and fallbacks
- [ ] **Accessibility** - Keyboard nav, ARIA labels

**Files:**
- `apps/pos/src/lib/components/[ComponentName].svelte`
- `packages/ui/src/components/[SharedComponent].svelte`

#### Pages/Routes
- [ ] **SvelteKit routes** - Pages created
- [ ] **Load functions** - Data fetching
- [ ] **Form actions** - Server-side form handling
- [ ] **Layout** - Consistent layout applied
- [ ] **SEO** - Meta tags for SEO

**Files:**
- `apps/pos/src/routes/[route-name]/+page.svelte`
- `apps/pos/src/routes/[route-name]/+page.ts` (or `.server.ts`)

#### State Management
- [ ] **Stores created** - Svelte stores if needed
- [ ] **Context API** - Shared state via context
- [ ] **Optimistic updates** - UI updates before server response

**Files:**
- `apps/pos/src/lib/stores/[store-name].ts`

### Verify Tests Pass
- [ ] **Run tests** - `npm run test`
- [ ] **Confirm GREEN** - All tests pass
- [ ] **Coverage checked** - `npm run test:coverage`

---

## Phase 3: Refactor

### Code Quality
- [ ] **Remove duplication** - DRY principle applied
- [ ] **Extract functions** - Single responsibility
- [ ] **Naming clarity** - Clear, descriptive names
- [ ] **Comments added** - Complex logic documented
- [ ] **JSDoc comments** - Public API documented
- [ ] **Type safety** - No `any` types
- [ ] **Error handling** - Graceful error handling
- [ ] **Performance** - Optimizations applied

### Architecture
- [ ] **Patterns followed** - Consistent with existing code
- [ ] **Abstractions** - Proper abstraction layers
- [ ] **Dependencies** - Minimal coupling
- [ ] **Reusability** - Shared code extracted to packages

### Tests Refactored
- [ ] **Test factories** - Use factories for test data
- [ ] **Helper functions** - Extract test helpers
- [ ] **Test clarity** - AAA pattern followed
- [ ] **No test duplication** - Reuse test setup

### Verify Tests Still Pass
- [ ] **Run tests** - `npm run test`
- [ ] **Confirm GREEN** - Tests still pass after refactor

---

## Phase 4: Quality Assurance

### Code Quality Checks
- [ ] **TypeScript** - `npm run typecheck` passes
- [ ] **Linting** - `npm run lint` passes
- [ ] **Formatting** - `npm run format` applied
- [ ] **Build** - `npm run build` succeeds
- [ ] **No console logs** - Development logs removed

### Testing
- [ ] **Unit tests pass** - `npm run test:unit`
- [ ] **Integration tests pass** - `npm run test:integration`
- [ ] **E2E tests pass** - `npm run test:e2e` (if applicable)
- [ ] **Coverage meets target** - 80%+ standard, 90%+ critical
- [ ] **No flaky tests** - Tests pass consistently (10/10)

### Accessibility (WCAG 2.1 AA)
- [ ] **Keyboard navigation** - All functionality accessible
- [ ] **Screen reader** - Semantic HTML + ARIA labels
- [ ] **Color contrast** - 4.5:1 minimum for text
- [ ] **Touch targets** - 44x44px minimum
- [ ] **Focus indicators** - Visible on interactive elements
- [ ] **Axe tests** - Accessibility tests pass

### Performance
- [ ] **Lighthouse** - Performance score > 90
- [ ] **Bundle size** - No significant increase
- [ ] **API response** - < 200ms (p95)
- [ ] **UI interactions** - < 100ms response
- [ ] **Memory leaks** - None detected in profiler
- [ ] **N+1 queries** - Avoided in database queries

### Security
- [ ] **Input validation** - All inputs validated with Zod
- [ ] **SQL injection** - Parameterized queries (Drizzle)
- [ ] **XSS prevention** - User input sanitized
- [ ] **Authentication** - Protected routes enforced
- [ ] **Authorization** - RBAC verified
- [ ] **No secrets** - No hardcoded secrets

### Cross-Browser/Device
- [ ] **Chrome** - Tested and working
- [ ] **Firefox** - Tested and working
- [ ] **Safari** - Tested and working
- [ ] **Edge** - Tested and working
- [ ] **Mobile** - Responsive on mobile devices
- [ ] **Tablet** - Responsive on tablets
- [ ] **Offline** - Works offline if applicable (PWA)

---

## Phase 5: Documentation

### Code Documentation
- [ ] **Inline comments** - Complex logic explained
- [ ] **JSDoc** - Public APIs documented
- [ ] **Type definitions** - All types documented

### Project Documentation
- [ ] **README updated** - If applicable
- [ ] **API docs** - OpenAPI spec updated
- [ ] **User docs** - User-facing documentation
- [ ] **ADR created** - If major decision made
- [ ] **CHANGELOG** - Changes documented

### Migration Guides
- [ ] **Breaking changes** - Documented with migration path
- [ ] **Environment variables** - New vars documented
- [ ] **Database migrations** - Rollback plan documented

---

## Phase 6: Review & Merge

### Pre-Pull Request
- [ ] **Self-review** - Review your own code first
- [ ] **Clean commits** - Clear commit messages
- [ ] **Branch updated** - Merge latest main
- [ ] **Conflicts resolved** - No merge conflicts
- [ ] **CI passing locally** - All checks pass

### Pull Request
- [ ] **PR created** - Follow PR template
- [ ] **Description complete** - All sections filled
- [ ] **Screenshots** - UI changes shown
- [ ] **Breaking changes** - Documented if any
- [ ] **Reviewers assigned** - Appropriate reviewers
- [ ] **Labels added** - Feature, component labels
- [ ] **Linked issues** - Related issues linked

### Code Review
- [ ] **Review feedback** - Address all comments
- [ ] **Changes requested** - Make requested changes
- [ ] **Re-review requested** - After addressing feedback
- [ ] **Approval received** - At least one approval

### CI/CD
- [ ] **Build passes** - CI build successful
- [ ] **Tests pass** - CI tests successful
- [ ] **Linting passes** - CI linting successful
- [ ] **Deploy preview** - Vercel preview deployed
- [ ] **Preview tested** - Manual test of preview

---

## Phase 7: Deployment

### Pre-Merge Checklist
- [ ] **All checks pass** - CI/CD green
- [ ] **Approvals** - Required approvals obtained
- [ ] **Up to date** - Branch synced with main
- [ ] **No conflicts** - Ready to merge

### Merge
- [ ] **Merge method** - Squash and merge (or rebase)
- [ ] **Merge message** - Clear, descriptive
- [ ] **Branch deleted** - Cleanup after merge

### Post-Deployment
- [ ] **Production deploy** - Feature deployed to prod
- [ ] **Smoke test** - Quick test in production
- [ ] **Monitoring** - Check error rates
- [ ] **Performance** - Verify performance metrics
- [ ] **User feedback** - Monitor user feedback

### Cleanup
- [ ] **Related issues closed** - Close completed issues
- [ ] **Documentation updated** - Final doc updates
- [ ] **Team notified** - Stakeholders informed
- [ ] **Retrospective notes** - Capture learnings

---

## Acceptance Criteria

### From User Story
<!-- Copy acceptance criteria from the user story -->

- [ ]
- [ ]
- [ ]

### Technical Acceptance
- [ ] All tests passing (80%+ coverage)
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Responsive (mobile + desktop)
- [ ] Performant (Lighthouse > 90)
- [ ] Secure (input validated, auth enforced)
- [ ] Documented (code + user docs)

---

## Notes & Learnings

### Challenges Encountered
<!-- Document any challenges and how they were resolved -->

### Decisions Made
<!-- Key technical decisions -->

### Future Improvements
<!-- Ideas for future enhancements -->

### Lessons Learned
<!-- What did you learn from this feature? -->

---

## Checklist Status

**Total Items:** [ ]
**Completed:** [ ]
**Remaining:** [ ]
**Progress:** [ ]%

---

*Template Version: 1.0.0*
*Last Updated: 2025-09-29*