// src/constants/adminDashboard.ts

export const PENDING_VERIFICATIONS = [
  {
    id: '1',
    type: 'agent',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@properties.co.uk',
    phone: '+44 7700 900123',
    submittedAt: '2024-01-15',
    documents: ['ID', 'Certification', 'References'],
    status: 'pending'
  },
  {
    id: '2',
    type: 'owner',
    name: 'Michael Chen',
    email: 'michael.chen@gmail.com',
    phone: '+44 7700 900124',
    submittedAt: '2024-01-14',
    documents: ['Property Deed', 'ID', 'Proof of Address'],
    status: 'pending'
  },
  {
    id: '3',
    type: 'agent',
    name: 'Emma Williams',
    email: 'emma.williams@realestate.co.uk',
    phone: '+44 7700 900125',
    submittedAt: '2024-01-13',
    documents: ['ID', 'License', 'Insurance'],
    status: 'review'
  }
];

export const MOCK_MESSAGES_DATA = {
  contacts: [
    {
      id: "usr_001",
      name: "Sarah Jenkins",
      role: "Tenant",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      lastMessage: "Thank you, the plumber fixed the issue this morning.",
      timestamp: "2026-02-18T11:30:00Z",
      unreadCount: 0,
      isOnline: true
    },
    {
      id: "usr_002",
      name: "David Ochieng",
      role: "Owner",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      lastMessage: "When will the background check for the new applicant be ready?",
      timestamp: "2026-02-18T10:15:00Z",
      unreadCount: 2,
      isOnline: false
    },
    {
      id: "usr_003",
      name: "Amina Yusuf",
      role: "Buyer",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amina",
      lastMessage: "I would like to reschedule my viewing for tomorrow.",
      timestamp: "2026-02-17T16:45:00Z",
      unreadCount: 1,
      isOnline: true
    },
    {
      id: "usr_004",
      name: "Michael Chang",
      role: "Agent",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      lastMessage: "I've uploaded the new property photos to the dashboard.",
      timestamp: "2026-02-16T09:20:00Z",
      unreadCount: 0,
      isOnline: false
    }
  ],
  conversations: {
    "usr_001": [
      { id: "msg_101", senderId: "usr_001", text: "Hi Admin, the sink in apartment 4B is leaking again.", timestamp: "2026-02-17T08:00:00Z" },
      { id: "msg_102", senderId: "admin", text: "Hello Sarah, I'm sorry to hear that. I will dispatch the maintenance team immediately.", timestamp: "2026-02-17T08:15:00Z" },
      { id: "msg_103", senderId: "admin", text: "They should be there between 9 AM and 11 AM tomorrow.", timestamp: "2026-02-17T08:16:00Z" },
      { id: "msg_104", senderId: "usr_001", text: "Thank you, the plumber fixed the issue this morning.", timestamp: "2026-02-18T11:30:00Z" }
    ],
    "usr_002": [
      { id: "msg_201", senderId: "usr_002", text: "Good morning. Just following up on the Westlands property.", timestamp: "2026-02-18T10:10:00Z" },
      { id: "msg_202", senderId: "usr_002", text: "When will the background check for the new applicant be ready?", timestamp: "2026-02-18T10:15:00Z" }
    ],
    "usr_003": [
      { id: "msg_301", senderId: "admin", text: "Hi Amina, confirming your viewing for the Kilimani apartment today at 4 PM.", timestamp: "2026-02-17T10:00:00Z" },
      { id: "msg_302", senderId: "usr_003", text: "I would like to reschedule my viewing for tomorrow.", timestamp: "2026-02-17T16:45:00Z" }
    ],
    "usr_004": [
      { id: "msg_401", senderId: "usr_004", text: "Hey, the client loved the virtual tour.", timestamp: "2026-02-15T14:30:00Z" },
      { id: "msg_402", senderId: "admin", text: "That's great news! Do we need to update the listing images?", timestamp: "2026-02-15T14:45:00Z" },
      { id: "msg_403", senderId: "usr_004", text: "I've uploaded the new property photos to the dashboard.", timestamp: "2026-02-16T09:20:00Z" }
    ]
  }
};