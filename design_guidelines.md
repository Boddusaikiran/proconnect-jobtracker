# Design Guidelines: LinkedIn-Style Professional Networking Platform

## Design Approach
**System Selected:** Material Design-influenced professional system with LinkedIn-style patterns
**Rationale:** Professional utility platform requiring clarity, information density, and established interaction patterns for user trust and efficiency.

## Core Design Principles
1. **Professional Hierarchy:** Clear visual distinction between primary actions and secondary information
2. **Information Density:** Efficient use of space to display rich professional data without overwhelming users
3. **Consistent Interaction:** Predictable patterns across all features (Network, Jobs, Profile, Messages)

## Typography System

**Font Stack:** Inter or similar professional sans-serif via Google Fonts
- **Headings:** Font weights 600-700
  - H1: text-2xl to text-3xl (page titles)
  - H2: text-xl to text-2xl (section headers)
  - H3: text-lg (card headers, subsection titles)
- **Body:** Font weight 400-500
  - Primary: text-base (main content)
  - Secondary: text-sm (metadata, timestamps, helper text)
  - Micro: text-xs (tags, labels, counts)

## Layout System

**Spacing Units:** Use Tailwind units of 2, 4, 6, 8, 12, and 16 consistently
- Card padding: p-6
- Section spacing: space-y-6 to space-y-8
- Component gaps: gap-4
- Page margins: px-4 md:px-8

**Grid Patterns:**
- Main Layout: Sticky sidebar (240px-280px) + Main content (max-w-4xl)
- Cards Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 with gap-6
- List Items: Full-width stacked with divide-y

## Component Library

### Navigation Header
- Fixed top position with backdrop blur
- Height: h-14 to h-16
- Left: Logo + primary nav items (Home, Network, Jobs, Messages, Notifications)
- Right: Search bar (expandable on mobile) + Profile dropdown
- Active state: Border-bottom indicator on current route

### Cards (Primary Content Container)
- Rounded corners: rounded-lg
- Border treatment for definition
- Padding: p-6
- Shadow: Subtle elevation (shadow-sm)
- Hover state: Gentle shadow increase (shadow-md)

### Profile Components
**Profile Header:**
- Cover area: h-32 to h-48
- Avatar: Overlapping cover (-mt-16), size w-32 h-32, rounded-full with border
- Name + Headline: Below avatar, left-aligned
- Action buttons: Positioned top-right of card

**Experience/Education Items:**
- Company/School logo: w-12 h-12, rounded
- Title + Company: Stacked, font-semibold + font-normal
- Duration + Location: text-sm secondary text
- Description: Expandable "Show more" pattern after 3 lines

**Skills Section:**
- Pill-style badges: px-3 py-1.5, rounded-full
- Grid layout: flex flex-wrap gap-2
- Endorsement counts: text-xs on pill

### Network Page Components
**Connection Cards:**
- Avatar: w-16 h-16, rounded-full
- Name + Headline: Truncate at 2 lines
- Mutual connections: text-sm with count
- Action buttons: "Connect" primary, "Remove" secondary, stacked on mobile

**Invitation List:**
- Avatar + Name + Headline + Timestamp in horizontal layout
- Accept (primary) + Ignore (secondary) buttons, inline on desktop

### Jobs Page Components
**Search Bar:**
- Prominent placement: Full-width, h-12
- Keywords + Location inputs side-by-side on desktop
- Filters: Collapsible sidebar or expandable panel

**Job Card:**
- Company logo: w-14 h-14, rounded
- Title (font-semibold text-lg) + Company + Location
- Metadata row: Job type, level, posted time (text-sm)
- Save icon: Top-right corner
- Hover: Lift effect with shadow transition

**Filters Panel:**
- Checkbox groups with category headers
- Salary range: Dual-thumb slider
- Clear filters: Text link at top

### Messages Page
**Two-Column Layout:**
- Conversation list: w-80 to w-96, fixed height with scroll
- Message thread: flex-1

**Conversation Item:**
- Avatar: w-12 h-12
- Name + last message preview (text-sm, truncate)
- Timestamp: text-xs, top-right
- Unread indicator: Blue dot or count badge

**Message Bubbles:**
- Sent: Right-aligned, max-w-md
- Received: Left-aligned, max-w-md
- Padding: px-4 py-2.5, rounded-2xl
- Timestamp below: text-xs

**Message Input:**
- Fixed bottom: Sticky input bar
- Height: min-h-12, auto-grow to max 4 lines
- Send button: Icon-only, positioned inline-right

### Notifications Page
**Notification Items:**
- Avatar + notification text + timestamp in row
- Unread: Slight background tint
- Action context: "View profile", "See job" as inline links
- Group by date: "Today", "This Week", "Earlier"

### Forms & Inputs
- Input height: h-10 to h-12
- Border: Full border with focus ring
- Labels: text-sm font-medium, mb-2
- Error states: Border change + text-sm error message below

### Buttons
**Primary:** Full padding (px-6 py-2.5), rounded-lg, font-medium
**Secondary:** Same padding, border treatment
**Text/Ghost:** Minimal padding (px-3 py-1.5)
**Sizes:** Small (text-sm), Medium (text-base), Large (text-lg)

## Page-Specific Layouts

**Home Feed:**
- Center column: max-w-2xl
- Left sidebar: Profile summary card (sticky)
- Right sidebar: Trending topics, suggestions (sticky)
- Post cards: Full width, space-y-4

**Profile:**
- Single column: max-w-4xl centered
- Sections stacked: About, Experience, Education, Skills
- Edit mode: Inline editing with save/cancel

**Network:**
- Tab navigation: Connections, Invitations, Suggestions
- Grid for cards: 2-3 columns on desktop
- Count indicators in tabs

**Jobs:**
- Filter sidebar: w-64 on desktop, drawer on mobile
- Main area: Job list, infinite scroll or pagination
- Applied jobs: Separate tab with status indicators

## Animations
**Minimal Motion:**
- Hover transitions: 150ms ease
- Card elevation: Smooth shadow transitions
- Modal/Drawer entry: 200ms slide + fade
- **No scroll-based animations or complex keyframes**

## Images
**Required Images:**
- Profile avatars: Circular, consistent sizes throughout
- Company/School logos: Square or rounded-square
- Job listing company logos: 56x56px standard size
- Profile cover photos: 16:5 aspect ratio, optional but recommended
- **No large hero images** - This is a utility platform, not marketing site

## Responsive Behavior
- Mobile (<768px): Single column, stacked navigation drawer, full-width cards
- Tablet (768px-1024px): Two-column grids, condensed sidebars
- Desktop (>1024px): Three-column layouts where appropriate, sticky sidebars active