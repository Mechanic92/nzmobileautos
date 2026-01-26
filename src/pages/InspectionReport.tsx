import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "../../Header";
import Footer from "../../Footer";
import { 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  MinusCircle,
  Save,
  Share2,
  Loader2,
  Car,
  User,
  FileText,
  ChevronLeft
} from "lucide-react";
import { toast } from "sonner";
import type { 
  InspectionReportDataV1, 
  InspectionStatus, 
  InspectionSection, 
  InspectionItem,
  OverallCondition,
  Recommendation
} from "../../shared/types/inspection";

const STATUS_OPTIONS: { value: InspectionStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "OK", label: "OK", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-600" },
  { value: "Attention Soon", label: "Attention Soon", icon: <AlertTriangle className="h-4 w-4" />, color: "text-yellow-600" },
  { value: "Requires Repair", label: "Requires Repair", icon: <XCircle className="h-4 w-4" />, color: "text-red-600" },
  { value: "N/A", label: "N/A", icon: <MinusCircle className="h-4 w-4" />, color: "text-gray-400" },
];

const CONDITION_OPTIONS: OverallCondition[] = ["Excellent", "Good", "Fair", "Poor"];
const RECOMMENDATION_OPTIONS: Recommendation[] = ["Recommend purchase", "Caution", "Not recommended"];

export default function InspectionReport() {
  const params = useParams<{ bookingId: string }>();
  const [, setLocation] = useLocation();
  const bookingId = parseInt(params.bookingId || "0", 10);

  const [reportId, setReportId] = useState<number | null>(null);
  const [publicToken, setPublicToken] = useState<string>("");
  const [reportData, setReportData] = useState<InspectionReportDataV1 | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Create or get existing report
  const createOrGetMutation = trpc.reports.createOrGetForBooking.useMutation({
    onSuccess: (data) => {
      setReportId(data.id);
      setPublicToken(data.publicToken);
      setReportData(data.data);
      if (!data.isNew) {
        toast.info("Loaded existing report");
      }
    },
    onError: (error) => {
      toast.error(`Failed to load report: ${error.message}`);
    },
  });

  // Update report mutation
  const updateMutation = trpc.reports.update.useMutation({
    onSuccess: () => {
      setLastSaved(new Date());
      setIsSaving(false);
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
      setIsSaving(false);
    },
  });

  // Load report on mount
  useEffect(() => {
    if (bookingId > 0) {
      createOrGetMutation.mutate({ bookingId, type: "pre_purchase" });
    }
  }, [bookingId]);

  // Debounced autosave
  const saveReport = useCallback(() => {
    if (reportId && reportData) {
      setIsSaving(true);
      updateMutation.mutate({ id: reportId, data: reportData });
    }
  }, [reportId, reportData]);

  // Autosave on changes (debounced)
  useEffect(() => {
    if (!reportData || !reportId) return;
    const timer = setTimeout(saveReport, 2000);
    return () => clearTimeout(timer);
  }, [reportData]);

  // Update item status
  const updateItemStatus = (sectionKey: string, itemKey: string, status: InspectionStatus) => {
    if (!reportData) return;
    setReportData({
      ...reportData,
      sections: reportData.sections.map((section) =>
        section.key === sectionKey
          ? {
              ...section,
              items: section.items.map((item) =>
                item.key === itemKey ? { ...item, status } : item
              ),
            }
          : section
      ),
    });
  };

  // Update item comment
  const updateItemComment = (sectionKey: string, itemKey: string, comment: string) => {
    if (!reportData) return;
    setReportData({
      ...reportData,
      sections: reportData.sections.map((section) =>
        section.key === sectionKey
          ? {
              ...section,
              items: section.items.map((item) =>
                item.key === itemKey ? { ...item, comment } : item
              ),
            }
          : section
      ),
    });
  };

  // Update vehicle info
  const updateVehicle = (field: keyof InspectionReportDataV1["vehicle"], value: string | number) => {
    if (!reportData) return;
    setReportData({
      ...reportData,
      vehicle: { ...reportData.vehicle, [field]: value },
    });
  };

  // Update summary
  const updateSummary = (field: keyof InspectionReportDataV1["summary"], value: string) => {
    if (!reportData) return;
    setReportData({
      ...reportData,
      summary: { ...reportData.summary, [field]: value },
    });
  };

  // Add photo to item (placeholder - would integrate with camera/upload)
  const addPhoto = async (sectionKey: string, itemKey: string) => {
    // In production, this would open camera or file picker
    // and upload to S3, then add the URL to the item's photos array
    toast.info("Photo upload coming soon - will integrate with your phone camera");
  };

  // Copy public link
  const copyPublicLink = () => {
    const url = `${window.location.origin}/report/${publicToken}`;
    navigator.clipboard.writeText(url);
    toast.success("Report link copied to clipboard!");
  };

  // Vehicle lookup mutation
  const lookupMutation = trpc.vehicle.lookup.useMutation({
    onSuccess: (data) => {
      if (!reportData) return;
      const vinFromLookup = (data as any)?.vin as string | undefined;
      setReportData({
        ...reportData,
        vehicle: {
          ...reportData.vehicle,
          make: data.make || reportData.vehicle.make,
          model: data.model || reportData.vehicle.model,
          year: data.year || reportData.vehicle.year,
          vin: vinFromLookup || reportData.vehicle.vin,
        },
      });
      toast.success("Vehicle details found!");
    },
    onError: (error) => {
      toast.error(`Lookup failed: ${error.message}`);
    },
  });

  // Handle vehicle lookup
  const handleLookup = () => {
    const rego = reportData?.vehicle.rego;
    if (!rego) {
      toast.error("Please enter a registration number first");
      return;
    }
    lookupMutation.mutate({ plate: rego });
  };

  // Loading state
  if (createOrGetMutation.isPending || !reportData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading inspection report...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get status icon and color
  const getStatusDisplay = (status: InspectionStatus) => {
    const option = STATUS_OPTIONS.find((o) => o.value === status);
    return option || STATUS_OPTIONS[3];
  };

  // Count items by status
  const countByStatus = (status: InspectionStatus) => {
    return reportData.sections.reduce(
      (count, section) => count + section.items.filter((item) => item.status === status).length,
      0
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <main className="flex-1 pb-24">
        {/* Header Bar */}
        <div className="sticky top-20 z-40 bg-background border-b shadow-sm">
          <div className="container py-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                {isSaving ? (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving...
                  </span>
                ) : lastSaved ? (
                  <span className="text-sm text-muted-foreground">
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                ) : null}
                <Button size="sm" variant="outline" onClick={copyPublicLink}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
                <Button size="sm" onClick={saveReport} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-6 space-y-6">
          {/* Status Summary */}
          <div className="grid grid-cols-4 gap-2">
            <Card className="text-center p-3">
              <div className="text-2xl font-bold text-green-600">{countByStatus("OK")}</div>
              <div className="text-xs text-muted-foreground">OK</div>
            </Card>
            <Card className="text-center p-3">
              <div className="text-2xl font-bold text-yellow-600">{countByStatus("Attention Soon")}</div>
              <div className="text-xs text-muted-foreground">Attention</div>
            </Card>
            <Card className="text-center p-3">
              <div className="text-2xl font-bold text-red-600">{countByStatus("Requires Repair")}</div>
              <div className="text-xs text-muted-foreground">Repair</div>
            </Card>
            <Card className="text-center p-3">
              <div className="text-2xl font-bold text-gray-400">{countByStatus("N/A")}</div>
              <div className="text-xs text-muted-foreground">N/A</div>
            </Card>
          </div>

          {/* Vehicle & Customer Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Make</Label>
                  <Input
                    value={reportData.vehicle.make}
                    onChange={(e) => updateVehicle("make", e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs">Model</Label>
                  <Input
                    value={reportData.vehicle.model}
                    onChange={(e) => updateVehicle("model", e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs">Year</Label>
                  <Input
                    type="number"
                    value={reportData.vehicle.year}
                    onChange={(e) => updateVehicle("year", parseInt(e.target.value) || 0)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs">Rego</Label>
                  <Input
                    value={reportData.vehicle.rego || ""}
                    onChange={(e) => updateVehicle("rego", e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs">Odometer (km)</Label>
                  <Input
                    type="number"
                    value={reportData.vehicle.kms || ""}
                    onChange={(e) => updateVehicle("kms", parseInt(e.target.value) || 0)}
                    className="h-9"
                    placeholder="Enter kms"
                  />
                </div>
                <div>
                  <Label className="text-xs">VIN</Label>
                  <Input
                    value={reportData.vehicle.vin || ""}
                    onChange={(e) => updateVehicle("vin", e.target.value)}
                    className="h-9"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer: {reportData.customer.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {reportData.customer.email && <div>{reportData.customer.email}</div>}
                {reportData.customer.phone && <div>{reportData.customer.phone}</div>}
              </div>
            </CardContent>
          </Card>

          {/* Inspection Sections */}
          <Accordion type="multiple" className="space-y-3">
            {reportData.sections.map((section) => (
              <AccordionItem key={section.key} value={section.key} className="border rounded-lg bg-card">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-2">
                    <span className="font-semibold">{section.title}</span>
                    <div className="flex items-center gap-1">
                      {section.items.filter((i) => i.status === "OK").length > 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          {section.items.filter((i) => i.status === "OK").length} OK
                        </span>
                      )}
                      {section.items.filter((i) => i.status === "Requires Repair").length > 0 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          {section.items.filter((i) => i.status === "Requires Repair").length} Issue
                        </span>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    {section.items.map((item) => (
                      <div key={item.key} className="border rounded-lg p-3 bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="font-medium">{item.label}</Label>
                          <div className={`flex items-center gap-1 ${getStatusDisplay(item.status).color}`}>
                            {getStatusDisplay(item.status).icon}
                          </div>
                        </div>
                        
                        {/* Status Selection - Mobile Friendly Buttons */}
                        <div className="grid grid-cols-4 gap-1 mb-3">
                          {STATUS_OPTIONS.map((option) => (
                            <Button
                              key={option.value}
                              variant={item.status === option.value ? "default" : "outline"}
                              size="sm"
                              className={`text-xs h-8 ${
                                item.status === option.value ? "" : option.color
                              }`}
                              onClick={() => updateItemStatus(section.key, item.key, option.value)}
                            >
                              {option.icon}
                            </Button>
                          ))}
                        </div>

                        {/* Comment */}
                        <Textarea
                          placeholder="Add notes..."
                          value={item.comment || ""}
                          onChange={(e) => updateItemComment(section.key, item.key, e.target.value)}
                          className="min-h-[60px] text-sm"
                        />

                        {/* Photo Button */}
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addPhoto(section.key, item.key)}
                            className="text-xs"
                          >
                            <Camera className="h-3 w-3 mr-1" />
                            Add Photo ({item.photos.length})
                          </Button>
                          {item.photos.length > 0 && (
                            <div className="flex gap-1">
                              {item.photos.slice(0, 3).map((photo, idx) => (
                                <div
                                  key={photo.id}
                                  className="w-8 h-8 rounded bg-muted border overflow-hidden"
                                >
                                  <img
                                    src={photo.url}
                                    alt={`Photo ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                              {item.photos.length > 3 && (
                                <div className="w-8 h-8 rounded bg-muted border flex items-center justify-center text-xs">
                                  +{item.photos.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Summary Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Summary & Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Overall Condition</Label>
                  <Select
                    value={reportData.summary.overallCondition}
                    onValueChange={(value) => updateSummary("overallCondition", value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITION_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Recommendation</Label>
                  <Select
                    value={reportData.summary.recommendation}
                    onValueChange={(value) => updateSummary("recommendation", value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RECOMMENDATION_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Overall Comments</Label>
                <Textarea
                  placeholder="Enter your overall assessment and any important notes for the customer..."
                  value={reportData.summary.overallComment || ""}
                  onChange={(e) => updateSummary("overallComment", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button className="flex-1" size="lg" onClick={saveReport} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Report
                </>
              )}
            </Button>
            <Button variant="secondary" size="lg" onClick={copyPublicLink}>
              <Share2 className="h-4 w-4 mr-2" />
              Share with Customer
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
