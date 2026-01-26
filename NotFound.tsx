import { Button } from "@/components/ui/button";
import Footer from "./Footer";
import Header from "./Header";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16">
        <div className="container text-center">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. It may have
            been moved or doesn't exist.
          </p>
          <Link href="/">
            <Button size="lg">Return to Home</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
