import React, { FormEvent, useEffect, useState } from "react";
import {
  ExternalLink,
  Loader2,
  MapPin,
  RefreshCw,
  Send,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  shouldType?: boolean;
};

type LocationPoint = {
  lat: number;
  lng: number;
};

type Doctor = {
  name: string;
  address: string;
  placeId: string;
  distanceKm?: number;
  type: string;
};

const EARTH_RADIUS_KM = 6371;

const TYPEWRITER_CHUNK_SIZE = 4;

/* =========================================================
   RESPONSE TEXT
========================================================= */

export const splitResponsePointers = (content: string) =>
  content
    .replace(/\\\*/g, "*")
    .replace(/\s+\*\s+(?=\*\*[^*]+:\*\*)/g, "\n- ")
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => ({
      text: line.replace(/^[-•*]\s*/, "").replace(/\*\*(.*?)\*\*/g, "$1"),
      pointer: /^[-•*]\s+/.test(line),
    }));

/* =========================================================
   TYPEWRITER
========================================================= */

export function TypedReply({
  content,
  active,
}: {
  content: string;
  active?: boolean;
}) {
  const [visible, setVisible] = useState(active ? "" : content);

  useEffect(() => {
    if (!active) {
      setVisible(content);
      return;
    }

    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) {
      setVisible(content);
      return;
    }

    setVisible("");

    let offset = 0;

    const timer = window.setInterval(() => {
      offset = Math.min(content.length, offset + TYPEWRITER_CHUNK_SIZE);

      setVisible(content.slice(0, offset));

      if (offset >= content.length) {
        window.clearInterval(timer);
      }
    }, 14);

    return () => window.clearInterval(timer);
  }, [active, content]);

  const isTyping = active && visible.length < content.length;

  const segments = splitResponsePointers(visible);

  return (
    <>
      {segments.map((segment, index) =>
        segment.pointer ? (
          <span key={`${segment.text}-${index}`} className="mt-1 flex gap-2">
            <span aria-hidden className="text-cyan-300">
              •
            </span>

            <span>{segment.text}</span>
          </span>
        ) : (
          <span
            key={`${segment.text}-${index}`}
            className={index ? "mt-2 block" : "block"}
          >
            {segment.text}
          </span>
        )
      )}

      {isTyping && (
        <span
          aria-hidden
          className="ml-0.5 inline-block h-4 border-l border-cyan-300 align-[-3px] animate-pulse"
        />
      )}
    </>
  );
}

/* =========================================================
   LOCATION HELPERS
========================================================= */

function distanceKm(from: LocationPoint, to: LocationPoint) {
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;

  const dLng = ((to.lng - from.lng) * Math.PI) / 180;

  const lat1 = (from.lat * Math.PI) / 180;

  const lat2 = (to.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getPlaceType(tags: Record<string, any>) {
  if (tags.amenity === "hospital" || tags.healthcare === "hospital") {
    return "Hospital";
  }

  if (tags.amenity === "clinic" || tags.healthcare === "clinic") {
    return "Clinic";
  }

  if (tags.amenity === "doctors" || tags.healthcare === "doctor") {
    return "Doctor";
  }

  if (tags.healthcare === "centre" || tags.healthcare === "center") {
    return "Healthcare Centre";
  }

  return "Healthcare";
}

function getPlaceName(tags: Record<string, any>) {
  return (
    tags.name ||
    tags["name:en"] ||
    tags.official_name ||
    tags["official_name:en"] ||
    "Healthcare facility"
  );
}

function getPlaceAddress(tags: Record<string, any>) {
  if (tags["addr:full"]) {
    return tags["addr:full"];
  }

  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:neighbourhood"],
    tags["addr:city"],
    tags["addr:postcode"],
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(", ");
  }

  if (tags["addr:district"]) {
    return tags["addr:district"];
  }

  return "Address unavailable";
}

/* =========================================================
   OPENSTREETMAP SEARCH
   No Google API
   No Forge API
   No API KEY
========================================================= */

async function findNearbyHealthcare(
  location: LocationPoint
): Promise<Doctor[]> {
  const radius = 12000;

  const query = `
[out:json][timeout:8];
(
  node["amenity"="hospital"](around:${radius},${location.lat},${location.lng});
  node["amenity"="clinic"](around:${radius},${location.lat},${location.lng});
  node["amenity"="doctors"](around:${radius},${location.lat},${location.lng});

  node["healthcare"="doctor"](around:${radius},${location.lat},${location.lng});
  node["healthcare"="clinic"](around:${radius},${location.lat},${location.lng});
  node["healthcare"="hospital"](around:${radius},${location.lat},${location.lng});
  node["healthcare"="centre"](around:${radius},${location.lat},${location.lng});
  node["healthcare"="center"](around:${radius},${location.lat},${location.lng});

  way["amenity"="hospital"](around:${radius},${location.lat},${location.lng});
  way["amenity"="clinic"](around:${radius},${location.lat},${location.lng});
  way["amenity"="doctors"](around:${radius},${location.lat},${location.lng});

  way["healthcare"="hospital"](around:${radius},${location.lat},${location.lng});
  way["healthcare"="clinic"](around:${radius},${location.lat},${location.lng});
  way["healthcare"="doctor"](around:${radius},${location.lat},${location.lng});
);
out center tags;
`;

  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];

  for (const endpoint of endpoints) {
    const controller = new AbortController();

    const timeout = window.setTimeout(() => {
      controller.abort();
    }, 9000);

    try {
      const response = await fetch(
        `${endpoint}?data=${encodeURIComponent(query)}`,
        {
          method: "GET",
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        }
      );

      window.clearTimeout(timeout);

      if (!response.ok) {
        continue;
      }

      const data = await response.json();

      const seen = new Set<string>();

      const places: Doctor[] = [];

      for (const element of data.elements ?? []) {
        const tags = element.tags ?? {};

        const lat =
          typeof element.lat === "number" ? element.lat : element.center?.lat;

        const lng =
          typeof element.lon === "number" ? element.lon : element.center?.lon;

        if (typeof lat !== "number" || typeof lng !== "number") {
          continue;
        }

        const name = getPlaceName(tags);

        const type = getPlaceType(tags);

        const address = getPlaceAddress(tags);

        const key = `${name.toLowerCase()}-${lat.toFixed(5)}-${lng.toFixed(5)}`;

        if (seen.has(key)) {
          continue;
        }

        seen.add(key);

        places.push({
          name,
          address,
          placeId: `${element.type}-${element.id}`,
          distanceKm: distanceKm(location, {
            lat,
            lng,
          }),
          type,
        });
      }

      return places
        .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
        .slice(0, 10);
    } catch {
      window.clearTimeout(timeout);

      continue;
    }
  }

  throw new Error("Nearby healthcare search timed out.");
}

/* =========================================================
   GOOGLE MAPS DIRECTIONS
   This does NOT require a Google Maps API key.
========================================================= */

function openDirections(doctor: Doctor) {
  const destination = `${doctor.name}, ${doctor.address}`;

  const url =
    `https://www.google.com/maps/dir/?api=1&destination=` +
    encodeURIComponent(destination);

  window.open(url, "_blank", "noopener,noreferrer");
}

/* =========================================================
   MAIN ASSISTANT PAGE
========================================================= */

export default function Assistant() {
  const { user, loading, error } = useAuth();

  const status = trpc.assistant.status.useQuery(undefined, {
    enabled: !!user,
  });

  const chat = trpc.assistant.chat.useMutation();

  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      content:
        "I’m your DiaSense AI Health Assistant. You can ask about your assessment or general health topics such as symptoms, nutrition, exercise, sleep, blood pressure, diabetes, heart health, medicines, vitamins, and wellness. I provide general health education and do not replace medical care.",
    },
  ]);

  const [location, setLocation] = useState<LocationPoint | null>(null);

  const [locationError, setLocationError] = useState("");

  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [searching, setSearching] = useState(false);

  const [locationLoading, setLocationLoading] = useState(false);

  const highRisk = status.data?.highRisk === true;

  /* =======================================================
     SEND CHAT MESSAGE
  ======================================================= */

  const send = async (e: FormEvent) => {
    e.preventDefault();

    const message = input.trim();

    if (!message || chat.isPending) {
      return;
    }

    setMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: message,
      },
    ]);

    setInput("");

    try {
      const result = await chat.mutateAsync({
        message,
      });

      setMessages(prev => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: result.answer,
          shouldType: true,
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content:
            "I’m temporarily unavailable. Please try again shortly. If you feel unwell or have urgent symptoms, contact local emergency services now.",
          shouldType: true,
        },
      ]);
    }
  };

  /* =======================================================
     REQUEST LOCATION
  ======================================================= */

  const requestLocation = () => {
    setLocationError("");
    setDoctors([]);

    if (!navigator.geolocation) {
      setLocationError(
        "Location is not supported by this browser. Please use a browser with location access enabled."
      );

      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async position => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setLocation(userLocation);

        setLocationLoading(false);

        /*
         * Immediately search after
         * getting the location.
         */

        setSearching(true);
        setLocationError("");

        try {
          const results = await findNearbyHealthcare(userLocation);

          setDoctors(results);

          if (results.length === 0) {
            setLocationError(
              "No nearby healthcare facilities were found in the available OpenStreetMap data."
            );
          }
        } catch {
          setDoctors([]);

          setLocationError(
            "Nearby healthcare search is temporarily unavailable. Please try again."
          );
        } finally {
          /*
           * VERY IMPORTANT:
           * Never leave this true.
           */
          setSearching(false);
        }
      },
      err => {
        setLocationLoading(false);
        setSearching(false);

        if (err.code === err.PERMISSION_DENIED) {
          setLocationError(
            "Location permission was denied. Please allow location access in your browser and click Use my location again."
          );
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError(
            "Your location could not be determined. Check your browser/device location settings and try again."
          );
        } else if (err.code === err.TIMEOUT) {
          setLocationError("Location request timed out. Please try again.");
        } else {
          setLocationError(
            "We could not determine your location. Please try again."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 60000,
      }
    );
  };

  /* =======================================================
     RETRY SEARCH
  ======================================================= */

  const retryNearbySearch = async () => {
    if (!location) {
      requestLocation();
      return;
    }

    setLocationError("");
    setDoctors([]);
    setSearching(true);

    try {
      const results = await findNearbyHealthcare(location);

      setDoctors(results);

      if (results.length === 0) {
        setLocationError(
          "No nearby healthcare facilities were found. Please try again later."
        );
      }
    } catch {
      setDoctors([]);

      setLocationError(
        "Nearby healthcare search is taking too long or is temporarily unavailable."
      );
    } finally {
      setSearching(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="app-shell grid min-h-screen place-items-center">
        <div className="eyebrow">Loading health assistant</div>
      </div>
    );
  }

  /* =======================================================
     AUTH ERROR
  ======================================================= */

  if (error || !user) {
    return (
      <div className="app-shell grid min-h-screen place-items-center p-6">
        <div className="panel max-w-lg p-8 text-center">
          <div className="eyebrow">Authentication required</div>

          <h1 className="mt-4 text-2xl font-bold text-white">
            Sign in to use the assistant.
          </h1>

          <Link
            href="/auth"
            className="btn-primary mt-6 inline-flex px-5 py-3 no-underline"
          >
            Open secure sign in
          </Link>
        </div>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="app-shell min-h-screen">
      <div className="container-wide py-10">
        <Link href="/dashboard" className="text-sm text-slate-400 no-underline">
          ← Back to overview
        </Link>

        <div className="mt-10 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
          {/* =================================================
              LEFT: HEALTH ASSISTANT
          ================================================= */}

          <section className="panel bracket p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="eyebrow">AI health assistant</div>

                <h1 className="mt-3 text-3xl font-bold text-white">
                  Ask about your health.
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  Ask about your DiaSense assessment or general health topics
                  such as symptoms, nutrition, exercise, sleep, blood pressure,
                  diabetes, heart health, medicines, vitamins, and wellness.
                </p>
              </div>

              <Stethoscope className="shrink-0 text-cyan-300" size={26} />
            </div>

            {/* CHAT */}

            <div className="mt-7 space-y-4" aria-live="polite">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`max-w-[92%] rounded-lg p-4 text-sm leading-6 ${
                    message.role === "user"
                      ? "ml-auto bg-cyan-300/10 text-cyan-50"
                      : "border border-slate-800 bg-slate-950/50 text-slate-300"
                  }`}
                >
                  <span className="mono mb-1 block text-[10px] text-slate-500">
                    {message.role === "user" ? "YOU" : "DIASENSE AI"}
                  </span>

                  {message.role === "assistant" ? (
                    <TypedReply
                      content={message.content}
                      active={message.shouldType}
                    />
                  ) : (
                    message.content
                  )}
                </div>
              ))}

              {chat.isPending && (
                <div className="flex items-center gap-3 rounded-lg border border-cyan-300/15 bg-cyan-300/5 p-3 text-sm text-cyan-100">
                  <span className="flex gap-1" aria-hidden>
                    <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.3s]" />
                    <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.15s]" />
                    <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300" />
                  </span>

                  <span>DiaSense AI is composing a response…</span>
                </div>
              )}
            </div>

            {/* INPUT */}

            <form onSubmit={send} className="mt-6 flex gap-2">
              <label className="sr-only" htmlFor="assistant-question">
                Ask the assistant
              </label>

              <input
                id="assistant-question"
                value={input}
                onChange={e => setInput(e.target.value)}
                maxLength={1000}
                className="field flex-1"
                placeholder="Ask anything about your health..."
              />

              <button
                type="submit"
                disabled={chat.isPending || !input.trim()}
                className="btn-primary inline-flex items-center px-4 py-3 disabled:opacity-50"
              >
                <Send size={16} />

                <span className="ml-2 hidden sm:inline">Send</span>
              </button>
            </form>

            {/* SAFETY */}

            <div className="mt-5 rounded-lg border border-amber-300/20 bg-amber-300/5 p-4 text-xs leading-5 text-amber-100">
              <b>Important:</b> DiaSense AI provides general health education
              and is not a substitute for a medical professional. For chest
              pain, difficulty breathing, fainting, confusion, signs of stroke,
              or another emergency, contact local emergency services now.
            </div>
          </section>

          {/* =================================================
              RIGHT: CLINICAL FOLLOW-UP
          ================================================= */}

          <section className="panel p-6 sm:p-8">
            <div className="eyebrow">Clinical follow-up</div>

            {/* STATUS LOADING */}

            {status.isLoading ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="animate-spin" size={15} />
                Checking your latest assessment…
              </div>
            ) : highRisk ? (
              <>
                {/* HIGH RISK */}

                <div className="mt-4 flex gap-3 rounded-lg border border-rose-300/30 bg-rose-300/10 p-4">
                  <ShieldAlert
                    className="mt-0.5 shrink-0 text-rose-300"
                    size={20}
                  />

                  <div>
                    <h2 className="font-semibold text-rose-100">
                      Your latest signal needs timely clinical follow-up.
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-rose-100/80">
                      Your result was {status.data?.risk}% risk. Consider
                      arranging an appointment with a qualified healthcare
                      professional.
                    </p>
                  </div>
                </div>

                {/* LOCATION BUTTON */}

                <button
                  type="button"
                  onClick={location ? retryNearbySearch : requestLocation}
                  disabled={locationLoading || searching}
                  className="btn-primary mt-5 inline-flex items-center px-4 py-3 disabled:opacity-50"
                >
                  {locationLoading || searching ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : (
                    <MapPin size={16} className="mr-2" />
                  )}

                  {locationLoading
                    ? "Getting your location..."
                    : searching
                      ? "Finding nearby healthcare..."
                      : location
                        ? "Refresh nearby healthcare"
                        : "Use my location"}
                </button>

                {/* LOCATION ERROR */}

                {locationError && (
                  <div className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/5 p-4 text-sm leading-6 text-amber-100">
                    <p>{locationError}</p>

                    <button
                      type="button"
                      onClick={location ? retryNearbySearch : requestLocation}
                      className="mt-3 inline-flex items-center text-xs font-semibold text-cyan-300"
                    >
                      <RefreshCw size={13} className="mr-1" />
                      Try again
                    </button>
                  </div>
                )}

                {/* LOCATION DETECTED */}

                {location && (
                  <div className="mt-5">
                    <div className="rounded-lg border border-cyan-300/15 bg-cyan-300/5 p-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-cyan-300" />

                        <span className="text-sm font-semibold text-cyan-100">
                          Location detected
                        </span>
                      </div>

                      <p className="mt-2 text-xs leading-5 text-slate-400">
                        Nearby healthcare facilities are searched using
                        OpenStreetMap public data. Your location is used only
                        for this search.
                      </p>
                    </div>

                    {/* SEARCHING */}

                    {searching && (
                      <div className="mt-5 flex items-center gap-2 text-sm text-slate-400">
                        <Loader2 className="animate-spin" size={15} />
                        Searching nearby doctors, clinics and hospitals…
                      </div>
                    )}

                    {/* RESULTS */}

                    {!searching && doctors.length > 0 && (
                      <div className="mt-5 space-y-3">
                        <div className="mono text-[10px] text-slate-500">
                          NEARBY HEALTHCARE
                        </div>

                        {doctors.map(doctor => (
                          <div
                            key={doctor.placeId}
                            className="rounded-lg border border-slate-800 bg-slate-950/40 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="mb-1 inline-flex rounded-full border border-cyan-300/15 bg-cyan-300/5 px-2 py-0.5 text-[10px] font-semibold text-cyan-200">
                                  {doctor.type}
                                </div>

                                <h3 className="text-sm font-semibold text-white">
                                  {doctor.name}
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                  {doctor.address}
                                </p>

                                <p className="mt-2 text-[11px] text-slate-500">
                                  {typeof doctor.distanceKm === "number"
                                    ? `${doctor.distanceKm.toFixed(1)} km away`
                                    : "Distance unavailable"}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => openDirections(doctor)}
                                className="inline-flex shrink-0 items-center text-xs font-semibold text-cyan-300"
                              >
                                Directions
                                <ExternalLink size={13} className="ml-1" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* NO RESULTS */}

                    {!searching && doctors.length === 0 && !locationError && (
                      <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                        <p className="text-sm leading-6 text-slate-400">
                          No nearby healthcare facility was found in the
                          available OpenStreetMap data.
                        </p>

                        <button
                          type="button"
                          onClick={retryNearbySearch}
                          className="mt-3 inline-flex items-center text-xs font-semibold text-cyan-300"
                        >
                          <RefreshCw size={13} className="mr-1" />
                          Search again
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* =================================================
                 NOT HIGH RISK
              ================================================= */

              <div className="mt-5 rounded-lg border border-emerald-300/20 bg-emerald-300/5 p-4">
                <h2 className="font-semibold text-emerald-100">
                  No high-risk escalation is currently active.
                </h2>

                <p className="mt-2 text-sm leading-6 text-emerald-100/80">
                  Continue using the assistant for health education and follow
                  the recommendations from your latest assessment. If you
                  develop concerning symptoms, contact a qualified clinician
                  promptly.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
