# Guest App User Stories
## Customer-Facing Loyalty Platform

---

## Epic 5: Guest Account Management

### US-018: Create Guest Account
**As a** customer
**I want to** create a Guest account
**So that** I can earn points and rewards at my favorite venues

#### Acceptance Criteria
```gherkin
Given I download the Guest app
When I tap "Sign Up"
And I enter my email "sarah@email.com" and create a password
And I verify my email via the confirmation link
Then my Guest account should be created
And I should receive 100 welcome bonus points
And I should see the onboarding tutorial

Given I try to sign up with an email that already exists
When I enter "existing@email.com"
Then I should see "Account already exists. Log in instead?"
And I should have the option to reset my password
```

#### Test Cases
- ✅ Successful account creation
- ✅ Email verification required
- ✅ Duplicate email prevention
- ✅ Welcome points awarded
- ✅ Password strength validation
- ✅ Terms of service acceptance
- ✅ Age verification (21+)

**Priority**: P1 (High)
**Effort**: Medium
**Dependencies**: Authentication system

---

### US-019: Complete Profile Setup
**As a** Guest member
**I want to** complete my profile with preferences
**So that** venues can personalize my experience

#### Acceptance Criteria
```gherkin
Given I have a new Guest account
When I complete the profile setup wizard
And I add my date of birth, phone number
And I select my favorite spirit categories
And I note my dietary restrictions
Then my profile should be saved
And venues should see my preferences when I check in
And I should receive 50 bonus points for completing my profile

Given I skip optional profile fields
When I tap "Complete Later"
Then I should still have access to the app
And I should be reminded to complete my profile later
```

#### Test Cases
- ✅ Full profile completion
- ✅ Partial profile (skip optional)
- ✅ Date of birth validation (21+)
- ✅ Phone number format validation
- ✅ Dietary restriction selection
- ✅ Spirit preference tagging
- ✅ Profile completion bonus awarded

**Priority**: P1 (High)
**Effort**: Medium

---

## Epic 6: Points & Rewards

### US-020: Earn Points on Purchases
**As a** Guest member
**I want to** automatically earn points on my purchases
**So that** I can accumulate rewards

#### Acceptance Criteria
```gherkin
Given I am a Guest member with 500 points
And I check in at a venue via QR code
When I complete a $50 purchase
Then I should earn 50 points (1 point per $1)
And my new balance should show 550 points
And I should see a push notification "You earned 50 points!"
And points should appear in my account within 24 hours

Given I am a Special Guest member
When I make the same $50 purchase
Then I should earn 100 points (2x multiplier)
And the notification should say "You earned 100 points (2x Special Guest bonus)!"
```

#### Test Cases
- ✅ Standard points calculation (1 point per $1)
- ✅ Special Guest multiplier (2x)
- ✅ Minimum purchase threshold ($10)
- ✅ Points awarded within 24 hours
- ✅ Push notification sent
- ✅ Points visible in app
- ✅ Points history tracking
- ✅ Check-in bonus (5 points)

**Priority**: P0 (Critical)
**Effort**: Medium
**Dependencies**: POS integration, check-in system

---

### US-021: Redeem Points for Rewards
**As a** Guest member
**I want to** redeem my points for rewards
**So that** I can get discounts and free items

#### Acceptance Criteria
```gherkin
Given I have 1,000 points
When I view the rewards catalog
Then I should see available rewards:
  - $5 off (500 points)
  - $10 off (900 points)
  - Free appetizer (750 points)
  - Free cocktail (1,000 points)

When I select "Free cocktail" and tap "Redeem"
Then a QR code should be generated
And my points should decrease to 0
And the reward should be marked as "Active - Valid for 30 days"

Given I present the QR code at the venue
When the server scans it
Then the reward should be applied to my order
And the QR code should be marked as "Used"
And I should not be able to use it again
```

#### Test Cases
- ✅ View available rewards
- ✅ Redemption QR code generation
- ✅ Points deduction on redemption
- ✅ Reward expiration (30 days)
- ✅ POS scan validation
- ✅ One-time use enforcement
- ✅ Insufficient points handling
- ✅ Redemption history

**Priority**: P0 (Critical)
**Effort**: High
**Dependencies**: Points system, QR code generation, POS scanning

---

### US-022: Track Points Expiration
**As a** Guest member
**I want to** see when my points will expire
**So that** I can use them before they're lost

#### Acceptance Criteria
```gherkin
Given I have 500 points earned 11 months ago
And 200 points earned last week
When I view my points balance
Then I should see:
  - Total Points: 700
  - Expiring Soon: 500 points (expires in 30 days)

When points are 7 days from expiring
Then I should receive a push notification
And an email reminder
Saying "500 points expiring soon! Use them by [date]"

Given my points expire
When the expiration date passes
Then expired points should be removed from my balance
And I should see "500 points expired" in my history
```

#### Test Cases
- ✅ Points expiration display
- ✅ 12-month expiration rule
- ✅ 7-day warning notification
- ✅ Auto-deduction on expiration
- ✅ Expiration history log
- ✅ Email reminder sent

**Priority**: P2 (Medium)
**Effort**: Low

---

## Epic 7: Reservations

### US-023: Make Restaurant Reservation
**As a** Guest member
**I want to** reserve a table via the app
**So that** I don't have to call the restaurant

#### Acceptance Criteria
```gherkin
Given I am browsing a venue in the app
When I tap "Reserve Table"
And I select date (within 14 days for Guest)
And I select time and party size
And I add any special requests
Then my reservation should be confirmed
And I should receive a confirmation email
And a calendar event should be added to my phone
And I should receive reminders (24hr and 1hr before)

Given I am a Special Guest member
When I make a reservation
Then I should be able to book up to 30 days in advance
And I should see "Priority Reservation" badge
And I should have flexible cancellation (up to 1 hour before)
```

#### Test Cases
- ✅ Date selection (Guest: 14 days, Special Guest: 30 days)
- ✅ Time slot availability check
- ✅ Party size limits
- ✅ Special requests field
- ✅ Confirmation email sent
- ✅ Calendar integration
- ✅ 24-hour reminder
- ✅ 1-hour reminder
- ✅ Priority badge for Special Guests

**Priority**: P1 (High)
**Effort**: High
**Dependencies**: Venue availability API

---

### US-024: Modify or Cancel Reservation
**As a** Guest member
**I want to** modify or cancel my reservation
**So that** I can adjust my plans if needed

#### Acceptance Criteria
```gherkin
Given I have a reservation for Friday at 7pm
When I tap "Modify Reservation"
And I change the time to 8pm
Then the reservation should update
And I should receive a new confirmation
And the venue should be notified

Given I want to cancel
When I tap "Cancel Reservation" more than 24 hours before
Then the reservation should be cancelled with no penalty
And I should receive a cancellation confirmation

Given I cancel within 24 hours as a Guest member
Then I should see a warning about no-show penalties
And a $25 cancellation fee may apply

Given I am a Special Guest member
When I cancel within 1 hour
Then no penalty should apply (flexible cancellation)
```

#### Test Cases
- ✅ Modify date/time/party size
- ✅ Cancel with >24hr notice (no penalty)
- ✅ Cancel with <24hr notice (penalty warning)
- ✅ Special Guest flexible cancellation
- ✅ Venue notification on changes
- ✅ Confirmation emails for changes
- ✅ No-show tracking

**Priority**: P1 (High)
**Effort**: Medium

---

## Epic 8: Special Guest Premium

### US-025: Subscribe to Special Guest
**As a** Guest member
**I want to** upgrade to Special Guest premium
**So that** I can get exclusive benefits

#### Acceptance Criteria
```gherkin
Given I am a Guest member
When I navigate to "Upgrade to Special Guest"
Then I should see the benefits list:
  - First access to allocated spirits
  - Priority reservations (30 days vs 14)
  - Extended happy hour all day
  - 2x points multiplier
  - Exclusive events
  - Monthly free appetizer

When I see pricing options:
  - Monthly: $19.99/month
  - Annual: $199/year (save $40)
  - Lifetime: $999 (limited)

When I select "Monthly" and complete Stripe checkout
Then my account should upgrade to Special Guest
And I should receive a welcome email
And my benefits should activate immediately
And I should see a "⭐ Special Guest" badge in my profile
```

#### Test Cases
- ✅ View upgrade page with benefits
- ✅ See pricing options
- ✅ Complete Stripe subscription
- ✅ Account tier upgrade
- ✅ Welcome email sent
- ✅ Benefits immediately active
- ✅ Profile badge displayed
- ✅ Apple Pay / Google Pay support

**Priority**: P0 (Critical - Revenue)
**Effort**: High
**Dependencies**: Stripe subscription integration

---

### US-026: Access Allocated Spirits
**As a** Special Guest member
**I want to** reserve allocated/rare spirits before the public
**So that** I can secure bottles that would otherwise sell out

#### Acceptance Criteria
```gherkin
Given a new bourbon allocation arrives at a venue
When the venue adds it to the allocation system
Then I should receive a push notification
And an email 24 hours before public release

When I view the allocation:
  - Pappy Van Winkle 23 Year
  - Price: $499 per bottle
  - Quantity available: 3
  - Your window: 24 hours (Special Guest only)
  - Public release: In 24 hours

When I tap "Reserve Bottle"
Then my reservation should be confirmed
And I should receive pickup instructions
And the bottle should be held for 7 days
And my payment method should be authorized (not charged)

Given I don't pick up within 7 days
Then my reservation should be cancelled
And the bottle should go to the wait list
And I should be notified
```

#### Test Cases
- ✅ Early notification (24hr before public)
- ✅ View allocation details
- ✅ Reserve bottle (1 per release per member)
- ✅ Pickup window (7 days)
- ✅ Payment authorization (not charge)
- ✅ Pickup confirmation
- ✅ Automatic cancellation after 7 days
- ✅ Wait list if unavailable
- ✅ Purchase history tracking

**Priority**: P0 (Critical - Key Feature)
**Effort**: High
**Dependencies**: Allocation management system, payment authorization

---

### US-027: Enjoy Extended Happy Hour
**As a** Special Guest member
**I want to** get happy hour prices all day
**So that** I save money on every visit

#### Acceptance Criteria
```gherkin
Given I am a Special Guest member
And happy hour pricing is normally 4-6pm
When I check in at any time (e.g., 8pm)
And I order a cocktail normally $15 (happy hour $12)
Then the system should automatically apply the $12 price
And my receipt should show "Special Guest Extended HH: -$3"
And this should apply to me + up to 3 guests at my table

Given I am not a Special Guest
When I order the same cocktail at 8pm
Then I should pay the regular $15 price
```

#### Test Cases
- ✅ Auto-apply happy hour pricing
- ✅ Works all day (not just 4-6pm)
- ✅ Applies to Special Guest + 3 guests
- ✅ Receipt shows discount
- ✅ Works on all happy hour items
- ✅ Cannot combine with other discounts
- ✅ Proper price calculation in POS

**Priority**: P0 (Critical - Key Benefit)
**Effort**: Medium
**Dependencies**: POS pricing engine, check-in system

---

## Epic 9: Social & Gamification

### US-028: Earn Achievement Badges
**As a** Guest member
**I want to** earn badges for accomplishments
**So that** I can show my loyalty and engagement

#### Acceptance Criteria
```gherkin
Given I complete my first visit
Then I should earn the "🏆 First Timer" badge
And I should receive 25 bonus points
And I should see an animation celebrating the achievement

Given I complete 10 visits
Then I should earn "🔥 Regular" badge
And unlock a special reward (free appetizer)

Given I try 25 different cocktails
Then I should earn "🍸 Cocktail Connoisseur" badge
And receive 100 bonus points

When I view my profile
Then I should see all earned badges
And badges should display in my public profile
And I should be able to share achievements to social media
```

#### Test Cases
- ✅ Badge earning triggers
- ✅ Badge display in profile
- ✅ Bonus points awarded
- ✅ Achievement animations
- ✅ Social sharing
- ✅ Badge progress tracking
- ✅ Multiple badge categories

**Priority**: P2 (Medium)
**Effort**: Medium

---

### US-029: View Leaderboards
**As a** Guest member
**I want to** see how I rank against other members
**So that** I can compete and stay engaged

#### Acceptance Criteria
```gherkin
Given I am viewing the app
When I navigate to "Leaderboards"
Then I should see multiple leaderboards:
  - Top Point Earners (Monthly)
  - Most Visits (Yearly)
  - Venue Champions (per venue)

When I view "Top Point Earners"
Then I should see:
  1. Sarah T. - 5,240 points 👑
  2. Mike R. - 4,890 points
  3. Jessica L. - 4,500 points
  ...
  42. Me - 1,250 points

When I tap on a venue
Then I should see my rank at that specific venue
And I should see my position: "You're #12 at The Bourbon Room"

Given I opt-out of leaderboards
When I toggle "Private Profile"
Then my name should not appear on public leaderboards
But I should still see my private rank
```

#### Test Cases
- ✅ Multiple leaderboard types
- ✅ Monthly/yearly periods
- ✅ Venue-specific rankings
- ✅ User position highlighted
- ✅ Privacy toggle
- ✅ Private rank view
- ✅ Top 3 highlighted
- ✅ Real-time updates

**Priority**: P3 (Low)
**Effort**: Medium

---

### US-030: Refer Friends
**As a** Guest member
**I want to** refer friends to join Guest
**So that** we both earn bonus points

#### Acceptance Criteria
```gherkin
Given I want to refer a friend
When I tap "Refer Friend"
Then I should see my unique referral code: "SARAH2024"
And a shareable link
And options to share via text, email, or social media

When my friend Sarah signs up with my code
Then she should receive 200 bonus points
And I should receive 100 bonus points
And we should both get a notification
And I should see her in my "Referred Friends" list

Given I refer 10 friends who all sign up
Then I should earn the "🤝 Social Butterfly" badge
And receive 1,000 bonus points
And a special reward
```

#### Test Cases
- ✅ Unique referral code generation
- ✅ Shareable link creation
- ✅ Multi-channel sharing
- ✅ New user code entry
- ✅ Bonus points to both parties
- ✅ Referral tracking
- ✅ Referral badge unlocks
- ✅ Fraud prevention (same device check)

**Priority**: P2 (Medium - Growth)
**Effort**: Medium

---

## Epic 10: Guest Check-In & Recognition

### US-031: Check-In at Venue
**As a** Guest member
**I want to** check in when I arrive at a venue
**So that** the staff knows I'm a member and I earn bonus points

#### Acceptance Criteria
```gherkin
Given I arrive at The Bourbon Room
When I open the Guest app
And I tap "Check In"
And I scan the venue's QR code (or use NFC tap)
Then I should see "Checked in at The Bourbon Room ✓"
And I should earn 5 bonus check-in points
And the POS should display my profile to staff

When staff views the POS
Then they should see:
  - My name and photo
  - My tier (Guest or Special Guest ⭐)
  - My preferences (bourbon, booth seating)
  - My last visit (3 days ago)
  - Active rewards
  - Dietary restrictions ⚠️

Given I have an active reward
When I check in
Then the staff should see a prominent banner
"🎁 Sarah has a Free Appetizer reward available"
```

#### Test Cases
- ✅ QR code check-in
- ✅ NFC tap check-in
- ✅ Geofence auto check-in (if enabled)
- ✅ Bonus points awarded
- ✅ POS customer profile display
- ✅ Preferences visible to staff
- ✅ Active rewards highlighted
- ✅ Dietary restrictions warning

**Priority**: P0 (Critical)
**Effort**: High
**Dependencies**: QR/NFC, geofencing, POS integration

---

## Epic 11: Industry Love Competition

### US-032: Register Industry Affiliation
**As an** industry employee (bartender, server, manager, etc.)
**I want to** attach my workplace to my Guest account
**So that** I can represent my venue in the Industry Love competition

#### Acceptance Criteria
```gherkin
Given I work in the hospitality industry
When I navigate to Profile → "Industry Perks"
And I toggle "I work in hospitality"
Then I should see a form to enter workplace details

When I enter workplace information:
  - Venue name: "The Oak Barrel"
  - Address: "123 Main St, Austin, TX"
  - Position: "Bartender"
  - Employment verification: [Upload paystub/business card/LinkedIn]
And I submit for review
Then I should receive confirmation "Under review"
And I should be notified within 24-48 hours

Given my affiliation is verified
When I view my profile
Then I should see "🍺 Representing The Oak Barrel" badge
And my workplace should appear on Industry Love leaderboards
And my visits should count toward my team's score

Given I want to change my affiliation
When I try to update before 3 months
Then I should see "You can change affiliation once every 3 months"
And I should see my next eligible change date
```

#### Test Cases
- ✅ Industry affiliation form submission
- ✅ Document upload (paystub, business card, LinkedIn)
- ✅ Verification pending status
- ✅ Verification approval notification
- ✅ Badge display on profile
- ✅ 3-month change restriction
- ✅ Verification rejection handling
- ✅ Re-submit after rejection

**Priority**: P1 (High)
**Effort**: Large
**Dependencies**: Guest profile system, document upload, admin verification system

---

### US-033: Track Team Performance
**As an** industry employee
**I want to** see how my workplace ranks in the Industry Love competition
**So that** I can encourage coworkers to visit and help us win

#### Acceptance Criteria
```gherkin
Given I have a verified industry affiliation
When I check in at a HOST venue
Then my visit should count as 1 point for my team
And I should see "✅ Visit counted for The Oak Barrel!"
And I should see updated team standings

When I navigate to "Industry Love" tab
Then I should see the current competition leaderboard:
  - Competing venue names
  - Total visits per team
  - Current rankings (🥇🥈🥉)
  - Days remaining in month
  - Prize details for each placement

And I should see my team's stats:
  - Current rank (#2 of 6)
  - Total team visits (19)
  - Points behind leader (4 visits)
  - My personal contribution (4 visits)
  - Team member breakdown

When my team's rank changes
Then I should receive push notification:
  "Your team moved up to #2! Keep visiting to take #1!"

When the month ends and my team wins
Then I should receive notification:
  "🎉 Victory! The Oak Barrel WON October's Industry Love!"
And I should see reward details
And I should be able to share achievement on social media
```

#### Test Cases
- ✅ Visit tracking for industry staff
- ✅ Real-time leaderboard updates
- ✅ Personal contribution tracking
- ✅ Team member breakdown
- ✅ Rank change notifications
- ✅ Winner announcement
- ✅ Prize detail display
- ✅ Social sharing of victory
- ✅ Multiple venues/multiple competitions

**Priority**: P1 (High)
**Effort**: Medium
**Dependencies**: Check-in system, leaderboard engine, push notifications

---

### US-034: Claim Winner Rewards
**As an** industry employee from the winning venue
**I want to** automatically receive rewards when checking in
**So that** I can enjoy the benefits my team earned

#### Acceptance Criteria
```gherkin
Given my team won last month's Industry Love competition
And the prize was "20% off all tabs in November"
When I check in at the HOST venue in November
Then I should see "🏆 Industry Winner (Nov 2025)" on my digital card
And my reward should be active

When I place an order
Then the 20% discount should auto-apply at checkout
And the receipt should show:
  "Industry Love Winner Discount: -$8.40 (20%)"

When staff views my profile at POS
Then they should see:
  "💳 Active: Nov Winner Discount (20%)"
  "Used: 2 times this month"

Given the reward type is "Free Appetizer"
When I order an appetizer
Then I should see eligible items highlighted
And the discount should apply (up to max value)
And usage should be tracked (1 per visit)

When I view my profile
Then I should see active rewards section
And I should see reward expiration date
And I should see usage count
And I should be able to view reward terms

Given it's the last day of reward validity
When I receive notification "Reward expires tonight!"
Then I should be reminded to use my benefits
```

#### Test Cases
- ✅ Auto-apply percentage discount
- ✅ Auto-apply complimentary items
- ✅ Priority reservation access
- ✅ Special Guest trial activation
- ✅ POS display of active rewards
- ✅ Receipt shows discount details
- ✅ Usage tracking per visit
- ✅ Expiration notifications
- ✅ Reward terms display
- ✅ Multiple reward types
- ✅ Stackability with Guest rewards

**Priority**: P2 (Medium)
**Effort**: Medium
**Dependencies**: POS reward engine, discount application, usage tracking

---

## Priority Summary

### P0 (Critical - Must Have)
- US-020: Earn Points on Purchases
- US-021: Redeem Points for Rewards
- US-025: Subscribe to Special Guest
- US-026: Access Allocated Spirits
- US-027: Extended Happy Hour
- US-031: Check-In at Venue

### P1 (High - Important)
- US-018: Create Guest Account
- US-019: Complete Profile Setup
- US-023: Make Reservation
- US-024: Modify/Cancel Reservation
- US-032: Register Industry Affiliation
- US-033: Track Team Performance

### P2 (Medium - Nice to Have)
- US-022: Track Points Expiration
- US-028: Achievement Badges
- US-030: Refer Friends
- US-034: Claim Winner Rewards

### P3 (Low - Future)
- US-029: Leaderboards

---

## Technical Dependencies

### Phase 1 (v0.2 - Basic Guest App)
- Mobile app development (React Native)
- Authentication system (Auth0/Firebase)
- Points calculation engine
- QR code generation & scanning
- Push notifications
- POS integration API

### Phase 2 (v0.3 - Special Guest Premium)
- Stripe subscription integration
- Allocation management system
- Payment authorization (hold, not charge)
- Priority reservation system
- Dynamic pricing engine
- Benefits activation logic

### Phase 3 (v0.3 - Industry Love Competition)
- Industry affiliation verification system
- Document upload and review workflow
- Team-based competition engine
- Visit tracking for industry staff
- Leaderboard calculation and display
- Reward application engine
- Monthly automated competition cycles
- Winner notification system

### Phase 4 (v0.4 - Advanced Features)
- Geofencing (BLE beacons)
- Advanced social features (friends, sharing)
- Enhanced gamification engine
- Global leaderboard system
- Advanced analytics dashboard

---

*Last Updated: 2025-09-29*
*Version: 1.1.0*
*Total Guest User Stories: 17 (US-018 through US-034)*