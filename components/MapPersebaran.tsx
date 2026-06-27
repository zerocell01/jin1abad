"use client";

import { useEffect, useRef, useState } from "react";

interface LocationData {
  name: string;
  count: number;
  lat: number;
  lng: number;
  details: string[];
}

interface MapProps {
  locations: LocationData[];
}

export default function MapPersebaran({ locations }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [leafletInstance, setLeafletInstance] = useState<any>(null);

  useEffect(() => {
    // 1. Load Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.crossOrigin = "";
    document.head.appendChild(link);

    // 2. Load Leaflet JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.crossOrigin = "";
    document.head.appendChild(script);

    script.onload = () => {
      setIsLoaded(true);
    };

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Centered at Central Java (Kudus/Pati) which is the main alumni base
    const map = L.map(mapRef.current).setView([-6.75, 111.04], 8);

    // Clean, modern map tiles (CartoDB Positron for Light Mode)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Add Markers
    const markers = locations.map((loc) => {
      if (!loc.lat || !loc.lng) return null;

      // Color/Radius based on count
      const marker = L.circleMarker([loc.lat, loc.lng], {
        color: "#4F46E5", // Indigo accent color
        fillColor: "#4F46E5",
        fillOpacity: 0.6,
        weight: 1.5,
        radius: Math.min(6 + loc.count * 1.5, 20),
      }).addTo(map);

      // Detail names of the alumni at this location
      const detailsList = loc.details.map(d => `<li>• ${d}</li>`).join("");

      marker.bindPopup(`
        <div style="font-family: var(--font-body), sans-serif; font-size: 13px; color: #0F172A;">
          <h4 style="margin: 0 0 4px 0; font-family: var(--font-display); font-size: 14px; font-weight: 600; color: #4F46E5;">
            ${loc.name}
          </h4>
          <p style="margin: 0 0 6px 0; font-weight: 500; font-size: 12px; color: #64748B;">
            ${loc.count} Alumni terdaftar
          </p>
          <ul style="margin: 0; padding: 0; list-style: none; font-size: 11px; max-height: 100px; overflow-y: auto; color: #334155;">
            ${detailsList}
          </ul>
        </div>
      `);

      return marker;
    }).filter(Boolean);

    // Fit map bounds to show all markers if there are any
    if (markers.length > 0) {
      const group = new L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    setLeafletInstance(map);

    return () => {
      map.remove();
    };
  }, [isLoaded, locations]);

  return (
    <div className="relative w-full h-[450px] border border-line rounded-sm overflow-hidden bg-white mb-8 z-10 shadow-sm">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-slate bg-paper">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-maroon"></div>
            <span>Memuat Peta Persebaran...</span>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: "450px" }} />
    </div>
  );
}
