"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RouteMap } from "@/components/map/route-map";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  AlertIcon,
  ChevronRightIcon,
  ClockIcon,
  InfoIcon,
  MapPinIcon,
  NavigationIcon,
  RouteIcon,
  VolumeIcon,
  VolumeOffIcon,
  WalkIcon,
} from "@/components/ui/icons";
import { placeLocationLabel } from "@/components/places/post-card";
import {
  fetchWalkingRoute,
  formatRouteDistance,
  formatRouteDuration,
} from "@/lib/map/osrm";
import {
  distanceAlongRoute,
  haversineMeters,
  locateOnRoute,
} from "@/lib/map/geo";
import { cn } from "@/lib/utils/cn";
import type { RouteDestination } from "@/components/map/types";
import type { Coordinate, RouteOrigin, RouteStep, WalkingRoute } from "@/types/map";
import type { PlaceDetail } from "@/types/place";

type VoiceMode = "off" | "on";

type RouteStatus = "idle" | "loading" | "ready" | "error";

const LOCATION_UPDATE_METERS = 5;
const ROUTE_REFRESH_METERS = 150;
const OFF_ROUTE_METERS = 60;
const OFF_ROUTE_CONFIRMATIONS = 2;

type NavigationProgress = {
  activeStepIndex: number;
  activeStep: RouteStep | null;
  distanceToNextManeuver: number;
  remainingMeters: number;
  remainingSeconds: number;
};

function buildProgress(
  origin: Coordinate,
  route: WalkingRoute,
): NavigationProgress | null {
  const location = locateOnRoute(origin, route.geometry);
  if (!location) return null;

  const stepDistances = route.steps.map((step, index) => {
    if (!step.location) return index === 0 ? 0 : null;
    return distanceAlongRoute(
      { latitude: step.location[0], longitude: step.location[1] },
      route.geometry,
    );
  });

  let activeStepIndex = 0;

  for (let index = 0; index < route.steps.length; index += 1) {
    const distance = stepDistances[index];
    if (distance === null) continue;
    activeStepIndex = index;
    if (distance >= location.distanceAlongMeters + 3) break;
  }

  const activeDistance = stepDistances[activeStepIndex];
  const distanceToNextManeuver =
    activeDistance === null || activeDistance === undefined
      ? location.remainingMeters
      : Math.max(0, activeDistance - location.distanceAlongMeters);

  const remainingRatio =
    route.distanceMeters > 0
      ? Math.min(1, Math.max(0, location.remainingMeters / route.distanceMeters))
      : 0;

  return {
    activeStepIndex,
    activeStep: route.steps[activeStepIndex] ?? null,
    distanceToNextManeuver,
    remainingMeters: location.remainingMeters,
    remainingSeconds: Math.max(
      0,
      Math.round(route.durationSeconds * remainingRatio),
    ),
  };
}

function locationErrorMessage(error: GeolocationPositionError) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Akses lokasi ditolak. Izinkan lokasi untuk situs ini di pengaturan browser, lalu coba lagi.";
    case error.POSITION_UNAVAILABLE:
      return "Lokasi perangkat belum tersedia. Pastikan GPS atau layanan lokasi menyala dan kamu berada di area dengan sinyal.";
    default:
      return "Membaca lokasi terlalu lama. Coba lagi di area dengan sinyal yang lebih baik.";
  }
}

export function NavigationExperience({ place }: { place: PlaceDetail }) {
  const destination = useMemo<RouteDestination>(
    () => ({
      label: place.name,
      latitude: place.latitude,
      longitude: place.longitude,
    }),
    [place.name, place.latitude, place.longitude],
  );

  const [voiceMode, setVoiceMode] = useState<VoiceMode>("off");
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [origin, setOrigin] = useState<RouteOrigin | null>(null);
  const [locating, setLocating] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationRequest, setLocationRequest] = useState(0);
  const [route, setRoute] = useState<WalkingRoute | null>(null);
  const [routeStatus, setRouteStatus] = useState<RouteStatus>("idle");
  const [routeRequest, setRouteRequest] = useState(0);
  const [followUser, setFollowUser] = useState(true);

  const lastPositionRef = useRef<Coordinate | null>(null);
  const lastRouteOriginRef = useRef<Coordinate | null>(null);
  const routeAbortRef = useRef<AbortController | null>(null);
  const lastAnnouncedRef = useRef<string | null>(null);
  const offRouteStreakRef = useRef(0);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      const timer = setTimeout(() => {
        setLocating(false);
        setLocationError(
          "Browser ini tidak menyediakan akses lokasi. Navigasi live membutuhkan GPS atau layanan lokasi perangkat.",
        );
      }, 0);

      return () => clearTimeout(timer);
    }

    let active = true;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (!active) return;

        const next: Coordinate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        const previous = lastPositionRef.current;

        setLocating(false);
        setLocationError(null);

        if (previous && haversineMeters(previous, next) < LOCATION_UPDATE_METERS) {
          return;
        }

        lastPositionRef.current = next;
        setOrigin({
          ...next,
          label: "Lokasi Anda",
          source: "geolocation",
          accuracyMeters: position.coords.accuracy,
        });
      },
      (error) => {
        if (!active) return;
        setLocating(false);
        setLocationError(locationErrorMessage(error));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 20000,
      },
    );

    return () => {
      active = false;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [locationRequest]);

  useEffect(() => {
    if (!origin) return;

    const previousOrigin = lastRouteOriginRef.current;
    const movedFar =
      !previousOrigin ||
      haversineMeters(previousOrigin, origin) > ROUTE_REFRESH_METERS;
    const offRoute =
      route !== null &&
      (locateOnRoute(origin, route.geometry)?.distanceToRouteMeters ?? 0) >
        OFF_ROUTE_METERS;

    // Satu sampel GPS yang meleset tidak cukup untuk membuang rute: tunggu
    // beberapa sampel berturut-turut supaya garis tidak dihitung ulang terus
    // dan terlihat berputar.
    offRouteStreakRef.current = offRoute ? offRouteStreakRef.current + 1 : 0;
    const confirmedOffRoute =
      offRouteStreakRef.current >= OFF_ROUTE_CONFIRMATIONS;

    const fetching = Boolean(
      routeAbortRef.current && !routeAbortRef.current.signal.aborted,
    );

    if (!movedFar && !confirmedOffRoute && (route || fetching)) return;

    offRouteStreakRef.current = 0;

    // Abort hanya saat memulai permintaan rute baru. Cleanup effect ini tidak
    // membatalkan fetch yang sedang berjalan setiap kali GPS bergerak 5 m.
    routeAbortRef.current?.abort();
    const controller = new AbortController();
    routeAbortRef.current = controller;

    lastRouteOriginRef.current = origin;

    fetchWalkingRoute({
      origin,
      destination,
      signal: controller.signal,
    }).then((result) => {
      if (routeAbortRef.current !== controller) return;
      routeAbortRef.current = null;

      if (result) {
        setRoute(result);
        setRouteStatus("ready");
        return;
      }

      setRouteStatus("error");
    });
  }, [destination, origin, route, routeRequest]);

  useEffect(() => {
    return () => routeAbortRef.current?.abort();
  }, []);

  const progress = useMemo(
    () => (origin && route ? buildProgress(origin, route) : null),
    [origin, route],
  );

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 0.95;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  useEffect(() => {
    if (voiceMode !== "on" || !progress?.activeStep) return;

    const key = `${progress.activeStepIndex}:${progress.activeStep.instruction}`;
    if (lastAnnouncedRef.current === key) return;

    lastAnnouncedRef.current = key;
    speak(progress.activeStep.instruction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceMode, progress?.activeStepIndex, progress?.activeStep?.instruction]);

  function changeVoiceMode(mode: VoiceMode) {
    lastAnnouncedRef.current = null;

    if (mode === "on") {
      const supported =
        typeof window !== "undefined" && "speechSynthesis" in window;
      if (!supported) {
        setVoiceMode("off");
        setVoiceNotice(
          "Browser ini belum mendukung panduan suara. Petunjuk arah tetap bisa dibaca sebagai teks.",
        );
        return;
      }
      setVoiceMode("on");
      setVoiceNotice(null);
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setVoiceMode("off");
    setVoiceNotice(null);
  }

  function retryLocation() {
    lastPositionRef.current = null;
    setOrigin(null);
    setRouteStatus("idle");
    setLocating(true);
    setLocationError(null);
    setLocationRequest((value) => value + 1);
  }

  function retryRoute() {
    lastRouteOriginRef.current = null;
    setRouteRequest((value) => value + 1);
  }

  const searching = locating && !origin;
  const hasComplexError = Boolean(locationError) && !origin;
  const displayRouteStatus: RouteStatus =
    routeStatus === "error"
      ? "error"
      : origin && !route
        ? "loading"
        : routeStatus;

  const activeStep = progress?.activeStep ?? null;
  const distanceToNextManeuver = progress?.distanceToNextManeuver ?? 0;
  const remainingLabel = progress
    ? formatRouteDistance(Math.round(progress.remainingMeters))
    : route
      ? formatRouteDistance(route.distanceMeters)
      : "—";
  const durationLabel = progress
    ? formatRouteDuration(progress.remainingSeconds)
    : route
      ? formatRouteDuration(route.durationSeconds)
      : "—";

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
      <div className="lg:sticky lg:top-24">
        <div className="relative">
          <RouteMap
            origin={origin}
            destination={destination}
            route={route}
            followUser={followUser}
            onUserInteract={() => setFollowUser(false)}
          />

          <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-wrap items-start justify-between gap-2">
            <span
              className={cn(
                "pointer-events-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-xs backdrop-blur",
                origin
                  ? "border-success-600/30 bg-surface/95 text-success-700"
                  : "border-warning-600/30 bg-surface/95 text-warning-700",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  origin ? "bg-success-600" : "animate-pulse bg-warning-600",
                )}
              />
              {origin
                ? "Lokasi live"
                : locationError
                  ? "Lokasi tidak aktif"
                  : `Mencari lokasi${searching ? "…" : ""}`}
            </span>

            {origin && !followUser ? (
              <button
                type="button"
                onClick={() => setFollowUser(true)}
                className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/95 px-2.5 py-1 text-xs font-semibold text-primary-800 shadow-xs backdrop-blur hover:bg-surface"
              >
                <NavigationIcon className="h-3.5 w-3.5" />
                Ikuti lokasi
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-card border border-line bg-surface px-4 py-2.5 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <MapPinIcon className="h-4 w-4 shrink-0 text-[#2563eb]" />
            {origin
              ? origin.accuracyMeters
                ? `Akurasi ±${Math.round(origin.accuracyMeters)} m`
                : "Lokasi perangkat aktif"
              : locationError
                ? "Izin lokasi belum aktif"
                : "Menunggu izin lokasi perangkat"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <RouteIcon className="h-4 w-4 shrink-0 text-[#2563eb]" />
            {route
              ? `${formatRouteDistance(route.distanceMeters)} total`
              : "Rute belum dihitung"}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <section
          aria-labelledby="live-heading"
          className="rounded-sheet border border-line bg-surface p-5 shadow-xs sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id="live-heading"
              className="text-xl font-bold tracking-tight text-ink"
            >
              Navigasi live
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-800">
              <RouteIcon className="h-3.5 w-3.5" />
              Rute OSRM
            </span>
          </div>
          <p className="mt-1.5 flex items-start gap-1.5 text-sm leading-relaxed text-ink-muted">
            <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
            {placeLocationLabel(place)}
          </p>

          <div
            aria-live="polite"
            aria-atomic="true"
            className="mt-4 rounded-card border border-[#2563eb]/20 bg-[#2563eb]/5 p-4"
          >
            {hasComplexError ? (
              <div className="space-y-3">
                <p className="flex items-start gap-2 text-sm leading-relaxed text-warning-700">
                  <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  {locationError}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={retryLocation}
                >
                  <NavigationIcon className="h-4 w-4" />
                  Coba baca lokasi lagi
                </Button>
              </div>
            ) : searching ? (
              <p className="flex items-center gap-2 text-sm text-ink-muted">
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-primary-300 border-t-primary-700"
                />
                Meminta lokasi perangkat dan menghitung rute…
              </p>
            ) : activeStep ? (
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#2563eb] text-white shadow-sm">
                  <NavigationIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563eb]">
                    {distanceToNextManeuver < 15
                      ? "Sekarang"
                      : `${formatRouteDistance(
                          Math.round(distanceToNextManeuver),
                        )} lagi`}
                  </p>
                  <p className="mt-0.5 text-lg font-semibold leading-snug text-ink">
                    {activeStep.instruction}
                  </p>
                </div>
              </div>
            ) : displayRouteStatus === "loading" ? (
              <p className="flex items-center gap-2 text-sm text-ink-muted">
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-primary-300 border-t-primary-700"
                />
                Menghitung rute…
              </p>
            ) : (
              <p className="flex items-start gap-2 text-sm leading-relaxed text-ink-muted">
                <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                Petunjuk arah akan muncul setelah lokasi perangkat terbaca dan
                rute berhasil dihitung.
              </p>
            )}
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-card bg-surface-muted/70 p-3.5">
              <dt className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                <WalkIcon className="h-3.5 w-3.5 text-primary-700" />
                Jarak tersisa
              </dt>
              <dd className="mt-1 text-lg font-bold text-ink">
                {remainingLabel}
              </dd>
            </div>
            <div className="rounded-card bg-surface-muted/70 p-3.5">
              <dt className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                <ClockIcon className="h-3.5 w-3.5 text-primary-700" />
                Estimasi perjalanan
              </dt>
              <dd className="mt-1 text-lg font-bold text-ink">
                {durationLabel}
              </dd>
            </div>
          </dl>

          {locationError && origin ? (
            <p className="mt-3 flex items-start gap-2 rounded-card border border-warning-600/30 bg-warning-50 px-3.5 py-3 text-sm leading-relaxed text-warning-700">
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
              {locationError}
            </p>
          ) : null}

          {routeStatus === "error" ? (
            <div className="mt-3 rounded-card border border-warning-600/30 bg-warning-50 px-3.5 py-3 text-sm leading-relaxed text-warning-700">
              <p className="flex items-start gap-2">
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                Rute gagal dihitung. Periksa koneksi internet, lalu coba lagi.
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={retryRoute}
                className="mt-2.5"
              >
                Hitung ulang rute
              </Button>
            </div>
          ) : null}

          <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-ink-muted">
            <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-700" />
            Titik awal selalu lokasi perangkat. Rute dihitung ulang otomatis saat
            kamu bergerak jauh atau keluar dari jalur.
          </p>
        </section>

        <section
          aria-labelledby="suara-heading"
          className="rounded-sheet border border-line bg-surface p-5 shadow-xs sm:p-6"
        >
          <h2
            id="suara-heading"
            className="text-xl font-bold tracking-tight text-ink"
          >
            Panduan suara
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
            Saat aktif, setiap langkah baru dibacakan otomatis mengikuti
            pergerakanmu.
          </p>

          <fieldset className="mt-4">
            <legend className="sr-only">Pilihan panduan suara</legend>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={cn(
                  "flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-button border px-3 text-sm font-medium transition-colors",
                  voiceMode === "off"
                    ? "border-primary-600 bg-primary-50 text-primary-900"
                    : "border-line bg-surface text-ink-muted hover:border-primary-300",
                )}
              >
                <input
                  type="radio"
                  name="suara"
                  value="off"
                  checked={voiceMode === "off"}
                  onChange={() => changeVoiceMode("off")}
                  className="h-4 w-4 accent-primary-600"
                />
                Tanpa
                <VolumeOffIcon className="h-4 w-4" />
              </label>
              <label
                className={cn(
                  "flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-button border px-3 text-sm font-medium transition-colors",
                  voiceMode === "on"
                    ? "border-primary-600 bg-primary-50 text-primary-900"
                    : "border-line bg-surface text-ink-muted hover:border-primary-300",
                )}
              >
                <input
                  type="radio"
                  name="suara"
                  value="on"
                  checked={voiceMode === "on"}
                  onChange={() => changeVoiceMode("on")}
                  className="h-4 w-4 accent-primary-600"
                />
                Pakai
                <VolumeIcon className="h-4 w-4" />
              </label>
            </div>
          </fieldset>

          {voiceNotice ? (
            <p
              role="alert"
              className="mt-3 rounded-card border border-warning-600/30 bg-warning-50 px-3.5 py-3 text-sm leading-relaxed text-warning-700"
            >
              {voiceNotice}
            </p>
          ) : null}
        </section>

        <section
          aria-labelledby="petunjuk-heading"
          className="scroll-mt-24 rounded-sheet border border-line bg-surface p-5 shadow-xs sm:p-6"
        >
          <h2
            id="petunjuk-heading"
            className="text-xl font-bold tracking-tight text-ink"
          >
            Petunjuk arah
          </h2>
          <p className="mt-1.5 text-sm text-ink-muted">
            Menuju <strong className="font-semibold text-ink">{place.name}</strong>
            {progress ? ` · ${remainingLabel} · ${durationLabel}` : ""}
          </p>

          {route && route.steps.length > 0 ? (
            <ol className="mt-4 space-y-3">
              {route.steps.map((step, index) => {
                const isActive = index === progress?.activeStepIndex;
                const isDone =
                  progress !== null && index < progress.activeStepIndex;

                return (
                  <li
                    key={`${index}-${step.instruction}`}
                    className={cn(
                      "flex gap-3 rounded-card px-2 py-2 transition-colors",
                      isActive && "bg-[#2563eb]/5 ring-1 ring-[#2563eb]/20",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                        isActive
                          ? "bg-[#2563eb] text-white"
                          : isDone
                            ? "bg-success-50 text-success-700"
                            : "bg-surface-muted text-ink-muted",
                      )}
                    >
                      {isDone ? "✓" : index + 1}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          isActive
                            ? "font-semibold text-ink"
                            : isDone
                              ? "text-ink-muted line-through decoration-line"
                              : "text-ink-muted",
                        )}
                      >
                        <span className="sr-only">Langkah {index + 1}: </span>
                        {step.instruction}
                      </p>
                      {isActive ? (
                        <p className="mt-0.5 text-xs font-medium text-[#2563eb]">
                          {distanceToNextManeuver < 15
                            ? "Lakukan sekarang"
                            : `${formatRouteDistance(
                                Math.round(distanceToNextManeuver),
                              )} lagi`}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="mt-4 rounded-card border border-dashed border-line bg-surface-muted/50 px-4 py-5 text-sm leading-relaxed text-ink-muted">
              Petunjuk arah muncul setelah rute berhasil dihitung dari lokasi
              perangkatmu.
            </p>
          )}
        </section>

        <ButtonLink
          href={`/jelajahi/${place.slug}`}
          variant="secondary"
          size="md"
          className="w-full"
        >
          <ChevronRightIcon className="h-4 w-4 rotate-180" />
          Kembali ke detail tempat
        </ButtonLink>
      </div>
    </div>
  );
}
