import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, Phone, Mail, Car, AlertCircle, DollarSign, TrendingUp, Users, FileText, ClipboardList } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import Header from "./Header";
import Footer from "./Footer";
import { getLoginUrl } from "@/const";

export default function Admin() {
  const { user, loading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("bookings");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [actualCost, setActualCost] = useState("");

  const [reportBooking, setReportBooking] = useState<any>(null);
  const [reportType, setReportType] = useState<"basic" | "asset" | "chassis">("basic");
  const [reportResult, setReportResult] = useState<any>(null);

  const { data: bookings, isLoading: bookingsLoading, refetch } = trpc.bookings.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: quotes, isLoading: quotesLoading } = trpc.quotes.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const basicVehicleInfoQuery = trpc.vehicle.basicVehicleInfo.useQuery(
    {
      plate: reportBooking?.vehicleRego || undefined,
      vin: undefined,
    },
    {
      enabled: false,
      retry: false,
    }
  );

  const assetCheckQuery = trpc.vehicle.assetCheck.useQuery(
    {
      plate: reportBooking?.vehicleRego || undefined,
      vin: undefined,
    },
    {
      enabled: false,
      retry: false,
    }
  );

  const chassisCheckQuery = trpc.vehicle.chassisCheckPlusRedbook.useQuery(
    {
      plate: reportBooking?.vehicleRego || undefined,
      vin: undefined,
      widen: false,
    },
    {
      enabled: false,
      retry: false,
    }
  );

  const updateStatusMutation = trpc.bookings.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Booking updated successfully");
      setSelectedBooking(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update booking");
    },
  });

  const handleUpdateStatus = async () => {
    if (!selectedBooking || !newStatus) return;

    await updateStatusMutation.mutateAsync({
      id: selectedBooking.id,
      status: newStatus as any,
      adminNotes: adminNotes || undefined,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      actualCost: actualCost ? parseFloat(actualCost) : undefined,
    });
  };

  const runVehicleReport = async () => {
    if (!reportBooking?.vehicleRego) {
      toast.error("This booking has no registration plate recorded.");
      return;
    }

    setReportResult(null);
    try {
      if (reportType === "basic") {
        const res = await basicVehicleInfoQuery.refetch();
        setReportResult(res.data);
      } else if (reportType === "asset") {
        const res = await assetCheckQuery.refetch();
        setReportResult(res.data);
      } else {
        const res = await chassisCheckQuery.refetch();
        setReportResult(res.data);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to run MotorWeb report");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>Admin access required</CardDescription>
            </CardHeader>
            <CardContent>
              {!isAuthenticated ? (
                <Button onClick={() => window.location.href = getLoginUrl()} className="w-full">
                  Log In
                </Button>
              ) : (
                <p className="text-center text-muted-foreground">You don't have permission to access this page</p>
              )}
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

  const totalRevenue = bookings?.reduce((sum: number, b: any) => sum + (b.actualCost || 0), 0) || 0;
  const pipelineValue = bookings?.reduce((sum: number, b: any) => {
    return b.status !== 'cancelled' && b.status !== 'completed' ? sum + (b.estimatedCost || 0) : sum;
  }, 0) || 0;

  const customers = useMemo(() => {
    if (!bookings) return [];
    const customerMap = bookings.reduce((acc: any, booking: any) => {
      const email = booking.email.toLowerCase();
      if (!acc[email]) {
        acc[email] = {
          id: email,
          name: booking.customerName,
          email: booking.email,
          phone: booking.phone,
          bookings: [],
          totalSpent: 0,
          lastVisit: booking.appointmentDate,
        };
      }
      acc[email].bookings.push(booking);
      acc[email].totalSpent += (booking.actualCost || 0);
      if (new Date(booking.appointmentDate) > new Date(acc[email].lastVisit)) {
        acc[email].lastVisit = booking.appointmentDate;
      }
      return acc;
    }, {});
    return Object.values(customerMap).sort((a: any, b: any) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());
  }, [bookings]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 bg-muted/30">
        <div className="container max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage bookings, quotes, and business performance</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {bookings?.filter((b: any) => b.status === 'pending').length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Pending Bookings</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {bookings?.filter((b: any) => ['confirmed', 'in_progress'].includes(b.status)).length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Active Jobs</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-800">
                    <DollarSign className="h-5 w-5" />
                    <p className="text-3xl font-bold">
                      {totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Total Revenue</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <TrendingUp className="h-5 w-5" />
                    <p className="text-3xl font-bold">
                      {pipelineValue.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Pipeline Value</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b pb-1 overflow-x-auto">
            <Button 
              variant={activeTab === "bookings" ? "default" : "ghost"}
              onClick={() => setActiveTab("bookings")}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              Bookings
            </Button>
            <Button 
              variant={activeTab === "quotes" ? "default" : "ghost"}
              onClick={() => setActiveTab("quotes")}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Quotes
            </Button>
            <Button 
              variant={activeTab === "customers" ? "default" : "ghost"}
              onClick={() => setActiveTab("customers")}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Customers
            </Button>
          </div>

          {/* Bookings Management */}
          {activeTab === "bookings" && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">All Bookings</h2>
              </div>
              {bookingsLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : bookings && bookings.length > 0 ? (
                <div className="grid gap-4">
                  {bookings.map((booking: any) => (
                    <Card key={booking.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg">{booking.serviceType}</h3>
                            <p className="text-sm text-muted-foreground">
                              {booking.vehicleYear} {booking.vehicleMake} {booking.vehicleModel}
                              {booking.vehicleRego && ` (${booking.vehicleRego})`}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            {booking.estimatedCost && (
                              <span className="text-xs text-muted-foreground">
                                Est: ${booking.estimatedCost}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
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
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.phone}</span>
                          </div>
                        </div>

                        <div className="bg-muted p-3 rounded mb-3">
                          <p className="text-sm"><strong>Customer:</strong> {booking.customerName}</p>
                          <p className="text-sm"><strong>Email:</strong> {booking.email}</p>
                          <p className="text-sm"><strong>Address:</strong> {booking.address}</p>
                          {booking.notes && <p className="text-sm mt-2"><strong>Notes:</strong> {booking.notes}</p>}
                        </div>

                        {booking.adminNotes && (
                          <div className="bg-primary/10 p-3 rounded mb-3">
                            <p className="text-sm"><strong>Admin Notes:</strong> {booking.adminNotes}</p>
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-4">
                          {user?.role === 'admin' && (
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => window.location.href = `/inspection/${booking.id}`}
                              >
                                <Car className="h-4 w-4 mr-2" />
                                Inspection Report
                              </Button>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setReportBooking(booking);
                                      setReportType("basic");
                                      setReportResult(null);
                                    }}
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Vehicle Reports
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>MotorWeb Vehicle Reports</DialogTitle>
                                    <DialogDescription>
                                      Run business-grade reports for {booking.vehicleRego || "(no rego on booking)"}
                                    </DialogDescription>
                                  </DialogHeader>

                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium">Report Type</label>
                                      <Select value={reportType} onValueChange={(v) => setReportType(v as any)}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="basic">Basic Vehicle Info</SelectItem>
                                          <SelectItem value="asset">Asset Check</SelectItem>
                                          <SelectItem value="chassis">Chassis Check + Redbook</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <Button
                                      className="w-full"
                                      onClick={runVehicleReport}
                                      disabled={
                                        !booking.vehicleRego ||
                                        basicVehicleInfoQuery.isFetching ||
                                        assetCheckQuery.isFetching ||
                                        chassisCheckQuery.isFetching
                                      }
                                    >
                                      {basicVehicleInfoQuery.isFetching || assetCheckQuery.isFetching || chassisCheckQuery.isFetching
                                        ? "Running..."
                                        : "Run Report"}
                                    </Button>

                                    {reportResult?.summary && (
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Summary</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm">
                                          <div className="grid md:grid-cols-2 gap-2">
                                            <div><strong>Plate:</strong> {reportResult.summary.plate ?? "-"}</div>
                                            <div><strong>VIN:</strong> {reportResult.summary.vin ?? "-"}</div>
                                            <div><strong>Make:</strong> {reportResult.summary.make ?? "-"}</div>
                                            <div><strong>Model:</strong> {reportResult.summary.model ?? "-"}</div>
                                            <div><strong>Year:</strong> {reportResult.summary.year ?? "-"}</div>
                                            {"regoExpiry" in reportResult.summary && (
                                              <div><strong>Rego Expiry:</strong> {reportResult.summary.regoExpiry ?? "-"}</div>
                                            )}
                                            {"wofExpiry" in reportResult.summary && (
                                              <div><strong>WOF Expiry:</strong> {reportResult.summary.wofExpiry ?? "-"}</div>
                                            )}
                                          </div>

                                          {Array.isArray(reportResult.summary.alerts) && reportResult.summary.alerts.length > 0 && (
                                            <div className="mt-3">
                                              <strong>Alerts:</strong>
                                              <div className="mt-2 space-y-2">
                                                {reportResult.summary.alerts.map((a: any, idx: number) => (
                                                  <div key={idx} className="border rounded p-2">
                                                    <div className="font-medium">{a.msgCode ?? "Alert"}</div>
                                                    <div className="text-muted-foreground">{a.description ?? ""}</div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>
                                    )}

                                    {reportResult?.raw && (
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Raw Output</CardTitle>
                                          <CardDescription>
                                            {reportResult.contentType || ""}
                                          </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                          <pre className="text-xs whitespace-pre-wrap break-words bg-muted p-3 rounded">
                                            {typeof reportResult.raw === "string"
                                              ? reportResult.raw
                                              : JSON.stringify(reportResult.raw, null, 2)}
                                          </pre>
                                        </CardContent>
                                      </Card>
                                    )}

                                    {(basicVehicleInfoQuery.error || assetCheckQuery.error || chassisCheckQuery.error) && (
                                      <Card className="border-destructive">
                                        <CardContent className="pt-6 text-sm">
                                          <div className="font-medium">Report Error</div>
                                          <div className="text-muted-foreground mt-1">
                                            {(basicVehicleInfoQuery.error as any)?.message ||
                                              (assetCheckQuery.error as any)?.message ||
                                              (chassisCheckQuery.error as any)?.message ||
                                              "Unable to run report"}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setNewStatus(booking.status);
                                  setAdminNotes(booking.adminNotes || "");
                                  setEstimatedCost(booking.estimatedCost?.toString() || "");
                                  setActualCost(booking.actualCost?.toString() || "");
                                }}
                              >
                                Update Status
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update Booking</DialogTitle>
                                <DialogDescription>
                                  Update status and financials for {booking.customerName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Status</label>
                                  <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="confirmed">Confirmed</SelectItem>
                                      <SelectItem value="in_progress">In Progress</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Est. Cost ($)</label>
                                    <Input 
                                      type="number" 
                                      value={estimatedCost} 
                                      onChange={(e) => setEstimatedCost(e.target.value)}
                                      placeholder="0.00"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Actual Cost ($)</label>
                                    <Input 
                                      type="number" 
                                      value={actualCost} 
                                      onChange={(e) => setActualCost(e.target.value)}
                                      placeholder="0.00"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Admin Notes</label>
                                  <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Internal notes..."
                                    rows={3}
                                  />
                                </div>
                                <Button
                                  onClick={handleUpdateStatus}
                                  disabled={updateStatusMutation.isPending}
                                  className="w-full"
                                >
                                  {updateStatusMutation.isPending ? "Updating..." : "Update Booking"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No bookings yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Quote Requests */}
          {activeTab === "quotes" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Quote Requests</h2>
              {quotesLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : quotes && quotes.length > 0 ? (
                <div className="grid gap-4">
                  {quotes.map((quote: any) => (
                    <Card key={quote.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg">{quote.customerName}</h3>
                            <p className="text-sm text-muted-foreground">{quote.serviceType}</p>
                          </div>
                          <Badge variant="secondary">
                            {new Date(quote.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{quote.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{quote.email}</span>
                          </div>
                        </div>

                        {quote.vehicleMake && (
                          <div className="bg-muted p-3 rounded mb-3">
                            <p className="text-sm">
                              <strong>Vehicle:</strong> {quote.vehicleYear} {quote.vehicleMake} {quote.vehicleModel}
                            </p>
                          </div>
                        )}

                        {quote.message && (
                          <div className="bg-muted p-3 rounded">
                            <p className="text-sm"><strong>Message:</strong></p>
                            <p className="text-sm mt-1">{quote.message}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No quote requests</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Customer Management */}
          {activeTab === "customers" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Customer List</h2>
              <div className="grid gap-4">
                {customers.map((customer: any) => (
                  <Card key={customer.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{customer.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xl">${customer.totalSpent.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Total Spend</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm">
                        <div className="text-muted-foreground">
                          {customer.bookings.length} Booking{customer.bookings.length !== 1 ? 's' : ''} • Last seen {new Date(customer.lastVisit).toLocaleDateString()}
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <ClipboardList className="h-4 w-4 mr-2" />
                              View History
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{customer.name}'s History</DialogTitle>
                              <DialogDescription>
                                Complete booking history and vehicle service records
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              {customer.bookings.map((booking: any) => (
                                <div key={booking.id} className="border rounded p-3 text-sm">
                                  <div className="flex justify-between mb-2">
                                    <span className="font-bold">{booking.serviceType}</span>
                                    <Badge className={getStatusColor(booking.status)}>
                                      {booking.status}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-muted-foreground mb-2">
                                    <div>Date: {new Date(booking.appointmentDate).toLocaleDateString()}</div>
                                    <div>Vehicle: {booking.vehicleMake} {booking.vehicleModel}</div>
                                  </div>
                                  {booking.adminNotes && (
                                    <div className="bg-muted p-2 rounded text-xs">
                                      Note: {booking.adminNotes}
                                    </div>
                                  )}
                                  <div className="mt-2 text-right font-medium">
                                    {booking.actualCost ? `Cost: $${booking.actualCost}` : 'No charge recorded'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {customers.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No customers found</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
