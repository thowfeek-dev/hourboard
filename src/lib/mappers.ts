import type { DailyLog, Project, Tag, Task } from "@prisma/client";
import type { DailyLogDTO, DaySummary, SettingsDTO, TaskDTO } from "@/types";
import type { Settings } from "@prisma/client";

type TaskWithRelations = Task & {
  project?: Project | null;
  tags?: { tag: Tag }[];
};

export function mapTask(task: TaskWithRelations): TaskDTO {
  return {
    id: task.id,
    date: task.date,
    slotNumber: task.slotNumber,
    title: task.title,
    priority: (task.priority as TaskDTO["priority"]) ?? "",
    done: task.done,
    hours: task.hours,
    notes: task.notes,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    projectId: task.projectId,
    projectName: task.project?.name ?? null,
    projectColor: task.project?.color ?? null,
    tags: (task.tags ?? []).map((row) => ({
      id: row.tag.id,
      name: row.tag.name,
      color: row.tag.color,
    })),
  };
}

export function mapDay(
  log: DailyLog & { tasks: TaskWithRelations[] },
  hourTarget: number,
): DailyLogDTO {
  const tasks = [...log.tasks].sort((a, b) => a.slotNumber - b.slotNumber).map(mapTask);
  const tasksDone = tasks.length;
  const totalHours = tasks.reduce((sum, task) => sum + task.hours, 0);
  return {
    date: log.date,
    weekday: log.weekday,
    wins: log.wins,
    blockers: log.blockers,
    carryForward: log.carryForward,
    notes: log.notes,
    energyLevel: log.energyLevel,
    tasks,
    totalHours,
    tasksDone,
    hitTarget: totalHours >= hourTarget,
  };
}

export function mapDaySummary(day: DailyLogDTO): DaySummary {
  return {
    date: day.date,
    weekday: day.weekday,
    tasksDone: day.tasksDone,
    totalHours: day.totalHours,
    hitTarget: day.hitTarget,
    taskCount: day.tasks.length,
    energyLevel: day.energyLevel,
  };
}

export function emptyDay(date: string, weekday: string): DailyLogDTO {
  return {
    date,
    weekday,
    wins: "",
    blockers: "",
    carryForward: "",
    notes: "",
    energyLevel: null,
    tasks: [],
    totalHours: 0,
    tasksDone: 0,
    hitTarget: false,
  };
}

export function mapSettings(settings: Settings): SettingsDTO {
  return {
    dailyTargetTasks: settings.dailyTargetTasks,
    dailyTargetHours: settings.dailyTargetHours,
    dailySlots: settings.dailySlots,
    weekStartDay: settings.weekStartDay as SettingsDTO["weekStartDay"],
    theme: settings.theme as SettingsDTO["theme"],
    defaultPriority: settings.defaultPriority as SettingsDTO["defaultPriority"],
    exportFormat: settings.exportFormat as SettingsDTO["exportFormat"],
    timeFormat: settings.timeFormat as SettingsDTO["timeFormat"],
    dateFormat: settings.dateFormat as SettingsDTO["dateFormat"],
    monthTarget: settings.monthTarget,
  };
}
