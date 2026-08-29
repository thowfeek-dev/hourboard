import type { Priority } from "@/lib/constants";

export interface TaskDTO {
  id: string;
  date: string;
  slotNumber: number;
  title: string;
  priority: Priority;
  done: boolean;
  hours: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  projectId: string | null;
  projectName?: string | null;
  projectColor?: string | null;
  tags: { id: string; name: string; color: string }[];
}

export interface DaySummary {
  date: string;
  weekday: string;
  tasksDone: number;
  totalHours: number;
  hitTarget: boolean;
  taskCount: number;
  energyLevel: number | null;
}

export interface DailyLogDTO {
  date: string;
  weekday: string;
  wins: string;
  blockers: string;
  carryForward: string;
  notes: string;
  energyLevel: number | null;
  tasks: TaskDTO[];
  totalHours: number;
  tasksDone: number;
  hitTarget: boolean;
}

export interface ProjectDTO {
  id: string;
  name: string;
  color: string;
  description: string | null;
  createdAt: string;
  taskCount: number;
  hours: number;
}

export interface TagDTO {
  id: string;
  name: string;
  color: string;
  taskCount: number;
  hours: number;
}

export interface SettingsDTO {
  dailyTargetTasks: number;
  dailyTargetHours: number;
  dailySlots: number;
  weekStartDay: 0 | 1 | 6;
  theme: "light" | "dark" | "system";
  defaultPriority: Priority;
  exportFormat: "pdf" | "csv" | "json";
  timeFormat: "12h" | "24h";
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  monthTarget: number;
}

export interface Statistics {
  totalTasks: number;
  totalHours: number;
  daysTracked: number;
  daysWithTasks: number;
  daysHitTarget: number;
  targetAchievementRate: number;
  tasksNeededForTarget: number;
  currentStreak: number;
  bestStreak: number;
  currentStreakStart: string | null;
  bestStreakStart: string | null;
  avgTasksPerDay: number;
  avgHoursPerDay: number;
  avgTaskDuration: number;
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
    unassigned: number;
  };
  weekdayPerformance: Record<
    string,
    { avgTasks: number; avgHours: number; daysTracked: number }
  >;
  projectStats: Record<
    string,
    { name: string; color: string; tasks: number; hours: number; completionRate: number }
  >;
  tagStats: Record<string, { name: string; color: string; tasks: number; hours: number }>;
  trends: {
    dates: string[];
    tasksCompleted: number[];
    hoursLogged: number[];
    movingAverage7: number[];
    movingAverage30: number[];
  };
  timeDistribution: Record<string, number>;
  monthlyHours: { month: string; hours: number }[];
  insights: {
    mostProductiveDay: string;
    mostProductiveWeek: { week: number; year: number; tasks: number };
    mostUsedPriority: "H" | "M" | "L";
    bestMonth: { month: string; tasks: number };
    consistencyScore: number;
    energyCorrelation: number;
    weekdayVsWeekend: number;
    projectedYearEnd: number;
    onTrack: boolean;
    tasksPerDayNeeded: number;
    bestProjectedMonth: string;
  };
}

export interface ExportHistoryDTO {
  id: string;
  filename: string;
  format: string;
  dateRange: { start: string; end: string };
  exportedAt: string;
  size: number;
}

export interface AppBackup {
  version: string;
  exportedAt: string;
  settings: SettingsDTO;
  months: Record<
    string,
    {
      year: number;
      month: number;
      days: DailyLogDTO[];
    }
  >;
  projects: ProjectDTO[];
  tags: TagDTO[];
}
