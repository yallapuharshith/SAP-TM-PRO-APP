import {
  Award,
  Bookmark,
  BookOpen,
  CheckCircle2,
  Flame,
  Layers,
  Medal,
  Target,
  Trophy,
} from 'lucide-react';

export const statCards = [
  {
    id: 'total-questions',
    title: 'Total Questions',
    value: '1,024',
    delta: '+84 this month',
    icon: Layers,
    tone: 'primary',
  },
  {
    id: 'completed',
    title: 'Completed',
    value: '286',
    delta: '27.9% coverage',
    icon: CheckCircle2,
    tone: 'success',
  },
  {
    id: 'accuracy',
    title: 'Accuracy',
    value: '78.4%',
    delta: '+4.2% from last week',
    icon: Target,
    tone: 'accent',
  },
  {
    id: 'xp',
    title: 'XP',
    value: '12,640',
    delta: 'Level pace: strong',
    icon: Trophy,
    tone: 'warning',
  },
  {
    id: 'current-level',
    title: 'Current Level',
    value: 'Advanced 2',
    delta: '340 XP to next level',
    icon: Medal,
    tone: 'primary',
  },
  {
    id: 'daily-streak',
    title: 'Daily Streak',
    value: '14 days',
    delta: 'Best streak: 21 days',
    icon: Flame,
    tone: 'danger',
  },
];

export const progressCards = [
  {
    id: 'study-progress',
    title: 'Study Progress',
    progress: 62,
    subtitle: 'Core TM concepts and freight order flows',
  },
  {
    id: 'mock-tests',
    title: 'Mock Tests',
    progress: 38,
    subtitle: 'Certification-style readiness cycles',
  },
  {
    id: 'bookmarks',
    title: 'Bookmarks Review',
    progress: 71,
    subtitle: 'Focused revision on weak topics',
  },
];

export const recentActivity = [
  {
    id: 'a1',
    label: 'Completed Road Freight Planning module',
    meta: 'Score 82% · 24 questions',
    time: '2h ago',
  },
  {
    id: 'a2',
    label: 'Attempted Mock Exam #07',
    meta: 'Score 74% · 60 questions',
    time: 'Yesterday',
  },
  {
    id: 'a3',
    label: 'Bookmarked charge management scenario',
    meta: 'Topic: Freight Cost Distribution',
    time: '2 days ago',
  },
  {
    id: 'a4',
    label: 'Unlocked Optimization Learner badge',
    meta: 'Milestone: 10 analytics sessions',
    time: '3 days ago',
  },
];

export const spotlightCards = [
  {
    id: 'stream-track',
    title: 'Accenture Stream Track',
    value: 'Week 3/8',
    icon: BookOpen,
  },
  {
    id: 'cert-readiness',
    title: 'Certification Readiness',
    value: 'Exam Window: 28 Days',
    icon: Award,
  },
  {
    id: 'bookmark-focus',
    title: 'Bookmark Focus',
    value: '19 Priority Questions',
    icon: Bookmark,
  },
];
