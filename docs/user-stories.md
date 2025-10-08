# HOST User Stories & Acceptance Criteria
## Comprehensive User Stories for Test-Driven Development

---

## Epic 1: Authentication & Access Control

### US-001: Staff Login with Email
**As a** staff member
**I want to** log in using my email and password
**So that** I can access the POS system securely

#### Acceptance Criteria
```gherkin
Given I am on the login page
When I enter valid email "john@restaurant.com" and password
Then I should be redirected to the dashboard
And I should see my name in the navigation bar
And a session token should be stored securely

Given I am on the login page
When I enter invalid credentials
Then I should see an error message "Invalid email or password"
And I should remain on the login page
And the error should be logged for security monitoring
```

#### Test Cases
- ✅ Valid login with correct credentials
- ✅ Invalid login with wrong password
- ✅ Invalid login with non-existent email
- ✅ Session persistence after page refresh
- ✅ Session expiration after timeout
- ✅ Concurrent login prevention
- ✅ Password field masking

---

### US-002: Quick PIN Access
**As a** server
**I want to** quickly access the system with my PIN
**So that** I can take orders without typing my full credentials

#### Acceptance Criteria
```gherkin
Given I am on the quick access screen
When I enter my 4-digit PIN "1234"
Then I should be logged in within 500ms
And I should see my assigned tables
And my shift should be marked as active

Given I enter an incorrect PIN 3 times
Then my PIN access should be temporarily locked for 5 minutes
And a manager should be notified
And I should be prompted to use email/password login
```

#### Test Cases
- ✅ Valid PIN entry
- ✅ Invalid PIN rejection
- ✅ PIN lockout after 3 attempts
- ✅ PIN reset by manager
- ✅ PIN uniqueness per venue
- ✅ PIN change requirement

---

## Epic 2: Order Management

### US-003: Create New Order
**As a** server
**I want to** create a new order for a table
**So that** I can start taking customer orders

#### Acceptance Criteria
```gherkin
Given I am logged in as a server
And table 5 is available
When I select "New Order" for table 5
Then a new order should be created with status "open"
And the table status should change to "occupied"
And I should see the order screen with an empty cart
And the order should be assigned to me

Given table 5 already has an open order
When I try to create a new order
Then I should see a warning "Table 5 has an open order"
And I should have options to "View Order" or "Transfer Table"
```

#### Test Cases
- ✅ Create order for available table
- ✅ Prevent duplicate orders on same table
- ✅ Order number generation (sequential daily)
- ✅ Server assignment tracking
- ✅ Guest count input
- ✅ Order type selection (dine-in, takeout, bar)

---

### US-004: Add Items to Order
**As a** server
**I want to** add menu items to an order
**So that** I can build the customer's order

#### Acceptance Criteria
```gherkin
Given I have an open order
When I select "Cheeseburger" from the menu
Then the item should appear in the order with quantity 1
And the order total should update to reflect the price
And any required modifiers should be prompted

Given I add an item with required modifiers
When the modifier prompt appears
Then I must select at least the minimum required options
And I cannot proceed without selecting required modifiers
And modifier prices should be added to the item total
```

#### Test Cases
- ✅ Add single item
- ✅ Add multiple quantities
- ✅ Add item with optional modifiers
- ✅ Add item with required modifiers
- ✅ Add item with notes
- ✅ Price calculation with modifiers
- ✅ Remove item from order
- ✅ Update item quantity

#### Implementation Status
- ✅ **Phase 1**: Server-side logic (13 server tests)
  - tRPC integration for order detail loading
  - Form actions: addItem, removeItem, updateQuantity
  - Error handling and validation with proper status codes
  - Server load function with menu items and categories
- ✅ **Phase 2**: UI implementation (24 tests total)
  - Order detail page with tab navigation (Details, Menu, Payment)
  - Order summary sidebar with real-time subtotal/tax/total calculations
  - Category filtering for menu item selection
  - 11 component tests with Vitest Browser Mode (Chromium)
  - 13 server-side tests for load function and form actions
- ⏳ **Phase 3**: Real-time updates and calculations
  - Live order total updates on item add/remove
  - Inventory availability checks before adding items
  - Kitchen status synchronization for order items
- ⏳ **Phase 4**: End-to-end tests
  - Complete order flow from creation to item selection
  - Multi-user scenarios with concurrent order updates
  - Error recovery and validation patterns

---

### US-005: Process Split Checks
**As a** server
**I want to** split a check multiple ways
**So that** customers can pay separately

#### Acceptance Criteria
```gherkin
Given an order with total $100
When I select "Split Check" and choose "Split Evenly by 4"
Then 4 separate checks should be created for $25 each
And each check should show the split items
And tax should be divided proportionally

Given an order with 5 items
When I select "Split by Item"
And assign items to different customers
Then separate checks should be created with assigned items
And shared items should be split evenly
And each check should be payable independently
```

#### Test Cases
- ✅ Split evenly by N guests
- ✅ Split by specific items
- ✅ Split by custom amounts
- ✅ Split shared items (appetizers)
- ✅ Tax distribution accuracy
- ✅ Tip calculation on splits
- ✅ Partial payment on splits
- ✅ Rejoin split checks

---

## Epic 3: Payment Processing

### US-006: Accept Card Payment
**As a** cashier
**I want to** process credit card payments
**So that** customers can pay with their cards

#### Acceptance Criteria
```gherkin
Given an order with total $45.50
When I select "Pay with Card"
And the customer taps/inserts their card
Then the payment should process within 3 seconds
And a success message should appear
And the receipt should be available to print/email
And the order status should change to "paid"

Given a card payment fails
When the payment is declined
Then I should see the decline reason
And the order should remain open
And I should be able to try another payment method
```

#### Test Cases
- ✅ Successful card payment
- ✅ Declined card handling
- ✅ Partial card payment
- ✅ Multiple card split payment
- ✅ Tip addition on screen
- ✅ Signature capture when required
- ✅ Receipt generation
- ✅ Refund processing

---

### US-007: Process Cash Payment
**As a** server
**I want to** accept cash payments
**So that** customers can pay with cash

#### Acceptance Criteria
```gherkin
Given an order total of $37.25
When I enter cash received as $50
Then the change due should show $12.75
And the cash drawer should be prompted to open
And the payment should be recorded
And the order should be closed

Given exact change is provided
When I enter the exact amount
Then no change calculation should be shown
And the transaction should complete immediately
```

#### Test Cases
- ✅ Calculate correct change
- ✅ Handle exact change
- ✅ Handle insufficient cash
- ✅ Cash drawer integration
- ✅ Multiple denomination entry
- ✅ Cash + card combination
- ✅ Tip entry for cash

---

## Epic 4: Inventory Management

### US-008: Track Inventory Depletion
**As a** bar manager
**I want** inventory to update automatically when drinks are sold
**So that** I know current stock levels

#### Acceptance Criteria
```gherkin
Given a cocktail recipe uses 2oz of vodka
And current vodka inventory is 50oz
When the cocktail is sold
Then vodka inventory should decrease to 48oz
And the depletion should be logged
And low stock alerts should trigger if below par

Given an item reaches reorder point
When inventory drops below the threshold
Then an alert should be sent to the manager
And the item should appear in the low stock report
And suggested reorder quantity should be calculated
```

#### Test Cases
- ✅ Recipe-based depletion
- ✅ Manual depletion entry
- ✅ Waste tracking
- ✅ Spillage recording
- ✅ Low stock alerts
- ✅ Par level monitoring
- ✅ Reorder suggestions
- ✅ Depletion history

---

### US-009: Perform Inventory Count
**As an** inventory manager
**I want to** record physical inventory counts
**So that** I can track variances and adjust stock

#### Acceptance Criteria
```gherkin
Given I am conducting inventory
When I enter a physical count of 45 for an item showing 50 in system
Then a variance of -5 should be calculated
And the variance percentage should show -10%
And I should be prompted to add notes
And the system quantity should update after confirmation

Given multiple users are counting
When counts are submitted by different users
Then counts should be consolidated by timestamp
And conflicts should be flagged for review
And final counts should require manager approval
```

#### Test Cases
- ✅ Enter physical counts
- ✅ Calculate variance
- ✅ Variance explanation required
- ✅ Multi-user count coordination
- ✅ Count history tracking
- ✅ Adjustment approval workflow
- ✅ Count sheet generation
- ✅ Blind count option

---

## Epic 5: Kitchen Display System

### US-010: Send Orders to Kitchen
**As a** server
**I want to** send orders to the kitchen
**So that** food preparation can begin

#### Acceptance Criteria
```gherkin
Given I have added items to an order
When I press "Send to Kitchen"
Then items should appear on kitchen display within 1 second
And items should be grouped by station (grill, salad, etc)
And the order timer should start
And I should receive confirmation of sending

Given some items have different prep times
When I send the order with coursing
Then appetizers should fire immediately
And entrees should fire after specified delay
And desserts should remain held until manually fired
```

#### Test Cases
- ✅ Send all items immediately
- ✅ Course-based firing
- ✅ Timed firing delays
- ✅ Rush order flagging
- ✅ Allergy/dietary alerts
- ✅ Item modification display
- ✅ Order recall capability
- ✅ Kitchen printer backup

---

### US-011: Mark Items Ready
**As a** cook
**I want to** mark items as ready
**So that** servers know when to deliver food

#### Acceptance Criteria
```gherkin
Given an order appears on my station
When I complete preparing the item
And I tap "Mark Ready"
Then the item should show as ready on server screens
And the prep time should be recorded
And the item should move to the "Ready" section

Given all items in an order are ready
When the last item is marked complete
Then the entire order should flash as ready for pickup
And a notification should be sent to the assigned server
And the order completion time should be logged
```

#### Test Cases
- ✅ Mark single item ready
- ✅ Mark multiple items ready
- ✅ Undo ready status
- ✅ Prep time tracking
- ✅ Order completion alerts
- ✅ Quality check workflow
- ✅ Expeditor view
- ✅ Ready item timeout alerts

---

## Epic 6: Shift Management

### US-012: Clock In/Out
**As an** employee
**I want to** clock in and out for my shifts
**So that** my hours are tracked accurately

#### Acceptance Criteria
```gherkin
Given I am scheduled for a shift at 5:00 PM
When I clock in at 4:55 PM
Then my shift should start
And I should be marked as "on duty"
And I should be able to access my assigned sections
And the time clock should show my clock-in time

Given I am clocked in
When I clock out
Then I should be prompted to confirm
And my total hours should be calculated
And my sales/tips summary should be displayed
And I should be logged out of the POS
```

#### Test Cases
- ✅ Clock in on time
- ✅ Clock in early/late
- ✅ Clock out normally
- ✅ Break tracking
- ✅ Overtime calculation
- ✅ Shift role assignment
- ✅ Section assignment
- ✅ Tip reporting requirement

---

## Epic 7: Reporting & Analytics

### US-013: View Daily Sales Report
**As a** manager
**I want to** see daily sales summaries
**So that** I can track restaurant performance

#### Acceptance Criteria
```gherkin
Given the day has ended
When I access the daily sales report
Then I should see total gross sales
And I should see sales by category
And I should see sales by payment method
And I should see hourly sales breakdown
And comparison to previous periods should be shown

Given I want to analyze trends
When I view the report
Then I should see week-over-week comparison
And I should see top selling items
And I should see server performance metrics
And I should be able to export to Excel/PDF
```

#### Test Cases
- ✅ Generate end-of-day report
- ✅ Real-time sales tracking
- ✅ Category breakdown
- ✅ Payment method analysis
- ✅ Void/comp tracking
- ✅ Discount analysis
- ✅ Labor cost percentage
- ✅ Report scheduling

---

### US-014: Staff Performance Metrics
**As a** manager
**I want to** track staff performance
**So that** I can identify top performers and training needs

#### Acceptance Criteria
```gherkin
Given a server has worked a shift
When I view their performance report
Then I should see total sales amount
And I should see average check size
And I should see items per transaction
And I should see average service time
And I should see tip percentage

Given multiple servers are working
When I view comparative reports
Then I should see rankings by sales
And I should see upselling effectiveness
And I should see customer satisfaction scores
And I should identify training opportunities
```

#### Test Cases
- ✅ Individual performance metrics
- ✅ Comparative rankings
- ✅ Sales per hour tracking
- ✅ Upselling tracking
- ✅ Void/comp frequency
- ✅ Speed of service metrics
- ✅ Tip percentage analysis
- ✅ Section performance

---

## Epic 8: Menu Management

### US-015: Update Menu Items
**As a** manager
**I want to** update menu items and prices
**So that** the menu reflects current offerings

#### Acceptance Criteria
```gherkin
Given I have manager permissions
When I edit a menu item price from $12 to $14
Then the new price should apply immediately
And active orders should keep the old price
And the price change should be logged
And all terminals should sync within 5 seconds

Given an item is out of stock
When I mark it as "86'd"
Then it should show as unavailable
And servers should not be able to add it to new orders
And it should appear in the 86 list
And I should be able to un-86 it quickly
```

#### Test Cases
- ✅ Update item prices
- ✅ Update item descriptions
- ✅ Add new menu items
- ✅ Remove menu items
- ✅ 86 items temporarily
- ✅ Category management
- ✅ Modifier management
- ✅ Happy hour pricing
- ✅ Image uploads

---

## Epic 9: Cost Management

### US-016: Calculate Cocktail Costs
**As a** bar manager
**I want to** calculate the cost of cocktails
**So that** I can price them profitably

#### Acceptance Criteria
```gherkin
Given a cocktail recipe with:
  - 2oz vodka at $0.50/oz
  - 1oz lime juice at $0.10/oz
  - 0.5oz simple syrup at $0.05/oz
When I calculate the cost
Then the total cost should be $1.15
And the cost percentage at $12 price should be 9.58%
And suggested price for 20% cost should be $5.75

Given ingredient costs change
When vodka price increases to $0.60/oz
Then all cocktails using vodka should recalculate
And margin alerts should trigger if below target
And price adjustment suggestions should be generated
```

#### Test Cases
- ✅ Calculate ingredient costs
- ✅ Include garnish costs
- ✅ Include labor costs
- ✅ Batch recipe scaling
- ✅ Margin calculation
- ✅ Price suggestions
- ✅ Cost trend analysis
- ✅ Supplier price updates

---

## Epic 10: Offline Functionality

### US-017: Work Offline
**As a** server
**I want to** continue taking orders when internet is down
**So that** service isn't interrupted

#### Acceptance Criteria
```gherkin
Given the internet connection is lost
When I create a new order
Then the order should be saved locally
And I should see an "Offline Mode" indicator
And I should be able to add items and process cash payments
And orders should queue for syncing

Given connection is restored
When the system comes back online
Then all offline orders should sync automatically
And any conflicts should be resolved
And sync status should be visible
And no data should be lost
```

#### Test Cases
- ✅ Offline order creation
- ✅ Offline cash payments
- ✅ Queue management
- ✅ Sync on reconnection
- ✅ Conflict resolution
- ✅ Offline duration limits
- ✅ Card payment restrictions
- ✅ Inventory tracking offline

---

## Non-Functional Requirements

### Performance Requirements
- Page load time < 2 seconds
- Order submission < 500ms
- Payment processing < 3 seconds
- Menu search < 100ms
- Report generation < 5 seconds

### Security Requirements
- All passwords hashed with Argon2
- Session timeout after 8 hours
- PCI compliance for card processing
- Role-based access control
- Audit logging for all changes

### Accessibility Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Touch targets minimum 44x44px

### Reliability Requirements
- 99.9% uptime
- Automatic failover
- Data backup every hour
- 30-day data retention
- Disaster recovery plan

---

## Test Priority Matrix

| Epic | Priority | Test Coverage Target |
|------|----------|---------------------|
| Authentication | Critical | 95% |
| Order Management | Critical | 90% |
| Payment Processing | Critical | 95% |
| Inventory | High | 85% |
| Kitchen Display | High | 85% |
| Shift Management | Medium | 80% |
| Reporting | Medium | 80% |
| Menu Management | Medium | 85% |
| Cost Management | Low | 75% |
| Offline Mode | High | 90% |

---

## Definition of Ready
- [ ] User story has clear description
- [ ] Acceptance criteria defined in Gherkin
- [ ] Test cases identified
- [ ] API contracts defined
- [ ] UI mockups approved
- [ ] Dependencies identified
- [ ] Story pointed (1, 2, 3, 5, 8)

## Definition of Done
- [ ] Code complete and reviewed
- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] Acceptance criteria met
- [ ] Documentation updated
- [ ] No critical bugs
- [ ] Performance benchmarks met
- [ ] Deployed to staging

---

*Last Updated: September 29, 2025*
*Version: 0.1.0-alpha*
*Total User Stories: 17*
*Total Test Cases: 180+*