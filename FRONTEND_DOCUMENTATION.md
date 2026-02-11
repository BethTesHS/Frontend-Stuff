# Frontend Documentation - Property Management Platform

## Overview
This is a comprehensive property management platform built with React, TypeScript, and Tailwind CSS. The application serves multiple user types including property owners, tenants, agents, and administrators with distinct dashboards and functionality for each role.

## Technology Stack
- **Framework**: React 18 with TypeScript
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui components
- **State Management**: React Context API
- **Data Fetching**: TanStack React Query
- **Icons**: Lucide React
- **3D Graphics**: React Three Fiber
- **Real-time**: Socket.io client
- **Build Tool**: Vite

## Architecture Overview

### Design System
The application uses a comprehensive design system defined in:
- `src/index.css` - CSS custom properties and semantic tokens
- `tailwind.config.ts` - Tailwind configuration with custom colors and themes
- All components use semantic tokens instead of direct colors for consistent theming

### Context Providers
Multiple context providers manage global application state:
- **AuthContext**: User authentication and session management
- **LoadingContext**: Global loading states
- **NotificationContext**: Real-time notifications
- **SavedPropertiesContext**: User's saved properties

### Component Structure
- **UI Components**: Reusable shadcn/ui components in `src/components/ui/`
- **Feature Components**: Business logic components organized by feature
- **Layout Components**: Header, Footer, Navigation, and Layout wrappers
- **Page Components**: Top-level page components in `src/pages/`

## Authentication System

### Features
- **Multi-role Authentication**: Supports Owner, Tenant, Agent, and Admin roles
- **Social Login**: Google and Facebook OAuth integration
- **Email Verification**: Secure email verification process
- **Password Reset**: Forgot password functionality
- **Role-based Routing**: Different dashboards for each user type

### Components
- `LoginForm.tsx` - User login with email/password
- `SignupForm.tsx` - User registration with validation
- `AuthModal.tsx` - Modal wrapper for login/signup forms
- `AuthModalHeader.tsx` - Branded header for auth modals
- `SocialSignupButtons.tsx` - OAuth integration buttons

### Authentication Flow
1. User selects role during registration (`SelectRole.tsx`)
2. Email verification required (`VerifyEmail.tsx`)
3. Profile setup for additional information (`ProfileSetup.tsx`)
4. Role-specific dashboard redirection

### Security
- JWT token-based authentication
- Route protection with `useAuthGuard` hook
- Role-based access control
- Secure session management

## User Roles & Dashboards

### Property Owners (`OwnerDashboard.tsx`)
**Features:**
- Property portfolio management
- Booking calendar and scheduling
- Message center with tenants/agents
- Profile management
- Property listing creation

**Components:**
- `OwnerBookings.tsx` - Manage property viewings
- `OwnerCalendar.tsx` - Calendar interface
- `OwnerMessages.tsx` - Communication hub
- `OwnerSidebar.tsx` - Navigation sidebar

### Tenants (`TenantDashboard.tsx`)
**Features:**
- Complaint submission and tracking
- Message center with landlords
- Notification management
- Profile updates

**Components:**
- `MyComplaints.tsx` - Complaint management
- `NotificationsComponent.tsx` - Real-time notifications
- Integrated messaging system

### External Tenants (`ExternalTenantDashboard.tsx`)
**Special tenant type for non-registered users:**
- `ExternalTenantCalendar.tsx` - Calendar access
- `ExternalTenantComplaints.tsx` - Complaint system
- `ExternalTenantHistory.tsx` - Interaction history
- `ExternalTenantMessages.tsx` - Communication
- `ExternalTenantProfile.tsx` - Profile management
- `ExternalTenantSidebar.tsx` - Navigation

### Agents (`AgentDashboard.tsx`)
**Features:**
- Property inquiry management
- Complaint handling
- Profile management
- Client communication

**Components:**
- `ViewInquiries.tsx` - Property inquiries
- `AgentSidebar.tsx` - Navigation
- Public profile system (`PublicAgentProfile.tsx`)

### Administrators (`AdminDashboard.tsx`)
**Features:**
- User management
- System oversight
- Global messaging
- Analytics and reporting

**Components:**
- `AdminProfile.tsx` - Admin profile management
- Complete system access and control

## Property Management System

### Property Listings
**Core Features:**
- Property search and filtering
- Detailed property views
- Image galleries and virtual tours
- Price tracking and history
- Saved properties functionality

**Components:**
- `Properties.tsx` - Main property listing page
- `PropertyDetails.tsx` - Detailed property view
- `PropertyCard.tsx` - Property preview cards
- `PropertyFilters.tsx` - Advanced filtering system
- `PriceHistoryCard.tsx` - Price tracking visualization

### Property Operations
- `ListProperty.tsx` - Property listing creation
- `PostProperty.tsx` - Property posting interface
- `PropertyListingChoice.tsx` - Listing type selection
- `MyProperties.tsx` - Owner property management

### Property Features
- **Brochure System**: Request and download property brochures
  - `BrochureRequestDialog/` - Complete brochure request system
  - Email delivery and direct download options
- **Sharing**: Social sharing functionality (`SharePropertyPopover.tsx`)
- **Scheduling**: Property viewing scheduling (`ScheduleViewingDialog.tsx`)

## Messaging & Communication

### Comprehensive Messaging System
**Features:**
- Real-time messaging with Socket.io
- File attachments and media sharing
- Conversation management
- Read/unread status tracking
- Typing indicators

**Components:**
- Multi-role messaging support (Admin ↔ Users, Tenants ↔ Owners)
- File upload and download with security
- Message history and search
- Notification integration

### Communication Channels
- **Direct Messages**: User-to-user communication
- **Support Chat**: Integrated help system (`SupportBot.tsx`)
- **Agent Communication**: Client-agent messaging (`ContactAgent.tsx`)

## Complaint Management System

### Complaint Features
- **Submission**: Detailed complaint forms (`SubmitComplaint.tsx`)
- **Tracking**: Real-time status updates
- **Resolution**: Automated resolution notifications
- **Statistics**: Complaint analytics and reporting

**Components:**
- `ComplaintCard.tsx` - Individual complaint display
- `ComplaintEmptyState.tsx` - Empty state handling
- `ComplaintResolutionNotification.tsx` - Resolution alerts
- `ComplaintStats.tsx` - Analytics dashboard
- `ComplaintStatusBadge.tsx` - Visual status indicators

### Multi-tenant Support
- Regular tenant complaints
- External tenant complaint system
- Agent complaint handling
- Admin oversight and resolution

## Agent Network System

### Agent Discovery
- **Agent Listings**: Browse available agents (`AgentsList.tsx`)
- **Agent Profiles**: Detailed agent information
- **Agent Selection**: Choose agents for properties (`SelectAgent.tsx`)
- **Reviews**: Agent rating and review system (`ReviewAgent.tsx`)

### Agent Management
- **Find Agents**: Location-based agent discovery (`FindAgent.tsx`)
- **Agent Requests**: Request agent services
- **Profile Management**: Agent profile updates

## Tenant Management

### Tenant Onboarding
**Features:**
- Multi-step tenant verification process
- Document upload and verification
- Landlord details collection
- Property information gathering

**Components:**
- `TenantOnboarding.tsx` - Main onboarding flow
- `TenantVerification.tsx` - Verification process
- `ExternalTenantForm.tsx` - External tenant registration
- **Verification Steps:**
  - `LandlordDetailsStep.tsx` - Landlord information
  - `PropertyDetailsStep.tsx` - Property details
  - `TenancyDetailsStep.tsx` - Tenancy information

### Tenant Operations
- `TenantApprovalRequests.tsx` - Approval workflow
- `TenantSupport.tsx` - Dedicated support system
- Profile management and updates

## Navigation & Layout

### Navigation System
**Features:**
- Responsive navigation menu
- Role-based menu items
- Dropdown navigation with hover effects
- Mobile-friendly design

**Components:**
- `Header.tsx` - Main header with navigation
- `NavigationMenu.tsx` - Desktop navigation
- `MobileMenu.tsx` - Mobile navigation
- `Logo.tsx` - Brand logo component
- **Navigation Configuration:**
  - `navigationConfig.ts` - Menu structure definition
  - `DropdownNavItem.tsx` - Dropdown menu items
  - `SimpleNavItem.tsx` - Simple navigation links

### Layout Components
- `Layout.tsx` - Main layout wrapper
- `Footer.tsx` - Site footer
- `UserActions.tsx` - User authentication actions
- Responsive design with mobile optimization

## Home Page & Landing

### Landing Page Features
**Components:**
- `HeroSection.tsx` - Main hero banner with 3D animations
- `FeaturedProperties.tsx` - Showcase selected properties
- `Features.tsx` - Platform feature highlights
- `Articles.tsx` - Content and blog articles

### 3D Animations
- `MissionAnimation.tsx` - Interactive 3D mission statement
- React Three Fiber integration
- Smooth animations and transitions

## Notification System

### Real-time Notifications
**Features:**
- Socket.io powered real-time updates
- Multiple notification types
- Priority-based notifications
- Action-required notifications

**Components:**
- `NotificationDropdown.tsx` - Notification center
- `NotificationPreferences.tsx` - User preferences
- Integration with all major features

### Notification Types
- Message notifications
- Complaint updates
- System alerts
- Booking confirmations
- Status changes

## File Management

### File Upload System
**Features:**
- Secure file uploads
- Multiple file type support
- Size validation and compression
- File preview and download

**Supported File Types:**
- Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- Images: PNG, JPG, JPEG, GIF
- Media: MP4, MP3
- Archives: ZIP
- Text: TXT, CSV

### Security Features
- File type validation
- Size limits (10MB)
- Secure filename generation
- Access control and permissions

## Search & Filtering

### Advanced Search
**Features:**
- Property search with multiple criteria
- Location-based filtering
- Price range filtering
- Property type selection
- Advanced filter combinations

### Location Services
- Postcode lookup integration
- Map integration for property locations
- Office location mapping (`OfficeMap.tsx`)

## Utility Features

### UI Components
Comprehensive set of reusable UI components:
- **Form Components**: Input, Label, Textarea, Select, Checkbox, Radio
- **Layout Components**: Card, Sheet, Dialog, Drawer, Tabs
- **Data Display**: Table, Badge, Avatar, Progress, Chart
- **Navigation**: Breadcrumb, Pagination, Command menu
- **Feedback**: Toast, Alert, Loading spinners
- **Interactive**: Button variants, Toggle, Switch, Slider

### Custom Hooks
- `useAuthGuard.tsx` - Route protection
- `useComplaintNotifications.tsx` - Complaint updates
- `useDropdownHover.tsx` - Hover interactions
- `useNotificationSocket.ts` - Real-time notifications
- `usePostcodeLookup.ts` - Address validation
- `use-mobile.tsx` - Responsive design helper

### Utility Functions
- `utils.ts` - Common utility functions
- Form validation and data processing
- Date formatting and manipulation
- String processing utilities

## Page Structure

### Authentication Pages
- `Login.tsx` - User login
- `Register.tsx` - User registration
- `ForgotPassword.tsx` - Password reset
- `VerifyEmail.tsx` - Email verification

### Property Pages
- `Properties.tsx` - Property listings
- `PropertyDetails.tsx` - Property details
- `ListProperty.tsx` - List new property
- `PostProperty.tsx` - Post property
- `MyProperties.tsx` - Owner properties
- `Saved.tsx` - Saved properties

### Communication Pages
- `Messages.tsx` - Message center
- `Contact.tsx` - Contact forms
- `ContactAgent.tsx` - Agent communication

### User Management Pages
- `ProfileSetup.tsx` - Profile configuration
- `SelectRole.tsx` - Role selection
- Various dashboard pages for each role

### Information Pages
- `Help.tsx` - Help and support
- `Privacy.tsx` - Privacy policy
- `Terms.tsx` - Terms of service
- `Article.tsx` - Content articles
- `NotFound.tsx` - 404 error page

## API Integration

### Service Layer
Organized API services for different features:
- `api.ts` - Core API functions
- `adminApi.ts` - Admin-specific operations
- `complaintsApi.ts` - Complaint management
- `messagingApi.ts` - Messaging operations
- `postcodeApi.ts` - Address lookup
- `tenantApprovalApi.ts` - Tenant workflows
- `tenantNotifications.ts` - Notification services
- `tenantVerificationApi.ts` - Verification processes

### Error Handling
- Comprehensive error handling
- User-friendly error messages
- Retry mechanisms for failed requests
- Loading states and feedback

## Performance Optimizations

### Code Splitting
- Route-based code splitting
- Lazy loading of components
- Dynamic imports for large features

### Caching
- React Query for data caching
- Image optimization and caching
- Local storage for user preferences

### Responsive Design
- Mobile-first approach
- Responsive breakpoints
- Touch-friendly interfaces
- Progressive web app features

## Security Features

### Data Protection
- Input validation and sanitization
- XSS protection
- CSRF protection
- Secure file uploads

### Access Control
- Role-based permissions
- Route protection
- API endpoint security
- Session management

## Development Features

### Development Tools
- TypeScript for type safety
- ESLint for code quality
- Responsive design testing
- Component documentation

### Build Process
- Vite for fast development
- Hot module replacement
- Production optimizations
- Asset optimization

## Future Enhancements

### Planned Features
- Advanced analytics dashboard
- Integration with external services
- Enhanced 3D visualizations
- Mobile application
- Advanced reporting tools

### Scalability Considerations
- Modular architecture
- Reusable component library
- Efficient state management
- Performance monitoring

---

This documentation covers the complete frontend implementation of the property management platform, showcasing a comprehensive solution for property management, tenant relations, and real estate operations with modern web technologies and best practices.