"use client";

import { useState } from "react";

export function AdminLogoutButton() {
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Logout failed");
      }
      window.location.href = "/";
    } catch (err: any) {
      alert(err?.message || "Logout failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      disabled={busy}
      className="px-3 py-2 rounded-md border border-white/15 text-white/90 hover:bg-white/5 disabled:opacity-60"
      onClick={logout}
    >
      {busy ? "Logging out…" : "Logout"}
    </button>
  );
}
