import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  const [tasks, days, users] = await Promise.all([
    prisma.task.count(),
    prisma.dailyLog.count(),
    prisma.user.count(),
  ]);
  console.log(`Reset complete. tasks=${tasks} days=${days} users=${users}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
