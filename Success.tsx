import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, AlertCircle, Calendar, Mail } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import Seo from "./Seo";

export default function Success() {
    const [, setLocation] = useLocation();
    const [sessionId, setSessionId] = useState<string>("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sid = params.get("session_id");
        if (sid) {
            setSessionId(sid);
        }
    }, []);

    const { data, isLoading, error } = trpc.confirmation.confirm.useQuery(
        { sessionId },
        { enabled: !!sessionId, retry: false }
    );

    if (!sessionId) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center py-16">
                    <Card className="max-w-md mx-auto">
                        <CardContent className="pt-6 text-center">
                            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Invalid Request</h2>
                            <p className="text-muted-foreground mb-6">
                                No payment session found. Please try booking again.
                            </p>
                            <Button onClick={() => setLocation("/book")}>Return to Booking</Button>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center py-16">
                    <Card className="max-w-md mx-auto">
                        <CardContent className="pt-6 text-center">
                            <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
                            <h2 className="text-2xl font-bold mb-2">Processing Your Payment...</h2>
                            <p className="text-muted-foreground">
                                Please wait while we confirm your booking.
                            </p>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !data?.success) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center py-16">
                    <Card className="max-w-md mx-auto border-yellow-500">
                        <CardContent className="pt-6 text-center">
                            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Payment Verification Pending</h2>
                            <p className="text-muted-foreground mb-6">
                                We received your payment request but couldn't confirm it yet. Our team has been
                                notified and will contact you shortly to confirm your booking.
                            </p>
                            <p className="text-sm text-muted-foreground mb-6">
                                Error: {error?.message || data?.error || "Unknown error"}
                            </p>
                            <div className="space-y-2">
                                <Button onClick={() => setLocation("/")}>Return Home</Button>
                                <p className="text-sm text-muted-foreground">
                                    Questions? Call us at <a href="tel:0276421824" className="font-bold">027 642 1824</a>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Seo title="Payment Success | Booking Confirmed" description="Thank you for your booking. Your payment has been received and your appointment is confirmed." />
            <Header />
            <main className="flex-1 flex items-center justify-center py-16 bg-muted/30">
                <Card className="max-w-2xl mx-auto border-2 border-green-500">
                    <CardContent className="pt-6">
                        <div className="text-center mb-6">
                            <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-4" />
                            <h1 className="text-3xl font-bold mb-2">Payment Received!</h1>
                            <p className="text-xl text-muted-foreground">
                                Your booking has been confirmed
                            </p>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
                                <p className="text-3xl font-bold text-green-700">{data.bookingRef}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                <Mail className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-semibold">Confirmation Email Sent</p>
                                    <p className="text-sm text-muted-foreground">
                                        We've sent a confirmation to {data.email}
                                    </p>
                                </div>
                            </div>

                            {data.calendarEventId && !data.calendarFailed && (
                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-semibold">Calendar Event Created</p>
                                        <p className="text-sm text-muted-foreground">
                                            Your appointment has been added to our calendar
                                        </p>
                                        {data.calendarEventLink && (
                                            <a
                                                href={data.calendarEventLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:underline"
                                            >
                                                View in Google Calendar →
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {data.calendarFailed && (
                                <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-yellow-800">Calendar Sync Pending</p>
                                        <p className="text-sm text-yellow-700">
                                            We'll manually add this to our calendar and confirm your appointment time shortly
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                            <h3 className="font-semibold mb-2">What Happens Next?</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>✓ We'll contact you within 24 hours to confirm your appointment time</li>
                                <li>✓ Our mobile mechanic will arrive at your location on the scheduled date</li>
                                <li>✓ Any balance due will be collected after the service is complete</li>
                            </ul>
                        </div>

                        <div className="text-center space-y-3">
                            <Button onClick={() => setLocation("/")} size="lg" className="w-full">
                                Return to Home
                            </Button>
                            <p className="text-sm text-muted-foreground">
                                Need to make changes? Call us at{" "}
                                <a href="tel:0276421824" className="font-bold text-primary hover:underline">
                                    027 642 1824
                                </a>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
