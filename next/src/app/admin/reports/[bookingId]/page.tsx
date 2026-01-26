import { requireAdminOrThrow } from "@/server/adminGuard";
import { ReportEditor } from "../ReportEditor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminReportPage({ params }: { params: Promise<{ bookingId: string }> }) {
  await requireAdminOrThrow();
  const { bookingId } = await params;

  return (
    <div className="container py-12 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Report</h1>
          <p className="mt-2 text-white/70">Booking ID: {bookingId}</p>
        </div>
        <a className="text-sm text-white/70 hover:text-white" href="/admin">
          Back to admin
        </a>
      </div>

      <ReportEditor bookingId={bookingId} defaultType="DIAGNOSTICS" />
    </div>
  );
}
