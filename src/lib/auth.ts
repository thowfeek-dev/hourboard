import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { DEFAULT_SETTINGS } from "@/lib/constants";

export const requireUserId = cache(async () => {
  const { userId } = await auth.protect();
  await ensureUser(userId);
  return userId;
});

export const ensureUser = cache(async (userId: string) => {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (existing) return userId;

  const clerkUser = await currentUser();
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses[0]?.emailAddress ??
    null;
  const name =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
    clerkUser?.username ||
    null;

  try {
    await prisma.user.create({
      data: {
        id: userId,
        email,
        name,
        imageUrl: clerkUser?.imageUrl ?? null,
        settings: { create: DEFAULT_SETTINGS },
      },
    });
  } catch {
    // Another request created the same user first.
  }
  return userId;
});
