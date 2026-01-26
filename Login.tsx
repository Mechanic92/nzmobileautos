import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import Header from "./Header";
import Footer from "./Footer";

export default function Login() {
  const { requestMagicLink, loading, isAuthenticated, user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone && !email) {
      toast.error("Enter your mobile number (recommended) or email");
      return;
    }

    setSubmitting(true);
    try {
      await requestMagicLink({
        phone: phone || undefined,
        email: email || undefined,
        name: name || undefined,
      });
      toast.success("Login link sent. Check your SMS (or server console in dev).", {
        duration: 7000,
      });
    } catch (err: any) {
      toast.error(err?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Log In</CardTitle>
            <CardDescription>
              We use passwordless magic links. Enter your mobile number and we’ll text you a one-time login link. In local dev, SMS is logged to the server console.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="text-sm">
                  Logged in as <strong>{user?.email}</strong> ({user?.role})
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => setLocation(user?.role === "admin" ? "/admin" : "/dashboard")}
                  >
                    Continue
                  </Button>
                  <Button className="flex-1" variant="outline" onClick={() => {
                    logout();
                    toast.message("Logged out");
                  }}>
                    Log Out
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name (optional)</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number (recommended)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g., 027 642 1824"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading || submitting}>
                  {submitting ? "Sending link..." : "Send Login Link"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
