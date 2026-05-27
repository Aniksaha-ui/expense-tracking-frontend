import { CalendarDays, CircleCheck, CircleAlert, UserPlus, Users } from 'lucide-react'

export const crmStats = [
  {
    label: 'Total',
    value: '14',
    icon: Users,
    tone: 'blue',
  },
  {
    label: 'New This Month',
    value: '3',
    icon: UserPlus,
    tone: 'green',
  },
  {
    label: 'Active',
    value: '12',
    icon: CircleCheck,
    tone: 'emerald',
  },
  {
    label: 'Upcoming Follow-ups',
    value: '0',
    icon: CalendarDays,
    tone: 'cyan',
  },
  {
    label: 'Inactive',
    value: '2',
    icon: CircleAlert,
    tone: 'amber',
  },
]

export const growthMonths = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']

export const sources = [
  { label: 'Cold Call', value: 8, color: '#18c56e' },
  { label: 'Direct', value: 17, color: '#3b82f6' },
  { label: 'Partner', value: 8, color: '#f7a713' },
  { label: 'Referral', value: 33, color: '#ff454a' },
  { label: 'Trade Show', value: 8, color: '#9b5cf6' },
  { label: 'Website', value: 25, color: '#14b8d4' },
]

export const recentlyAdded = [
  { id: 1, name: 'Robert C B', meta: 'robert@bfamily.net', source: 'Referral', status: 'Active' },
  { id: 2, name: 'fggfg', meta: 'fgfg@fefefe.com  ·  admin', source: 'Referral', status: 'Active' },
  { id: 3, name: 'dwed', meta: '-', status: 'Inactive' },
  { id: 4, name: 'Debasish Acharya', meta: 'acharyasales2211@gmail.com', status: 'Active' },
  { id: 5, name: 'TechNova Solutions', meta: 'billing@technova.com  ·  Operations User', source: 'Website', status: 'Active' },
  { id: 6, name: 'Meridian Retail Group', meta: 'accounts@meridianrg.com  ·  Sales Executive', source: 'Referral', status: 'Active' },
  { id: 7, name: 'GlobalEdge Logistics', meta: 'finance@globaledge.io  ·  admin', source: 'Direct', status: 'Active' },
  { id: 8, name: 'Apex Healthcare Ltd', meta: 'ap@apexhealthcare.co.uk  ·  Operations User', source: 'Partner', status: 'Active' },
  { id: 9, name: 'BlueSky Capital', meta: 'ops@blueskycap.com  ·  Sales Executive', source: 'Cold Call', status: 'Active' },
  { id: 10, name: 'Sunrise Manufacturing', meta: 'purchase@sunrisemfg.com  ·  admin', source: 'Trade Show', status: 'Active' },
]

export const inactiveAccounts = [
  { id: 1, name: 'Meridian Retail Group', meta: 'accounts@meridianrg.com  ·  Sales Executive', status: 'Active' },
  { id: 2, name: 'GlobalEdge Logistics', meta: 'finance@globaledge.io  ·  admin', status: 'Active' },
  { id: 3, name: 'BlueSky Capital', meta: 'ops@blueskycap.com  ·  Sales Executive', status: 'Active' },
  { id: 4, name: 'Sunrise Manufacturing', meta: 'purchase@sunrisemfg.com  ·  admin', status: 'Active' },
  { id: 5, name: 'DataStream Analytics', meta: 'finance@datastream.ai  ·  Operations User', status: 'Active' },
  { id: 6, name: 'Pinnacle Consulting', meta: 'accounts@pinnaclecon.com  ·  Sales Executive', status: 'Inactive' },
  { id: 7, name: 'Nexus Properties DMCC', meta: 'ap@nexusprops.ae  ·  admin', status: 'Active' },
  { id: 8, name: 'Quantum Defense Systems', meta: 'contracts@quantumds.com  ·  Operations User', status: 'Active' },
]
