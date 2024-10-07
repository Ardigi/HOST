# Architecture Decision Records (ADR)

## What is an ADR?

An **Architecture Decision Record** (ADR) is a document that captures an important architectural decision made along with its context and consequences.

## Why ADRs?

- **Historical Context**: Future developers understand why decisions were made
- **Knowledge Sharing**: New team members can get up to speed quickly
- **Decision Tracking**: Track the evolution of the system architecture
- **Avoid Repeated Discussions**: Reference past decisions instead of re-debating
- **Accountability**: Clear record of who decided what and when

## When to Create an ADR?

Create an ADR when making decisions about:

- **Technology Choices**: Framework selection, database choice, libraries
- **Architecture Patterns**: Monorepo vs polyrepo, microservices vs monolith
- **API Design**: REST vs GraphQL vs tRPC, authentication approach
- **Data Models**: Schema design, normalization decisions
- **Performance**: Caching strategies, optimization approaches
- **Security**: Authentication/authorization patterns
- **Development Process**: Testing strategies, CI/CD approach

## ADR Format

We use a simplified ADR format inspired by Michael Nygard's template:

```markdown
# ADR-###: [Title]

## Status

[Proposed | Accepted | Rejected | Deprecated | Superseded by ADR-###]

## Context

What is the issue we're facing? What factors influenced this decision?

## Decision

What decision did we make and why?

## Consequences

What becomes easier or harder as a result of this decision?

### Positive

- Benefits of this decision

### Negative

- Drawbacks or tradeoffs

### Risks

- Potential risks we're accepting

## Alternatives Considered

What other options did we evaluate?

## References

- Links to relevant documentation, discussions, or research
```

## Naming Convention

ADR files follow this pattern:
```
ADR-###-short-title.md
```

Examples:
- `ADR-001-svelte-5-framework.md`
- `ADR-002-turso-database.md`
- `ADR-003-tRPC-api-layer.md`

## ADR Lifecycle

### 1. Proposed
Decision is under consideration but not yet final.

### 2. Accepted
Decision has been made and is being implemented.

### 3. Rejected
Decision was considered but ultimately not chosen. Document why.

### 4. Deprecated
Decision was valid once but no longer applies.

### 5. Superseded
Decision has been replaced by a newer decision. Link to the new ADR.

## Example ADR

See `ADR-001-example-template.md` for a complete example.

## List of ADRs

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [001](ADR-001-svelte-5-framework.md) | Svelte 5 as Frontend Framework | Accepted | 2025-09-29 |
| [002](ADR-002-turso-database.md) | Turso (LibSQL) as Primary Database | Accepted | 2025-09-29 |
| [003](ADR-003-material-design-3.md) | Material Design 3 with m3-svelte | Accepted | 2025-09-30 |

## Creating a New ADR

1. **Find the Next Number**: Check the list above for the next available ADR number

2. **Copy the Template**:
   ```bash
   cp docs/adr/TEMPLATE.md docs/adr/ADR-###-your-title.md
   ```

3. **Fill Out the Template**: Complete all sections with relevant information

4. **Submit for Review**: Create a PR with the ADR for team review

5. **Update This README**: Add your ADR to the list above

6. **Update Status**: As the decision progresses, update the status

## Best Practices

### Be Clear and Concise
- Use simple language
- Avoid jargon unless necessary
- Focus on the "why" not just the "what"

### Include Context
- Business drivers
- Technical constraints
- Team capabilities
- Timeline considerations

### Document Alternatives
- What else was considered?
- Why were they rejected?
- Trade-offs for each option

### Keep it Current
- Update status as decisions evolve
- Mark deprecated decisions
- Link to superseding ADRs

### Make it Discoverable
- Use descriptive titles
- Add relevant tags/labels
- Link from related documentation

## References

- [Michael Nygard's ADR Article](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR GitHub Organization](https://adr.github.io/)
- [Documenting Architecture Decisions - ThoughtWorks](https://www.thoughtworks.com/insights/articles/documenting-architecture-decisions)