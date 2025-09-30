---
name: ⚙️ Technical Debt
about: Report technical debt that needs addressing
title: '[TECH-DEBT] '
labels: ['tech-debt', 'needs-triage']
assignees: ''
---

## ⚙️ Technical Debt Description

<!-- Clear description of the technical debt -->

## 📍 Location

**Affected Area:**
- [ ] Code Quality
- [ ] Architecture
- [ ] Performance
- [ ] Security
- [ ] Testing
- [ ] Documentation
- [ ] Dependencies
- [ ] Infrastructure

**Component/Module:**
<!-- e.g., apps/pos/src/lib/services/order.service.ts -->

## 🎯 Why This Exists

<!-- How did this technical debt accumulate? -->

- [ ] Quick fix during MVP
- [ ] Temporary workaround
- [ ] Outdated dependency
- [ ] Lack of tests
- [ ] Poor architecture decision
- [ ] Missing documentation
- [ ] Performance optimization deferred
- [ ] Other: ____

## 📊 Impact

**Current Impact:**
- [ ] 🔴 High - Actively causing issues
- [ ] 🟠 Medium - Slowing development
- [ ] 🟡 Low - Minor inconvenience

**Risk Level:**
- [ ] 🔴 Critical - Could cause production issues
- [ ] 🟠 High - Could impact reliability/security
- [ ] 🟡 Medium - Affects code maintainability
- [ ] 🟢 Low - Minor quality issue

## 💡 Proposed Resolution

<!-- How should this technical debt be addressed? -->

### Approach
<!-- Describe the solution -->

### Implementation Steps
1.
2.
3.

### Estimated Effort
- [ ] Small (< 1 day)
- [ ] Medium (1-3 days)
- [ ] Large (3-5 days)
- [ ] Extra Large (> 5 days)

## ✅ Acceptance Criteria

<!-- What needs to be done for this to be resolved? -->

- [ ]
- [ ]
- [ ]

## 📈 Benefits of Addressing

**Code Quality:**
<!-- How will this improve code quality? -->

**Performance:**
<!-- Will this improve performance? -->

**Maintainability:**
<!-- How will this make code easier to maintain? -->

**Developer Experience:**
<!-- How will this improve DX? -->

**Security:**
<!-- Does this improve security? -->

## 🔗 Related Issues

<!-- Link to related issues or features -->

- Related to #
- Blocking #
- Caused by #

## 📐 Technical Details

### Current Implementation

```typescript
// Current problematic code
```

### Proposed Implementation

```typescript
// Proposed improved code
```

### Architecture Changes
<!-- Are architecture changes needed? -->

### Breaking Changes
<!-- Will this introduce breaking changes? -->
- [ ] Yes
- [ ] No

If yes, describe:

## 🧪 Testing Strategy

<!-- How should this change be tested? -->

### Test Coverage
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add E2E tests
- [ ] Update existing tests

### Regression Risk
<!-- What's the risk of regression? -->
- [ ] High - Touches critical code
- [ ] Medium - Touches shared code
- [ ] Low - Isolated change

## 📅 Priority & Timeline

**Priority:**
- [ ] 🔴 Urgent - Address ASAP
- [ ] 🟠 High - Next sprint
- [ ] 🟡 Medium - Within next month
- [ ] 🟢 Low - Can defer

**Suggested Timeline:**
<!-- When should this be addressed? -->

**Milestone:**
<!-- Assign to a milestone if applicable -->

## 💰 Cost of Delay

<!-- What happens if we don't address this? -->

**Short Term (1 month):**

**Medium Term (3 months):**

**Long Term (6+ months):**

## 🚧 Workarounds

<!-- Current workarounds being used -->

## 📚 References

<!-- Links to related documentation, articles, discussions -->

- [Documentation](link)
- [Discussion](link)
- [ADR](link)

## 🎓 Learning Opportunity

<!-- Can this be a learning opportunity for the team? -->

**Skills Developed:**
-

**Knowledge Shared:**
-

## 💬 Additional Context

<!-- Any other relevant information -->

### Why Now?
<!-- Why should this be addressed now vs later? -->

### Dependencies
<!-- What needs to be in place first? -->

---

**For Maintainers:**

### Triage Checklist
- [ ] Impact level assessed
- [ ] Risk level evaluated
- [ ] Priority assigned
- [ ] Effort estimated
- [ ] Milestone assigned (if prioritized)
- [ ] Dependencies identified

### Planning Notes
<!-- Maintainer notes during planning -->

### ROI Analysis
**Cost:** <!-- Time/effort to fix -->
**Benefit:** <!-- Value gained -->
**Decision:** <!-- Fix now, defer, or wontfix -->