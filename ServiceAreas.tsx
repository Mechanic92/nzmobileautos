import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "./Footer";
import Header from "./Header";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";
import { AlertCircle, MapPin, Phone } from "lucide-react";
import { Link } from "wouter";
import { appPortalUrl } from "@/const";
import Seo from "./Seo";

export default function ServiceAreas() {
  const { data: areas, isLoading } = trpc.serviceAreas.list.useQuery();

  const standardAreas = areas?.filter((area) => !area.additionalCharge) || [];
  const additionalChargeAreas = areas?.filter((area) => area.additionalCharge) || [];

  // West Auckland center coordinates
  const westAucklandCenter = { lat: -36.8500, lng: 174.6300 };

  const mapMarkers = (areas ?? [])
    .map((area) => {
      const lat = area.latitude ? Number.parseFloat(area.latitude) : NaN;
      const lng = area.longitude ? Number.parseFloat(area.longitude) : NaN;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return {
        lat,
        lng,
        title: area.name,
      };
    })
    .filter((m): m is { lat: number; lng: number; title: string } => m !== null);

  // Map functionality is currently disabled until API key is provided
  const handleMapReady = (map: any) => {
    // Placeholder for when map integration is active
    console.log("Map ready");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Service Areas | Mobile Mechanic West Auckland & North Shore"
        description="We provide mobile mechanical services across West Auckland including Hobsonville, Henderson, and Massey, plus the North Shore. Check our coverage map."
      />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary to-accent text-primary-foreground py-12 md:py-16">
          <div className="container text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MapPin className="h-10 w-10" />
              <h1 className="text-4xl md:text-5xl font-bold">Service Areas</h1>
            </div>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              We proudly serve West Auckland and North Shore with professional
              mobile mechanical services.
            </p>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-16 bg-background">
          <div className="container">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="h-[500px] w-full">
                  <MapView
                    center={westAucklandCenter}
                    zoom={10}
                    markers={mapMarkers}
                    onMapReady={handleMapReady}
                  />
                </div>
              </CardContent>
            </Card>
            <div className="mt-6 flex flex-wrap gap-6 justify-center items-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-accent/30 border-2 border-accent"></div>
                <span className="text-muted-foreground">Standard Coverage Areas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                <span className="text-muted-foreground">Additional Charge Areas</span>
              </div>
            </div>
          </div>
        </section>

        {/* Service Areas List */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Where We Work
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              We bring professional mobile mechanical services to your home or office across West Auckland and the North Shore.
            </p>

            {isLoading ? (
              <div className="text-center text-muted-foreground flex flex-col items-center gap-4">
                <div className="h-8 w-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                <span>Loading our coverage map...</span>
              </div>
            ) : (
              <>
                {/* West Auckland Areas */}
                <div className="mb-12">
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="h-px bg-border flex-1 max-w-[100px]"></div>
                    <h3 className="text-2xl font-bold">West Auckland</h3>
                    <div className="h-px bg-border flex-1 max-w-[100px]"></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                    {[
                      "Henderson", "Massey", "Whenuapai", "Hobsonville",
                      "West Harbour", "Te Atatū", "Glendene", "Swanson",
                      "Ranui", "Kumeu", "Huapai", "Riverhead"
                    ].map((name) => (
                      <Card
                        key={name}
                        className="border-2 hover:border-accent transition-all group hover:shadow-md"
                      >
                        <CardContent className="pt-6 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-accent flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">{name}</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* North Shore Areas */}
                <div>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="h-px bg-border flex-1 max-w-[100px]"></div>
                    <h3 className="text-2xl font-bold">North Shore</h3>
                    <div className="h-px bg-border flex-1 max-w-[100px]"></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                    {[
                      "Albany", "Northcote", "Glenfield", "Birkenhead",
                      "Beach Haven", "Hillcrest", "Greenhithe", "Bayswater"
                    ].map((name) => (
                      <Card
                        key={name}
                        className="border-2 hover:border-accent transition-all group hover:shadow-md"
                      >
                        <CardContent className="pt-6 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-accent flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">{name}</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Additional Charge Areas */}
        {additionalChargeAreas.length > 0 && (
          <section className="py-16 bg-background">
            <div className="container">
              <div className="max-w-3xl mx-auto">
                <Card className="border-2 border-orange-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3 mb-4">
                      <AlertCircle className="h-6 w-6 text-orange-500 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-2xl font-bold mb-2">
                          Additional Charge Areas
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          We also service the following areas with a small additional
                          travel charge. Contact us for a quote.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {additionalChargeAreas.map((area) => (
                        <Card
                          key={area.id}
                          className="border-2 border-orange-500/30 bg-orange-50"
                        >
                          <CardContent className="pt-4 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-orange-500 flex-shrink-0" />
                            <div>
                              <div className="font-medium">{area.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {area.description}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Coverage Info */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-3xl">
            <Card className="border-2 border-accent">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 text-center">
                  Not Sure If We Cover Your Area?
                </h3>
                <p className="text-muted-foreground text-center mb-6">
                  We service a wide range of locations across West Auckland and
                  North Shore. If your suburb isn't listed above, don't hesitate to
                  get in touch — we may still be able to help!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href={appPortalUrl("/book/quote")}>
                    <Button size="lg">Request a Quote</Button>
                  </a>
                  <Button size="lg" variant="outline" asChild>
                    <a href="tel:0276421824">
                      <Phone className="mr-2 h-5 w-5" />
                      027 642 1824
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready for Mobile Service?
            </h2>
            <p className="text-lg mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
              Experience the convenience of professional mechanical service at
              your home or workplace.
            </p>
            <a href={appPortalUrl("/book/quote")}>
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Get Started Today
              </Button>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
