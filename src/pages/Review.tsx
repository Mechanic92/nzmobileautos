/**
 * Review Collection Page
 * Simple landing page to direct customers to leave a Google review
 */

import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { Star, ExternalLink, MessageSquare, ThumbsUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '../../Header';
import Footer from '../../Footer';

// Configure your Google Business Profile review link here
// To find your link:
// 1. Go to Google Maps and search for your business
// 2. Click "Write a review" and copy the URL
// Or use: https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID
const GOOGLE_REVIEW_URL = 'https://g.page/r/mobileautoworksnz/review';

// Alternative: Direct place ID link (replace with your actual place ID)
// const GOOGLE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJ...';

export default function Review() {
  const handleReviewClick = () => {
    // Track review click if analytics is set up
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'review_click', {
        event_category: 'engagement',
        event_label: 'google_review',
      });
    }
    window.open(GOOGLE_REVIEW_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Helmet>
        <title>Leave a Review | Mobile Autoworks NZ</title>
        <meta name="description" content="Had a great experience with Mobile Autoworks NZ? We'd love to hear your feedback! Leave us a Google review." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            {/* Stars decoration */}
            <div className="flex justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="w-8 h-8 text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              How Did We Do?
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              Your feedback helps us improve and helps other Aucklanders find reliable mobile mechanic services.
            </p>

            {/* Main CTA */}
            <Card className="mb-8 border-2 border-primary/20 bg-white shadow-lg">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <img
                    src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png"
                    alt="Google"
                    className="h-6"
                  />
                </div>
                
                <h2 className="text-2xl font-semibold mb-4">
                  Leave a Google Review
                </h2>

                <p className="text-gray-600 mb-6">
                  It only takes 30 seconds and makes a huge difference to our small business.
                </p>

                <Button
                  size="lg"
                  onClick={handleReviewClick}
                  className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700"
                >
                  Write a Review
                  <ExternalLink className="ml-2 w-5 h-5" />
                </Button>

                <p className="text-sm text-gray-500 mt-4">
                  Opens Google Maps in a new tab
                </p>
              </CardContent>
            </Card>

            {/* What to mention */}
            <div className="text-left bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                What to mention in your review
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <ThumbsUp className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>The service you received (diagnostic, pre-purchase inspection, servicing, etc.)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>How convenient the mobile service was</span>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span>Your overall experience and if you'd recommend us</span>
                </li>
              </ul>
            </div>

            {/* Thank you message */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Thank you for choosing Mobile Autoworks NZ. We appreciate your business!
              </p>
              <Link href="/">
                <Button variant="outline">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
