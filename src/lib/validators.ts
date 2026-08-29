import { z } from "zod";

export const prioritySchema = z.enum(["H", "M", "L", ""]);

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const taskInputSchema = z.object({
  date: dateSchema,
  slotNumber: z.number().int().min(1).max(30),
  title: z.string().min(1).max(240),
  priority: prioritySchema.optional(),
  done: z.boolean().optional(),
  hours: z.number().min(0).max(24).optional(),
  notes: z.string().max(4000).optional(),
  projectId: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional(),
});

export const taskUpdateSchema = taskInputSchema.partial().extend({
  id: z.string().min(1),
});

export const dayUpdateSchema = z.object({
  date: dateSchema,
  wins: z.string().max(4000).optional(),
  blockers: z.string().max(4000).optional(),
  carryForward: z.string().max(4000).optional(),
  notes: z.string().max(4000).optional(),
  energyLevel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.null()]).optional(),
});

export const settingsSchema = z.object({
  dailyTargetTasks: z.number().int().min(1).max(30),
  dailyTargetHours: z.number().min(0.5).max(24),
  dailySlots: z.number().int().min(1).max(30),
  weekStartDay: z.union([z.literal(0), z.literal(1), z.literal(6)]),
  theme: z.enum(["light", "dark", "system"]),
  defaultPriority: prioritySchema,
  exportFormat: z.enum(["pdf", "csv", "json"]),
  timeFormat: z.enum(["12h", "24h"]),
  dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]),
  monthTarget: z.number().int().min(1).max(2000),
});

export const projectSchema = z.object({
  name: z.string().min(1).max(80),
  color: z.string().min(4).max(20),
  description: z.string().max(400).optional(),
});

export const tagSchema = z.object({
  name: z.string().min(1).max(40),
  color: z.string().min(4).max(20),
});

export const rangeSchema = z.object({
  start: dateSchema,
  end: dateSchema,
});

export const batchTaskSchema = z.object({
  date: dateSchema,
  lines: z.string().min(1).max(8000),
});

export const addTaskSchema = z.object({
  date: dateSchema,
  title: z.string().min(1).max(240),
  hours: z.number().min(0).max(24).optional(),
  notes: z.string().max(4000).optional(),
});

export function parseBatchLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(?:\[(H|M|L)\]|(H|M|L):)\s*(.+)$/i);
      if (match) {
        const priority = ((match[1] || match[2] || "") as string).toUpperCase() as "H" | "M" | "L";
        return { title: match[3].trim(), priority };
      }
      return { title: line, priority: "" as const };
    });
}
