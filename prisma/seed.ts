import { PrismaClient } from "@prisma/client";
import { addDays, format, getDay } from "date-fns";

const prisma = new PrismaClient();
const SEED_USER_ID = "local-demo";
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TASK_POOL = [
  ["Complete project brief", "H", 1.25, "Design"],
  ["Review designs", "H", 0.75, "Design"],
  ["Update documentation", "H", 1.0, "Planning"],
  ["Client meeting", "M", 0.5, "Meeting"],
  ["Deploy staging", "M", 1.0, "Code"],
  ["Write tests", "L", 0.5, "Code"],
  ["Fix responsive bug", "H", 0.75, "Code"],
  ["Create mockup", "M", 1.25, "Design"],
  ["SEO audit", "L", 0.5, "Review"],
  ["Performance review", "M", 0.5, "Review"],
  ["Team sync", "L", 0.25, "Meeting"],
  ["Update roadmap", "M", 0.75, "Planning"],
  ["Research libraries", "L", 0.5, "Planning"],
  ["Code review", "H", 1.0, "Review"],
  ["Inbox zero", "L", 0.25, "Planning"],
] as const;

function hash(input: string) {
  let value = 0;
  for (let i = 0; i < input.length; i += 1) value = (value * 31 + input.charCodeAt(i)) >>> 0;
  return value;
}

async function main() {
  await prisma.taskTag.deleteMany();
  await prisma.task.deleteMany();
  await prisma.dailyLog.deleteMany();
  await prisma.exportHistory.deleteMany();
  await prisma.weekReflection.deleteMany();
  await prisma.monthReview.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.project.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      id: SEED_USER_ID,
      email: "demo@hourboard.local",
      name: "Local Demo",
      settings: {
        create: { dailyTargetHours: 8, dailyTargetTasks: 12, dailySlots: 15, monthTarget: 160 },
      },
    },
  });

  const [client, internal, learning] = await Promise.all([
    prisma.project.create({ data: { userId: SEED_USER_ID, name: "Client Project A", color: "#6366f1", description: "Primary delivery stream" } }),
    prisma.project.create({ data: { userId: SEED_USER_ID, name: "Internal Initiative", color: "#10b981", description: "Platform and tooling" } }),
    prisma.project.create({ data: { userId: SEED_USER_ID, name: "Personal Learning", color: "#f59e0b", description: "Skills and research" } }),
  ]);
  const projects = [client, internal, learning];

  const tags = await Promise.all(
    [
      ["Design", "#818cf8"],
      ["Code", "#34d399"],
      ["Meeting", "#fbbf24"],
      ["Planning", "#38bdf8"],
      ["Review", "#fb7185"],
    ].map(([name, color]) => prisma.tag.create({ data: { userId: SEED_USER_ID, name, color } })),
  );
  const tagByName = Object.fromEntries(tags.map((tag) => [tag.name, tag]));

  const today = new Date(2026, 7, 23);
  const dates: Date[] = [];
  for (let cursor = new Date(2024, 0, 2); cursor <= today; cursor = addDays(cursor, 1)) {
    const day = getDay(cursor);
    const key = format(cursor, "yyyy-MM-dd");
    const roll = hash(key) % 100;
    if ((day !== 0 && day !== 6 && roll > 18) || ((day === 0 || day === 6) && roll > 88)) {
      dates.push(new Date(cursor));
    }
  }

  await prisma.dailyLog.createMany({
    data: dates.map((date) => {
      const iso = format(date, "yyyy-MM-dd");
      const seed = hash(iso);
      const doneCount = iso === "2026-08-23" ? 5 : iso === "2026-08-22" ? 11 : 7 + (seed % 7);
      return {
        userId: SEED_USER_ID,
        date: iso,
        weekday: WEEKDAYS[getDay(date)],
        wins: doneCount >= 12 ? "Hit the daily target before close of day." : "Moved the important work forward.",
        blockers: seed % 5 === 0 ? "Waiting on client feedback." : "",
        carryForward: seed % 4 === 0 ? "Research new animation libraries" : "",
        notes: "",
        energyLevel: (seed % 5) + 1,
      };
    }),
  });

  const taskRows = dates.flatMap((date) => {
    const iso = format(date, "yyyy-MM-dd");
    const seed = hash(iso);
    const taskCount = iso === "2026-08-23" ? 8 : 8 + (seed % 7);
    const doneCount = iso === "2026-08-23" ? 5 : iso === "2026-08-22" ? 11 : Math.min(taskCount, 7 + (seed % 7));
    return Array.from({ length: taskCount }, (_, i) => {
      const slot = i + 1;
      const template = TASK_POOL[(seed + slot) % TASK_POOL.length];
      const project = projects[(seed + slot) % projects.length];
      return {
        id: `${iso}-${slot}`,
        userId: SEED_USER_ID,
        date: iso,
        slotNumber: slot,
        title: template[0],
        priority: template[1],
        done: slot <= doneCount,
        hours: slot <= doneCount ? template[2] : 0,
        notes: slot === 1 ? "Logged from seed" : "",
        projectId: project.id,
        tagName: template[3],
      };
    });
  });

  await prisma.task.createMany({
    data: taskRows.map(({ tagName: _tagName, ...row }) => row),
  });

  await prisma.taskTag.createMany({
    data: taskRows.map((row) => ({ taskId: row.id, tagId: tagByName[row.tagName].id })),
  });

  await prisma.weekReflection.create({
    data: {
      userId: SEED_USER_ID,
      year: 2026,
      weekNumber: 34,
      keptOnTrack: "Protected deep-work mornings.",
      slowSkipped: "Admin overflow on Thursday.",
      focusNextWeek: JSON.stringify(["Ship month review", "Reduce meeting load"]),
    },
  });

  await prisma.monthReview.create({
    data: {
      userId: SEED_USER_ID,
      year: 2026,
      month: 8,
      monthTarget: 240,
      keepDoing: "Batch planning on Sunday nights.",
      stopChange: "Context switching after lunch.",
      carryOver: JSON.stringify([{ id: "research", task: "Animation library research" }]),
    },
  });

  console.log(`Seeded ${dates.length} days and ${taskRows.length} tasks for ${SEED_USER_ID}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
