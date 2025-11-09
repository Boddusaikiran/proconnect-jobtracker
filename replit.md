# ProConnect - Professional Networking Platform

## Overview
ProConnect is a LinkedIn-style professional networking platform built with React, TypeScript, and modern web technologies. The platform enables professionals to connect, discover job opportunities, exchange messages, and manage their professional presence.

## Project Architecture

### Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Wouter (routing)
- **Backend**: Express.js, Node.js
- **State Management**: TanStack Query v5
- **UI Components**: Shadcn UI components with Radix UI primitives
- **Storage**: In-memory storage (MemStorage) for MVP
- **Styling**: Tailwind CSS with custom design system tokens

### Design System
- **Font**: Inter (professional sans-serif)
- **Colors**: LinkedIn-inspired blue primary color (#0A66C2 equivalent)
- **Components**: Material Design-influenced professional components
- **Spacing**: Consistent 4px-based spacing system
- **Typography**: Clear hierarchy with 3 levels of text color

## Features Implemented

### 1. Home Feed
- Professional news feed with posts
- Post creation interface
- Social interactions (likes, comments, shares)
- Trending topics sidebar
- Featured jobs sidebar
- Profile summary card

### 2. Network Management
- Connections list with search
- Connection invitations with accept/ignore
- People suggestions based on mutual connections
- Connection request management
- Mutual connections count

### 3. Job Search & Applications
- Job listings with company logos
- Advanced filtering (job type, experience level, location)
- Job search with location input
- Save jobs functionality
- Easy apply system
- Application tracking
- Tabs for: All Jobs, Saved Jobs, Applied Jobs

### 4. Professional Messaging
- Two-column messaging interface
- Conversation list with online status
- Real-time message display (simulated)
- Message composition with attachments
- Unread message indicators
- Search conversations

### 5. Notifications Center
- Activity notifications (connections, messages, profile views)
- Unread/read states
- Interactive notifications (accept connection requests)
- Notification types: connection requests, accepted connections, messages, job applications, profile views, post likes
- Mark all as read functionality

### 6. User Profile
- Profile header with avatar and cover photo
- About section
- Experience timeline with company logos
- Education history
- Skills with endorsement counts
- Edit capabilities for all sections
- Connection count display

## Data Models

### User
- Basic info: name, headline, email, location
- Avatar and cover image URLs
- Professional summary (about)
- Connection count

### Experience
- Title, company, location
- Start/end dates, current position flag
- Company logo
- Description

### Education
- School, degree, field of study
- Start/end dates

### Skills
- Skill name
- Endorsement count

### Connections
- User relationships
- Status: pending, accepted, rejected
- Mutual connections tracking

### Jobs
- Title, company, location
- Job type, experience level
- Salary range
- Description and requirements
- Application tracking

### Messages
- Sender/receiver relationship
- Message content
- Read/unread status
- Timestamp

### Notifications
- Notification type
- Actor (who triggered it)
- Content
- Read/unread status

## File Structure

```
client/
├── src/
│   ├── components/
│   │   ├── ui/               # Shadcn UI components
│   │   └── Header.tsx        # Main navigation header
│   ├── pages/
│   │   ├── Home.tsx          # Home feed page
│   │   ├── Network.tsx       # Network management
│   │   ├── Jobs.tsx          # Job search and applications
│   │   ├── Messages.tsx      # Messaging interface
│   │   ├── Notifications.tsx # Notifications center
│   │   ├── Profile.tsx       # User profile page
│   │   └── not-found.tsx     # 404 page
│   ├── lib/
│   │   └── queryClient.ts    # TanStack Query setup
│   ├── App.tsx               # Main app with routing
│   ├── main.tsx              # App entry point
│   └── index.css             # Global styles and design tokens
├── index.html                # HTML entry point
└── attached_assets/
    └── generated_images/     # Professional headshots and logos

server/
├── routes.ts                 # API route handlers
├── storage.ts                # In-memory storage implementation
└── index.ts                  # Express server setup

shared/
└── schema.ts                 # Data models and TypeScript types
```

## Design Guidelines Followed

1. **Professional Hierarchy**: Clear visual distinction between primary actions and secondary information
2. **Information Density**: Efficient use of space for rich professional data
3. **Consistent Interactions**: Predictable patterns across all features
4. **Responsive Design**: Mobile-first approach with breakpoints at 768px and 1024px
5. **Accessibility**: Proper contrast ratios, keyboard navigation support
6. **Component Reusability**: Shadcn UI components used throughout
7. **Hover Interactions**: Subtle elevation effects using custom hover-elevate utilities
8. **Typography**: 3-level hierarchy (default, secondary, tertiary text colors)
9. **Spacing**: Consistent padding (p-4, p-6) and gaps (gap-2, gap-4, gap-6)

## Navigation Structure

- **Home** (`/`): Professional feed and networking updates
- **Network** (`/network`): Connections, invitations, suggestions
- **Jobs** (`/jobs`): Job search, saved jobs, applications
- **Messages** (`/messages`): Professional messaging
- **Notifications** (`/notifications`): Activity updates
- **Profile** (`/profile`): User profile management

## Component Patterns

### Cards
- Rounded corners (rounded-lg)
- Subtle borders for definition
- Padding: p-6 for content
- hover-elevate class for interactive cards

### Buttons
- Primary: Default variant for main actions
- Ghost: For secondary actions and icon buttons
- Outline: For alternative actions
- Sizes: sm, default, lg, icon

### Avatars
- Circular for profile pictures
- Consistent sizes throughout (h-8 w-8 for small, h-12 w-12 for medium, h-16 w-16 for large)
- Online status indicators where applicable

### Badges
- Secondary variant for tags and labels
- Pill-shaped for skills (rounded-full)
- Small text (text-xs to text-sm)

## Current Status

**Phase 1 Complete**: Schema and Frontend
- ✅ All data models defined
- ✅ Professional images generated
- ✅ Design tokens configured
- ✅ All React components built
- ✅ Responsive layouts implemented
- ✅ Navigation and routing working

**Next Phase**: Backend Implementation
- API endpoints for all features
- In-memory storage for users, connections, jobs, messages, notifications
- Data persistence and CRUD operations

## Notes

- Using in-memory storage for MVP (no database required)
- All images are generated AI headshots and logos
- Professional blue color scheme inspired by LinkedIn
- Mobile-responsive with hamburger menu on small screens
- All interactive elements have data-testid attributes for testing
