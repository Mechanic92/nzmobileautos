/**
 * Booking Success Page
 * Displayed after successful Stripe payment
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle2, Calendar, MapPin, Car, Phone, Mail, Clock, Download, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Header from '../../Header';
import Footer from '../../Footer';
import { Helmet } from 'react-helmet-async';

interface BookingDetails {
  bookingRef: string;
  customerName: string;
  email: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  address: string;
  vehicleRego: string;
  totalAmount: number;
  isWeekendBooking: boolean;
  status: string;
}

export default function BookingSuccess() {
  const [, navigate] = useLocation();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const bookingRef = params.get('ref');

    if (!sessionId || !bookingRef) {
      navigate('/booking');
      return;
    }

    // Fetch booking details
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/trpc/prepaidBooking.getByRef?input=${encodeURIComponent(JSON.stringify({ bookingRef, sessionId }))}`);
        const data = await response.json();
        
        if (data.result?.data?.found) {
          setBooking(data.result.data);
        }
      } catch (error) {
        console.error('Failed to fetch booking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [navigate]);

  const getServiceName = (type: string) => {
    const services: Record<string, string> = {
      mobile_diagnostic: 'Mobile Diagnostic (incl call-out)',
      pre_purchase_inspection: 'Pre-Purchase Inspection',
    };
    return services[type] || type;
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your booking details...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Booking Confirmed | Mobile Autoworks NZ</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Booking Confirmed!
              </h1>
              <p className="text-lg text-gray-600">
                Thank you for your payment. Your booking is secured.
              </p>
            </div>

            {/* Booking Reference */}
            {booking && (
              <Card className="mb-6 border-2 border-green-200 bg-green-50/50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
                    <p className="text-2xl font-mono font-bold text-green-700 tracking-wider">
                      {booking.bookingRef}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Please save this reference for your records
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Weekend Notice */}
            {booking?.isWeekendBooking && (
              <Card className="mb-6 border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-amber-800">Weekend Booking - Pending Confirmation</h3>
                      <p className="text-sm text-amber-700 mt-1">
                        Weekend appointments are by arrangement. We'll contact you within 24 hours to confirm the exact time.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Booking Details */}
            {booking && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Booking Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-500">Service</p>
                      <p className="font-medium">{getServiceName(booking.serviceType)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount Paid</p>
                      <p className="font-medium text-green-600">${booking.totalAmount} NZD</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{booking.preferredDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">
                        {booking.isWeekendBooking ? 'To be confirmed' : booking.preferredTime}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Service Location</p>
                        <p className="font-medium">{booking.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Car className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Vehicle</p>
                        <p className="font-medium">{booking.vehicleRego}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* What's Next */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">1</span>
                    <div>
                      <p className="font-medium">Confirmation Email</p>
                      <p className="text-sm text-gray-600">Check your inbox for a detailed confirmation email with all booking information.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">2</span>
                    <div>
                      <p className="font-medium">Prepare Your Vehicle</p>
                      <p className="text-sm text-gray-600">Ensure the vehicle is accessible, keys are available, and there's a safe working space.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">3</span>
                    <div>
                      <p className="font-medium">We'll Arrive On Time</p>
                      <p className="text-sm text-gray-600">Our mechanic will arrive at your location at the scheduled time, ready to work.</p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Need to make changes or have questions?</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="tel:0276421824" className="inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                      <Phone className="w-5 h-5" />
                      027 642 1824
                    </a>
                    <a href="mailto:chris@mobileautoworksnz.com" className="inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                      <Mail className="w-5 h-5" />
                      chris@mobileautoworksnz.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/')}>
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Button>
              <Button onClick={() => window.print()}>
                <Download className="w-4 h-4 mr-2" />
                Print Confirmation
              </Button>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
