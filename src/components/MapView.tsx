"use client";

import { useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Marker, Popup, Rectangle, TileLayer, useMap } from "react-leaflet";
import Link from "next/link";
import { divIcon } from "leaflet";
import type { StationItem } from "@/types/station";

const BANGLADESH_BOUNDS: [[number, number], [number, number]] = [
  [20.7, 88.0],
  [26.9, 92.8],
];

const stationMarkerIcon = divIcon({
  html: '<span style="position:relative;display:inline-flex;height:40px;width:40px;align-items:center;justify-content:center;border-radius:9999px;background:#ffffff;border:3px solid #f97316;box-shadow:0 8px 18px rgba(249,115,22,0.35);font-size:18px;"><span style="position:absolute;inset:-7px;border-radius:9999px;border:2px solid rgba(249,115,22,0.35);"></span>&#x26FD;</span>',
  className: "",
  iconAnchor: [20, 20],
  popupAnchor: [0, -18],
});

function isValidCoordinate(lat: number, lng: number) {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function AutoFitToStations({ stations }: { stations: StationItem[] }) {
  const map = useMap();

  useEffect(() => {
    if (stations.length === 0) {
      map.flyTo([23.85, 90.35], 7, { duration: 1.2, easeLinearity: 0.25 });
      return;
    }

    if (stations.length === 1) {
      const one = stations[0];
      map.flyTo([one.location.coordinates[1], one.location.coordinates[0]], 14, { duration: 1.2, easeLinearity: 0.25 });
      return;
    }

    const bounds = stations.map((m) => [m.location.coordinates[1], m.location.coordinates[0]] as [number, number]);
    map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 14, duration: 1.2, easeLinearity: 0.25 });
  }, [stations, map]);

  return null;
}

export function MapView({ stations }: { stations: StationItem[] }) {
  const validStations = useMemo(
    () =>
      stations.filter((m) => {
        const lat = m.location.coordinates[1];
        const lng = m.location.coordinates[0];
        return isValidCoordinate(lat, lng);
      }),
    [stations],
  );

  return (
    <div className="h-[420px] overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-soft">
      <MapContainer center={[23.85, 90.35]} zoom={7} minZoom={5} maxZoom={18} scrollWheelZoom zoomAnimation>
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Rectangle bounds={BANGLADESH_BOUNDS} pathOptions={{ color: "#f97316", weight: 2, fillColor: "#fdba74", fillOpacity: 0.08 }} />
        <AutoFitToStations stations={validStations} />
        {validStations.map((m) => (
          <CircleMarker
            key={`${m._id}-ring`}
            center={[m.location.coordinates[1], m.location.coordinates[0]]}
            radius={11}
            pathOptions={{ color: "#fb923c", weight: 2, fillColor: "#fdba74", fillOpacity: 0.18 }}
          />
        ))}
        {validStations.map((m) => (
          <Marker key={m._id} position={[m.location.coordinates[1], m.location.coordinates[0]]} icon={stationMarkerIcon}>
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold">{m.name}</p>
                <p className="text-xs">{m.area}</p>
                <Link href={`/station/${m._id}`} className="text-sm text-orange-700 underline">
                  বিস্তারিত আর ভোট দিন
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
