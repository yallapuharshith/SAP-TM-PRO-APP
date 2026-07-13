import {
  BarChart3,
  BookOpenCheck,
  Gauge,
  LayoutDashboard,
  Settings,
} from 'lucide-react';

export const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Study', path: '/study', icon: BookOpenCheck },
  { label: 'Exam', path: '/exam', icon: Gauge },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Settings', path: '/settings', icon: Settings },
];
