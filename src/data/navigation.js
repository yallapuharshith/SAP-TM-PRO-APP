import {
  BarChart3,
  BriefcaseBusiness,
  BookOpenCheck,
  FlaskConical,
  Gauge,
  LayoutDashboard,
  MessageSquareText,
  Settings,
} from 'lucide-react';

export const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
  { label: 'Study Notes', path: '/study-notes?section=study', icon: BookOpenCheck },
  { label: 'Viva Preparation', path: '/study-notes?section=viva', icon: MessageSquareText },
  { label: 'Hands-on Labs', path: '/hands-on-labs', icon: FlaskConical },
  { label: 'Capstone Projects', path: '/capstone-projects', icon: BriefcaseBusiness },
  { label: 'Practice MCQ', path: '/exam', icon: Gauge },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Settings', path: '/settings', icon: Settings },
];
