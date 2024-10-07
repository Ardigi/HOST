# HOST MVP Definition v0.1
## Minimum Viable Product Specification

---

## Executive Summary
HOST v0.1 focuses on delivering a **production-ready, modern POS system** with essential features that solve immediate pain points for single-venue restaurants and bars. This MVP prioritizes reliability, speed, and user experience over advanced AI features.

---

## ✅ INCLUDED in MVP v0.1

### Core POS Functionality
- **Order Management**
  - Table-based ordering workflow
  - Quick bar service mode
  - Order modifications and voids
  - Split checks functionality
  - Item notes and modifiers

- **Payment Processing**
  - Stripe integration (cards, tap-to-pay)
  - Cash handling with change calculation
  - Tip management and distribution
  - Receipt printing/emailing
  - End-of-day reconciliation

- **Menu Management**
  - Hierarchical menu structure (categories/items)
  - Modifier groups and options
  - Pricing tiers (happy hour, etc.)
  - Item availability toggles
  - Quick 86 (out of stock) functionality

### Specialized Features
- **Cocktail Cost Calculator**
  - Ingredient-level costing
  - Pour size tracking (0.25oz increments)
  - Recipe profitability analysis
  - Suggested pricing recommendations
  - Batch recipe scaling

- **Basic Inventory**
  - Manual inventory counts
  - Depletion tracking from recipes
  - Low stock alerts
  - Par level management
  - Simple receiving workflow

### User Experience
- **Modern UI Framework**
  - Micro-interactions on all actions
  - Touch-optimized interface
  - Dark/light mode support
  - Responsive design (tablet/desktop)
  - Visual feedback system

- **Staff Management**
  - Role-based permissions (Admin, Manager, Server, Bartender)
  - Clock in/out functionality
  - Basic shift management
  - Individual staff sales tracking
  - PIN-based authentication

### Reporting & Analytics
- **Essential Reports**
  - Daily sales summary
  - Payment method breakdown
  - Top selling items
  - Staff performance metrics
  - Hourly sales distribution
  - Basic inventory reports

### Technical Foundation
- **Authentication Infrastructure**
  - Keycloak SSO integration
  - PIN-based quick login
  - Session management and token refresh
  - Role-based access control (RBAC)
  - Secure credential storage

- **Performance Requirements**
  - Sub-100ms order processing
  - 99.9% uptime target
  - Offline mode (queue & sync)
  - Real-time data synchronization
  - Automatic backups

---

## ❌ EXPLICITLY EXCLUDED (Post-MVP)

### Customer-Facing Features (v0.2+)
- **Guest Loyalty App** (Customer mobile app)
  - Account creation and profiles
  - Points earning and redemption system
  - Digital loyalty cards
  - Basic reservations via app
  - QR code check-in
  - Push notifications
- **Special Guest Premium Tier** (v0.3+)
  - Subscription-based premium membership
  - Allocated spirits first access
  - Priority reservation system
  - Extended happy hour benefits
  - Exclusive event invitations
  - Points multiplier (2x)
- **Industry Love Competition** (v0.3+)
  - Monthly team-based competition for hospitality workers
  - Industry staff affiliation and verification
  - Visit-based scoring (not spend-based)
  - Team leaderboards and rankings
  - Automatic reward application for winners
  - Viral growth through authentic advocacy

### Advanced Features (v0.2+)
- Geofencing & customer recognition
- AI/LLM integration for predictions
- Natural language processing
- Behavioral analytics
- Predictive inventory ordering

### Enterprise Features (v0.3+)
- Multi-venue management
- Franchise support
- Centralized reporting
- Cross-location inventory transfers
- Corporate hierarchies

### Emerging Technologies (v0.4+)
- Blockchain integration
- Cryptocurrency payments
- Biometric authentication
- IoT device connectivity
- AR/VR menu experiences

### Advanced Integrations (Future)
- Third-party delivery platforms
- Accounting software sync
- Marketing automation tools
- Guest app marketplace (allocation resale/trading)

---

## 🎯 Success Criteria

### Technical Metrics
✓ Process 1,000 orders without critical errors
✓ Average order entry time < 30 seconds
✓ Payment processing < 3 seconds
✓ System response time < 100ms for all actions
✓ 24-hour offline capability with full sync recovery

### Business Metrics
✓ 5 beta venues actively using the system
✓ 95% of transactions processed successfully
✓ < 5% support ticket rate
✓ Staff training time < 2 hours
✓ Daily active usage > 90%

### User Experience Metrics
✓ NPS score > 50 from beta users
✓ Zero navigation dead-ends
✓ All critical paths achievable in ≤ 3 taps
✓ Error recovery possible without manager override
✓ Consistent micro-interaction feedback

---

## MVP Timeline (12 Weeks)
- **Weeks 1-2**: Authentication infrastructure (Keycloak, PostgreSQL, PIN authenticator)
- **Weeks 3-5**: Foundation & core POS functionality
- **Weeks 6-8**: Payments, inventory, and offline mode
- **Weeks 9-10**: Reporting, analytics, and cocktail cost calculator
- **Weeks 11-12**: Polish, testing, and beta deployment

---

## Risk Mitigation
- **Payment Processing**: Stripe-first approach with fallback options
- **Offline Capability**: Local-first architecture with Turso
- **Performance**: Edge computing and optimistic UI updates
- **Training**: Built-in interactive tutorials

---

## Post-MVP Roadmap Preview
- **v0.2** (Month 4-6): **Guest loyalty app (free tier)**, customer recognition, basic AI features
- **v0.3** (Month 7-9): **Special Guest premium tier**, **Industry Love competition**, allocation management, multi-venue, advanced analytics
- **v0.4** (Month 10-12): Platform ecosystem, Guest marketplace, advanced integrations

---

---

## 🎁 Guest Rewards System Overview

The **Guest** customer loyalty system is a key differentiator for HOST, launching in v0.2. It creates a two-tier membership model:

### Guest (Free Tier) - v0.2
- Points earning on all purchases
- Digital loyalty card
- Reward redemption
- Order history and favorites
- Standard reservations
- Email receipts

### Special Guest (Premium Tier) - v0.3
- Monthly subscription ($19.99/month)
- First access to allocated/rare spirits
- Priority reservations (30 days out vs 14 days)
- Extended happy hour pricing all day
- 2x points multiplier
- Exclusive events and tastings
- Complimentary monthly perks

**Business Model:** Subscription revenue + increased venue visits + higher spend per visit

📖 **Full Specification:** See [guest-rewards-system.md](./guest-rewards-system.md)

---

*Last Updated: 2025-09-29*
*Version: 0.2.0-alpha*
*Status: Updated with Guest Loyalty System*