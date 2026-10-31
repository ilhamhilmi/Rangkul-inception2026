"use client";

import { useEffect, useState } from "react";
import { MockRouteMap } from "@/components/map/mock-route-map";
import { FeatureStatusRow } from "@/components/places/feature-chip";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  DoorIcon,
  InfoIcon,
  NavigationIcon,
  VolumeIcon,
  VolumeOffIcon,
  WalkIcon,
} from "@/components/ui/icons";
import { ACCESSIBILITY_FEATURES, getMainEntrance } from "@/lib/mock/places";
import { cn } from "@/lib/utils/cn";
import type { Entrance } from "@/types/place";

type NavigationPlace = {
  slug: string;
  name: string;
  city: string;
  province: string;
  address: string;
  entrances: Entrance[];
};

type VoiceMode = "off" | "on";

function countAvailable(entrance: Entrance) {
  return ACCESSIBILITY_FEATURES.filter(
    (feature) => entrance.features[feature.key] === "available",
  ).length;
}

export function NavigationExperience({
  place,
  initialEntranceId,
}: {
  place: NavigationPlace;
  initialEntranceId?: string;
}) {
  const fallbackId = getMainEntrance(place).id;
  const [entranceId, setEntranceId] = useState(
    place.entrances.some((entrance) => entrance.id === initialEntranceId)
      ? (initialEntranceId as string)
      : fallbackId,
  );
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("off");
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const selected =
    place.entrances.find((entrance) => entrance.id === entranceId) ??
    place.entrances[0];

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function selectEntrance(id: string) {
    setEntranceId(id);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  function changeVoiceMode(mode: VoiceMode) {
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

    setVoiceMode("off");
    setVoiceNotice(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  function speakDirections() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setVoiceNotice(
        "Panduan suara tidak tersedia di browser ini. Gunakan petunjuk arah teks di bawah.",
      );
      return;
    }

    const text = [
      `Panduan menuju ${selected.label} di ${place.name}.`,
      ...selected.route.steps.map(
        (step, index) => `Langkah ${index + 1}. ${step}`,
      ),
    ].join(" ");

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 0.95;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
      <div className="lg:sticky lg:top-24">
        <MockRouteMap
          destination={place.name}
          entranceLabel={selected.label}
          distance={selected.route.distance}
        />

        <p className="mt-3 flex items-start gap-2 rounded-card border border-line bg-surface px-4 py-3 text-xs leading-relaxed text-ink-muted">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
          Peta ini masih ilustrasi. Setelah Leaflet dan OSRM tersambung, rute
          akan mengikuti jalan sebenarnya. Petunjuk arah teks di samping tetap
          menjadi acuan utama.
        </p>
      </div>

      <div className="space-y-4">
        <section
          aria-labelledby="rencana-heading"
          className="rounded-sheet border border-line bg-surface p-5 shadow-xs sm:p-6"
        >
          <h2
            id="rencana-heading"
            className="text-xl font-bold tracking-tight text-ink"
          >
            Rencanakan perjalanan
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
            Pilih pintu masuk yang paling sesuai. Ringkasan rute dan petunjuk
            arah akan menyesuaikan.
          </p>

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold text-ink">
              Pilih pintu masuk
            </legend>
            <div className="mt-2.5 space-y-2">
              {place.entrances.map((entrance) => {
                const active = entrance.id === selected.id;
                return (
                  <label
                    key={entrance.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-card border p-3.5 transition-colors",
                      active
                        ? "border-primary-600 bg-primary-50"
                        : "border-line bg-surface hover:border-primary-300 hover:bg-surface-muted/50",
                    )}
                  >
                    <input
                      type="radio"
                      name="pintu"
                      value={entrance.id}
                      checked={active}
                      onChange={() => selectEntrance(entrance.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-primary-600"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-ink">
                          {entrance.label}
                        </span>
                        {entrance.isMain ? (
                          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-800">
                            Utama
                          </span>
                        ) : null}
                        <span className="text-xs text-ink-muted">
                          {countAvailable(entrance)} fasilitas tersedia
                        </span>
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-ink-muted">
                        {entrance.route.condition}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div
            role="status"
            className="mt-5 rounded-card bg-surface-muted/70 p-4"
          >
            <p className="text-sm font-semibold text-ink">
              Rute ke {selected.label}
            </p>
            <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Jarak</dt>
                <dd className="flex items-center gap-1.5 text-ink-muted">
                  <WalkIcon className="h-4 w-4 text-primary-700" />
                  <span className="font-medium text-ink">
                    {selected.route.distance}
                  </span>
                </dd>
              </div>
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Estimasi waktu</dt>
                <dd className="flex items-center gap-1.5 text-ink-muted">
                  <ClockIcon className="h-4 w-4 text-primary-700" />
                  <span className="font-medium text-ink">
                    {selected.route.duration}
                  </span>
                </dd>
              </div>
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Jumlah fasilitas</dt>
                <dd className="flex items-center gap-1.5 text-ink-muted">
                  <CheckIcon className="h-4 w-4 text-primary-700" />
                  <span className="font-medium text-ink">
                    {countAvailable(selected)} fasilitas
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <ButtonLink href="#petunjuk-arah" size="md" className="flex-1">
              <NavigationIcon className="h-4 w-4" />
              Arah
            </ButtonLink>
            <ButtonLink
              href={`/jelajahi/${place.slug}`}
              variant="secondary"
              size="md"
              className="flex-1"
            >
              <DoorIcon className="h-4 w-4" />
              Detail tempat
            </ButtonLink>
          </div>
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
            Suara tidak aktif otomatis. Petunjuk baru dibacakan setelah kamu
            memilih “Pakai” dan menekan tombol bacakan.
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

          {voiceMode === "on" ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={speakDirections}
              className="mt-3 w-full"
            >
              <VolumeIcon className="h-4 w-4" />
              Bacakan petunjuk arah
            </Button>
          ) : null}

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
            Menuju <strong className="font-semibold text-ink">{selected.label}</strong>{" "}
            · {selected.route.distance} · {selected.route.duration}
          </p>

          <ol
            id="petunjuk-arah"
            className="mt-4 scroll-mt-24 space-y-3"
          >
            {selected.route.steps.map((step, index) => (
              <li key={`${selected.id}-${index}`} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-100 text-xs font-bold text-primary-800"
                >
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed text-ink-muted">
                  <span className="sr-only">Langkah {index + 1}: </span>
                  {step}
                </p>
              </li>
            ))}
          </ol>

          <details className="group mt-5 rounded-card border border-line">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
              Fitur lainnya di {selected.label}
              <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-line px-4 py-2">
              <ul className="grid gap-x-4 sm:grid-cols-2">
                {ACCESSIBILITY_FEATURES.map((feature) => (
                  <FeatureStatusRow
                    key={feature.key}
                    feature={feature.key}
                    status={selected.features[feature.key]}
                  />
                ))}
              </ul>
            </div>
          </details>
        </section>
      </div>
    </div>
  );
}
