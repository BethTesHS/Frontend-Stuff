# Agency Dashboard - Complete Backend Schema

> **Generated on:** 2025-10-13
> **Purpose:** Comprehensive database schema and API specifications for the Agency Management System

---

## Table of Contents
1. [Database Schema](#database-schema)
2. [Entity Relationships](#entity-relationships)
3. [API Endpoints](#api-endpoints)
4. [Notification System](#notification-system)
5. [Authentication & Authorization](#authentication--authorization)

---

## Database Schema

### 1. Agencies Table
```sql
CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    website VARCHAR(255),
    logo_url VARCHAR(500),

    -- Theme customization
    theme_primary_color VARCHAR(7),
    theme_secondary_color VARCHAR(7),
    theme_logo_url VARCHAR(500),

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT slug_format CHECK (slug ~* '^[a-z0-9-]+$')
);

CREATE INDEX idx_agencies_slug ON agencies(slug);
CREATE INDEX idx_agencies_status ON agencies(status);
```

### 2. Agency Admins Table
```sql
CREATE TABLE agency_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'manager')),
    avatar_url VARCHAR(500),

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    last_active_at TIMESTAMP,

    -- Timestamps
    join_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(agency_id, email)
);

CREATE INDEX idx_agency_admins_agency_id ON agency_admins(agency_id);
CREATE INDEX idx_agency_admins_email ON agency_admins(email);
CREATE INDEX idx_agency_admins_role ON agency_admins(role);
```

### 3. Agents Table
```sql
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    avatar_url VARCHAR(500),
    specialization VARCHAR(255),

    -- Performance metrics
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    total_sales INTEGER DEFAULT 0,
    monthly_target INTEGER DEFAULT 0,
    current_progress INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'away', 'busy', 'inactive')),

    -- Timestamps
    join_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(agency_id, email)
);

CREATE INDEX idx_agents_agency_id ON agents(agency_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_email ON agents(agency_id, email);
```

### 4. Properties Table
```sql
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,

    -- Property details
    title VARCHAR(500) NOT NULL,
    address TEXT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('buy', 'rent')),
    property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('house', 'flat', 'commercial')),

    -- Features
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    parking INTEGER DEFAULT 0,
    sqft INTEGER NOT NULL,

    -- Media
    images JSONB DEFAULT '[]',

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'rented')),

    -- Metrics
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,

    -- Timestamps
    date_added DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_properties_agency_id ON properties(agency_id);
CREATE INDEX idx_properties_agent_id ON properties(agent_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_price ON properties(price);
```

### 5. Tenants Table
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,

    -- Tenant information
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    avatar_url VARCHAR(500),

    -- Lease details
    lease_start_date DATE NOT NULL,
    lease_end_date DATE NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,

    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'inactive', 'terminated')),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(agency_id, property_id, email)
);

CREATE INDEX idx_tenants_agency_id ON tenants(agency_id);
CREATE INDEX idx_tenants_property_id ON tenants(property_id);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_lease_end ON tenants(lease_end_date);
```

### 6. Viewings Table
```sql
CREATE TABLE viewings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,

    -- Client information
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,

    -- Viewing details
    viewing_date DATE NOT NULL,
    viewing_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    notes TEXT,

    -- Status
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show')),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_viewings_agency_id ON viewings(agency_id);
CREATE INDEX idx_viewings_property_id ON viewings(property_id);
CREATE INDEX idx_viewings_agent_id ON viewings(agent_id);
CREATE INDEX idx_viewings_date ON viewings(viewing_date);
CREATE INDEX idx_viewings_status ON viewings(status);
```

### 7. Messages/Conversations Table
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group')),
    title VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL, -- Can be agent_id or admin_id
    participant_type VARCHAR(20) NOT NULL CHECK (participant_type IN ('agent', 'admin', 'client')),
    role VARCHAR(255), -- e.g., "Agent", "Client", "Admin"
    status VARCHAR(20) DEFAULT 'online' CHECK (status IN ('online', 'offline', 'away')),

    -- Timestamps
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(conversation_id, participant_id, participant_type)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_avatar_url VARCHAR(500),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,

    -- Timestamps
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_agency_id ON conversations(agency_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_conv_participants_conversation_id ON conversation_participants(conversation_id);
```

### 8. Reports Table
```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('sales', 'performance', 'financial', 'market', 'custom')),
    description TEXT,

    -- Report configuration
    frequency VARCHAR(20) DEFAULT 'once' CHECK (frequency IN ('once', 'daily', 'weekly', 'monthly', 'quarterly')),
    is_scheduled BOOLEAN DEFAULT FALSE,

    -- Report metadata
    status VARCHAR(20) DEFAULT 'generating' CHECK (status IN ('ready', 'generating', 'scheduled', 'error')),
    file_url VARCHAR(500),
    file_size_mb DECIMAL(10,2),
    download_count INTEGER DEFAULT 0,

    -- Report options
    include_charts BOOLEAN DEFAULT TRUE,
    include_raw_data BOOLEAN DEFAULT FALSE,
    email_delivery BOOLEAN DEFAULT FALSE,

    -- Timestamps
    last_generated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_agency_id ON reports(agency_id);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_is_scheduled ON reports(is_scheduled);
```

### 9. Analytics Data Tables
```sql
-- Revenue tracking
CREATE TABLE revenue_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,

    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'sale', 'rental', 'commission'
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_month CHECK (month >= 1 AND month <= 12)
);

CREATE INDEX idx_revenue_agency_id ON revenue_records(agency_id);
CREATE INDEX idx_revenue_agent_id ON revenue_records(agent_id);
CREATE INDEX idx_revenue_date ON revenue_records(year, month);

-- Performance metrics
CREATE TABLE agent_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,

    sales_count INTEGER DEFAULT 0,
    revenue DECIMAL(15,2) DEFAULT 0,
    viewings_conducted INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(agent_id, month, year)
);

CREATE INDEX idx_agent_perf_agent_id ON agent_performance(agent_id);
CREATE INDEX idx_agent_perf_date ON agent_performance(year, month);
```

### 10. Notifications Table
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL, -- Can be admin_id or agent_id
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('admin', 'agent')),

    -- Notification content
    type VARCHAR(50) NOT NULL, -- e.g., 'viewing_scheduled', 'message_received', 'report_ready'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    -- Metadata
    related_entity_type VARCHAR(50), -- e.g., 'viewing', 'message', 'report'
    related_entity_id UUID,

    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, recipient_type);
CREATE INDEX idx_notifications_agency_id ON notifications(agency_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### 11. Settings Table
```sql
CREATE TABLE agency_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES agency_admins(id) ON DELETE CASCADE,

    -- Notification preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,

    -- Theme preferences
    dark_mode BOOLEAN DEFAULT FALSE,

    -- Other settings
    settings_data JSONB DEFAULT '{}',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(agency_id, admin_id)
);

CREATE INDEX idx_agency_settings_agency_id ON agency_settings(agency_id);
CREATE INDEX idx_agency_settings_admin_id ON agency_settings(admin_id);
```

---

## Entity Relationships

### Relationship Diagram (ERD)
```
agencies (1) ──┬──< (M) agency_admins
               ├──< (M) agents
               ├──< (M) properties
               ├──< (M) tenants
               ├──< (M) viewings
               ├──< (M) conversations
               ├──< (M) reports
               ├──< (M) notifications
               └──< (M) agency_settings

agents (1) ───┬──< (M) properties (assigned)
              ├──< (M) viewings
              └──< (M) agent_performance

properties (1) ──┬──< (M) tenants
                 └──< (M) viewings

conversations (1) ──┬──< (M) conversation_participants
                    └──< (M) messages

reports (1) ──< (M) revenue_records (optional)
```

### Key Relationships
1. **Agency → Admins**: One-to-many (agency can have multiple admins)
2. **Agency → Agents**: One-to-many (agency employs multiple agents)
3. **Agency → Properties**: One-to-many (agency manages multiple properties)
4. **Agent → Properties**: One-to-many (agent handles multiple properties)
5. **Property → Tenants**: One-to-many (property can have historical tenants)
6. **Property → Viewings**: One-to-many (property can have multiple viewings)
7. **Agent → Viewings**: One-to-many (agent conducts multiple viewings)
8. **Conversation → Messages**: One-to-many (conversation contains multiple messages)
9. **Conversation → Participants**: Many-to-many (through junction table)

---

## API Endpoints

### Authentication Endpoints
```
POST   /api/auth/agency/register      - Register new agency
POST   /api/auth/agency/login         - Agency admin login
POST   /api/auth/agency/logout        - Agency admin logout
POST   /api/auth/agency/refresh       - Refresh JWT token
POST   /api/auth/agency/forgot-password - Request password reset
POST   /api/auth/agency/reset-password  - Reset password
GET    /api/auth/agency/verify-email    - Verify email address
```

### Agency Management
```
GET    /api/agencies/:slug             - Get agency by slug (public)
GET    /api/agencies/profile           - Get authenticated agency profile
PUT    /api/agencies/profile           - Update agency profile
POST   /api/agencies/logo              - Upload agency logo
DELETE /api/agencies/logo              - Delete agency logo
GET    /api/agencies/theme             - Get agency theme settings
PUT    /api/agencies/theme             - Update agency theme
```

### Agency Admins Management
```
GET    /api/agency/admins              - List all admins
POST   /api/agency/admins              - Add new admin
GET    /api/agency/admins/:id          - Get admin details
PUT    /api/agency/admins/:id          - Update admin
DELETE /api/agency/admins/:id          - Remove admin
PUT    /api/agency/admins/:id/role     - Update admin role
```

### Agents Management
```
GET    /api/agency/agents              - List all agents
POST   /api/agency/agents              - Add new agent
GET    /api/agency/agents/:id          - Get agent details
PUT    /api/agency/agents/:id          - Update agent
DELETE /api/agency/agents/:id          - Delete agent
GET    /api/agency/agents/:id/performance - Get agent performance metrics
PUT    /api/agency/agents/:id/status   - Update agent status
GET    /api/agency/agents/stats        - Get agent statistics
```

### Properties Management
```
GET    /api/agency/properties          - List properties (with filters)
POST   /api/agency/properties          - Add new property
GET    /api/agency/properties/:id      - Get property details
PUT    /api/agency/properties/:id      - Update property
DELETE /api/agency/properties/:id      - Delete property
PUT    /api/agency/properties/:id/status - Update property status
POST   /api/agency/properties/:id/images - Upload property images
DELETE /api/agency/properties/:id/images/:imageId - Delete property image
GET    /api/agency/properties/stats    - Get property statistics
```

**Query Parameters for GET /api/agency/properties:**
- `search` - Search in title/address
- `type` - Filter by buy/rent
- `status` - Filter by status
- `property_type` - Filter by house/flat/commercial
- `agent_id` - Filter by agent
- `min_price` - Minimum price
- `max_price` - Maximum price
- `page` - Page number
- `limit` - Items per page

### Tenants Management
```
GET    /api/agency/tenants             - List all tenants
POST   /api/agency/tenants             - Add new tenant
GET    /api/agency/tenants/:id         - Get tenant details
PUT    /api/agency/tenants/:id         - Update tenant
DELETE /api/agency/tenants/:id         - Remove tenant
GET    /api/agency/tenants/stats       - Get tenant statistics
GET    /api/agency/tenants/expiring    - Get leases expiring soon
```

### Viewings Management
```
GET    /api/agency/viewings            - List all viewings
POST   /api/agency/viewings            - Schedule new viewing
GET    /api/agency/viewings/:id        - Get viewing details
PUT    /api/agency/viewings/:id        - Update viewing
DELETE /api/agency/viewings/:id        - Cancel viewing
PUT    /api/agency/viewings/:id/status - Update viewing status
GET    /api/agency/viewings/calendar   - Get viewings by date
GET    /api/agency/viewings/stats      - Get viewing statistics
```

**Query Parameters for GET /api/agency/viewings:**
- `search` - Search client name, property, agent
- `status` - Filter by status
- `date` - Filter by date
- `agent_id` - Filter by agent
- `property_id` - Filter by property
- `page` - Page number
- `limit` - Items per page

### Messages Management
```
GET    /api/agency/conversations       - List all conversations
POST   /api/agency/conversations       - Create new conversation
GET    /api/agency/conversations/:id   - Get conversation details
GET    /api/agency/conversations/:id/messages - Get conversation messages
POST   /api/agency/conversations/:id/messages - Send message
PUT    /api/agency/messages/:id/read   - Mark message as read
DELETE /api/agency/conversations/:id   - Delete conversation
POST   /api/agency/conversations/:id/participants - Add participant
DELETE /api/agency/conversations/:id/participants/:userId - Remove participant
```

### Reports Management
```
GET    /api/agency/reports             - List all reports
POST   /api/agency/reports             - Create new report
GET    /api/agency/reports/:id         - Get report details
GET    /api/agency/reports/:id/download - Download report file
DELETE /api/agency/reports/:id         - Delete report
GET    /api/agency/reports/templates   - Get available report templates
GET    /api/agency/reports/stats       - Get report statistics
```

**Report Types:**
- `sales` - Sales performance report
- `performance` - Agent performance report
- `financial` - Financial summary report
- `market` - Market analysis report
- `custom` - Custom report

### Analytics Endpoints
```
GET    /api/agency/analytics/dashboard - Get dashboard analytics
GET    /api/agency/analytics/revenue   - Get revenue data
GET    /api/agency/analytics/agents    - Get agent performance data
GET    /api/agency/analytics/properties - Get property analytics
GET    /api/agency/analytics/conversions - Get conversion funnel data
GET    /api/agency/analytics/market-trends - Get market trends
```

**Query Parameters:**
- `start_date` - Start date (YYYY-MM-DD)
- `end_date` - End date (YYYY-MM-DD)
- `period` - '7d', '30d', '90d', '1y'

### Notifications Endpoints
```
GET    /api/agency/notifications       - List notifications
GET    /api/agency/notifications/unread-count - Get unread count
PUT    /api/agency/notifications/:id/read - Mark as read
PUT    /api/agency/notifications/mark-all-read - Mark all as read
DELETE /api/agency/notifications/:id   - Delete notification
POST   /api/agency/notifications/test  - Send test notification
```

### Settings Endpoints
```
GET    /api/agency/settings            - Get settings
PUT    /api/agency/settings            - Update settings
PUT    /api/agency/settings/notifications - Update notification preferences
PUT    /api/agency/settings/password   - Change password
POST   /api/agency/settings/2fa/enable - Enable 2FA
POST   /api/agency/settings/2fa/disable - Disable 2FA
```

---

## Notification System

### Notification Types
```typescript
enum NotificationType {
  // Viewing notifications
  VIEWING_SCHEDULED = 'viewing_scheduled',
  VIEWING_CONFIRMED = 'viewing_confirmed',
  VIEWING_COMPLETED = 'viewing_completed',
  VIEWING_CANCELLED = 'viewing_cancelled',
  VIEWING_REMINDER = 'viewing_reminder',

  // Message notifications
  NEW_MESSAGE = 'new_message',

  // Property notifications
  PROPERTY_INQUIRY = 'property_inquiry',
  PROPERTY_LIKED = 'property_liked',
  PROPERTY_VIEWED = 'property_viewed',

  // Report notifications
  REPORT_READY = 'report_ready',
  REPORT_SCHEDULED = 'report_scheduled',
  REPORT_ERROR = 'report_error',

  // Agent notifications
  AGENT_PERFORMANCE_MILESTONE = 'agent_performance_milestone',
  AGENT_TARGET_REACHED = 'agent_target_reached',

  // Tenant notifications
  LEASE_EXPIRING_SOON = 'lease_expiring_soon',
  RENT_DUE = 'rent_due',
  TENANT_APPLICATION = 'tenant_application',

  // System notifications
  ADMIN_ADDED = 'admin_added',
  ADMIN_REMOVED = 'admin_removed',
  SYSTEM_UPDATE = 'system_update',
  SECURITY_ALERT = 'security_alert'
}
```

### Notification Payload Structure
```typescript
interface NotificationPayload {
  id: string;
  agency_id: string;
  recipient_id: string;
  recipient_type: 'admin' | 'agent';
  type: NotificationType;
  title: string;
  message: string;
  related_entity_type?: string;
  related_entity_id?: string;
  is_read: boolean;
  created_at: Date;
  read_at?: Date;
}
```

### Real-time Notification Delivery
**WebSocket Events:**
```
// Client subscribes to notifications
WS_CONNECT: /ws/agency/:agencyId/notifications?token=<jwt>

// Server events
notification:new - New notification received
notification:read - Notification marked as read
notification:deleted - Notification deleted
notification:count - Unread count updated

// Client events
notification:mark_read - Mark notification as read
notification:mark_all_read - Mark all as read
notification:subscribe - Subscribe to specific types
```

### Email Notification Templates
1. **Viewing Scheduled**: Email to agent with viewing details
2. **Viewing Reminder**: Reminder 24h before viewing
3. **Report Ready**: Email with report download link
4. **Lease Expiring**: Alert 30 days before lease end
5. **New Inquiry**: Property inquiry notification

---

## Authentication & Authorization

### JWT Token Structure
```typescript
interface JWTPayload {
  sub: string;          // Admin ID
  agency_id: string;    // Agency ID
  role: 'owner' | 'admin' | 'manager';
  email: string;
  iat: number;          // Issued at
  exp: number;          // Expires at
}
```

### Token Configuration
- **Access Token**: 1 hour expiry
- **Refresh Token**: 7 days expiry
- **Algorithm**: HS256 or RS256

### Authorization Roles & Permissions

#### Owner Role
- Full access to all features
- Can add/remove admins
- Can delete agency
- Can access billing

#### Admin Role
- Can manage agents
- Can manage properties
- Can manage tenants
- Can manage viewings
- Can view all reports
- Can manage conversations
- Cannot manage other admins

#### Manager Role
- Can view agents (limited edit)
- Can manage properties
- Can manage viewings
- Can view reports
- Limited conversation access
- Cannot manage admins

### Permission Matrix
```
Feature               | Owner | Admin | Manager
---------------------|-------|-------|--------
Agency Settings      |   ✓   |   ✗   |   ✗
Admin Management     |   ✓   |   ✗   |   ✗
Agent Management     |   ✓   |   ✓   |   ○
Property Management  |   ✓   |   ✓   |   ✓
Tenant Management    |   ✓   |   ✓   |   ✓
Viewing Management   |   ✓   |   ✓   |   ✓
Messages (All)       |   ✓   |   ✓   |   ○
Reports (Create)     |   ✓   |   ✓   |   ○
Reports (View)       |   ✓   |   ✓   |   ✓
Analytics            |   ✓   |   ✓   |   ✓
Notifications        |   ✓   |   ✓   |   ✓
Settings             |   ✓   |   ✓   |   ✓

✓ = Full Access
○ = Limited Access
✗ = No Access
```

### Security Middleware
```typescript
// Authentication middleware
authenticateAgency() // Verify JWT token

// Authorization middleware
authorizeRole(['owner', 'admin']) // Require specific roles
requireAgencyAccess() // Verify user belongs to agency
requireEntityOwnership() // Verify user owns resource
```

---

## Additional Considerations

### Data Validation Rules
1. **Email**: Valid email format, unique per agency
2. **Phone**: Valid phone format (international or local)
3. **Slug**: Lowercase alphanumeric with hyphens, unique
4. **Dates**: Valid date ranges (lease_end > lease_start)
5. **Prices**: Positive decimal values
6. **Status**: Must be from predefined enum values

### Soft Delete Strategy
- **Agents**: Soft delete (set status to 'inactive')
- **Properties**: Soft delete (set status to 'archived')
- **Conversations**: Hard delete with cascade
- **Messages**: Hard delete with conversation
- **Notifications**: Soft delete (is_deleted flag)

### Performance Optimizations
1. **Indexes**: Created on frequently queried fields
2. **Pagination**: Default 20 items per page
3. **Caching**: Redis for analytics data (1-hour TTL)
4. **Query Optimization**: Use joins instead of N+1 queries
5. **File Storage**: AWS S3/CloudFlare R2 for images and reports

### Backup Strategy
- **Database**: Daily automated backups
- **Files**: Versioned storage with lifecycle policies
- **Retention**: 30 days for backups

---

## Example API Requests

### 1. Login Agency Admin
```http
POST /api/auth/agency/login
Content-Type: application/json

{
  "email": "admin@agency.com",
  "password": "securepassword123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "admin@agency.com",
      "role": "owner",
      "agency_id": "uuid"
    }
  }
}
```

### 2. Create Agent
```http
POST /api/agency/agents
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sarah Wilson",
  "email": "sarah@agency.com",
  "phone": "+44 20 1234 5678",
  "specialization": "Luxury Properties"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Sarah Wilson",
    "email": "sarah@agency.com",
    "phone": "+44 20 1234 5678",
    "specialization": "Luxury Properties",
    "status": "active",
    "rating": 0,
    "total_sales": 0,
    "created_at": "2025-10-13T10:00:00Z"
  }
}
```

### 3. Get Analytics Dashboard
```http
GET /api/agency/analytics/dashboard?period=30d
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "total_revenue": 318000,
    "revenue_growth": 13.6,
    "total_properties": 91,
    "total_viewings": 644,
    "conversion_rate": 10.0,
    "active_agents": 3,
    "revenue_data": [...],
    "property_type_distribution": [...],
    "agent_performance": [...]
  }
}
```

### 4. Create Report
```http
POST /api/agency/reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Q3 Sales Performance",
  "type": "sales",
  "description": "Quarterly sales analysis",
  "frequency": "quarterly",
  "include_charts": true,
  "include_raw_data": false,
  "email_delivery": true
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Q3 Sales Performance",
    "type": "sales",
    "status": "generating",
    "created_at": "2025-10-13T10:00:00Z"
  },
  "message": "Report generation started"
}
```

---

## Schema Version
**Version:** 1.0.0
**Last Updated:** 2025-10-13
**Compatibility:** PostgreSQL 12+, MySQL 8+

---

## Notes for Backend Implementation
1. Use **UUID** for all primary keys for better scalability
2. Implement **soft deletes** where appropriate for data recovery
3. Use **transactions** for multi-step operations (e.g., creating property with images)
4. Implement **rate limiting** on authentication endpoints
5. Add **audit logs** for sensitive operations (admin changes, deletions)
6. Use **connection pooling** for database connections
7. Implement **request validation** using middleware (e.g., Joi, Zod)
8. Add **API versioning** (e.g., /api/v1/agency/...)
9. Implement **CORS** properly for frontend integration
10. Use **environment variables** for sensitive configuration
