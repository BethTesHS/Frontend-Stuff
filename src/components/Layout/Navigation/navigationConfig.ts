
import { 
  Search, 
  Building, 
  TrendingUp,
  Info,
  Heart,
  Bed
} from 'lucide-react';

export const navigationDropdowns = [
  {
    key: 'findAgent',
    icon: Search,
    label: 'Find Agent',
    iconColor: 'text-blue-500',
    options: [
      { to: '/find-agent', label: 'Find Estate Agent' }
    ]
  },
  {
    key: 'agency',
    icon: Building,
    label: 'Agency',
    iconColor: 'text-indigo-500',
    options: [
      { to: '/agency-profile', label: 'Learn More' },
      { to: '/agency-registration', label: 'Create Profile' }
    ]
  },
  {
    key: 'properties',
    icon: Building,
    label: 'Properties',
    iconColor: 'text-purple-500',
    options: [
      { to: '/properties?type=buy', label: 'Buy' },
      { to: '/properties?type=rent', label: 'Rent' },
      { to: '/properties?type=sell', label: 'Sell' }
    ]
  },
  {
    key: 'rooms',
    icon: Bed,
    label: 'Rooms',
    iconColor: 'text-orange-500',
    options: [
      { to: '/rooms', label: 'Find Rooms' },
      { to: '/rooms/list', label: 'List a Room' }
    ]
  },
  {
    key: 'tenantSupport',
    icon: Info,
    label: 'Tenant Support',
    iconColor: 'text-emerald-500',
    options: [
      { to: '/tenant-support', label: 'Manage Your Tenancy' }
    ]
  },
  {
    key: 'saved',
    icon: Heart,
    label: 'Saved',
    iconColor: 'text-red-500',
    options: [
      { to: '/saved', label: 'View Saved Properties' }
    ]
  }
];
