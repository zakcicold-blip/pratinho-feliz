import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import AdminNav from "./AdminNav";
import HeatOptOut from "@/components/HeatOptOut";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-stone-100">
      <HeatOptOut />
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-stone-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white">
              <UtensilsCrossed size={14} />
            </span>
            Pratinho Feliz · Backoffice
          </Link>
          <AdminNav />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
