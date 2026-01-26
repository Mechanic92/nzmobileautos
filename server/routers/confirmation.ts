import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { stripe } from "../utils/stripe";
import { createCalendarEvent } from "../utils/calendar";
import { sendAdminBookingConfirmation } from "../utils/email";
import { updateBookingStatus } from "../../db";

export const confirmationRouter = router({
    /**
     * Confirm a Stripe checkout session and process the booking
     * This is called from the /success page after payment
     */
    confirm: publicProcedure
        .input(z.object({
            sessionId: z.string(),
        }))
        .query(async ({ input }) => {
            if (!stripe) {
                return {
                    success: false,
                    error: "Payment system not configured",
                };
            }

            try {
                // Retrieve the checkout session from Stripe
                const session = await stripe.checkout.sessions.retrieve(input.sessionId, {
                    expand: ["payment_intent"],
                });

                // Verify payment was successful
                if (session.payment_status !== "paid") {
                    return {
                        success: false,
                        error: "Payment not completed",
                        paymentStatus: session.payment_status,
                    };
                }

                // Check if already confirmed (idempotency)
                if (session.metadata.confirmed === "true") {
                    console.log("[Confirmation] Session already confirmed:", input.sessionId);
                    return {
                        success: true,
                        bookingRef: session.metadata.bookingRef || session.id.slice(-8),
                        alreadyConfirmed: true,
                    };
                }

                // Generate booking reference
                const bookingRef = session.id.slice(-8).toUpperCase();

                // Extract booking data from metadata
                const bookingData = {
                    customerName: session.metadata.customerName || "",
                    phone: session.metadata.phone || "",
                    email: session.customer_email || session.metadata.email || "",
                    address: session.metadata.address || "",
                    suburb: session.metadata.suburb || "",
                    vehicleRego: session.metadata.vehicleRego || "",
                    vehicleMake: session.metadata.vehicleMake || "",
                    vehicleModel: session.metadata.vehicleModel || "",
                    vehicleYear: parseInt(session.metadata.vehicleYear || "0"),
                    serviceType: session.metadata.serviceType || "",
                    appointmentDate: session.metadata.appointmentDate || "",
                    appointmentTime: session.metadata.appointmentTime || "",
                    notes: session.metadata.notes || "",
                };

                const paymentIntent = session.payment_intent as any;
                const amountPaid = session.amount_total || 0;
                const paidAt = new Date((paymentIntent?.created || Date.now() / 1000) * 1000).toISOString();

                // Create Google Calendar event
                let calendarEventId: string | undefined;
                let calendarEventLink: string | undefined;
                let calendarFailed = false;

                try {
                    const calendarResult = await createCalendarEvent({
                        ...bookingData,
                        stripeSessionId: session.id,
                        paymentIntentId: paymentIntent?.id,
                        amountPaid,
                        paidAt,
                    });

                    if (calendarResult) {
                        calendarEventId = calendarResult.eventId;
                        calendarEventLink = calendarResult.eventLink;
                    } else {
                        calendarFailed = true;
                    }
                } catch (error: any) {
                    console.error("[Confirmation] Calendar creation failed:", error.message);
                    calendarFailed = true;
                }

                // Send admin confirmation email
                try {
                    await sendAdminBookingConfirmation({
                        bookingRef,
                        ...bookingData,
                        stripeSessionId: session.id,
                        paymentIntentId: paymentIntent?.id,
                        amountPaid,
                        paidAt,
                        calendarEventId,
                        calendarEventLink,
                        calendarFailed,
                    });
                } catch (error: any) {
                    console.error("[Confirmation] Email send failed:", error.message);
                    // Don't fail the whole confirmation if email fails
                }

                // Update Stripe session metadata to mark as confirmed (idempotency)
                try {
                    await stripe.checkout.sessions.update(session.id, {
                        metadata: {
                            ...session.metadata,
                            confirmed: "true",
                            bookingRef,
                            calendarEventId: calendarEventId || "",
                            confirmedAt: new Date().toISOString(),
                        },
                    });
                } catch (error: any) {
                    console.error("[Confirmation] Failed to update session metadata:", error.message);
                }

                // Update booking status in database
                const bookingId = parseInt(session.metadata.bookingId || "0");
                if (bookingId) {
                    try {
                        await updateBookingStatus(bookingId, "confirmed", undefined, undefined, undefined, "paid");
                    } catch (error: any) {
                        console.error("[Confirmation] Failed to update booking status:", error.message);
                    }
                }

                return {
                    success: true,
                    bookingRef,
                    customerName: bookingData.customerName,
                    email: bookingData.email,
                    calendarEventId,
                    calendarEventLink,
                    calendarFailed,
                };
            } catch (error: any) {
                console.error("[Confirmation] Error processing confirmation:", error.message);
                return {
                    success: false,
                    error: error.message || "Failed to confirm booking",
                };
            }
        }),
});
