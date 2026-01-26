import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Car, FileText, MapPin, Phone, Mail } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import { getLoginUrl } from "@/const";

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: bookings, isLoading: bookingsLoading } = trpc.bookings.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: serviceHistory, isLoading: historyLoading } = trpc.serviceHistory.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
              <CardDescription>Please log in to view your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = getLoginUrl()} className="w-full">
                Log In
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 bg-muted/30">
        <div className="container max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-muted-foreground">Manage your bookings and service history</p>
          </div>

          {/* User Info Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'}>
                  {user?.role === 'admin' ? 'Admin' : 'Customer'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Bookings */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Upcoming Bookings</h2>
            {bookingsLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : bookings && bookings.length > 0 ? (
              <div className="grid gap-4">
                {bookings
                  .filter((b: any) => ['pending', 'confirmed', 'in_progress'].includes(b.status))
                  .map((booking: any) => (
                    <Card key={booking.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg">{booking.serviceType}</h3>
                            <p className="text-sm text-muted-foreground">
                              {booking.vehicleYear} {booking.vehicleMake} {booking.vehicleModel}
                            </p>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(booking.appointmentDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.appointmentTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.suburb}</span>
                          </div>
                        </div>
                        {user?.role === 'admin' && (
                          <div className="mt-4 flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => window.location.href = `/inspection/${booking.id}`}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Inspection Report
                            </Button>
                          </div>
                        )}
                        {booking.adminNotes && (
                          <div className="mt-4 p-3 bg-muted rounded">
                            <p className="text-sm"><strong>Note from mechanic:</strong> {booking.adminNotes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No upcoming bookings</p>
                  <Button onClick={() => window.location.href = "/book"}>Book a Service</Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Service History */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Service History</h2>
            {historyLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : serviceHistory && serviceHistory.length > 0 ? (
              <div className="grid gap-4">
                {serviceHistory.map((service: any) => (
                  <Card key={service.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{service.serviceType}</h3>
                          <p className="text-sm text-muted-foreground">
                            {service.vehicleMake} {service.vehicleModel} {service.vehicleRego && `(${service.vehicleRego})`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">${service.totalCost}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(service.serviceDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="bg-muted p-3 rounded mb-3">
                        <p className="text-sm"><strong>Work Performed:</strong></p>
                        <p className="text-sm mt-1">{service.workPerformed}</p>
                      </div>
                      {service.partsUsed && (
                        <div className="bg-muted p-3 rounded mb-3">
                          <p className="text-sm"><strong>Parts Used:</strong></p>
                          <p className="text-sm mt-1">{service.partsUsed}</p>
                        </div>
                      )}
                      {service.nextServiceDue && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Next service due: {new Date(service.nextServiceDue).toLocaleDateString()}</span>
                        </div>
                      )}
                      {service.invoiceUrl && (
                        <Button variant="outline" size="sm" className="mt-3" asChild>
                          <a href={service.invoiceUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-2" />
                            View Invoice
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No service history yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
