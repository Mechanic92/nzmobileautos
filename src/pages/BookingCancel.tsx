/**
 * Booking Cancelled Page
 * Displayed when user cancels Stripe checkout
 */

import { useLocation } from 'wouter';
import { XCircle, ArrowLeft, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '../../Header';
import Footer from '../../Footer';
import { Helmet } from 'react-helmet-async';

export default function BookingCancel() {
  const [, navigate] = useLocation();

  return (
    <>
      <Helmet>
        <title>Booking Cancelled | Mobile Autoworks NZ</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center">
            
            {/* Cancel Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <XCircle className="w-12 h-12 text-gray-400" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Booking Not Completed
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Your payment was cancelled and no charges were made. Your booking slot has not been reserved.
            </p>

            {/* Actions */}
            <div className="space-y-4 mb-8">
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => navigate('/booking')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={() => navigate('/')}
              >
                Return Home
              </Button>
            </div>

            {/* Help Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  If you experienced any issues or have questions about our services, we're here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a 
                    href="tel:0276421824" 
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    027 642 1824
                  </a>
                  <a 
                    href="mailto:chris@mobileautoworksnz.com" 
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Email Us
                  </a>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
