import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  MinusCircle,
  Loader2,
  Car,
  User,
  Calendar,
  Phone,
  FileText,
  Wrench,
  Shield
} from "lucide-react";
import type { 
  InspectionReportDataV1, 
  InspectionStatus,
  OverallCondition,
  Recommendation
} from "../../shared/types/inspection";

const STATUS_CONFIG: Record<InspectionStatus, { icon: React.ReactNode; color: string; bg: string }> = {
  "OK": { 
    icon: <CheckCircle2 className="h-4 w-4" />, 
    color: "text-green-700", 
    bg: "bg-green-100" 
  },
  "Attention Soon": { 
    icon: <AlertTriangle className="h-4 w-4" />, 
    color: "text-yellow-700", 
    bg: "bg-yellow-100" 
  },
  "Requires Repair": { 
    icon: <XCircle className="h-4 w-4" />, 
    color: "text-red-700", 
    bg: "bg-red-100" 
  },
  "N/A": { 
    icon: <MinusCircle className="h-4 w-4" />, 
    color: "text-gray-500", 
    bg: "bg-gray-100" 
  },
};

const CONDITION_COLORS: Record<OverallCondition, string> = {
  "Excellent": "bg-green-500",
  "Good": "bg-blue-500",
  "Fair": "bg-yellow-500",
  "Poor": "bg-red-500",
};

const RECOMMENDATION_COLORS: Record<Recommendation, string> = {
  "Recommend purchase": "bg-green-600",
  "Caution": "bg-yellow-600",
  "Not recommended": "bg-red-600",
};

export default function PublicReport() {
  const params = useParams<{ token: string }>();
  const token = params.token || "";

  const { data: report, isLoading, error } = trpc.reports.getPublic.useQuery(
    { token },
    { enabled: !!token }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-yellow-500" />
          <p className="text-gray-600">Loading inspection report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Report Not Found</h2>
            <p className="text-gray-600">
              This inspection report link may be invalid or expired.
              Please contact Mobile Autoworks NZ for assistance.
            </p>
            <div className="mt-6 text-sm text-gray-500">
              <Phone className="h-4 w-4 inline mr-1" />
              027 642 1824
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = report.data as InspectionReportDataV1;

  // Count items by status
  const statusCounts = {
    "OK": 0,
    "Attention Soon": 0,
    "Requires Repair": 0,
    "N/A": 0,
  };
  data.sections.forEach((section) => {
    section.items.forEach((item) => {
      statusCounts[item.status]++;
    });
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500 p-2 rounded-lg">
                <Wrench className="h-6 w-6 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Mobile Autoworks NZ</h1>
                <p className="text-sm text-gray-400">Pre-Purchase Inspection Report</p>
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="flex items-center gap-1 text-gray-400">
                <Phone className="h-3 w-3" />
                027 642 1824
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Vehicle & Customer Summary */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="h-5 w-5 text-yellow-500" />
                Vehicle Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Make/Model:</span>
                  <span className="font-medium">{data.vehicle.make} {data.vehicle.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Year:</span>
                  <span className="font-medium">{data.vehicle.year}</span>
                </div>
                {data.vehicle.rego && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Registration:</span>
                    <span className="font-medium">{data.vehicle.rego}</span>
                  </div>
                )}
                {data.vehicle.kms && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Odometer:</span>
                    <span className="font-medium">{data.vehicle.kms.toLocaleString()} km</span>
                  </div>
                )}
                {data.vehicle.vin && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">VIN:</span>
                    <span className="font-medium text-xs">{data.vehicle.vin}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-yellow-500" />
                Inspection Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-medium">{data.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(data.inspectionDate).toLocaleDateString("en-NZ", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Inspector:</span>
                  <span className="font-medium">Mobile Autoworks NZ</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center p-4 border-green-200 bg-green-50">
            <div className="text-3xl font-bold text-green-700">{statusCounts["OK"]}</div>
            <div className="text-xs text-green-600 flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> OK
            </div>
          </Card>
          <Card className="text-center p-4 border-yellow-200 bg-yellow-50">
            <div className="text-3xl font-bold text-yellow-700">{statusCounts["Attention Soon"]}</div>
            <div className="text-xs text-yellow-600 flex items-center justify-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Attention Soon
            </div>
          </Card>
          <Card className="text-center p-4 border-red-200 bg-red-50">
            <div className="text-3xl font-bold text-red-700">{statusCounts["Requires Repair"]}</div>
            <div className="text-xs text-red-600 flex items-center justify-center gap-1">
              <XCircle className="h-3 w-3" /> Requires Repair
            </div>
          </Card>
          <Card className="text-center p-4 border-gray-200 bg-gray-50">
            <div className="text-3xl font-bold text-gray-500">{statusCounts["N/A"]}</div>
            <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <MinusCircle className="h-3 w-3" /> N/A
            </div>
          </Card>
        </div>

        {/* Overall Assessment */}
        <Card className="mb-8 border-2 border-yellow-400">
          <CardHeader className="pb-3 bg-yellow-50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-yellow-600" />
              Overall Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge className={`${CONDITION_COLORS[data.summary.overallCondition]} text-white px-4 py-1`}>
                Condition: {data.summary.overallCondition}
              </Badge>
              <Badge className={`${RECOMMENDATION_COLORS[data.summary.recommendation]} text-white px-4 py-1`}>
                {data.summary.recommendation}
              </Badge>
            </div>
            {data.summary.overallComment && (
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <p className="text-gray-700 whitespace-pre-wrap">{data.summary.overallComment}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Sections */}
        <div className="space-y-6">
          {data.sections.map((section) => (
            <Card key={section.key}>
              <CardHeader className="pb-3 bg-gray-50">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{section.title}</span>
                  <div className="flex gap-1">
                    {section.items.filter((i) => i.status === "OK").length > 0 && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {section.items.filter((i) => i.status === "OK").length} OK
                      </Badge>
                    )}
                    {section.items.filter((i) => i.status === "Requires Repair").length > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {section.items.filter((i) => i.status === "Requires Repair").length} Issues
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {section.items.map((item) => {
                    const config = STATUS_CONFIG[item.status];
                    return (
                      <div key={item.key} className="border-b last:border-0 pb-3 last:pb-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.label}</span>
                          <Badge 
                            variant="outline" 
                            className={`${config.bg} ${config.color} border-0 flex items-center gap-1`}
                          >
                            {config.icon}
                            {item.status}
                          </Badge>
                        </div>
                        {item.comment && (
                          <p className="text-sm text-gray-600 mt-1 pl-2 border-l-2 border-gray-200">
                            {item.comment}
                          </p>
                        )}
                        {item.photos.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {item.photos.map((photo, idx) => (
                              <a
                                key={photo.id}
                                href={photo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-20 h-20 rounded overflow-hidden border hover:border-yellow-400 transition-colors"
                              >
                                <img
                                  src={photo.url}
                                  alt={photo.caption || `Photo ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500 border-t pt-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="bg-yellow-500 p-1.5 rounded">
              <Wrench className="h-4 w-4 text-black" />
            </div>
            <span className="font-semibold text-gray-700">Mobile Autoworks NZ</span>
          </div>
          <p>Mobile Diagnostics & Repairs Across West Auckland</p>
          <p className="mt-1">
            <Phone className="h-3 w-3 inline mr-1" />
            027 642 1824
          </p>
          <p className="mt-4 text-xs text-gray-400">
            This report was generated on {new Date(report.createdAt).toLocaleDateString("en-NZ")} and represents
            the condition of the vehicle at the time of inspection. This report is not a warranty or guarantee.
          </p>
        </div>
      </main>
    </div>
  );
}
