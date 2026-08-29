"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import { daysInRange, monthDays, requireDate, shiftDay, toISODate, weekdayName, weekBounds } from "@/lib/dates";
import { emptyDay, mapDay, mapDaySummary, mapSettings, mapTask } from "@/lib/mappers";
import { computeStatistics } from "@/lib/stats";
import {
  addTaskSchema,
  batchTaskSchema,
  dateSchema,
  dayUpdateSchema,
  parseBatchLines,
  projectSchema,
  settingsSchema,
  tagSchema,
  taskInputSchema,
  taskUpdateSchema,
} from "@/lib/validators";
import type { DailyLogDTO, ProjectDTO, SettingsDTO, TagDTO } from "@/types";

const getOrCreateSettings = cache(async (userId: string) => {
  return prisma.settings.upsert({
    where: { userId },
    update: {},
    create: { userId, ...DEFAULT_SETTINGS },
  });
});

export const getSettings = cache(async (): Promise<SettingsDTO> => {
  const userId = await requireUserId();
  return mapSettings(await getOrCreateSettings(userId));
});

export async function updateSettings(input: unknown) {
  const userId = await requireUserId();
  const data = settingsSchema.parse(input);
  const settings = await prisma.settings.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
  revalidatePath("/");
  return mapSettings(settings);
}

async function ensureDay(userId: string, date: string) {
  const parsed = requireDate(date);
  return prisma.dailyLog.upsert({
    where: { userId_date: { userId, date } },
    update: {},
    create: { userId, date, weekday: weekdayName(parsed) },
  });
}

const taskInclude = {
  project: true,
  tags: { include: { tag: true } },
} as const;

async function ownedTask(userId: string, id: string) {
  const task = await prisma.task.findFirst({ where: { id, userId }, include: taskInclude });
  if (!task) throw new Error("Task not found");
  return task;
}

async function assertOwnedProject(userId: string, projectId: string | null | undefined) {
  if (!projectId) return;
  const project = await prisma.project.findFirst({ where: { id: projectId, userId }, select: { id: true } });
  if (!project) throw new Error("Project not found");
}

async function assertOwnedTags(userId: string, tagIds: string[] | undefined) {
  if (!tagIds?.length) return;
  const count = await prisma.tag.count({ where: { userId, id: { in: tagIds } } });
  if (count !== tagIds.length) throw new Error("Invalid tags");
}

export async function getDay(date: string): Promise<DailyLogDTO> {
  const userId = await requireUserId();
  dateSchema.parse(date);
  const settings = await getOrCreateSettings(userId);
  const log = await prisma.dailyLog.findUnique({
    where: { userId_date: { userId, date } },
    include: { tasks: { include: taskInclude } },
  });
  if (!log) return emptyDay(date, weekdayName(requireDate(date)));
  return mapDay(log, settings.dailyTargetHours);
}

export async function getDays(start: string, end: string) {
  const userId = await requireUserId();
  dateSchema.parse(start);
  dateSchema.parse(end);
  const settings = await getOrCreateSettings(userId);
  const logs = await prisma.dailyLog.findMany({
    where: { userId, date: { gte: start, lte: end } },
    include: { tasks: { include: taskInclude } },
    orderBy: { date: "asc" },
  });
  return logs.map((log) => mapDay(log, settings.dailyTargetHours));
}

export async function getBootstrap(date: string) {
  const settings = await getSettings();
  const day = await getDay(date);
  const [projects, tags] = await Promise.all([listProjects(), listTags()]);
  return { settings, day, projects, tags };
}

export async function getDashboardData(start: string, end: string) {
  const [settings, days] = await Promise.all([getSettings(), getDays(start, end)]);
  const stats = computeStatistics(days, settings, { start, end });
  const recentStart = shiftDay(end, -6);
  const recent = days.filter((day) => day.date >= recentStart && day.date <= end).map(mapDaySummary);
  return {
    settings,
    days: days.map(mapDaySummary),
    stats,
    recent,
  };
}

export async function upsertTask(input: unknown) {
  const userId = await requireUserId();
  const data = taskInputSchema.parse(input);
  await assertOwnedProject(userId, data.projectId);
  await assertOwnedTags(userId, data.tagIds);
  await ensureDay(userId, data.date);
  const task = await prisma.task.upsert({
    where: { userId_date_slotNumber: { userId, date: data.date, slotNumber: data.slotNumber } },
    update: {
      title: data.title,
      done: true,
      ...(data.priority !== undefined ? { priority: data.priority } : {}),
      ...(data.hours !== undefined ? { hours: data.hours } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.projectId !== undefined ? { projectId: data.projectId } : {}),
    },
    create: {
      userId,
      date: data.date,
      slotNumber: data.slotNumber,
      title: data.title,
      priority: data.priority ?? "",
      done: true,
      hours: data.hours ?? 1,
      notes: data.notes ?? "",
      projectId: data.projectId ?? null,
    },
    include: taskInclude,
  });

  if (data.tagIds) {
    await prisma.taskTag.deleteMany({ where: { taskId: task.id } });
    if (data.tagIds.length) {
      await prisma.taskTag.createMany({
        data: data.tagIds.map((tagId) => ({ taskId: task.id, tagId })),
      });
    }
  }

  revalidatePath("/");
  revalidatePath(`/day/${data.date}`);
  if (!data.tagIds) return mapTask(task);
  return mapTask(
    await prisma.task.findUniqueOrThrow({ where: { id: task.id }, include: taskInclude }),
  );
}

export async function updateTask(input: unknown) {
  const userId = await requireUserId();
  const data = taskUpdateSchema.parse(input);
  const { id, tagIds, ...rest } = data;
  await ownedTask(userId, id);
  await assertOwnedProject(userId, rest.projectId);
  await assertOwnedTags(userId, tagIds);
  if (rest.date) await ensureDay(userId, rest.date);
  const task = await prisma.task.update({
    where: { id },
    data: {
      ...("date" in rest ? { date: rest.date } : {}),
      ...("slotNumber" in rest ? { slotNumber: rest.slotNumber } : {}),
      ...("title" in rest ? { title: rest.title } : {}),
      ...("priority" in rest ? { priority: rest.priority } : {}),
      ...("done" in rest ? { done: rest.done } : {}),
      ...("hours" in rest ? { hours: rest.hours } : {}),
      ...("notes" in rest ? { notes: rest.notes } : {}),
      ...("projectId" in rest ? { projectId: rest.projectId } : {}),
    },
    include: taskInclude,
  });
  if (tagIds) {
    await prisma.taskTag.deleteMany({ where: { taskId: id } });
    if (tagIds.length) {
      await prisma.taskTag.createMany({
        data: tagIds.map((tagId) => ({ taskId: id, tagId })),
      });
    }
  }
  revalidatePath("/");
  revalidatePath(`/day/${task.date}`);
  return mapTask(
    await prisma.task.findUniqueOrThrow({ where: { id }, include: taskInclude }),
  );
}

export async function toggleTask(id: string) {
  const userId = await requireUserId();
  const current = await ownedTask(userId, id);
  const task = await prisma.task.update({
    where: { id },
    data: { done: !current.done },
    include: taskInclude,
  });
  revalidatePath("/");
  revalidatePath(`/day/${task.date}`);
  return mapTask(task);
}

export async function deleteTask(id: string) {
  const userId = await requireUserId();
  const task = await ownedTask(userId, id);
  await prisma.task.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath(`/day/${task.date}`);
  return { ok: true };
}

export async function moveTask(id: string, direction: "up" | "down") {
  const userId = await requireUserId();
  const task = await ownedTask(userId, id);
  const swapSlot = direction === "up" ? task.slotNumber - 1 : task.slotNumber + 1;
  if (swapSlot < 1) return mapTask(task);
  const other = await prisma.task.findUnique({
    where: { userId_date_slotNumber: { userId, date: task.date, slotNumber: swapSlot } },
  });
  if (!other) {
    const updated = await prisma.task.update({
      where: { id },
      data: { slotNumber: swapSlot },
      include: taskInclude,
    });
    return mapTask(updated);
  }
  await prisma.$transaction([
    prisma.task.update({ where: { id: task.id }, data: { slotNumber: -1 } }),
    prisma.task.update({ where: { id: other.id }, data: { slotNumber: task.slotNumber } }),
    prisma.task.update({ where: { id: task.id }, data: { slotNumber: swapSlot } }),
  ]);
  revalidatePath(`/day/${task.date}`);
  return getDay(task.date);
}

export async function updateDay(input: unknown) {
  const userId = await requireUserId();
  const data = dayUpdateSchema.parse(input);
  await ensureDay(userId, data.date);
  const log = await prisma.dailyLog.update({
    where: { userId_date: { userId, date: data.date } },
    data: {
      wins: data.wins,
      blockers: data.blockers,
      carryForward: data.carryForward,
      notes: data.notes,
      energyLevel: data.energyLevel,
    },
    include: { tasks: { include: taskInclude } },
  });
  const settings = await getOrCreateSettings(userId);
  revalidatePath(`/day/${data.date}`);
  return mapDay(log, settings.dailyTargetHours);
}

export async function addTask(input: unknown) {
  const userId = await requireUserId();
  const data = addTaskSchema.parse(input);
  const settings = await getOrCreateSettings(userId);
  await ensureDay(userId, data.date);
  const existing = await prisma.task.findMany({
    where: { userId, date: data.date },
    select: { slotNumber: true },
  });
  const used = new Set(existing.map((row) => row.slotNumber));
  let slot = 1;
  while (used.has(slot) && slot <= settings.dailySlots) slot += 1;
  if (slot > settings.dailySlots) {
    throw new Error("No free slots left on that day");
  }
  const task = await prisma.task.create({
    data: {
      userId,
      date: data.date,
      slotNumber: slot,
      title: data.title,
      done: true,
      hours: data.hours ?? 1,
      notes: data.notes ?? "",
    },
    include: taskInclude,
  });
  revalidatePath("/");
  revalidatePath(`/day/${data.date}`);
  revalidatePath("/analytics");
  return mapTask(task);
}

export async function batchAddTasks(input: unknown) {
  const userId = await requireUserId();
  const data = batchTaskSchema.parse(input);
  const settings = await getOrCreateSettings(userId);
  await ensureDay(userId, data.date);
  const existing = await prisma.task.findMany({
    where: { userId, date: data.date },
    select: { slotNumber: true },
  });
  const used = new Set(existing.map((row) => row.slotNumber));
  const lines = parseBatchLines(data.lines);
  const created = [];
  let slot = 1;
  for (const line of lines) {
    while (used.has(slot) && slot <= settings.dailySlots) slot += 1;
    if (slot > settings.dailySlots) break;
    created.push(
      await prisma.task.create({
        data: {
          userId,
          date: data.date,
          slotNumber: slot,
          title: line.title,
          done: true,
          hours: 1,
        },
        include: taskInclude,
      }),
    );
    used.add(slot);
  }
  revalidatePath(`/day/${data.date}`);
  return created.map(mapTask);
}

export async function copyDay(from: string, to: string) {
  const userId = await requireUserId();
  dateSchema.parse(from);
  dateSchema.parse(to);
  const source = await prisma.dailyLog.findUnique({
    where: { userId_date: { userId, date: from } },
    include: { tasks: { include: { tags: true } } },
  });
  if (!source) return getDay(to);
  await ensureDay(userId, to);
  await prisma.task.deleteMany({ where: { userId, date: to } });
  for (const task of source.tasks) {
    const created = await prisma.task.create({
      data: {
        userId,
        date: to,
        slotNumber: task.slotNumber,
        title: task.title,
        priority: task.priority,
        done: true,
        hours: task.hours,
        notes: task.notes,
        projectId: task.projectId,
      },
    });
    if (task.tags.length) {
      await prisma.taskTag.createMany({
        data: task.tags.map((row) => ({ taskId: created.id, tagId: row.tagId })),
      });
    }
  }
  await prisma.dailyLog.update({
    where: { userId_date: { userId, date: to } },
    data: {
      wins: "",
      blockers: source.blockers,
      carryForward: source.carryForward,
      notes: source.notes,
      energyLevel: null,
    },
  });
  revalidatePath(`/day/${to}`);
  return getDay(to);
}

export async function clearDay(date: string) {
  const userId = await requireUserId();
  dateSchema.parse(date);
  await prisma.task.deleteMany({ where: { userId, date } });
  await prisma.dailyLog.updateMany({
    where: { userId, date },
    data: { wins: "", blockers: "", carryForward: "", notes: "", energyLevel: null },
  });
  revalidatePath(`/day/${date}`);
  return getDay(date);
}

export async function listProjects(): Promise<ProjectDTO[]> {
  const userId = await requireUserId();
  const projects = await prisma.project.findMany({
    where: { userId },
    include: { tasks: true },
    orderBy: { createdAt: "asc" },
  });
  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    color: project.color,
    description: project.description,
    createdAt: project.createdAt.toISOString(),
    taskCount: project.tasks.length,
    hours: Number(project.tasks.reduce((sum, task) => sum + task.hours, 0).toFixed(1)),
  }));
}

export async function createProject(input: unknown) {
  const userId = await requireUserId();
  const data = projectSchema.parse(input);
  const project = await prisma.project.create({ data: { ...data, userId } });
  revalidatePath("/projects");
  return project;
}

export async function deleteProject(id: string) {
  const userId = await requireUserId();
  const project = await prisma.project.findFirst({ where: { id, userId } });
  if (!project) throw new Error("Project not found");
  await prisma.project.delete({ where: { id } });
  revalidatePath("/projects");
  return { ok: true };
}

export async function listTags(): Promise<TagDTO[]> {
  const userId = await requireUserId();
  const tags = await prisma.tag.findMany({
    where: { userId },
    include: { tasks: { include: { task: true } } },
    orderBy: { name: "asc" },
  });
  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
    taskCount: tag.tasks.length,
    hours: Number(tag.tasks.reduce((sum, row) => sum + row.task.hours, 0).toFixed(1)),
  }));
}

export async function createTag(input: unknown) {
  const userId = await requireUserId();
  const data = tagSchema.parse(input);
  const tag = await prisma.tag.create({ data: { ...data, userId } });
  revalidatePath("/projects");
  return tag;
}

export async function deleteTag(id: string) {
  const userId = await requireUserId();
  const tag = await prisma.tag.findFirst({ where: { id, userId } });
  if (!tag) throw new Error("Tag not found");
  await prisma.tag.delete({ where: { id } });
  revalidatePath("/projects");
  return { ok: true };
}

export async function searchTasks(query: string) {
  const userId = await requireUserId();
  const q = query.trim();
  if (q.length < 2) return [];
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      OR: [
        { title: { contains: q } },
        { notes: { contains: q } },
        { project: { name: { contains: q } } },
      ],
    },
    include: taskInclude,
    orderBy: { date: "desc" },
    take: 20,
  });
  return tasks.map(mapTask);
}

export async function getMonthData(year: number, month: number) {
  const userId = await requireUserId();
  const settings = await getSettings();
  const days = monthDays(year, month);
  const logs = await getDays(days[0], days[days.length - 1]);
  const byDate = new Map(logs.map((log) => [log.date, log]));
  const filled = days.map((date) => byDate.get(date) ?? emptyDay(date, weekdayName(requireDate(date))));
  const review = await prisma.monthReview.findUnique({
    where: { userId_year_month: { userId, year, month } },
  });
  return { settings, days: filled, review };
}

export async function getWeekData(year: number, week: number) {
  const userId = await requireUserId();
  const settings = await getSettings();
  const bounds = weekBounds(year, week, settings.weekStartDay);
  const logs = await getDays(bounds.start, bounds.end);
  const byDate = new Map(logs.map((log) => [log.date, log]));
  const days = daysInRange(bounds.start, bounds.end).map(
    (date) => byDate.get(date) ?? emptyDay(date, weekdayName(requireDate(date))),
  );
  const reflection = await prisma.weekReflection.findUnique({
    where: { userId_year_weekNumber: { userId, year, weekNumber: week } },
  });
  return { settings, bounds, days, reflection };
}

export async function getYearData(year: number) {
  const settings = await getSettings();
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  const days = await getDays(start, end);
  return {
    settings,
    days: days.map(mapDaySummary),
    stats: computeStatistics(days, settings, { start, end }),
  };
}

export async function saveWeekReflection(input: {
  year: number;
  weekNumber: number;
  keptOnTrack: string;
  slowSkipped: string;
  focusNextWeek: string[];
}) {
  const userId = await requireUserId();
  const row = await prisma.weekReflection.upsert({
    where: { userId_year_weekNumber: { userId, year: input.year, weekNumber: input.weekNumber } },
    update: {
      keptOnTrack: input.keptOnTrack,
      slowSkipped: input.slowSkipped,
      focusNextWeek: JSON.stringify(input.focusNextWeek),
    },
    create: {
      userId,
      year: input.year,
      weekNumber: input.weekNumber,
      keptOnTrack: input.keptOnTrack,
      slowSkipped: input.slowSkipped,
      focusNextWeek: JSON.stringify(input.focusNextWeek),
    },
  });
  revalidatePath(`/week/${input.year}/${input.weekNumber}`);
  return row;
}

export async function saveMonthReview(input: {
  year: number;
  month: number;
  monthTarget: number;
  keepDoing: string;
  stopChange: string;
  carryOver: { id: string; task: string }[];
}) {
  const userId = await requireUserId();
  const row = await prisma.monthReview.upsert({
    where: { userId_year_month: { userId, year: input.year, month: input.month } },
    update: {
      monthTarget: input.monthTarget,
      keepDoing: input.keepDoing,
      stopChange: input.stopChange,
      carryOver: JSON.stringify(input.carryOver),
    },
    create: {
      userId,
      year: input.year,
      month: input.month,
      monthTarget: input.monthTarget,
      keepDoing: input.keepDoing,
      stopChange: input.stopChange,
      carryOver: JSON.stringify(input.carryOver),
    },
  });
  revalidatePath(`/month/${input.year}/${input.month}`);
  return row;
}

export async function listExports() {
  const userId = await requireUserId();
  const rows = await prisma.exportHistory.findMany({
    where: { userId },
    orderBy: { exportedAt: "desc" },
    take: 20,
  });
  return rows.map((row) => ({
    id: row.id,
    filename: row.filename,
    format: row.format,
    dateRange: { start: row.rangeStart, end: row.rangeEnd },
    exportedAt: row.exportedAt.toISOString(),
    size: row.size,
  }));
}

export async function recordExport(input: {
  filename: string;
  format: string;
  start: string;
  end: string;
  size: number;
}) {
  const userId = await requireUserId();
  return prisma.exportHistory.create({
    data: {
      userId,
      filename: input.filename,
      format: input.format,
      rangeStart: input.start,
      rangeEnd: input.end,
      size: input.size,
    },
  });
}

export async function importBackup(payload: unknown, mode: "merge" | "replace") {
  const userId = await requireUserId();
  const data = payload as {
    settings?: Partial<SettingsDTO>;
    months?: Record<string, { days: DailyLogDTO[] }>;
    projects?: { name: string; color: string; description?: string | null }[];
    tags?: { name: string; color: string }[];
  };

  if (mode === "replace") {
    await prisma.task.deleteMany({ where: { userId } });
    await prisma.dailyLog.deleteMany({ where: { userId } });
    await prisma.project.deleteMany({ where: { userId } });
    await prisma.tag.deleteMany({ where: { userId } });
  }

  if (data.settings) {
    await prisma.settings.upsert({
      where: { userId },
      update: data.settings,
      create: { userId, ...DEFAULT_SETTINGS, ...data.settings },
    });
  }

  const projectMap = new Map<string, string>();
  for (const project of data.projects ?? []) {
    const existing = await prisma.project.findFirst({ where: { userId, name: project.name } });
    const created = existing
      ? await prisma.project.update({
          where: { id: existing.id },
          data: { color: project.color, description: project.description },
        })
      : await prisma.project.create({
          data: { userId, name: project.name, color: project.color, description: project.description },
        });
    projectMap.set(project.name, created.id);
  }

  const tagMap = new Map<string, string>();
  for (const tag of data.tags ?? []) {
    const created = await prisma.tag.upsert({
      where: { userId_name: { userId, name: tag.name } },
      update: { color: tag.color },
      create: { userId, name: tag.name, color: tag.color },
    });
    tagMap.set(tag.name, created.id);
  }

  for (const month of Object.values(data.months ?? {})) {
    for (const day of month.days ?? []) {
      await ensureDay(userId, day.date);
      await prisma.dailyLog.update({
        where: { userId_date: { userId, date: day.date } },
        data: {
          wins: day.wins ?? "",
          blockers: day.blockers ?? "",
          carryForward: day.carryForward ?? "",
          notes: day.notes ?? "",
          energyLevel: day.energyLevel ?? null,
        },
      });
      for (const task of day.tasks ?? []) {
        const created = await prisma.task.upsert({
          where: { userId_date_slotNumber: { userId, date: day.date, slotNumber: task.slotNumber } },
          update: {
            title: task.title,
            priority: task.priority ?? "",
            done: Boolean(task.done),
            hours: task.hours ?? 0,
            notes: task.notes ?? "",
          },
          create: {
            userId,
            date: day.date,
            slotNumber: task.slotNumber,
            title: task.title,
            priority: task.priority ?? "",
            done: Boolean(task.done),
            hours: task.hours ?? 0,
            notes: task.notes ?? "",
          },
        });
        if (task.projectName && projectMap.get(task.projectName)) {
          await prisma.task.update({
            where: { id: created.id },
            data: { projectId: projectMap.get(task.projectName) },
          });
        }
      }
    }
  }

  revalidatePath("/");
  return { ok: true };
}

export async function getDateContext() {
  return { today: toISODate(new Date()) };
}

export async function clearAllData() {
  const userId = await requireUserId();
  await prisma.task.deleteMany({ where: { userId } });
  await prisma.dailyLog.deleteMany({ where: { userId } });
  await prisma.exportHistory.deleteMany({ where: { userId } });
  await prisma.weekReflection.deleteMany({ where: { userId } });
  await prisma.monthReview.deleteMany({ where: { userId } });
  await prisma.tag.deleteMany({ where: { userId } });
  await prisma.project.deleteMany({ where: { userId } });
  await prisma.settings.update({
    where: { userId },
    data: DEFAULT_SETTINGS,
  });
  revalidatePath("/");
  revalidatePath("/analytics");
  revalidatePath("/settings");
  revalidatePath("/import-export");
  revalidatePath("/week");
  revalidatePath("/month");
  revalidatePath("/year");
  return { ok: true };
}
