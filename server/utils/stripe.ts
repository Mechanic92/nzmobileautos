import Stripe from "stripe";
import { PricingResult } from "./pricing";

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2024-11-20.acacia", // Use a recent API version or match what was in next/package.json if known. I'll default to a recent one.
        typescript: true,
    })
    : null;

const APP_URL = process.env.PUBLIC_APP_URL || "http://localhost:5173"; // Vite default

export async function createStripeCheckoutSession(
    bookingId: number,
    customerEmail: string,
    pricing: PricingResult,
    bookingData: {
        customerName: string;
        phone: string;
        address: string;
        suburb: string;
        vehicleRego?: string;
        vehicleMake: string;
        vehicleModel: string;
        vehicleYear: number;
        serviceType: string;
        appointmentDate: string; // ISO string
        appointmentTime: string;
        notes?: string;
    }
) {
    if (!stripe) {
        console.warn("Stripe key not found. Skipping payment session creation.");
        return null;
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: customerEmail,
        line_items: [
            {
                price_data: {
                    currency: pricing.currency,
                    product_data: {
                        name: pricing.description,
                        description: pricing.isDeposit
                            ? "Deposit payment. Balance due upon completion of work."
                            : "Service fee.",
                    },
                    unit_amount: pricing.amountCents,
                },
                quantity: 1,
            },
        ],
        metadata: {
            bookingId: bookingId.toString(),
            customerName: bookingData.customerName,
            phone: bookingData.phone,
            address: bookingData.address,
            suburb: bookingData.suburb,
            vehicleRego: bookingData.vehicleRego || "",
            vehicleMake: bookingData.vehicleMake,
            vehicleModel: bookingData.vehicleModel,
            vehicleYear: bookingData.vehicleYear.toString(),
            serviceType: bookingData.serviceType,
            appointmentDate: bookingData.appointmentDate,
            appointmentTime: bookingData.appointmentTime,
            notes: bookingData.notes || "",
        },
        success_url: `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${APP_URL}/cancel`,
    });

    return session;
}

export { stripe };
