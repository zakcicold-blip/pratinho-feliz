import { requireSession } from "@/lib/currentChild";
import BottomNav from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireSession();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-2xl flex-1 pb-4">{children}</div>
      <BottomNav />
    </div>
  );
}
