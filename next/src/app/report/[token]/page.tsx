import { db } from "@/server/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isLikelyImageUrl(url: string) {
  const u = url.toLowerCase();
  return u.endsWith(".jpg") || u.endsWith(".jpeg") || u.endsWith(".png") || u.endsWith(".webp") || u.includes("image/");
}

export default async function PublicReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const report = await db().getServiceReportByPublicToken(token);
  if (!report) return notFound();

  const title = (report.dataJson as any)?.title || (report.type === "DIAGNOSTICS" ? "Diagnostics Report" : "Pre-Purchase Inspection Report");
  const summary = (report.dataJson as any)?.summary || "";
  const content = (report.dataJson as any)?.contentMarkdown || "";
  const attachments = Array.isArray((report.dataJson as any)?.attachments) ? (report.dataJson as any).attachments : [];
  const imageAttachments = attachments.filter((a: any) => typeof a?.url === "string" && isLikelyImageUrl(a.url));

  return (
    <div className="container py-12 max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      {summary ? <p className="mt-4 text-white/70 whitespace-pre-wrap">{summary}</p> : null}

      {imageAttachments.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Photos</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {imageAttachments.map((a: any, idx: number) => (
              <a key={idx} href={a.url} target="_blank" rel="noreferrer" className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.url}
                  alt={a.label || `Photo ${idx + 1}`}
                  className="w-full rounded-lg border border-white/10 bg-black/20"
                  loading="lazy"
                />
                <div className="mt-2 text-xs text-white/60">{a.label || a.name || ""}</div>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {attachments.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Attachments</h2>
          <ul className="mt-3 space-y-2">
            {attachments.map((a: any, idx: number) => (
              <li key={idx}>
                <a className="text-brand-yellow hover:underline" href={a.url} target="_blank" rel="noreferrer">
                  {a.label || a.name || a.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {content ? (
        <div className="mt-10">
          <h2 className="text-lg font-semibold">Report</h2>
          <div className="mt-3 whitespace-pre-wrap text-white/80 leading-7">
            {content}
          </div>
        </div>
      ) : (
        <div className="mt-10 text-white/70">Report content is not available yet.</div>
      )}

      <div className="mt-10 text-xs text-white/50">Reference: {report.bookingId}</div>
    </div>
  );
}
