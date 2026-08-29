import {
  BarChart3,
  CalendarDays,
  Download,
  FolderKanban,
  Home,
  Settings,
} from "lucide-react";

export const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/analytics", label: "Charts", icon: BarChart3 },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/import-export", label: "Export", icon: Download },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export const MOBILE_NAV = [
  { href: "/", label: "Home", icon: Home, today: false },
  { href: "/today", label: "Today", icon: CalendarDays, today: true },
  { href: "/analytics", label: "Charts", icon: BarChart3, today: false },
  { href: "/projects", label: "Projects", icon: FolderKanban, today: false },
  { href: "/settings", label: "Settings", icon: Settings, today: false },
] as const;
