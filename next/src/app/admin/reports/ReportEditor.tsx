"use client";

import { useEffect, useMemo, useState } from "react";

type ReportStatus = "DRAFT" | "FINAL";

type ReportPayload = {
  version: number;
  type: "DIAGNOSTICS" | "PPI";
  title: string;
  summary: string;
  contentMarkdown: string;
  attachments: Array<{ label?: string; url: string; contentType?: string }>; // images + future files
};

type ReportResponse = {
  id: string;
  bookingId: string;
  type: "DIAGNOSTICS" | "PPI";
  status: ReportStatus;
  dataJson: ReportPayload;
  publicToken: string;
  emailedAt: string | null;
};

export function ReportEditor({ bookingId, defaultType }: { bookingId: string; defaultType: "DIAGNOSTICS" | "PPI" }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);

  const publicUrl = useMemo(() => {
    if (!report) return "";
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/report/${report.publicToken}`;
  }, [report]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/reports/create-or-get", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ bookingId, type: defaultType }),
        });
        if (!res.ok) throw new Error(await res.text());
        const json = (await res.json()) as ReportResponse;
        setReport(json);
      } catch (e: any) {
        setError(e?.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [bookingId, defaultType]);

  const updateField = (key: keyof ReportPayload, value: any) => {
    if (!report) return;
    setReport({ ...report, dataJson: { ...report.dataJson, [key]: value } });
  };

  const addAttachment = (att: { url: string; label?: string; contentType?: string }) => {
    if (!report) return;
    const next = [...(report.dataJson.attachments || []), att];
    setReport({ ...report, dataJson: { ...report.dataJson, attachments: next } });
  };

  const removeAttachmentAt = (idx: number) => {
    if (!report) return;
    const next = [...(report.dataJson.attachments || [])];
    next.splice(idx, 1);
    setReport({ ...report, dataJson: { ...report.dataJson, attachments: next } });
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!report || !files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const presignRes = await fetch("/api/uploads/presign", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            reportId: report.id,
            fileName: file.name,
            contentType: file.type,
            sizeBytes: file.size,
          }),
        });
        if (!presignRes.ok) throw new Error(await presignRes.text());
        const presignJson = (await presignRes.json()) as { uploadUrl: string; publicUrl: string; contentType: string };

        const putRes = await fetch(presignJson.uploadUrl, {
          method: "PUT",
          headers: { "content-type": file.type },
          body: file,
        });
        if (!putRes.ok) throw new Error("Upload failed");

        addAttachment({ url: presignJson.publicUrl, label: file.name, contentType: presignJson.contentType });
      }

      // Persist after uploads
      await save();
    } catch (e: any) {
      setError(e?.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const save = async (status?: ReportStatus) => {
    if (!report) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: report.id, status, dataJson: report.dataJson }),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as ReportResponse;
      setReport(json);
    } catch (e: any) {
      setError(e?.message || "Failed to save report");
    } finally {
      setSaving(false);
    }
  };

  const sendEmail = async () => {
    if (!report) return;
    setSending(true);
    setError(null);
    try {
      await save("FINAL");
      const res = await fetch("/api/reports/send-email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reportId: report.id }),
      });
      if (!res.ok) throw new Error(await res.text());
      window.alert("Report email sent.");
    } catch (e: any) {
      setError(e?.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="text-white/70">Loading report…</div>;
  if (error) return <div className="text-red-300">{error}</div>;
  if (!report) return <div className="text-white/70">Report not available.</div>;

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-2">
        <label className="text-sm text-white/70">Photos (JPG/PNG/WebP)</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={uploading}
          onChange={(e) => void uploadFiles(e.target.files)}
        />
        {uploading ? <div className="text-white/60 text-sm">Uploading…</div> : null}

        {report.dataJson.attachments?.length ? (
          <div className="mt-3 grid gap-3">
            {report.dataJson.attachments.map((a, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <a className="text-brand-yellow hover:underline text-sm" href={a.url} target="_blank" rel="noreferrer">
                  {a.label || a.url}
                </a>
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded border border-white/15 hover:bg-white/5"
                  onClick={() => removeAttachmentAt(idx)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-white/60 text-sm">No photos uploaded yet.</div>
        )}
      </div>

      <div className="grid gap-2">
        <label className="text-sm text-white/70">Title</label>
        <input
          className="w-full px-3 py-2 rounded bg-black/40 border border-white/10"
          value={report.dataJson.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm text-white/70">Summary (customer-facing)</label>
        <textarea
          className="w-full min-h-28 px-3 py-2 rounded bg-black/40 border border-white/10"
          value={report.dataJson.summary}
          onChange={(e) => updateField("summary", e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm text-white/70">Report content (plain text / markdown later)</label>
        <textarea
          className="w-full min-h-72 px-3 py-2 rounded bg-black/40 border border-white/10 font-mono text-sm"
          value={report.dataJson.contentMarkdown}
          onChange={(e) => updateField("contentMarkdown", e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <button
          type="button"
          disabled={saving}
          className="px-4 py-2 rounded bg-white/10 hover:bg-white/15 disabled:opacity-60"
          onClick={() => save()}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          disabled={sending}
          className="px-4 py-2 rounded bg-brand-yellow text-black font-semibold disabled:opacity-60"
          onClick={sendEmail}
        >
          {sending ? "Sending…" : "Finalize + Email to customer"}
        </button>

        <a className="text-brand-yellow hover:underline text-sm" href={publicUrl} target="_blank" rel="noreferrer">
          Preview customer view
        </a>

        <div className="text-xs text-white/50">Status: {report.status}</div>
      </div>
    </div>
  );
}
