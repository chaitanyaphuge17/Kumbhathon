import { useState, useEffect, useRef } from "react";
import { X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LiveNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Nashik Kumbh Mela center coordinates
const NASHIK_CENTER: [number, number] = [19.9975, 73.7898];

// Key locations in Nashik for Kumbh Mela
const nashikLocations = [
  { name: "ramkund", coords: [20.0012, 73.7878] as [number, number] },
  { name: "trimbakeshwar", coords: [19.9322, 73.5306] as [number, number] },
  { name: "tapovan", coords: [20.0089, 73.7823] as [number, number] },
  { name: "kalaramTemple", coords: [19.9989, 73.7895] as [number, number] },
  { name: "sitaGufa", coords: [20.0078, 73.7856] as [number, number] },
  { name: "panchavati", coords: [20.0023, 73.7867] as [number, number] },
  { name: "godavariGhat", coords: [20.0001, 73.7889] as [number, number] },
  { name: "sundarNarayan", coords: [19.9967, 73.7912] as [number, number] },
];

const LiveNavigationModal = ({ isOpen, onClose }: LiveNavigationModalProps) => {
  const { t } = useLanguage();
  const [destination, setDestination] = useState("");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [error, setError] = useState("");
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const locationMarkersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Initialize map centered on Nashik
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(NASHIK_CENTER, 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);

      // Add markers for key Nashik locations
      nashikLocations.forEach((loc) => {
        const marker = L.marker(loc.coords)
          .addTo(mapRef.current!)
          .bindPopup(`<b>${t(`nashikLocations.${loc.name}`)}</b>`);
        locationMarkersRef.current.push(marker);
      });
    }

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(loc);

          if (mapRef.current) {
            if (userMarkerRef.current) {
              mapRef.current.removeLayer(userMarkerRef.current);
            }

            const userIcon = L.divIcon({
              html: '<div style="background: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
              className: 'user-location-marker',
              iconSize: [16, 16],
            });

            userMarkerRef.current = L.marker(loc, { icon: userIcon })
              .addTo(mapRef.current)
              .bindPopup(t("navigation.youAreHere"))
              .openPopup();
          }
        },
        () => {
          setError(t("navigation.locationError"));
        }
      );
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        locationMarkersRef.current = [];
      }
    };
  }, [isOpen, t]);

  const geocode = async (address: string): Promise<[number, number]> => {
    // First check if it matches any known location
    const searchLower = address.toLowerCase();
    for (const loc of nashikLocations) {
      const locName = t(`nashikLocations.${loc.name}`).toLowerCase();
      if (searchLower.includes(locName) || locName.includes(searchLower) || 
          searchLower.includes(loc.name.toLowerCase())) {
        return loc.coords;
      }
    }
    
    // Otherwise use geocoding API with Nashik context
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", Nashik, Maharashtra, India")}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.length === 0) throw new Error("Location not found");
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  };

  const findRoute = async () => {
    if (!destination) {
      setError(t("navigation.destError"));
      return;
    }

    // Use Nashik center as starting point if user location not available
    const startPoint = userLocation || NASHIK_CENTER;

    try {
      setError("");
      const destCoords = await geocode(destination);

      const url = `https://router.project-osrm.org/route/v1/foot/${startPoint[1]},${startPoint[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`;

      const res = await fetch(url);
      const data = await res.json();

      if (!data.routes || data.routes.length === 0) {
        setError(t("navigation.noRoute"));
        return;
      }

      const routeCoords = data.routes[0].geometry.coordinates.map(
        (c: [number, number]) => [c[1], c[0]] as [number, number]
      );

      if (mapRef.current) {
        if (routeLayerRef.current) {
          mapRef.current.removeLayer(routeLayerRef.current);
        }
        if (destinationMarkerRef.current) {
          mapRef.current.removeLayer(destinationMarkerRef.current);
        }

        routeLayerRef.current = L.polyline(routeCoords, {
          color: "#ff5722",
          weight: 5,
        }).addTo(mapRef.current);

        mapRef.current.fitBounds(routeLayerRef.current.getBounds());

        const destIcon = L.divIcon({
          html: '<div style="background: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><span style="color: white; font-size: 10px;">🎯</span></div>',
          className: 'destination-marker',
          iconSize: [20, 20],
        });

        destinationMarkerRef.current = L.marker(destCoords, { icon: destIcon })
          .addTo(mapRef.current)
          .bindPopup(t("navigation.destination"))
          .openPopup();
      }
    } catch (err) {
      setError(t("navigation.notFound"));
    }
  };

  const handleQuickLocation = (locName: string) => {
    setDestination(t(`nashikLocations.${locName}`));
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
        <div className="w-full max-w-4xl h-[650px] bg-card rounded-2xl flex flex-col shadow-2xl pointer-events-auto overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[hsl(var(--kumbh-orange))] to-[hsl(var(--kumbh-deep-orange))] text-white p-4 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-3 right-4 text-white/90 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold">🗺️ {t("navigation.title")}</h3>
            <span className="text-sm opacity-90">{t("navigation.subtitle")}</span>
          </div>

          {/* Quick Locations */}
          <div className="px-4 py-3 border-b border-border bg-orange-50/50">
            <p className="text-xs text-gray-500 mb-2">{t("navigation.quickLocations")}:</p>
            <div className="flex flex-wrap gap-2">
              {nashikLocations.slice(0, 6).map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => handleQuickLocation(loc.name)}
                  className="px-3 py-1.5 bg-white rounded-full text-xs font-medium text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors"
                >
                  {t(`nashikLocations.${loc.name}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 flex gap-3 border-b border-border">
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={t("navigation.placeholder")}
              className="flex-1 rounded-full"
            />
            <Button
              onClick={findRoute}
              className="rounded-full bg-[hsl(var(--kumbh-orange))] hover:bg-[hsl(var(--kumbh-deep-orange))]"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {t("navigation.showRoute")}
            </Button>
          </div>

          {error && (
            <div className="px-4 py-2 text-destructive text-sm">{error}</div>
          )}

          {/* Map */}
          <div ref={mapContainerRef} className="flex-1 m-4 rounded-2xl shadow-lg" />

          {/* Footer */}
          <div className="text-center p-3 text-sm text-muted-foreground">
            {t("navigation.footer")}
          </div>
        </div>
      </div>
    </>
  );
};

export default LiveNavigationModal;
