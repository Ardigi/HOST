# ADR-002: Turso (LibSQL) as Primary Database

## Status

**Status**: Accepted

**Date**: 2025-09-29

**Deciders**: Tech Lead, Backend Team

**Related ADRs**: None

---

## Context

### Background

We're building a POS system that needs:
- Fast read/write performance for high-volume transactions
- Multi-region deployment for global customers
- Edge database capabilities for low latency
- Offline-first capability with sync
- Cost-effective scaling

### Problem Statement

We need a database solution that can provide:
1. Sub-10ms read latency for menu items and order data
2. Global replication for multi-region deployments
3. Embedded replicas for offline-first functionality
4. PostgreSQL-like reliability with SQLite simplicity
5. Cost-effective pricing for SaaS business model

### Driving Forces

- **Performance**: Need <200ms API response times (p95)
- **Scalability**: Must scale from single restaurant to enterprise chains
- **Cost**: Need predictable, affordable pricing
- **Developer Experience**: Want SQL + TypeScript with great tooling
- **Multi-tenancy**: Each venue needs data isolation

### Constraints

- Must support transactions (ACID)
- Must work with TypeScript/Node.js
- Must have ORM support (Drizzle)
- Must support full-text search
- Budget conscious (early-stage startup)

---

## Decision

We will **use Turso (LibSQL) as our primary database** with Drizzle ORM for type-safe queries.

### Reasoning

1. **Edge Performance**: Turso provides embedded replicas at the edge with sub-10ms reads
2. **SQLite Foundation**: Built on SQLite's proven, reliable storage engine
3. **Global Replication**: Automatic multi-region replication without configuration
4. **Cost Effective**: Free tier generous enough for development, affordable scaling
5. **Developer Experience**: Works seamlessly with Drizzle ORM and TypeScript
6. **Proven Technology**: SQLite is the most deployed database in the world

### Key Factors

- **Performance**: Sub-10ms reads with embedded replicas
- **Simplicity**: SQLite simplicity with cloud features
- **Cost**: 500 databases free, then $29/month for production
- **Drizzle Support**: First-class Turso support in Drizzle ORM
- **Offline-First**: Can use local SQLite in offline mode

---

## Consequences

### Positive

- **Exceptional Read Performance**: <10ms reads with edge replicas
- **Cost Effective**: Free for development, affordable at scale
- **Simple Mental Model**: SQLite semantics, easy to reason about
- **Type Safety**: Drizzle ORM provides end-to-end type safety
- **Multi-Region**: Automatic global replication
- **Offline Support**: Can embed libSQL for offline functionality
- **No Infrastructure**: Fully managed, no servers to maintain

### Negative

- **Write Latency**: Writes go to primary region (~50-100ms from other regions)
- **Vendor Lock-in**: Turso-specific features (though libSQL is open source)
- **Limited Ecosystem**: Newer product, smaller community than PostgreSQL
- **Feature Set**: Not all PostgreSQL extensions available
- **Query Complexity**: More complex than dedicated OLAP databases for analytics

### Neutral

- **SQLite Semantics**: Slightly different from PostgreSQL (mostly compatible)
- **Connection Limits**: Different connection model than traditional databases

### Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|-----------|--------|-------------------|
| Service availability | Low | High | Use embedded libSQL for local fallback |
| Write performance issues | Medium | Medium | Optimize write patterns, use batching |
| Migration from Turso | Low | High | libSQL is open source, can self-host if needed |
| Feature limitations | Medium | Low | Most POS needs met by SQLite feature set |

---

## Alternatives Considered

### Alternative 1: PostgreSQL

**Description**: Use PostgreSQL with Supabase or Neon

**Pros**:
- Mature, battle-tested
- Rich feature set (JSON, full-text search, extensions)
- Large ecosystem
- Strong consistency
- Many hosting options

**Cons**:
- Higher latency (no edge replicas)
- More expensive at scale
- More complex to operate
- Connection pooling required
- Heavier resource usage

**Why Rejected**: PostgreSQL doesn't offer edge replicas for <10ms reads. Turso's embedded replicas provide significantly better performance for read-heavy POS workloads.

### Alternative 2: MongoDB

**Description**: Use MongoDB Atlas

**Pros**:
- Flexible schema
- Good global distribution
- Strong ecosystem
- Built-in search

**Cons**:
- No strong transactions (pre-4.0)
- More expensive than SQL options
- Steeper learning curve
- Eventual consistency can cause issues
- Larger bundle sizes with driver

**Why Rejected**: POS systems need ACID transactions. MongoDB's eventual consistency and weaker transaction guarantees are not suitable for financial transactions.

### Alternative 3: PlanetScale

**Description**: Use PlanetScale (MySQL-compatible)

**Pros**:
- Branching for database changes
- Good performance
- MySQL compatibility
- Decent pricing

**Cons**:
- No edge replicas
- Foreign keys not supported in free tier
- More complex than SQLite
- Connection pooling required

**Why Rejected**: PlanetScale doesn't offer edge performance. Turso's embedded replicas and simpler model are better for our use case.

### Alternative 4: DynamoDB

**Description**: Use AWS DynamoDB

**Pros**:
- Excellent performance
- Infinite scalability
- Fully managed by AWS

**Cons**:
- Complex query model
- Expensive at scale
- No SQL, harder to work with
- Vendor lock-in to AWS
- Complex pricing

**Why Rejected**: DynamoDB's NoSQL model adds unnecessary complexity for structured POS data. SQL is more natural for our domain model.

---

## Implementation Notes

### Required Changes

- Setup Turso account and database
- Configure Drizzle ORM with Turso dialect
- Create database schema with Drizzle
- Setup migrations with drizzle-kit
- Configure connection pooling
- Implement offline-first sync (future)

### Migration Plan

- Use Turso local development (libSQL)
- Schema designed from the start for Turso
- Use Drizzle migrations for schema changes
- Test with production-like data volumes

### Timeline

- Week 1: Setup Turso and Drizzle
- Week 1-2: Design and implement schema
- Ongoing: Optimize queries and indexes

---

## Success Criteria

- Read queries < 10ms (p95)
- Write queries < 100ms (p95)
- No data loss
- 99.9% uptime
- Migration path clear if needed
- Developer satisfaction with Drizzle ORM

---

## References

- [Turso Documentation](https://docs.turso.tech/)
- [libSQL GitHub](https://github.com/tursodatabase/libsql)
- [Drizzle ORM Turso Guide](https://orm.drizzle.team/docs/connect-turso)
- [SQLite vs PostgreSQL](https://sqlite.org/whentouse.html)
- [Turso Pricing](https://turso.tech/pricing)

---

## Updates

| Date | Author | Change Description |
|------|--------|-------------------|
| 2025-09-29 | Tech Lead | Initial decision |

---

*ADR Version: 1.0.0*