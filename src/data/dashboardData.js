import { Briefcase, DollarSign, MapPin, Users } from 'lucide-react'

export const dashboardStats = [
  {
    title: 'Total Revenue',
    value: '$124,563',
    trend: '+14.5%',
    isPositive: true,
    icon: DollarSign,
  },
  {
    title: 'Active Projects',
    value: '45',
    trend: '+5.2%',
    isPositive: true,
    icon: Briefcase,
  },
  {
    title: 'Field Operations',
    value: '128',
    trend: '-2.4%',
    isPositive: false,
    icon: MapPin,
  },
  {
    title: 'Client Meetings',
    value: '312',
    trend: '+12.1%',
    isPositive: true,
    icon: Users,
  },
]

export const revenueGrowth = [
  { label: 'Jan', value: 41000 },
  { label: 'Feb', value: 50000 },
  { label: 'Mar', value: 45000 },
  { label: 'Apr', value: 58000 },
  { label: 'May', value: 56000 },
  { label: 'Jun', value: 72000 },
  { label: 'Jul', value: 80000 },
]

export const weeklyMeetings = [
  { label: 'Mon', value: 12 },
  { label: 'Tue', value: 19 },
  { label: 'Wed', value: 15 },
  { label: 'Thu', value: 25 },
  { label: 'Fri', value: 22 },
  { label: 'Sat', value: 8 },
  { label: 'Sun', value: 5 },
]

export const activityBreakdown = [
  { label: 'Client Meetings', value: 55, color: '#2563eb' },
  { label: 'Site Visits', value: 25, color: '#14b8a6' },
  { label: 'Conferences', value: 15, color: '#f59e0b' },
  { label: 'Other', value: 5, color: '#94a3b8' },
]

export const latestTrips = [
  {
    id: 1,
    destination: 'New York, USA',
    agent: 'Theresa Webb',
    date: 'Oct 12, 2025',
    status: 'Completed',
    cost: '$1,450',
  },
  {
    id: 2,
    destination: 'London, UK',
    agent: 'Cody Fisher',
    date: 'Oct 15, 2025',
    status: 'Active',
    cost: '$2,100',
  },
  {
    id: 3,
    destination: 'Tokyo, JP',
    agent: 'Esther Howard',
    date: 'Oct 18, 2025',
    status: 'Upcoming',
    cost: '$3,200',
  },
  {
    id: 4,
    destination: 'Berlin, DE',
    agent: 'Jenny Wilson',
    date: 'Oct 22, 2025',
    status: 'Upcoming',
    cost: '$1,100',
  },
]
