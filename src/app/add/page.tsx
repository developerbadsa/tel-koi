"use client";

import dynamic from "next/dynamic";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { areas } from "@/i18n/dict";
import { type KnownStation, knownStations } from "@/lib/known-stations";
import { siteConfig } from "@/lib/site";

const DynamicMapPicker = dynamic(() => import("@/components/MapPicker").then((m) => m.MapPicker), { ssr: false });

type GeoSearchResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  importance?: number;
};

type ReverseGeoResult = {
  display_name?: string;
};

type ProofImagePayload = {
  dataUrl: string;
  fileName: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
};

const DEFAULT_AREA = "Lalmonirhat Sadar";
const MIN_LAT = 25;
const MAX_LAT = 27;
const MIN_LNG = 88;
const MAX_LNG = 90;
const MAX_PROOF_IMAGE_LENGTH = 380_000;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isWithinServiceArea(lat: number, lng: number) {
  return lat >= MIN_LAT && lat <= MAX_LAT && lng >= MIN_LNG && lng <= MAX_LNG;
}

function buildLocationQuery(raw: string, selectedArea: string) {
  const parts = [raw.trim()];
  if (selectedArea) parts.push(selectedArea);
  parts.push(siteConfig.district, siteConfig.country);
  return parts.filter(Boolean).join(", ");
}

function rankResult(result: GeoSearchResult, selectedArea: string) {
  const text = result.display_name.toLowerCase();
  let score = result.importance ?? 0;
  if (selectedArea && text.includes(selectedArea.toLowerCase())) score += 4;
  if (text.includes(DEFAULT_AREA.toLowerCase())) score += 2;
  if (text.includes(siteConfig.district.toLowerCase())) score += 3;
  if (text.includes(siteConfig.country.toLowerCase())) score += 1;
  if (text.includes("filling station") || text.includes("petrol") || text.includes("pump")) score += 2;
  return score;
}

function inferAreaFromText(text: string) {
  const normalized = text.toLowerCase();
  return areas.find((area) => normalized.includes(area.toLowerCase())) ?? null;
}

function normalizeText(text: string) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function matchesKnownStation(station: KnownStation, query: string, selectedArea: string) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return !selectedArea || station.area === selectedArea;

  const haystack = normalizeText(
    [station.name, station.location, station.specialty, station.contact, ...(station.aliases ?? [])].filter(Boolean).join(" "),
  );
  const queryTerms = normalizedQuery.split(" ").filter(Boolean);
  const areaMatch = !selectedArea || station.area === selectedArea;

  return areaMatch && queryTerms.every((term) => haystack.includes(term));
}

function sortKnownStations(a: KnownStation, b: KnownStation, selectedArea: string) {
  const areaA = a.area === selectedArea ? 3 : a.area === DEFAULT_AREA ? 2 : 1;
  const areaB = b.area === selectedArea ? 3 : b.area === DEFAULT_AREA ? 2 : 1;
  if (areaA !== areaB) return areaB - areaA;
  if (a.source !== b.source) return a.source === "official" ? -1 : 1;
  return a.name.localeCompare(b.name);
}

async function searchNominatim(query: string, selectedArea: string, signal?: AbortSignal) {
  const q = buildLocationQuery(query, selectedArea);
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=bd&limit=6&dedupe=1&bounded=1&viewbox=${MIN_LNG},${MAX_LAT},${MAX_LNG},${MIN_LAT}&q=${encodeURIComponent(q)}`,
    { signal },
  );
  if (!res.ok) return [];

  const data = (await res.json()) as GeoSearchResult[];
  return [...data].sort((a, b) => rankResult(b, selectedArea) - rankResult(a, selectedArea));
}

async function reverseLookup(lat: number, lng: number, signal?: AbortSignal) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&lat=${lat}&lon=${lng}`,
    { signal },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as ReverseGeoResult;
  return data.display_name?.trim() || null;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("ছবিটি পড়া যায়নি। আবার চেষ্টা করুন।"));
    reader.readAsDataURL(file);
  });
}

async function loadImage(file: File) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("ছবিটি খোলা যায়নি। অন্য ছবি দিন।"));
      img.src = objectUrl;
    });
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function compressImageFile(file: File): Promise<ProofImagePayload> {
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("ছবিটি ৮MB এর কম দিন, তাহলে দ্রুত আপলোড হবে।");
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("শুধু JPG, PNG বা WEBP ছবি দেওয়া যাবে।");
  }

  const image = await loadImage(file);
  const maxSide = 1400;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

  const context = canvas.getContext("2d");
  if (!context) throw new Error("ছবিটি প্রসেস করা যায়নি।");

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  let mimeType: ProofImagePayload["mimeType"] = file.type === "image/png" ? "image/png" : "image/jpeg";
  let quality = mimeType === "image/png" ? undefined : 0.82;
  let dataUrl = canvas.toDataURL(mimeType, quality);

  while (dataUrl.length > MAX_PROOF_IMAGE_LENGTH && quality && quality > 0.45) {
    quality = Number((quality - 0.1).toFixed(2));
    dataUrl = canvas.toDataURL("image/jpeg", quality);
    mimeType = "image/jpeg";
  }

  if (dataUrl.length > MAX_PROOF_IMAGE_LENGTH) {
    dataUrl = await readFileAsDataUrl(file);
    if (dataUrl.length > MAX_PROOF_IMAGE_LENGTH) {
      throw new Error("ছবিটি অনেক বড়। একটু crop বা ছোট করে আবার দিন।");
    }
    mimeType = file.type as ProofImagePayload["mimeType"];
  }

  return {
    dataUrl,
    fileName: file.name,
    mimeType,
  };
}

export default function AddPage() {
  const router = useRouter();
  const proofInputRef = useRef<HTMLInputElement | null>(null);

  const [stationName, setStationName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(25.9);
  const [lng, setLng] = useState(89.4);
  const [message, setMessage] = useState("");
  const [locationTouched, setLocationTouched] = useState(false);
  const [selectedArea, setSelectedArea] = useState<(typeof areas)[number]>(DEFAULT_AREA);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [locationQuery, setLocationQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [geoStatus, setGeoStatus] = useState("লালমনিরহাট সদর ফোকাসড সার্চ চালু আছে। অন্য এলাকার পাম্প যোগ করতে হলে উপরের এলাকা বদলে নিন।");
  const [geoAccuracy, setGeoAccuracy] = useState<number | null>(null);
  const [pinSummary, setPinSummary] = useState("এখনও সঠিক পিন কনফার্ম করা হয়নি।");
  const [reverseLoading, setReverseLoading] = useState(false);
  const [proofImage, setProofImage] = useState<ProofImagePayload | null>(null);
  const [proofUploading, setProofUploading] = useState(false);

  const knownMatches = useMemo(() => {
    const query = `${stationName} ${locationQuery}`.trim();
    return knownStations.filter((station) => matchesKnownStation(station, query, selectedArea)).sort((a, b) => sortKnownStations(a, b, selectedArea)).slice(0, query ? 8 : 6);
  }, [locationQuery, selectedArea, stationName]);

  useEffect(() => {
    const trimmed = locationQuery.trim();
    if (trimmed.length < 3) {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const ranked = await searchNominatim(trimmed, selectedArea, controller.signal);
        setSearchResults(ranked);
        if (ranked[0]) {
          setLat(clamp(Number(ranked[0].lat), MIN_LAT, MAX_LAT));
          setLng(clamp(Number(ranked[0].lon), MIN_LNG, MAX_LNG));
          setGeoStatus("নিকটতম ম্যাপ ম্যাচ দেখানো হয়েছে। লিস্ট থেকে সিলেক্ট করুন বা নিচের পিনটা গেটের উপর মিলিয়ে নিন।");
        }
      } catch {
        if (!controller.signal.aborted) setSearchResults([]);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [locationQuery, selectedArea]);

  useEffect(() => {
    if (!locationTouched) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setReverseLoading(true);
        const label = await reverseLookup(lat, lng, controller.signal);
        if (!label) return;
        setPinSummary(label);

        const inferredArea = inferAreaFromText(label);
        if (inferredArea && inferredArea !== selectedArea) {
          setSelectedArea(inferredArea);
        }
      } finally {
        if (!controller.signal.aborted) setReverseLoading(false);
      }
    }, 500);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [lat, lng, locationTouched, selectedArea]);

  const pickLocation = (nextLat: number, nextLng: number) => {
    setLat(clamp(nextLat, MIN_LAT, MAX_LAT));
    setLng(clamp(nextLng, MIN_LNG, MAX_LNG));
    setLocationTouched(true);
    setPinSummary("নির্বাচিত পিনের readable ঠিকানা মিলিয়ে নেওয়া হচ্ছে...");
  };

  const applyGeoSelection = (result: GeoSearchResult, nextName?: string) => {
    pickLocation(Number(result.lat), Number(result.lon));
    setLocationQuery(result.display_name);
    setSearchResults([]);
    if (nextName) setStationName(nextName);

    const inferredArea = inferAreaFromText(result.display_name);
    if (inferredArea) setSelectedArea(inferredArea);
    setPinSummary(result.display_name);
    setGeoStatus("লোকেশন সিলেক্ট করা হয়েছে। এখন পাম্পের গেট বা ঢোকার মুখের সাথে পিনটা মিলিয়ে নিন।");
  };

  const onPickKnownStation = async (station: KnownStation) => {
    setStationName(station.name);
    setAddress(station.location);
    setSelectedArea(station.area);
    setLocationQuery(`${station.name}, ${station.location}`);
    setGeoStatus(`${station.name} বেছে নেওয়া হয়েছে। ম্যাপে exact pin মিলিয়ে দেওয়া হচ্ছে...`);
    setSearchResults([]);

    pickLocation(station.lat, station.lng);
    setPinSummary(`${station.name}, ${station.location}`);
    setGeoStatus(`${station.name} location has been prefilled from the saved station list. Adjust the pin to the gate if needed.`);
    return;
    /*
    try {
      setSearching(true);
      const ranked = await searchNominatim(`${station.name}, ${station.location}`, station.area);
      if (ranked[0]) {
        applyGeoSelection(ranked[0], station.name);
      } else {
        setGeoStatus("স্টেশন নাম মিলেছে, কিন্তু exact pin পাওয়া যায়নি। নিচের ম্যাপে গেটের জায়গা নিজে ঠিক করুন।");
      }
    } catch {
      setGeoStatus("স্টেশন নাম পাওয়া গেছে, কিন্তু ম্যাপ pin sync করা যায়নি। নিচের ম্যাপ থেকে ঠিক করুন।");
    } finally {
      setSearching(false);
    }
    */
  };

  const onUseCurrentLocation = () => {
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (!window.isSecureContext && !isLocalhost) {
      setGeoStatus("Current location পেতে HTTPS লাগে। সাইটটা HTTPS এ খুলে আবার চেষ্টা করুন।");
      return;
    }

    if (!("geolocation" in navigator)) {
      setGeoStatus("এই ব্রাউজারে লোকেশন ধরা যায় না।");
      return;
    }

    setGeoStatus("লোকেশন পারমিশন চাওয়া হচ্ছে...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const rawLat = position.coords.latitude;
        const rawLng = position.coords.longitude;
        const inArea = isWithinServiceArea(rawLat, rawLng);

        pickLocation(rawLat, rawLng);
        setGeoAccuracy(position.coords.accuracy ?? null);
        setGeoStatus(
          inArea
            ? "বর্তমান লোকেশন পাওয়া গেছে। এখন পাম্পের gate-side pin ঠিক আছে কি না দেখে নিন।"
            : "লোকেশন সার্ভিস এলাকার বাইরে। তাই কাছাকাছি অনুমোদিত বাউন্ডারিতে পিন দেখানো হয়েছে, চাইলে টেনে ঠিক করুন।",
        );
      },
      (error) => {
        if (error.code === 1) {
          setGeoStatus("লোকেশন পারমিশন বন্ধ আছে। পারমিশন দিয়ে আবার চেষ্টা করুন।");
          return;
        }
        if (error.code === 2) {
          setGeoStatus("GPS/Network থেকে অবস্থান পাওয়া যায়নি। একটু পরে আবার চেষ্টা করুন।");
          return;
        }
        if (error.code === 3) {
          setGeoStatus("লোকেশন নিতে বেশি সময় লাগছে। নেট বা GPS অন রেখে আবার চেষ্টা করুন।");
          return;
        }
        setGeoStatus("লোকেশন ধরা গেল না, আবার চেষ্টা করুন।");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const onProofImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setProofImage(null);
      return;
    }

    try {
      setProofUploading(true);
      setMessage("");
      const nextImage = await compressImageFile(file);
      setProofImage(nextImage);
    } catch (error) {
      setProofImage(null);
      if (proofInputRef.current) proofInputRef.current.value = "";
      setMessage(error instanceof Error ? error.message : "ছবিটি প্রস্তুত করা যায়নি।");
    } finally {
      setProofUploading(false);
    }
  };

  const removeProofImage = () => {
    setProofImage(null);
    if (proofInputRef.current) proofInputRef.current.value = "";
  };

  const canSubmit = locationTouched && !proofUploading;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!locationTouched) {
      setMessage("আগে ম্যাপে সঠিক লোকেশন ঠিক করুন।");
      return;
    }

    const payload = {
      name: stationName.trim(),
      area: selectedArea,
      address: address.trim(),
      lat,
      lng,
      proofImage: proofImage ?? undefined,
    };

    const res = await fetch("/api/stations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      setShowSuccessPopup(true);
      setMessage("");
      setTimeout(() => {
        router.push("/");
      }, 1400);
      return;
    }
    setMessage(data.error ?? "কাজটি সম্পন্ন হয়নি।");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-[color:var(--petrol-deep)]">নতুন পাম্প লোকেশন যোগ করুন</h1>
      <form className="space-y-4 rounded-2xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.78)] p-4 shadow-soft" onSubmit={onSubmit}>
        <input
          className="w-full rounded-xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.82)] p-2 text-[color:var(--text)]"
          name="name"
          required
          minLength={3}
          maxLength={80}
          value={stationName}
          onChange={(e) => setStationName(e.target.value)}
          placeholder="পাম্প বা স্টেশনের নাম"
        />
        <select
          className="w-full rounded-xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.82)] p-2 text-[color:var(--text)]"
          name="area"
          required
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value as (typeof areas)[number])}
        >
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <input
          className="w-full rounded-xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.82)] p-2 text-[color:var(--text)]"
          name="address"
          maxLength={140}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="ঠিকানা (ঐচ্ছিক)"
        />

        <div className="rounded-2xl border border-[color:var(--border)] bg-[rgba(19,84,79,0.04)] p-3">
          <label className="mb-1 block text-sm font-medium text-[color:var(--text-muted)]" htmlFor="proof-image">
            প্রুফ ছবি (ঐচ্ছিক)
          </label>
          <p className="text-xs text-[color:var(--text-soft)]">পাম্পের সাইনবোর্ড, গেট, বা ফোরকোর্টের ছবি দিলে লোকেশন verify করা সহজ হবে।</p>
          <input
            ref={proofInputRef}
            id="proof-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onProofImageChange}
            className="mt-3 block w-full rounded-xl border border-dashed border-[color:var(--border-strong)] bg-[rgba(255,255,255,0.78)] p-2 text-sm text-[color:var(--text-muted)]"
          />
          {proofUploading && <p className="mt-2 text-sm text-[color:var(--text-muted)]">ছবি প্রস্তুত করা হচ্ছে...</p>}
          {proofImage && (
            <div className="mt-3 rounded-2xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.82)] p-3">
              <img src={proofImage.dataUrl} alt="Pump proof preview" className="h-44 w-full rounded-xl object-cover" />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-[color:var(--text-soft)]">{proofImage.fileName}</p>
                <button
                  type="button"
                  onClick={removeProofImage}
                  className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text-muted)] hover:border-[color:var(--petrol)] hover:text-[color:var(--petrol)]"
                >
                  ছবি সরান
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[color:var(--border)] bg-[linear-gradient(135deg,rgba(19,84,79,0.06),rgba(244,182,61,0.14))] p-3">
          <label className="mb-1 block text-sm font-medium text-[color:var(--text-muted)]" htmlFor="location-search">
            আগে পাম্পের নাম দিয়ে খুঁজুন। না পেলে বাজার, রোড, বা পরিচিত জায়গার নাম লিখে নিচের পিনটা গেটের সাথে মিলিয়ে নিন।
          </label>
          <input
            id="location-search"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="w-full rounded-xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.82)] p-2 text-[color:var(--text)]"
            placeholder="যেমন: Binimoy Filling Station, Hossain Brothers, Mostofee, Airport Road"
          />

          {knownMatches.length > 0 && (
            <div className="mt-3 rounded-xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.84)] p-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--petrol)]">Lalmonirhat পরিচিত স্টেশন তালিকা</p>
              <div className="space-y-1">
                {knownMatches.map((station) => (
                  <button
                    type="button"
                    key={station.id}
                    onClick={() => void onPickKnownStation(station)}
                    className="block w-full rounded-xl border border-transparent px-3 py-2 text-left transition hover:border-[color:var(--border)] hover:bg-[rgba(19,84,79,0.06)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[color:var(--petrol-deep)]">{station.name}</p>
                      <span className="rounded-full bg-[rgba(19,84,79,0.09)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--petrol)]">{station.area}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">{station.location}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <span className="rounded-full bg-[rgba(244,182,61,0.16)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--fuel-deep)]">
                        {station.source === "official" ? "Official list" : "Community list"}
                      </span>
                      {station.services?.slice(0, 3).map((service) => (
                        <span key={service} className="rounded-full bg-[rgba(11,59,55,0.08)] px-2 py-0.5 text-[10px] font-medium text-[color:var(--text-muted)]">
                          {service}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onUseCurrentLocation}
              className="rounded-xl border border-[rgba(191,116,24,0.24)] bg-[rgba(244,182,61,0.16)] px-3 py-2 text-sm font-semibold text-[color:var(--fuel-deep)] hover:bg-[rgba(244,182,61,0.24)]"
            >
              আমার বর্তমান লোকেশন ব্যবহার করুন
            </button>
            {searching && <p className="text-sm text-[color:var(--text-soft)]">খোঁজা হচ্ছে...</p>}
          </div>
          {geoStatus && <p className="mt-2 text-sm text-[color:var(--text-muted)]">{geoStatus}</p>}
          {geoAccuracy !== null && (
            <p className="mt-1 text-xs text-[color:var(--text-soft)]">
              GPS accuracy: প্রায় {Math.round(geoAccuracy)} মিটার {geoAccuracy > 100 ? "(ম্যানুয়ালি পিন ঠিক করা ভালো)" : ""}
            </p>
          )}
          {searchResults.length > 0 && (
            <div className="mt-2 max-h-44 space-y-1 overflow-auto rounded-xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.82)] p-2">
              {searchResults.map((result) => (
                <button
                  type="button"
                  key={result.place_id}
                  onClick={() => applyGeoSelection(result)}
                  className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-[color:var(--text-muted)] hover:bg-[rgba(19,84,79,0.08)]"
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.82)] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--petrol)]">নির্বাচিত পিনের readable ঠিকানা</p>
          <p className="mt-1 text-sm text-[color:var(--petrol-deep)]">{pinSummary}</p>
          <p className="mt-1 text-xs text-[color:var(--text-soft)]">
            {reverseLoading
              ? "পিনের readable ঠিকানা মিলিয়ে নেওয়া হচ্ছে..."
              : "টিপস: পাম্পের গেট, ঢোকার মুখ, বা স্টেশন ফোরকোর্টের একদম কাছাকাছি পিন রাখলে location বেশি accurate হবে।"}
          </p>
        </div>

        <DynamicMapPicker
          lat={lat}
          lng={lng}
          onPick={(nextLat, nextLng) => {
            pickLocation(nextLat, nextLng);
          }}
        />

        <button
          className="rounded-xl bg-[var(--petrol)] px-4 py-2 text-white hover:bg-[var(--petrol-deep)] disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={!canSubmit}
        >
          সাবমিট করুন
        </button>
        {!locationTouched && <p className="text-xs text-[color:var(--fuel-deep)]">সাবমিটের আগে ম্যাপে লোকেশন একবার ঠিক করুন।</p>}
        {message && <p className="text-sm text-[color:var(--text-muted)]">{message}</p>}
      </form>
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[color:var(--border)] bg-[rgba(247,251,250,0.96)] p-5 text-center shadow-xl">
            <p className="text-lg font-bold text-[color:var(--petrol)]">সফল হয়েছে</p>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">স্টেশনের লোকেশন যোগ হয়েছে। হোম পেজে নেওয়া হচ্ছে...</p>
          </div>
        </div>
      )}
    </div>
  );
}
