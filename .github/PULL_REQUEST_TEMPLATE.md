# Pull Request

## Description

<!-- Provide a brief description of the changes in this PR -->

### Type of Change

<!-- Check all that apply -->

- [ ] 🚀 New feature (non-breaking change that adds functionality)
- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ♻️ Refactor (code change that neither fixes a bug nor adds a feature)
- [ ] 📝 Documentation update
- [ ] 🎨 Style/UI update (formatting, styling, no functional changes)
- [ ] ⚡ Performance improvement
- [ ] 🧪 Test addition or update
- [ ] 🔧 Configuration change
- [ ] 💥 Breaking change (fix or feature that breaks existing functionality)

## Related Issues

<!-- Link related issues using keywords: Closes #123, Fixes #456, Relates to #789 -->

- Closes #
- Fixes #
- Relates to #

## Motivation and Context

<!-- Why is this change required? What problem does it solve? -->

## Changes Made

<!-- Provide a detailed list of changes made in this PR -->

-
-
-

## Screenshots (if applicable)

<!-- Add screenshots or recordings to help explain your changes -->

### Before

<!-- Screenshot/video before changes -->

### After

<!-- Screenshot/video after changes -->

## Testing

### Test Coverage

- [ ] Unit tests added/updated and passing
- [ ] Integration tests added/updated and passing
- [ ] E2E tests added/updated and passing (if applicable)
- [ ] Coverage meets minimum thresholds (80%+ standard, 90%+ critical)

### Manual Testing

<!-- Describe the tests you ran to verify your changes -->

**Test Environment:**
- OS:
- Browser(s):
- Device(s):

**Test Scenarios:**
1.
2.
3.

**Test Results:**
- [ ] All manual tests passed

## Definition of Done Checklist

### Code Quality
- [ ] TypeScript compiles with no errors (`npm run typecheck`)
- [ ] Passes linting (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] No use of `any` types
- [ ] Functions under 50 lines, files under 300 lines
- [ ] JSDoc comments on public APIs

### Testing
- [ ] TDD approach followed (tests written first)
- [ ] All tests passing locally
- [ ] Tests follow AAA pattern (Arrange-Act-Assert)
- [ ] Edge cases and error scenarios tested
- [ ] No flaky tests (passed 10/10 times)

### Functionality
- [ ] Meets all acceptance criteria from user story
- [ ] Manually tested in local environment
- [ ] Works cross-browser (Chrome, Firefox, Safari, Edge)
- [ ] Responsive on mobile, tablet, desktop
- [ ] Error handling and user feedback implemented
- [ ] Loading states for async operations

### Accessibility (WCAG 2.1 AA)
- [ ] Keyboard navigation functional
- [ ] Screen reader compatible (semantic HTML + ARIA)
- [ ] Color contrast meets 4.5:1 minimum
- [ ] Touch targets minimum 44x44px
- [ ] Visible focus indicators
- [ ] Passes accessibility tests (vitest-axe or Playwright)

### Performance
- [ ] No significant bundle size increase
- [ ] Lighthouse performance score > 90
- [ ] No memory leaks
- [ ] N+1 queries avoided
- [ ] API responses < 200ms (p95)

### Security
- [ ] Input validation with Zod schemas
- [ ] Parameterized queries (Drizzle ORM)
- [ ] User input sanitized
- [ ] Authentication/authorization enforced
- [ ] No hardcoded secrets
- [ ] HTTPS for all API calls

### Documentation
- [ ] Code comments for complex logic
- [ ] README updated if needed
- [ ] API docs updated (OpenAPI spec)
- [ ] User documentation updated if needed
- [ ] ADR created for major decisions
- [ ] CHANGELOG.md updated

### Database (if applicable)
- [ ] Migration created and tested
- [ ] Migration can be rolled back
- [ ] Seed data updated if needed
- [ ] Indexes added for performance
- [ ] Foreign key constraints defined

### CI/CD
- [ ] All CI checks passing
- [ ] Build succeeds
- [ ] Tests pass in CI
- [ ] No merge conflicts
- [ ] Deploy preview tested

## Database Changes

<!-- Check if this PR includes database changes -->

- [ ] This PR includes database migrations
- [ ] Migrations tested locally
- [ ] Rollback migrations tested
- [ ] Production migration plan documented

**Migration Details:**
<!-- If applicable, describe database changes -->

## Breaking Changes

<!-- Check if this PR introduces breaking changes -->

- [ ] This PR contains breaking changes
- [ ] Migration guide provided
- [ ] Affected teams notified
- [ ] Backward compatibility maintained where possible

**Breaking Changes Details:**
<!-- If applicable, describe breaking changes and migration path -->

## Performance Impact

<!-- Describe any performance implications -->

- [ ] No performance impact
- [ ] Performance improved
- [ ] Performance degraded (justified below)

**Performance Notes:**
<!-- Add performance benchmarks, bundle size changes, etc. -->

## Deployment Notes

<!-- Any special deployment considerations -->

- [ ] No special deployment steps required
- [ ] Requires environment variable changes
- [ ] Requires database migration
- [ ] Requires external service configuration

**Deployment Instructions:**
<!-- If special steps needed, list them here -->

## Rollback Plan

<!-- Describe how to rollback these changes if needed -->

**Rollback Steps:**
1.
2.
3.

## Additional Context

<!-- Add any other context about the PR here -->

## Checklist for Reviewers

### For Code Reviewers
- [ ] Code follows established patterns and conventions
- [ ] Logic is clear and well-documented
- [ ] Tests adequately cover functionality
- [ ] No unnecessary complexity
- [ ] Security best practices followed
- [ ] Accessibility requirements met
- [ ] Performance considerations addressed

### For Tech Lead
- [ ] Architecture aligns with system design
- [ ] No technical debt introduced without tracking
- [ ] Dependencies properly managed
- [ ] Deployment plan is sound

### For QA
- [ ] Test coverage is adequate
- [ ] Manual test scenarios documented
- [ ] Edge cases considered
- [ ] Regression testing plan in place

## Post-Merge Tasks

<!-- Tasks to complete after merging -->

- [ ] Monitor error rates in production
- [ ] Verify performance metrics
- [ ] Update related documentation
- [ ] Close related issues
- [ ] Notify stakeholders

---

## Reviewer Notes

<!-- Space for reviewer feedback -->

### Review Comments

<!-- Reviewers: Add your comments and concerns here -->

---

**By submitting this PR, I confirm:**
- ✅ I have followed the TDD approach
- ✅ I have tested my changes thoroughly
- ✅ I have updated documentation as needed
- ✅ I have verified all Definition of Done criteria
- ✅ My code follows the project's style guidelines