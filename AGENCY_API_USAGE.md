# Agency Dashboard API Integration

This document provides usage examples for the newly integrated agency dashboard endpoints.

## Import the API

```typescript
import {
  agencyAgentsApi,
  agencyPropertiesApi,
  agencyTenantsApi,
  agencyViewingsApi,
  agencyNotificationsApi,
  agencyAnalyticsApi,
  agencyConversationsApi,
} from '@/services/agencyApi';
```

## Agents Management

### Get all agents
```typescript
const { agents, total } = await agencyAgentsApi.getAll('active');
```

### Create new agent
```typescript
const { agent } = await agencyAgentsApi.create({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+44123456789',
  specialization: 'Residential Sales',
  monthly_target: 50000,
});
```

### Get single agent
```typescript
const { agent } = await agencyAgentsApi.getById('agent-id');
```

### Update agent
```typescript
const { agent } = await agencyAgentsApi.update('agent-id', {
  name: 'Jane Doe',
  status: 'active',
});
```

### Deactivate agent
```typescript
const { message } = await agencyAgentsApi.deactivate('agent-id');
```

## Properties Management

### Get all properties with filters
```typescript
const { properties, total, page, pages } = await agencyPropertiesApi.getAll({
  page: 1,
  limit: 20,
  status: 'available',
  type: 'rent',
  agent_id: 'agent-123',
  search: 'london',
});
```

### Create new property
```typescript
const { property } = await agencyPropertiesApi.create({
  title: '3 Bed Modern Flat',
  address: '123 Main Street, London',
  price: 450000,
  type: 'buy',
  property_type: 'flat',
  bedrooms: 3,
  bathrooms: 2,
  parking: 1,
  sqft: 1200,
  agent_id: 'agent-123',
  images: ['url1', 'url2'],
});
```

### Update property
```typescript
const { property } = await agencyPropertiesApi.update('property-id', {
  price: 475000,
  status: 'sold',
});
```

## Tenants Management

### Get all tenants
```typescript
const { tenants, total } = await agencyTenantsApi.getAll({
  status: 'active',
  property_id: 'property-123',
});
```

### Create new tenant
```typescript
const { tenant } = await agencyTenantsApi.create({
  property_id: 'property-123',
  name: 'Alice Smith',
  email: 'alice@example.com',
  phone: '+44123456789',
  lease_start_date: '2025-01-01',
  lease_end_date: '2026-01-01',
  monthly_rent: 1500,
});
```

## Viewings Management

### Get all viewings
```typescript
const { viewings, total } = await agencyViewingsApi.getAll({
  status: 'scheduled',
  agent_id: 'agent-123',
  property_id: 'property-123',
  date: '2025-10-15',
});
```

### Schedule new viewing
```typescript
const { viewing } = await agencyViewingsApi.create({
  property_id: 'property-123',
  agent_id: 'agent-123',
  client_name: 'Bob Johnson',
  client_email: 'bob@example.com',
  client_phone: '+44123456789',
  viewing_date: '2025-10-20',
  viewing_time: '14:00',
  duration_minutes: 30,
  notes: 'Client interested in quick move-in',
});
```

### Update viewing status
```typescript
const { viewing } = await agencyViewingsApi.updateStatus('viewing-id', 'confirmed');
```

## Notifications

### Get all notifications
```typescript
const { notifications, total, page, pages } = await agencyNotificationsApi.getAll({
  page: 1,
  limit: 20,
  unread_only: true,
});
```

### Mark notification as read
```typescript
const { message } = await agencyNotificationsApi.markAsRead('notification-id');
```

## Analytics Dashboard

### Get dashboard analytics
```typescript
const analytics = await agencyAnalyticsApi.getDashboard('30d');
console.log(analytics.total_agents);
console.log(analytics.total_properties);
console.log(analytics.total_revenue);
```

## Conversations/Messaging

### Get all conversations
```typescript
const { conversations, total, page, pages } = await agencyConversationsApi.getAll({
  page: 1,
  limit: 20,
});
```

### Create new conversation
```typescript
const { conversation } = await agencyConversationsApi.create({
  type: 'agent_client',
  title: 'Property Inquiry - 123 Main St',
  participants: [
    { id: 'agent-123', type: 'agent', role: 'agent', status: 'active' },
    { id: 'client-456', type: 'client', role: 'client', status: 'active' },
  ],
});
```

### Get single conversation
```typescript
const { conversation } = await agencyConversationsApi.getById('conversation-id');
```

### Get conversation messages
```typescript
const { messages, total, page, pages } = await agencyConversationsApi.getMessages(
  'conversation-id',
  { page: 1, limit: 50 }
);
```

### Send message
```typescript
const { data: message } = await agencyConversationsApi.sendMessage('conversation-id', {
  content: 'Hello, how can I help you?',
  sender_id: 'agent-123',
  sender_name: 'John Doe',
  sender_avatar_url: 'https://example.com/avatar.jpg',
});
```

### Mark message as read
```typescript
const { message } = await agencyConversationsApi.markMessageAsRead(
  'conversation-id',
  'message-id'
);
```

### Add participant to conversation
```typescript
const { participant } = await agencyConversationsApi.addParticipant('conversation-id', {
  participant_id: 'user-789',
  participant_type: 'agent',
  role: 'support',
  status: 'active',
});
```

### Remove participant from conversation
```typescript
const { message } = await agencyConversationsApi.removeParticipant(
  'conversation-id',
  'participant-id',
  'agent'
);
```

## Error Handling

All API functions throw errors that can be caught:

```typescript
try {
  const { agents } = await agencyAgentsApi.getAll();
} catch (error) {
  console.error('Failed to fetch agents:', error.message);
}
```

## TypeScript Types

All request and response types are exported from the API file:

```typescript
import type {
  Agent,
  Property,
  Tenant,
  Viewing,
  Notification,
  DashboardAnalytics,
  Conversation,
  Message,
  Participant,
  PaginatedResponse,
} from '@/services/agencyApi';
```
