# Guest Rewards & Membership System
## Customer-Facing Loyalty Platform

---

## Overview

**Guest** is the customer-facing companion app to HOST POS, providing a tiered membership system that rewards loyalty and creates VIP experiences. The system tracks customer visits, spending, and preferences while offering exclusive benefits through a premium **Special Guest** subscription tier.

---

## System Architecture

### Two-Tier Membership Model

```
┌─────────────────────────────────────────────────────────────┐
│                         GUEST TIER                          │
│                      (Free Forever)                         │
├─────────────────────────────────────────────────────────────┤
│ ✓ Points earning on every visit                            │
│ ✓ Digital loyalty card                                      │
│ ✓ Order history tracking                                    │
│ ✓ Favorite items & preferences                              │
│ ✓ Standard reservations                                     │
│ ✓ Birthday rewards                                          │
│ ✓ Email receipts                                            │
│ ✓ Basic notifications                                       │
└─────────────────────────────────────────────────────────────┘
                            ⬇️ Upgrade
┌─────────────────────────────────────────────────────────────┐
│                    SPECIAL GUEST TIER                       │
│                  (Premium Subscription)                     │
├─────────────────────────────────────────────────────────────┤
│ ✨ All Guest features, PLUS:                               │
│ ✓ First allocation on rare/allocated spirits               │
│ ✓ Priority reservation access                              │
│ ✓ Extended happy hour pricing                              │
│ ✓ Exclusive menu previews                                  │
│ ✓ Private event invitations                                │
│ ✓ Complimentary tastings (quarterly)                       │
│ ✓ Free appetizer monthly                                   │
│ ✓ Premium support (text/call venue directly)               │
│ ✓ Points multiplier (2x standard rate)                     │
│ ✓ Early access to new cocktails                            │
│ ✓ VIP parking (where available)                            │
│ ✓ Guest +1 for events                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Features

### 1. Account Creation & Management

#### Sign-Up Flow
```
Download App → Email/Phone Verification → Profile Setup →
Welcome Points → First Visit Prompt
```

**Profile Information:**
- Full name
- Email address
- Phone number (SMS opt-in)
- Date of birth
- Profile photo (optional)
- Dietary preferences/restrictions
- Favorite spirits categories
- Preferred seating (bar, booth, patio)

**Privacy Controls:**
- Public/private profile toggle
- Location sharing preferences
- Notification preferences
- Data export/deletion options

### 2. Points & Rewards System

#### Earning Points

| Action | Guest Points | Special Guest Points |
|--------|-------------|---------------------|
| $1 spent | 1 point | 2 points |
| Check-in | 5 points | 10 points |
| Review/rating | 25 points | 50 points |
| Referral (both parties) | 100 points | 200 points |
| Birthday month | 50 bonus | 100 bonus |
| App order | +5% points | +10% points |

#### Redeeming Points

| Reward | Points Required | Availability |
|--------|----------------|--------------|
| $5 off | 500 points | Guest |
| $10 off | 900 points | Guest |
| Free appetizer | 750 points | Guest |
| Free cocktail | 1000 points | Guest |
| Bottle allocation access | 2000 points | Special Guest only |
| Private tasting for 2 | 3000 points | Special Guest only |

**Points Rules:**
- Points expire after 12 months of inactivity
- Cannot combine points with other offers (unless specified)
- Minimum transaction $10 to earn points
- Points awarded within 24 hours of visit
- Points visible in real-time in app

### 3. Special Guest Premium Features

#### Pricing Structure
```
Monthly: $19.99/month
Annual: $199/year (save $40)
Lifetime: $999 (limited availability)
```

**Value Proposition:**
- Break-even at ~2 visits/month
- Average savings: $30-50/month for regular visitors
- Exclusive access priceless for spirit enthusiasts

#### Premium Benefits Breakdown

**🥃 Allocated Spirits Access**
```
System Flow:
1. New allocation arrives (e.g., Pappy Van Winkle)
2. Special Guests notified 24 hours before public
3. Reserve via app (limit 1 bottle per release)
4. Pick up window: 7 days
5. If unclaimed, opens to wait list
```

**Tracked Allocations:**
- Limited bourbon releases
- Rare scotch
- Vintage wines
- Limited cocktail ingredients
- Special barrel picks
- Private label releases

**📅 Priority Reservations**
- Book 30 days out (vs 14 days for Guest)
- First access to prime time slots
- Guaranteed seating for parties up to 6
- Last-minute priority (within 24 hours)
- Flexible modification/cancellation
- Preferred table assignment

**⏰ Extended Happy Hour**
- Happy hour prices all day, every day
- Includes food and drink specials
- Valid for Special Guest + up to 3 guests at table
- Cannot be combined with other table discounts
- Automatically applied at checkout

**🎉 Exclusive Experiences**
- Private barrel tastings (quarterly)
- Chef's table dinners (bi-annually)
- Behind-the-bar experience
- Menu development preview sessions
- Meet the distiller/winemaker events
- Special Guest-only parties

### 4. Mobile App Features

#### Home Screen
```
┌──────────────────────────────────┐
│  Welcome back, Sarah! ⭐          │
│                                  │
│  Points: 2,450 (245 until $10)  │
│  [Progress Bar ████████░░] 90%  │
│                                  │
│  🎁 Birthday reward unlocked!    │
│                                  │
│  Nearby:                         │
│  📍 The Bourbon Room - 0.2mi     │
│     Last visit: 3 days ago       │
│     [Reserve Now] [View Menu]    │
│                                  │
│  Recent Orders:                  │
│  🍸 Old Fashioned                │
│  🍔 Bacon Burger                 │
│     [Reorder]                    │
└──────────────────────────────────┘
```

#### Key Screens
1. **Home** - Points, nearby venues, recent orders
2. **Discover** - Browse venues, menus, events
3. **Rewards** - Available rewards, redemption history
4. **Reservations** - Book tables, manage bookings
5. **Profile** - Settings, membership, preferences
6. **Allocations** (Special Guest) - Available spirits, reservation status
7. **Events** (Special Guest) - Exclusive event calendar

#### Features by Screen

**Discover:**
- Venue search with filters
- Digital menus with photos
- Real-time table availability
- Event calendar
- Special offers/promotions
- New item alerts

**Reservations:**
- Date/time/party size selection
- Table preference requests
- Special occasion notes
- Automatic reminders (24hr, 1hr before)
- Easy modification/cancellation
- No-show penalty tracking

**Rewards:**
- Available rewards grid
- Redemption QR code
- Points history
- Referral tracking
- Tier progress visualization

**Allocations (Special Guest Only):**
- Available bottles with photos
- Tasting notes
- Price and availability
- One-tap reservation
- Wait list option
- Release calendar

### 5. Venue Integration (POS Side)

#### Staff View Enhancements

**Customer Recognition:**
```
When Guest checks in (QR scan, NFC, or geofence):

┌─────────────────────────────────┐
│ 👤 Sarah Thompson               │
│ ⭐ Special Guest (6 months)     │
│                                 │
│ Last Visit: 3 days ago          │
│ Lifetime Spend: $2,450          │
│ Avg Check: $45                  │
│                                 │
│ Preferences:                    │
│ • Bourbon (Old Fashioneds)      │
│ • Booth seating preferred       │
│ • Allergic to shellfish ⚠️      │
│                                 │
│ Active Rewards:                 │
│ 🎁 Birthday month - Free app    │
│ 💳 Extended happy hour active   │
│                                 │
│ Quick Actions:                  │
│ [Order Usual] [View History]    │
└─────────────────────────────────┘
```

**POS Integrations:**
- Automatic points calculation
- Reward redemption at checkout
- Special Guest discount auto-apply
- Visit tracking
- Check-in confirmation
- Digital receipt to app

#### Manager Dashboard Additions

**Guest Insights:**
- Total active members
- Guest vs Special Guest conversion rate
- Redemption analytics
- Visit frequency by tier
- Revenue attribution
- Churn risk scoring
- Membership growth trends

**Allocation Management:**
- Incoming allocation tracking
- Special Guest notification queue
- Reservation management
- Fulfillment tracking
- Wait list management

### 6. Gamification Elements

#### Achievement Badges
```
🏆 First Timer - First visit
🔥 Regular - 10 visits
⭐ VIP - 50 visits
👑 Legend - 100 visits
🍸 Cocktail Connoisseur - Try 25 cocktails
🍔 Food Explorer - Try 50 menu items
💎 High Roller - Single check >$200
🎂 Birthday Regular - 3 birthday celebrations
🤝 Social Butterfly - Refer 10 friends
📅 Streak Master - 7 consecutive weeks
🍺 Industry Champion - Win Industry Love competition (industry staff only)
🥇 Industry MVP - Most visits in winning month (industry staff only)
```

#### Leaderboards
- Top point earners (monthly)
- Most visits (yearly)
- Venue-specific rankings
- Private friend competitions
- **Industry Love leaderboard** (team-based, industry staff only)

#### Challenges
```
Example: "Bourbon Journey"
- Try 10 different bourbons
- Reward: 500 bonus points + exclusive bottle access
- Duration: 90 days
```

#### Industry Love Competition (Industry Staff Only)
**NEW: Monthly team-based competition for hospitality workers**

A unique gamification feature where hospitality staff from neighboring venues compete to show the most "love" to HOST venues through visits (not spending).

**How It Works:**
- Industry staff register their workplace affiliation
- Each visit counts as 1 point for their team
- Monthly leaderboard tracks competing venues
- Winning team receives rewards for all staff

**Example Competition:**
```
October 2025 - The Bourbon Room

🥇 The Oak Barrel (23 visits) - Winner: 20% off all tabs in November
🥈 Bourbon & Rye (19 visits) - Runner-up: Free appetizer per visit
🥉 Craft & Draft (15 visits) - Third place: Priority reservations
```

**Key Features:**
- Visit-based scoring (fair for all income levels)
- Team competition (builds camaraderie)
- Monthly cycles with automatic reset
- Rewards for winning venue's entire staff
- Geographic radius (venues within 5 miles)

**Reward Types:**
- Percentage discounts (10-25% off tabs)
- Complimentary items (free appetizers, drinks)
- Priority access (skip waitlist, advanced booking)
- Special Guest trial (1 month free premium)

**Benefits:**
- Community building among hospitality professionals
- Viral growth through authentic advocacy
- Consistent traffic from industry workers
- Off-peak hour optimization (60% of visits)
- Natural brand ambassadors

📖 **Full Specification:** See [industry-love-competition.md](./industry-love-competition.md)

### 7. Communication Channels

#### Push Notifications
- Points earned confirmation
- Reward unlocked alerts
- Special Guest allocation notifications
- Reservation reminders
- Birthday month message
- Exclusive offers
- Event invitations

#### SMS (Opt-in)
- Reservation confirmations
- Last-minute table availability
- Urgent allocation alerts
- Special Guest-only flash sales

#### Email
- Monthly points summary
- Tier progress updates
- Allocation calendar (Special Guest)
- Event invitations
- Venue newsletters
- Personalized recommendations

### 8. Social Features

#### Friend System
- Connect with other Guests
- Share favorite venues
- Group reservations
- Split rewards
- Gift points
- Challenge friends

#### Reviews & Ratings
- Rate visit experience
- Review menu items
- Upload photos
- Earn points for reviews
- Verified reviewer badge

#### Social Sharing
- Share achievements
- Post check-ins
- Recommend venues
- Tag friends in visits

---

## Technical Implementation

### Data Model

```typescript
// Guest Profile
interface GuestProfile {
  id: string;
  email: string;
  phone: string;
  name: {
    first: string;
    last: string;
  };
  dateOfBirth: Date;
  memberSince: Date;
  tier: 'guest' | 'special_guest';
  specialGuestExpiry?: Date;

  // Points & Rewards
  pointsBalance: number;
  pointsLifetime: number;
  pointsExpiring: {
    points: number;
    expiryDate: Date;
  }[];

  // Preferences
  preferences: {
    dietary: string[];
    favoriteSpirits: string[];
    seatingPreference: string;
    communicationPreferences: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };

  // Venue-specific data
  venueData: {
    [venueId: string]: {
      visitCount: number;
      lastVisit: Date;
      favoriteItems: string[];
      averageCheck: number;
      lifetimeSpend: number;
    };
  };

  // Gamification
  badges: string[];
  level: number;
  streakDays: number;

  // Industry Affiliation (for Industry Love competition)
  industryAffiliation?: {
    venueName: string;
    venueAddress: string;
    venueType: 'bar' | 'restaurant' | 'hotel' | 'other';
    position: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    verificationMethod: 'paystub' | 'business_card' | 'linkedin' | 'manual';
    verifiedAt?: Date;
    affiliatedSince: Date;
    lastAffiliationChange?: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

// Special Guest Subscription
interface SpecialGuestSubscription {
  id: string;
  guestId: string;
  plan: 'monthly' | 'annual' | 'lifetime';
  status: 'active' | 'cancelled' | 'expired';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;

  benefits: {
    allocationAccess: boolean;
    priorityReservations: boolean;
    extendedHappyHour: boolean;
    pointsMultiplier: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

// Allocation
interface Allocation {
  id: string;
  venueId: string;
  productName: string;
  productType: 'bourbon' | 'scotch' | 'wine' | 'other';
  description: string;
  images: string[];
  quantityAvailable: number;
  pricePerBottle: number;

  // Release timing
  specialGuestReleaseDate: Date;
  publicReleaseDate: Date;
  pickupDeadline: Date;

  // Reservations
  reservations: {
    guestId: string;
    reservedAt: Date;
    status: 'reserved' | 'picked_up' | 'cancelled';
  }[];

  waitList: {
    guestId: string;
    addedAt: Date;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

// Points Transaction
interface PointsTransaction {
  id: string;
  guestId: string;
  venueId: string;
  orderId?: string;

  type: 'earn' | 'redeem' | 'expire' | 'adjust';
  points: number;
  reason: string;

  // For earning
  purchaseAmount?: number;
  multiplier?: number;

  // For redemption
  rewardId?: string;

  expiresAt?: Date;
  createdAt: Date;
}
```

### API Endpoints

```typescript
// Guest Management
POST   /api/guest/register
POST   /api/guest/login
GET    /api/guest/profile
PATCH  /api/guest/profile
DELETE /api/guest/account

// Points & Rewards
GET    /api/guest/points/balance
GET    /api/guest/points/history
POST   /api/guest/points/redeem
GET    /api/guest/rewards/available

// Special Guest
POST   /api/guest/special-guest/subscribe
GET    /api/guest/special-guest/status
POST   /api/guest/special-guest/cancel
GET    /api/guest/special-guest/benefits

// Allocations
GET    /api/allocations/available
POST   /api/allocations/:id/reserve
DELETE /api/allocations/:id/cancel
POST   /api/allocations/:id/waitlist

// Reservations
POST   /api/reservations/create
GET    /api/reservations/list
PATCH  /api/reservations/:id
DELETE /api/reservations/:id

// Social
GET    /api/guest/friends
POST   /api/guest/friends/add
POST   /api/reviews/create
GET    /api/reviews/list

// Industry Love Competition
POST   /api/guest/industry/register-affiliation
GET    /api/guest/industry/affiliation-status
PATCH  /api/guest/industry/update-affiliation
GET    /api/guest/industry/competition/current/:venueId
GET    /api/guest/industry/my-team-stats
GET    /api/guest/industry/my-competitions
POST   /api/venue/:venueId/industry-competition/create
GET    /api/venue/:venueId/industry-competition/leaderboard
```

### Mobile Tech Stack

**Framework:**
- React Native (iOS + Android from single codebase)
- TypeScript for type safety
- Expo for rapid development

**State Management:**
- Redux Toolkit or Zustand

**Authentication:**
- Auth0 or Firebase Auth
- Biometric login support
- JWT tokens

**Payments:**
- Stripe SDK for subscriptions
- Apple Pay / Google Pay

**Push Notifications:**
- Firebase Cloud Messaging
- OneSignal

**Analytics:**
- Mixpanel for user behavior
- Segment for data pipeline

---

## Business Model

### Revenue Projections

**Per-Venue Assumptions:**
- 200 active Guests (free tier)
- 30 Special Guests (15% conversion)
- Special Guest ARPU: $20/month

**Monthly Revenue per Venue:**
- 30 Special Guests × $20 = $600/month
- Annual per venue: $7,200

**With 100 venues:**
- Annual subscription revenue: $720,000
- Plus: Transaction fees, data insights, allocation marketplace

### Value to Venues

**Increased Revenue:**
- 20-30% increase in visit frequency
- 15-25% higher average check (Special Guests)
- Reduced no-show rate (deposits via app)

**Marketing Benefits:**
- Built-in customer database
- Targeted promotion capability
- User-generated content
- Referral engine

**Operational Benefits:**
- Reduced phone reservations
- Automated loyalty tracking
- Customer preference data
- Predictive analytics

---

## Roadmap Integration

### Phase 1 (v0.2 - Months 4-6)
- ✅ Basic Guest app (account, points, rewards)
- ✅ QR code check-in
- ✅ Digital loyalty card
- ✅ Basic reservations
- ✅ Push notifications

### Phase 2 (v0.3 - Months 7-9)
- ✅ Special Guest premium tier launch
- ✅ Allocation management system
- ✅ Priority reservation system
- ✅ Extended happy hour implementation
- ✅ Social features (friends, reviews)
- ✅ Gamification (badges, leaderboards)
- ✅ **Industry Love competition** (industry staff team competitions)

### Phase 3 (v0.4 - Months 10-12)
- ✅ Advanced personalization (AI recommendations)
- ✅ Geofencing and proximity features
- ✅ Group ordering
- ✅ Gift card integration
- ✅ Marketplace for allocations (resale/trading)

---

## Success Metrics

### User Acquisition
- **Target**: 10,000 Guests in first year
- **Conversion**: 15% to Special Guest tier
- **Retention**: 80% monthly active user rate

### Engagement
- **Visit Frequency**: 2.5x increase for Special Guests
- **App Open Rate**: 40% weekly active
- **Points Redemption**: 60% redemption within 6 months

### Revenue
- **ARPU**: $20/month per Special Guest
- **LTV**: $500+ for Special Guest (25-month retention)
- **Venue Revenue Lift**: 15-25% from Guest users

---

## Competitive Advantages

1. **Dual-Tier System**: Free + Premium vs. competitors' free-only or paid-only
2. **Allocation Access**: Unique to spirits-focused venues
3. **Real-Time Integration**: Seamless POS connection
4. **Venue-Agnostic**: Works across multiple independent venues
5. **Premium Experience**: Special Guest perks rival high-end credit cards

---

*Last Updated: 2025-09-29*
*Version: 1.0.0*
*Status: Specification Complete - Ready for Development*