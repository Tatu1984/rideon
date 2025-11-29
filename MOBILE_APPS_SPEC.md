# RideOn Mobile Apps - Complete Specification

## PROJECT STRUCTURE

```
rideon/
├── apps/
│   ├── admin/          # Admin Panel (COMPLETE ✅)
│   ├── backend/        # API Server (COMPLETE ✅)
│   ├── driver-app/     # Driver Mobile App (TO BUILD)
│   └── rider-app/      # Rider Mobile App (TO BUILD)
```

---

## DRIVER APP - TECHNICAL STACK

### Framework: React Native (Expo)
- **Why:** Cross-platform (iOS + Android) from single codebase
- **Navigation:** React Navigation 6
- **State Management:** Redux Toolkit + Redux Persist
- **Real-time:** Socket.IO client
- **Maps:** React Native Maps + Google Maps API
- **Location:** Expo Location
- **Notifications:** Expo Notifications + FCM
- **Storage:** AsyncStorage
- **API Client:** Axios
- **Forms:** React Hook Form
- **UI Library:** React Native Elements / NativeBase
- **Icons:** React Native Vector Icons
- **Image Picker:** Expo Image Picker
- **Camera:** Expo Camera
- **Calling:** React Native Communications
- **Chat:** Custom with Socket.IO

---

## DRIVER APP - COMPLETE FEATURE LIST

### 1. Registration & Onboarding
**Screens:**
- Welcome/Splash
- Phone Number Entry
- OTP Verification
- Personal Details (Name, Email, DOB)
- Address Information
- Driver's License Upload (Front & Back)
- Vehicle Information (Make, Model, Year, Color, Plate)
- Vehicle Registration Upload
- Insurance Certificate Upload
- Background Check Consent
- Profile Photo Capture
- Bank/Payout Setup (Account Number, IFSC/Routing, UPI)
- Terms & Conditions Agreement
- Submission & Pending Approval Screen

**API Endpoints Needed:**
- POST /api/driver/register
- POST /api/driver/upload-document
- POST /api/driver/verify-otp
- GET /api/driver/registration-status

---

### 2. Home/Dashboard Screen
**Features:**
- Online/Offline Toggle (Large prominent button)
- Current Status Badge (Online, Offline, On Trip, Busy)
- Today's Earnings Counter (Live updating)
- Today's Trips Count
- Acceptance Rate %
- Current Rating Display
- Heat Map Button (Navigate to high-demand areas)
- Quick Stats Cards:
  - Cash collected today
  - Online hours
  - Distance driven
- Notifications Bell (Unread count)
- Profile Icon (Navigate to settings)

**Real-time Updates:**
- Incoming trip requests (Full-screen modal)
- Earnings update after each trip
- Status changes

---

### 3. Trip Request Card (Full-screen Modal)
**Information Displayed:**
- Pickup Location (Name + Address)
- Distance to Pickup (e.g., "2.3 km away")
- Estimated Time to Pickup
- Dropoff Location (Name + Address)
- Total Distance
- Estimated Duration
- Fare Estimate (Breakdown available)
- Rider Name & Rating
- Vehicle Type Requested
- Special Requests/Notes (if any)
- Surge Multiplier (if applicable)

**Actions:**
- Accept Button (Green, prominent)
- Reject Button (Red)
- Auto-Accept Toggle (Settings)
- Countdown Timer (30 seconds to respond)

**Auto-Reject Logic:**
- If no action in 30s, auto-reject
- Sound + vibration alert
- Configurable in settings

---

### 4. Active Trip Screen
**Stages:**

**Stage 1: Accepted → Arriving**
- "Navigate to Pickup" button
- Launch preferred navigation (Google Maps, Waze, Apple Maps)
- Distance to pickup
- ETA to pickup
- "Arrived at Pickup" button
- Masked call button (call rider)
- Chat button (message rider)
- Cancel trip button (with cancellation reasons)

**Stage 2: Arrived → Waiting**
- "Waiting for rider" status
- Wait timer (starts automatically)
- "Start Trip" button (enabled after rider confirms)
- Call/Chat buttons active
- Current location map view

**Stage 3: Trip Started → En Route**
- "Navigate to Dropoff" button
- Route on map with turn-by-turn
- Distance remaining
- ETA to dropoff
- Current fare (live calculation)
- Rider info card (minimized)
- Call/Chat buttons
- Emergency/SOS button (red, top-right)
- "End Trip" button (only enabled when near dropoff)

**Stage 4: Trip Ended**
- Fare summary screen
- Payment method display (Cash/Card/Wallet)
- Collect cash button (if cash payment)
- Rate rider (1-5 stars)
- Report issue button
- Feedback/comments field
- Complete button
- Next trip button

---

### 5. Navigation Integration
**Features:**
- In-app basic navigation (React Native Maps)
- "Launch Navigation" button options:
  - Google Maps
  - Waze
  - Apple Maps
  - In-app navigation
- Deep linking to external nav apps with coordinates
- Turn-by-turn directions
- Real-time traffic integration
- Rerouting on traffic/route changes

---

### 6. Communication (Masked Calling & Chat)
**Masked Calling:**
- Tap call button → Calls through platform number
- Rider sees platform number, not driver's real number
- Driver sees platform number, not rider's real number
- Call logs stored in backend
- Duration tracking

**In-App Chat:**
- Real-time messaging via Socket.IO
- Text messages only (no media for safety)
- Chat history per trip
- Typing indicators
- Read receipts
- Quick replies (I'm on my way, Arriving in 2 mins, etc.)
- Chat automatically closes after trip ends

---

### 7. Trip History
**Features:**
- List view of all completed trips
- Filter by:
  - Date range
  - Payment method
  - Trip status
- Sort by date, earnings, distance
- Trip cards showing:
  - Trip ID
  - Date & Time
  - Pickup → Dropoff
  - Distance & Duration
  - Earnings
  - Payment method
  - Rider name & rating given
- Tap to view full trip details
- Invoice download/share
- Report issue (retroactive)

---

### 8. Earnings Dashboard
**Tabs:**

**Tab 1: Daily**
- Today's total earnings
- Trip-wise breakdown
- Cash collected
- Online payments
- Tips received
- Incentives earned
- Platform commission
- Net earnings

**Tab 2: Weekly**
- This week's summary
- Daily bar chart
- Comparison with last week
- Peak earning days
- Average per trip

**Tab 3: Monthly**
- Monthly overview
- Weekly breakdown
- Trends graph
- Total trips
- Total earnings
- Highest earning day
- Export statement (PDF/Excel)

**Stats Cards:**
- Total balance
- Available for payout
- Pending settlement
- Commission owed
- Next payout date

---

### 9. Wallet & Payouts
**Wallet Tab:**
- Current balance
- Pending amount
- Transaction history:
  - Trip earnings (credit)
  - Commission (debit)
  - Adjustments (credit/debit)
  - Bonuses (credit)
  - Penalties (debit)
- Filter by type and date

**Payouts Tab:**
- Available balance for payout
- Minimum payout threshold
- Request payout button
- Payout method (Bank/UPI)
- Payout history:
  - Date requested
  - Amount
  - Status (pending/processing/completed/failed)
  - Reference number
  - Bank details
- Automatic payout schedule (weekly/biweekly/monthly)

**Adjustments:**
- Admin can add/deduct amounts
- Reason displayed
- Notification sent

---

### 10. Incentives & Bonuses
**Features:**
- Active incentive programs list
- Progress tracking:
  - "Complete 10 more trips to earn $50 bonus"
  - Progress bar
  - Time remaining
- Types of incentives:
  - Trip count bonuses (Complete X trips)
  - Earnings milestones (Earn $X this week)
  - Peak hour bonuses (Work during rush hours)
  - Streak bonuses (Work 5 consecutive days)
  - Acceptance rate bonuses (Maintain >90%)
  - Rating bonuses (Keep 4.5+ rating)
  - Referral bonuses
- Completed bonuses list
- Bonus payout status

---

### 11. Ratings & Performance
**My Rating Section:**
- Overall rating (large display)
- Total ratings count
- Rating breakdown (5 stars: X%, 4 stars: Y%, etc.)
- Recent ratings (last 100)
- Comments from riders (anonymized)

**Performance Metrics:**
- Acceptance rate (%)
- Cancellation rate (%)
- Completion rate (%)
- Average rating
- On-time arrival %
- Comparison with city average
- Performance trend graph

**Improvement Tips:**
- AI-generated suggestions based on performance
- "Your cancellation rate is 12%, city avg is 5%. Try to accept trips you can complete."
- "Riders love your friendliness! Keep it up."
- Training resources
- Best practices

---

### 12. Referral System
**Features:**
- Personal referral code (unique)
- Share button (SMS, WhatsApp, Email, Copy)
- Referral stats:
  - Total referred
  - Pending signups
  - Active drivers referred
  - Total earnings from referrals
- Referral rewards:
  - $X when referee completes Y trips
  - Tiered bonuses
- Referee tracking (list of referrals with status)
- Leaderboard (optional)

---

### 13. Support & Help
**Features:**
- Create support ticket
- Categories:
  - Payment issues
  - App issues
  - Account problems
  - Trip disputes
  - Safety concerns
  - Other
- Priority level selection
- Attach screenshots
- View open tickets
- Ticket history
- Chat with support (real-time)
- Status updates via notification
- FAQ section
- Help articles/guides
- Contact numbers (emergency, support, office)
- Email support

---

### 14. SOS & Safety
**Emergency Button:**
- Red SOS button (accessible during trips)
- Quick access from any screen during active trip
- Actions when pressed:
  - Alert sent to admin dashboard (real-time)
  - Emergency contacts notified (SMS)
  - Location shared with authorities
  - Trip recording activated
  - Audio recording starts (if enabled)
  - Emergency helpline auto-dial option

**Safety Features:**
- Share trip details with contacts (live tracking link)
- Ride check-ins (automatic alerts if trip unusually long)
- Safety toolkit:
  - Emergency contacts management
  - Share location
  - Call police/emergency services
  - Fake call feature
- Trip recording (if enabled by jurisdiction)
- Safety tips and guidelines
- Report unsafe behavior

---

### 15. Profile & Settings
**Profile Tab:**
- Profile photo
- Name, email, phone
- Driver license number
- Vehicle details
- Bank account info
- Edit profile button
- Verification badges (ID verified, Background check, etc.)
- Join date
- Total trips completed
- Member status (Bronze/Silver/Gold/Platinum)

**Settings Tab:**

**Account Settings:**
- Change password
- Phone number update
- Email update
- Language preference
- Deactivate account
- Delete account

**App Preferences:**
- Preferred navigation app
- Auto-accept trips (toggle + radius setting)
- Sound notifications (on/off)
- Vibration (on/off)
- Dark mode (on/off/auto)
- Distance units (km/miles)
- Currency display

**Notification Settings:**
- Trip requests (on/off)
- Promotions (on/off)
- Earnings updates (on/off)
- App updates (on/off)
- Push notification preferences

**Privacy Settings:**
- Share location always/while using/never
- Data sharing preferences
- Ad preferences

**Documents:**
- View uploaded documents
- Upload new/updated documents
- Document expiry alerts
- Re-upload expired docs

**Payout Settings:**
- Bank account details
- UPI ID
- Payout frequency
- Tax information

**About:**
- App version
- Terms & conditions
- Privacy policy
- Licenses
- Rate app
- Share app

---

### 16. Heat Map (High-Demand Areas)
**Features:**
- Map view with color-coded zones
- Red zones = Very high demand
- Orange zones = High demand
- Yellow zones = Medium demand
- Green zones = Low demand
- Real-time updates (refresh every 2-5 mins)
- Navigate to high-demand area button
- Demand forecast (next 1-2 hours)
- Surge pricing indicators
- Historical demand patterns (optional)

---

## RIDER APP - COMPLETE FEATURE LIST

### 1. Signup & Login
**Screens:**
- Splash screen
- Welcome screen (Login/Signup buttons)
- Phone number entry
- OTP verification
- Name & Email
- Profile photo (optional)
- Location permission request
- Notification permission request
- Success screen

**Social Login Options:**
- Google
- Facebook
- Apple (iOS)

---

### 2. Home Screen (Main Map View)
**Features:**
- Full-screen map centered on user location
- "Where to?" search bar (prominent)
- Saved places shortcuts (Home, Work)
- Recent destinations
- Bottom sheet with:
  - Ride options button
  - Schedule ride button
  - Wallet balance display
  - Promo code button
- Current location button
- Menu hamburger/profile icon

---

### 3. Ride Booking Flow

**Step 1: Enter Destination**
- Search bar (autocomplete)
- Map pin for precise location
- Recent searches
- Saved places
- Current location option
- Add multiple stops (optional feature)

**Step 2: Add Stops (Optional)**
- "Add stop" button
- Reorder stops
- Remove stops
- Optimized route calculation

**Step 3: Choose Vehicle Type**
- Vehicle cards (horizontal scroll):
  - Economy
  - Premium
  - SUV
  - Luxury
- Each card shows:
  - Vehicle icon/image
  - Name
  - Capacity (seats)
  - ETA (time to pickup)
  - Fare estimate
  - Surge indicator (if applicable)
- Fare breakdown button (tap to see detailed pricing)

**Step 4: Payment Method**
- Cash
- Credit/Debit card
- Wallet
- UPI
- Add payment method option
- Apply promo code
- Use wallet balance toggle

**Step 5: Schedule or Book Now**
- "Book Now" button (default)
- "Schedule for Later" option:
  - Date picker
  - Time picker
  - Confirmation

**Step 6: Confirm Booking**
- Review all details
- Pickup location
- Dropoff location
- Stops (if any)
- Vehicle type
- Fare estimate
- Payment method
- Promo applied
- "Confirm Ride" button

---

### 4. Finding Driver Screen
**Features:**
- Animated searching indicator
- "Finding you a driver..." message
- Estimated wait time
- Cancel request button
- Tips for getting matched faster

**Driver Found:**
- Driver photo
- Driver name
- Rating (stars)
- Vehicle make, model, color
- License plate number
- ETA to pickup
- "Contact Driver" button (call/chat)
- "Cancel Trip" option (with cancellation fee warning)

---

### 5. Live Tracking (Driver Arriving)
**Features:**
- Map view showing:
  - Driver's current location (car icon, moving in real-time)
  - Pickup location (pin)
  - Route to pickup (colored line)
- Driver info card (bottom):
  - Photo, name, rating
  - Vehicle details
  - License plate
  - ETA countdown (updating every few seconds)
  - "He's 2 minutes away"
- Communication buttons:
  - Call driver (masked)
  - Chat with driver
- Share trip button (send to contacts)
- Cancel trip (with fee warning)
- Safety features access:
  - Emergency contacts
  - Share trip
  - SOS button

---

### 6. In-Trip View (Ride in Progress)
**Features:**
- Map showing:
  - Current location
  - Destination
  - Route (color-coded)
  - Remaining distance
  - ETA to destination
- Trip info card:
  - Driver name & photo
  - "Trip in progress"
  - Estimated fare (updating)
  - Remaining distance
  - Remaining time
- Communication:
  - Call driver
  - Chat with driver
- Share trip (live tracking link)
- SOS button (always visible)
- Report issue button
- Safety features

---

### 7. Trip Completion
**Fare Screen:**
- Total fare display (large)
- Fare breakdown:
  - Base fare
  - Distance charge
  - Time charge
  - Surge (if any)
  - Tolls/fees
  - Discount/promo
  - Total
- Payment method used
- Payment status (Paid)

**Rate Driver:**
- Star rating (1-5)
- Tip driver option:
  - Quick amounts ($2, $5, $10)
  - Custom amount
  - No tip
- Compliments (quick select badges):
  - Great conversation
  - Clean car
  - Safe driving
  - On time
  - Friendly
- Comments/feedback (optional)
- Report issue button
- Lost item button

**Receipt:**
- Trip summary
- Date & time
- Pickup → Dropoff
- Distance & duration
- Driver name
- Vehicle details
- Itemized fare
- Payment method
- Receipt number
- Download PDF button
- Email receipt button

---

### 8. Trip History
**Features:**
- List of all past trips
- Trip cards showing:
  - Date & time
  - Pickup → Dropoff
  - Fare paid
  - Driver name & rating given
- Filter options:
  - Date range
  - Payment method
  - Status (completed/cancelled)
- Search by location
- Tap to view full details
- Rebook same trip button
- Download invoice
- Report issue (retroactive)
- Get help with trip

---

### 9. Wallet
**Balance Display:**
- Current wallet balance (prominent)
- Add money button

**Top-Up Options:**
- Quick amounts ($10, $25, $50, $100)
- Custom amount
- Payment methods:
  - Credit/Debit card
  - Net banking
  - UPI
  - Google Pay/Apple Pay
- Auto-reload settings (enable/disable, threshold, amount)

**Transaction History:**
- All wallet transactions
- Types:
  - Added money (credit, green)
  - Ride payment (debit, red)
  - Refund (credit, blue)
  - Promo credit (credit, purple)
- Date, description, amount
- Filter by type
- Export statement

**Refunds:**
- Cancelled trip refunds
- Trip dispute refunds
- Processing time display
- Refund status tracking

---

### 10. Promotions & Offers
**Active Promotions:**
- List of available promo codes
- Each card shows:
  - Code
  - Discount amount/percentage
  - Minimum ride value
  - Expiry date
  - Terms & conditions
  - "Apply" button

**Expired Promos:**
- History of used/expired codes

**Referral Rewards:**
- Your referral code
- Share button
- Referral stats:
  - People referred
  - Rewards earned
  - Pending rewards

---

### 11. Scheduled Rides
**Features:**
- List of upcoming scheduled rides
- Ride cards showing:
  - Scheduled date & time
  - Pickup → Dropoff
  - Vehicle type
  - Estimated fare
- Edit scheduled ride:
  - Change time
  - Change vehicle type
  - Add/remove stops
- Cancel scheduled ride
- Reminders (push notification before scheduled time)
- Book a new scheduled ride

---

### 12. Saved Places
**Features:**
- Add/edit/delete saved places
- Default categories:
  - Home (with special icon)
  - Work (with special icon)
- Custom places:
  - Name
  - Address
  - Icon selection
- Quick access from booking flow
- Set as default pickup/dropoff

---

### 13. Payment Methods
**Manage Cards:**
- Add credit/debit card:
  - Card number
  - Expiry
  - CVV
  - Name on card
  - Save for future use
- Saved cards list
- Default payment method (star icon)
- Delete card
- Edit card (update expiry, etc.)

**Other Payment Methods:**
- Add UPI ID
- Link Google Pay/Apple Pay
- Cash (always available)
- Wallet (always available)

**Payment Security:**
- Tokenization
- CVV not stored
- PCI compliant

---

### 14. Ride Preferences & Accessibility
**Ride Preferences:**
- Preferred vehicle types
- Music preferences
- Temperature preferences
- Conversation level (chatty/quiet)
- Pet-friendly rides
- Accessibility needs

**Accessibility Features:**
- Wheelchair accessible vehicles
- Audio cues for visually impaired
- Large text mode
- Voice commands
- Assisted pickup/dropoff
- Service animal accommodation

---

### 15. Safety Features

**Share Trip:**
- Share live location with contacts
- Send trip details (driver, vehicle, ETA)
- Share via SMS, WhatsApp, Email
- Auto-share with emergency contacts (toggle)

**Ride Check-In:**
- Automatic check-ins during trip
- Unusual route detection
- Delayed arrival alerts
- Share location with loved ones

**SOS Button:**
- Emergency alert to local authorities
- Alert admin dashboard
- Send location to emergency contacts
- Call emergency services (911/112)
- Record trip audio/video (if enabled)

**Emergency Contacts:**
- Add up to 5 contacts
- Name, phone number, relationship
- Auto-notify on SOS
- Share trip status

**Safety Toolkit:**
- Verify driver (match photo, plate)
- Report unsafe driving
- Fake call feature
- Share trip QR code
- Safety tips

**RideCheck:**
- Long stop detection
- Unexpected route alerts
- Late-night ride monitoring

---

### 16. Lost Items
**Report Lost Item:**
- Select trip from history
- Item description
- Category (phone, wallet, bag, etc.)
- Contact info
- Upload photo (optional)
- Urgency level

**Track Lost Item Report:**
- Status (reported, driver contacted, found, returned, not found)
- Communication with driver
- Admin intervention option
- Mark as resolved/not resolved

---

### 17. Split Fare (Optional Feature)
**Features:**
- Split with other riders (in same trip)
- Split with friends (after trip)
- Enter number of people
- Equal split or custom amounts
- Send split request via app
- Payment reminders
- Track who paid
- Request payment button

---

### 18. Loyalty & Rewards
**Membership Tiers:**
- Bronze (0-50 trips)
- Silver (51-200 trips)
- Gold (201-500 trips)
- Platinum (500+ trips)

**Benefits per Tier:**
- Discount percentages
- Priority support
- Exclusive promos
- Free upgrades
- Birthday rewards

**Ride Streaks:**
- Consecutive days/weeks of riding
- Streak rewards
- Milestone bonuses

**Points System:**
- Earn points per trip
- Redeem for discounts/free rides
- Points balance
- Expiry tracking

---

### 19. Referrals
**Refer Friends:**
- Personal referral code
- Share via SMS, WhatsApp, Email, Social
- Referral rewards:
  - Both get discount on first ride
  - Bonus after X trips
- Referee list
- Rewards earned
- Pending rewards

---

### 20. Support & Help
**Features:**
- Create support ticket
- Categories:
  - Trip issues
  - Payment problems
  - Account help
  - Lost item
  - Safety concern
  - Other
- Chat with support
- Call support
- Email support
- View ticket history
- Status updates

**Help Center:**
- FAQ
- How-to guides
- Video tutorials
- Contact information

---

### 21. Profile & Settings
**Profile:**
- Photo
- Name, email, phone
- Member since
- Total trips
- Loyalty tier
- Edit profile

**Settings:**
- Account settings
- Notification preferences
- Privacy settings
- Language
- Currency
- Dark mode
- Units (km/miles)
- App version
- Terms & conditions
- Privacy policy
- Delete account

---

### 22. Notifications
**Types:**
- Trip updates (driver assigned, arriving, trip started, completed)
- Promotions & offers
- Wallet transactions
- Scheduled ride reminders
- Lost item updates
- Support ticket replies
- Referral rewards
- Loyalty points
- Safety alerts

**Settings:**
- Enable/disable per type
- Sound/vibration
- In-app notifications
- Push notifications

---

## EDGE COMPUTING REQUIREMENTS

All these features must leverage edge computing:

### 1. Rider/Driver Matching
- Geographic proximity
- Driver acceptance rate
- Driver rating
- Vehicle type availability
- Real-time location
- Predicted ETA
- Driver preferences
- Historical performance

### 2. Surge Pricing
- Real-time demand analysis
- Supply analysis
- Time-based patterns
- Event-based triggers
- Geographic zones
- Dynamic multiplier calculation
- Fair warning to riders

### 3. Routing & ETA
- Real-time traffic data
- Historical patterns
- Road closures
- Weather conditions
- Multiple route options
- Continuous re-routing
- Accurate time predictions

### 4. Payment Risk Scoring
- Fraud detection
- Pattern analysis
- Velocity checks
- Geo-location verification
- Device fingerprinting
- Behavior analysis
- Real-time blocking

### 5. Safety Alerts & SOS
- Automatic detection of emergencies
- Route deviation alerts
- Long stop detection
- Unusual behavior
- Real-time escalation
- Authority notification
- Location tracking

### 6. Offline-First Sync
- Local data caching
- Queue pending actions
- Sync when online
- Conflict resolution
- Optimistic updates
- Background sync
- Data compression

---

## ESTIMATED DEVELOPMENT TIME

**Driver App:** 200-250 hours
**Rider App:** 180-220 hours
**Edge Computing Layer:** 120-150 hours
**Backend Enhancements:** 80-100 hours
**Testing & QA:** 100-120 hours

**Total:** 680-840 hours (4-5 months with 1 developer, or 2-3 months with a team)

---

This is the complete technical specification for both mobile apps with all features you requested!
