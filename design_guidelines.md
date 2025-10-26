# WholeWellness Design Guidelines

## Design Approach

**Reference-Based Strategy:** Drawing from BetterHelp's trustworthy coaching interface, Calm's empowering warmth, and Notion's accessible clarity. This creates a safe, professional space that empowers survivors while maintaining approachability.

**Core Principles:**
- Warmth through generous spacing and soft shapes
- Trust through professional structure and clear information hierarchy
- Empowerment through accessible, confidence-building interactions
- Mobile-first with touch-optimized components (48px minimum touch targets)

## Typography System

**Font Selection (Google Fonts):**
- Primary: Inter (400, 500, 600) - clean, highly legible for body text and UI
- Headings: Outfit (500, 600, 700) - warm, approachable personality

**Type Scale:**
- Hero Headline: 48px/56px (mobile: 32px/40px) - bold, empowering
- Section Headers: 36px/44px (mobile: 28px/36px)
- Subsection Headers: 24px/32px (mobile: 20px/28px)
- Body Large: 18px/28px - key messages, introductions
- Body Standard: 16px/26px - primary content
- Body Small: 14px/22px - metadata, captions
- Button Text: 16px/24px, medium weight

## Layout System

**Spacing Primitives:** Tailwind units of 4, 6, 8, 12, 16, 24 for consistent rhythm
- Component padding: p-6 to p-8
- Section spacing: py-16 to py-24 (desktop), py-12 to py-16 (mobile)
- Card gaps: gap-6 to gap-8
- Touch targets: minimum h-12 (48px)

**Container Strategy:**
- Full-width sections with max-w-7xl inner containers
- Content sections: max-w-6xl
- Forms and reading content: max-w-2xl for focus

**Grid Patterns:**
- Desktop: 3-column feature grids, 2-column service splits
- Tablet: 2-column maximum
- Mobile: Single column stacking, full-width cards

## Component Library

### Navigation
**Top Navigation:**
- Sticky header, backdrop blur for depth
- Left: Logo with "WholeWellness" wordmark
- Center: Primary navigation (Dashboard, Coaching, Resources, Community)
- Right: Notification bell, user avatar with dropdown
- Mobile: Hamburger menu (top-right), slide-out drawer with large touch targets

**Bottom Navigation (Mobile PWA):**
- Fixed bottom bar, 5 icons maximum
- Home, Coaching, Messages, Resources, Profile
- Active state with icon fill + subtle label
- 60px height for comfortable thumb reach

### Hero Section
**Layout:**
- Asymmetric split: 50% content (left), 50% hero image (right)
- Mobile: Image top (40vh), content below with overlap
- Content: Headline + 2-3 line subheading + dual CTAs + trust badge ("Supporting 10,000+ survivors")
- Buttons with backdrop blur when over images
- Generous padding: py-20 on desktop, py-12 mobile

### Cards
**Service Cards:**
- Rounded corners (rounded-2xl), soft shadows
- Icon at top (64px circle with subtle teal/purple gradient background)
- Title + 2-3 line description + "Learn more" link
- Hover: slight lift (translate-y-1), shadow increase
- Touch: No hover states, direct tap with haptic feedback consideration

**Coach Profile Cards:**
- Horizontal layout on desktop (photo left, info right)
- Vertical stack on mobile
- Photo: 96px rounded-full with subtle border
- Name (h3) + credentials + specialties (tags) + "Book session" button
- Availability indicator (green dot + "Available now")

**Progress Cards:**
- Thin border, no heavy shadow for calm appearance
- Progress bars with smooth fill animations
- Milestone indicators with achievement icons
- Encouraging micro-copy ("You're making progress!")

### Forms
**Input Fields:**
- Large, touch-friendly: h-12 minimum
- Clear labels above inputs (not floating)
- Soft rounded corners (rounded-lg)
- Focus states with teal/purple ring
- Error messages below field in warm red, with helpful guidance
- Success states with checkmark icon

**Buttons:**
- Primary: h-12, px-8, rounded-full for warmth
- Secondary: outlined version with same dimensions
- Touch ripple effect on activation
- Disabled state: reduced opacity + "not-allowed" cursor
- Icon + text combinations with gap-2 spacing

### Video Conferencing Interface
**Layout:**
- Large video area with rounded corners (rounded-xl)
- Floating control bar at bottom (blur backdrop)
- Sidebar for chat/notes (collapsible on mobile)
- Controls: Mute, video, share, end call - all h-12 circular buttons
- Active speaker highlight with subtle teal border

### Dashboard Widgets
**Stat Cards:**
- 2x2 grid desktop, stacked mobile
- Icon + large number + label
- Subtle background gradient (teal to purple, low opacity)

**Quick Actions:**
- Grid of large touchable tiles (minimum 120px x 120px)
- Icon + short label
- "Schedule session", "Take assessment", "Message coach", "View resources"

**Activity Feed:**
- Timeline layout with left border accent
- Avatar + action description + timestamp
- "View all" link at bottom

### Assessment Interface
**Question Cards:**
- One question per card, full focus
- Large radio buttons/checkboxes (32px touch targets)
- Progress indicator at top (stepped progress bar)
- "Previous" and "Next" buttons at bottom, full width on mobile
- Auto-save indicator for reassurance

### Modals & Overlays
**Modal Structure:**
- Centered with max-w-2xl
- Rounded-2xl with generous padding (p-8)
- Close button (top-right, 40px touch target)
- Scrollable content area if needed
- Overlay with blur backdrop

**Donation Modal:**
- Suggested amounts as large tap cards (3-column grid)
- Custom amount input prominently displayed
- Impact message ("Your $50 provides 2 coaching sessions")
- Secure payment badges below submit button

## Mobile PWA Specific

**Touch Interactions:**
- All interactive elements minimum 48px height
- Generous spacing between clickable items (gap-4 minimum)
- Swipe gestures: Swipe left on coach cards to favorite, swipe down to refresh
- Pull-to-refresh on feed screens
- Bottom sheet patterns for secondary actions

**Offline Capabilities:**
- Offline indicator banner at top when disconnected
- Cached content cards show "Saved for offline" badge
- Queue messages when offline, auto-send when reconnected

**App-like Features:**
- Install prompt banner (dismissible, remembers choice)
- Push notification permission request (contextual, after first value delivered)
- Splash screen with logo on warm gradient background

## Images

**Hero Image:**
- Large, prominent hero image showing diverse individuals in empowering, supportive settings
- Image should depict strength, growth, community - consider sunrise/growth metaphors, people moving forward, supportive connections
- Warm, natural lighting - avoid clinical or institutional aesthetics
- Position: Right 50% of hero on desktop, top 40vh on mobile
- Treatment: Subtle gradient overlay (purple/teal) at 20% opacity for text contrast

**Section Images:**
- Coach profiles: Professional headshots, warm expressions, diverse representation
- Service illustrations: Custom illustrations showing AI coaching (abstract, approachable), video calls, community connections
- Testimonial photos: Authentic survivor photos (with permission) or tasteful silhouettes with warm lighting
- Resource cards: Contextual imagery (reading, journaling, meditation spaces)

**Background Treatments:**
- Abstract gradient shapes (teal/purple) at low opacity in section backgrounds
- Avoid patterns that could feel overwhelming or triggering
- Use generous white space as primary background element

## Accessibility Features

**Critical Implementations:**
- Focus indicators with 3px teal ring on all interactive elements
- Skip navigation link at top
- High contrast text ratios (4.5:1 minimum)
- Screen reader labels on all icons
- Form errors with aria-live announcements
- Keyboard navigation fully supported with logical tab order
- Reduced motion preferences respected (prefers-reduced-motion query)
- Text scaling support up to 200% without breaking layouts
- Touch target spacing prevents accidental taps

**Trust Signals Throughout:**
- Security badges in footer
- "Crisis hotline" always accessible (sticky button on mobile)
- Clear privacy statements
- Professional credentials displayed
- Nonprofit status badge
- Testimonials with first names only for privacy