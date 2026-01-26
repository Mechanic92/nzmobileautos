import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./Home";
import Services from "./Services";
import About from "./About";
import Blog from "./Blog";
import BlogPost from "./BlogPost";
import ServicePage from "./src/pages/ServicePage";
import LocationPage from "./src/pages/LocationPage";
import ServiceAreas from "./ServiceAreas";
import Quote from "./Quote";
import BookingRequest from "./BookingRequest";
import PrepaidBooking from "./src/pages/PrepaidBooking";
import BookingSuccess from "./src/pages/BookingSuccess";
import BookingCancel from "./src/pages/BookingCancel";
import MobileDiagnosticAuckland from "./src/pages/MobileDiagnosticAuckland";
import PrePurchaseInspectionAuckland from "./src/pages/PrePurchaseInspectionAuckland";
import CarWontStartAuckland from "./src/pages/CarWontStartAuckland";
import Review from "./src/pages/Review";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services/:slug" component={ServicePage} />
      <Route path="/services" component={Services} />
      <Route path="/about" component={About} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/areas/:slug" component={LocationPage} />
      <Route path="/areas" component={ServiceAreas} />
      <Route path="/book" component={BookingRequest} />
      <Route path="/quote" component={Quote} />
      
      {/* Prepaid Booking System */}
      <Route path="/booking" component={PrepaidBooking} />
      <Route path="/booking/success" component={BookingSuccess} />
      <Route path="/booking/cancel" component={BookingCancel} />
      
      {/* SEO Service Pages */}
      <Route path="/mobile-diagnostic-auckland" component={MobileDiagnosticAuckland} />
      <Route path="/pre-purchase-inspection-auckland" component={PrePurchaseInspectionAuckland} />
      <Route path="/car-wont-start-auckland" component={CarWontStartAuckland} />
      <Route path="/review" component={Review} />
      
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <ErrorBoundary>
          <div className="flex flex-col min-h-screen font-sans selection:bg-primary selection:text-primary-foreground">
            <Router />
            <Toaster richColors position="top-center" closeButton />
          </div>
        </ErrorBoundary>
      </TooltipProvider>
    </ThemeProvider>
  );
}
