import { requireAdminOrThrow } from "@/server/adminGuard";

export default async function ReportsIndexPage() {
  await requireAdminOrThrow();
  return (
    <div className="container py-12">
      <h1 className="text-2xl font-semibold">Reports</h1>
      <p className="mt-2 text-white/70">Open a report from a booking in the Admin page.</p>
      <a className="mt-6 inline-block text-brand-yellow hover:underline" href="/admin">
        Back to admin
      </a>
    </div>
  );
}
