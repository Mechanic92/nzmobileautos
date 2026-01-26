import { useEffect, useMemo, useRef, useState } from "react";

interface MapViewProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{ lat: number; lng: number; title?: string }>;
  className?: string;
  onMapReady?: (map: any) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

let googleMapsScriptPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps) return Promise.resolve();
  if (googleMapsScriptPromise) return googleMapsScriptPromise;

  googleMapsScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-google-maps="true"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Google Maps failed to load")));
      return;
    }

    const script = document.createElement("script");
    script.dataset.googleMaps = "true";
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}

export function MapView({ 
  center = { lat: -36.8509, lng: 174.7645 }, // Auckland default
  zoom = 10,
  markers = [],
  className = "",
  onMapReady
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstancesRef = useRef<any[]>([]);

  const apiKey = useMemo(() => {
    return (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  }, []);

  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error" | "missing_key">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!mapRef.current) return;
      if (!apiKey) {
        setStatus("missing_key");
        return;
      }

      try {
        setStatus("loading");
        await loadGoogleMaps(apiKey);
        if (cancelled) return;

        const gmaps = window.google?.maps;
        if (!gmaps) {
          throw new Error("Google Maps loaded but window.google.maps is unavailable");
        }

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new gmaps.Map(mapRef.current, {
            center,
            zoom,
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
          });
          onMapReady?.(mapInstanceRef.current);
        } else {
          mapInstanceRef.current.setCenter(center);
          mapInstanceRef.current.setZoom(zoom);
        }

        // Clear and re-create markers
        markerInstancesRef.current.forEach((m: any) => m.setMap(null));
        markerInstancesRef.current = [];

        markers.forEach((m) => {
          const marker = new gmaps.Marker({
            position: { lat: m.lat, lng: m.lng },
            title: m.title,
            map: mapInstanceRef.current,
          });
          markerInstancesRef.current.push(marker);
        });

        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Unknown error");
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [apiKey, center, zoom, markers, onMapReady]);

  // Fallback to OpenStreetMap embed if no Google Maps API key
  if (status === "missing_key") {
    const bbox = `${center.lng - 0.15},${center.lat - 0.08},${center.lng + 0.15},${center.lat + 0.08}`;
    return (
      <div className={`rounded-lg overflow-hidden ${className}`}>
        <iframe
          title="Service Area Map"
          width="100%"
          height="500"
          frameBorder="0"
          scrolling="no"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${center.lat},${center.lng}`}
          style={{ border: 0 }}
        />
        <div className="bg-muted/50 p-3 text-center text-sm text-muted-foreground">
          <a 
            href={`https://www.openstreetmap.org/?mlat=${center.lat}&mlon=${center.lng}#map=11/${center.lat}/${center.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            View larger map
          </a>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef}
      className={`rounded-lg min-h-[300px] ${status !== "ready" ? "bg-muted flex items-center justify-center" : ""} ${className}`}
    >
      {status !== "ready" ? (
        <div className="text-center text-muted-foreground p-8">
          <p className="font-medium">Service Area Map</p>
          {status === "loading" ? (
            <p className="text-sm mt-2">Loading map…</p>
          ) : status === "error" ? (
            <p className="text-sm mt-2">Failed to load map: {errorMessage}</p>
          ) : (
            <p className="text-sm mt-2">Preparing map…</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default MapView;
