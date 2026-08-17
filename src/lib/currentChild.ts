import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session;
}

export async function getCurrentChild() {
  const session = await requireSession();
  const child = await db.childProfile.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
  if (!child) redirect("/onboarding");
  return { session, child };
}

export async function getActiveMealPlan(childId: string) {
  return db.mealPlan.findFirst({
    where: { childProfileId: childId, ativo: true },
    orderBy: { cicloNumero: "desc" },
  });
}
