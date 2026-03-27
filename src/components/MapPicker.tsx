"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { divIcon, type LeafletEventHandlerFnMap } from "leaflet";
import { MapContainer, Marker, Rectangle, TileLayer, useMap, useMapEvents } from "react-leaflet";

const BANGLADESH_BOUNDS: [[number, number], [number, number]] = [
  [20.7, 88.0],
  [26.9, 92.8],
];

const pickerMarkerIcon = divIcon({
  html: '<span style="display:inline-flex;height:34px;width:34px;align-items:center;justify-content:center;border-radius:9999px;background:#f7fbfa;border:3px solid #13544f;box-shadow:0 10px 20px rgba(11,59,55,0.22);font-size:15px;color:#bf7418;">BD</span>',
  className: "",
  iconAnchor: [17, 17],
  popupAnchor: [0, -16],
});

function Clicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function RecenterOnPosition({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

export function MapPicker({ lat, lng, onPick }: { lat: number; lng: number; onPick: (lat: number, lng: number) => void }) {
  const position = useMemo<[number, number]>(() => [lat, lng], [lat, lng]);
  const dragHandlers = useMemo<LeafletEventHandlerFnMap>(
    () => ({
      dragend(e) {
        const marker = e.target;
        const next = marker.getLatLng();
        onPick(next.lat, next.lng);
      },
    }),
    [onPick],
  );

  return (
    <div className="h-64 overflow-hidden rounded-xl border border-[color:var(--border)] shadow-soft">
      <MapContainer
        center={position}
        zoom={11}
        minZoom={7}
        maxZoom={18}
        maxBounds={BANGLADESH_BOUNDS}
        maxBoundsViscosity={1.0}
        scrollWheelZoom
      >
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Rectangle bounds={BANGLADESH_BOUNDS} pathOptions={{ color: "#13544f", weight: 2, fillColor: "#f4b63d", fillOpacity: 0.06 }} />
        <Marker position={position} icon={pickerMarkerIcon} draggable eventHandlers={dragHandlers} />
        <Clicker onPick={onPick} />
        <RecenterOnPosition lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
}
