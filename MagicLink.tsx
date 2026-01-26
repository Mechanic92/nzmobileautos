import { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "./Header";
import Footer from "./Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MagicLink() {
  const { token } = useParams() as { token?: string };
  const { consumeMagicLink, loading, isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const t = (token || "").trim();
    if (!t) return;

    let cancelled = false;

    (async () => {
      try {
        await consumeMagicLink(t);
        if (cancelled) return;

        const userDataStr = localStorage.getItem("user_data");
        const role = userDataStr ? (JSON.parse(userDataStr)?.role as string | undefined) : undefined;
        setLocation(role === "admin" ? "/admin" : "/dashboard");
      } catch {
        // Stay on page and show error UI below
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, consumeMagicLink, setLocation]);

  const hasToken = !!(token || "").trim();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Signing you in…</CardTitle>
            <CardDescription>
              {hasToken
                ? "Please wait while we validate your magic link."
                : "Missing token. Please request a new login link."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasToken && <div className="text-sm text-muted-foreground">Go back to /login and request a new link.</div>}

            {hasToken && !loading && !isAuthenticated && (
              <div className="text-sm">
                <div className="font-medium">Link invalid or expired</div>
                <div className="text-muted-foreground mt-1">Go back to /login and request a new link.</div>
              </div>
            )}

            {isAuthenticated && (
              <div className="text-sm text-muted-foreground">Logged in as {user?.email || user?.name || "Customer"}. Redirecting…</div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
