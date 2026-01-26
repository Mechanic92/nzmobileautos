import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import Seo from "./Seo";

export default function Cancel() {
    const [, setLocation] = useLocation();

    return (
        <div className="min-h-screen flex flex-col">
            <Seo title="Payment Cancelled" description="Your payment was cancelled. No charge has been made to your card." />
            <Header />
            <main className="flex-1 flex items-center justify-center py-16 bg-muted/30">
                <Card className="max-w-md mx-auto">
                    <CardContent className="pt-6 text-center">
                        <XCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
                        <p className="text-muted-foreground mb-6">
                            No charge has been made to your card. You can try booking again whenever you're ready.
                        </p>
                        <div className="space-y-3">
                            <Button onClick={() => setLocation("/book")} size="lg" className="w-full">
                                Return to Booking
                            </Button>
                            <Button
                                onClick={() => setLocation("/")}
                                variant="outline"
                                size="lg"
                                className="w-full"
                            >
                                Go to Home
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-6">
                            Questions? Call us at{" "}
                            <a href="tel:0276421824" className="font-bold text-primary hover:underline">
                                027 642 1824
                            </a>
                        </p>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
