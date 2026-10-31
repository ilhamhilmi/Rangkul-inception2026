import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRightIcon,
  CheckIcon,
  GlobeIcon,
  InstagramIcon,
  MailIcon,
  MessageCircleIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from "@/components/ui/icons";
import { CommunityCard } from "@/components/communities/community-card";
import { CommunityProfileHeader } from "@/components/communities/community-profile-header";
import {
  getCommunityBySlug,
  getRelatedCommunities,
} from "@/server/communities/queries";
import type { Community } from "@/types/community";

const shortDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const joinSteps = [
  "Hubungi pengurus lewat kontak yang tertera atau tombol bergabung.",
  "Kenali pengurus dan anggota lewat grup komunikasi komunitas.",
  "Mulai terlibat sesuai minat dan kenyamananmu.",
];

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPhone(value: string) {
  return /^(\+62|62|0)[0-9\s-]{8,18}$/.test(value);
}

function websiteHref(value: string) {
  try {
    const url = new URL(
      /^https?:\/\//i.test(value) ? value : `https://${value}`,
    );
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function DetailSkeleton() {
  return (
    <div>
      <Skeleton className="h-6 w-64" />
      <Skeleton className="mt-4 h-72 w-full rounded-sheet" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-card" />
          <Skeleton className="h-56 w-full rounded-card" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-card" />
          <Skeleton className="h-48 w-full rounded-card" />
        </div>
      </div>
    </div>
  );
}

function ContactList({ community }: { community: Community }) {
  const items = [
    {
      icon: isEmail(community.contact)
        ? MailIcon
        : isPhone(community.contact)
          ? PhoneIcon
          : MessageCircleIcon,
      label: isEmail(community.contact)
        ? "Email"
        : isPhone(community.contact)
          ? "Telepon"
          : "Kontak",
      value: community.contact,
      href: null,
    },
    ...(community.socials.instagram
      ? [
          {
            icon: InstagramIcon,
            label: "Instagram",
            value: community.socials.instagram,
            href: null,
          },
        ]
      : []),
    ...(community.socials.facebook
      ? [
          {
            icon: GlobeIcon,
            label: "Facebook",
            value: community.socials.facebook,
            href: null,
          },
        ]
      : []),
    ...(community.socials.website
      ? [
          {
            icon: GlobeIcon,
            label: "Situs web",
            value: community.socials.website,
            href: websiteHref(community.socials.website),
          },
        ]
      : []),
  ];

  return (
    <dl className="mt-4 space-y-3.5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-700">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <dt className="text-xs text-ink-muted">{item.label}</dt>
              <dd className="mt-0.5 break-words text-sm font-medium text-ink">
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-4 hover:text-primary-800 hover:underline"
                  >
                    {item.value}
                  </a>
                ) : (
                  item.value
                )}
              </dd>
            </div>
          </div>
        );
      })}
    </dl>
  );
}

async function CommunityDetail({
  params,
}: Pick<PageProps<"/komunitas/[slug]">, "params">) {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);

  if (!community) notFound();

  const related = await getRelatedCommunities(community);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          { label: "Komunitas", href: "/komunitas" },
          { label: community.name },
        ]}
      />

      <div className="mt-4">
        <CommunityProfileHeader community={community} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:items-start">
        <div className="min-w-0 space-y-4">
          <section
            aria-labelledby="tentang-komunitas"
            className="rounded-card border border-line bg-surface p-5 shadow-xs sm:p-6"
          >
            <h2
              id="tentang-komunitas"
              className="text-lg font-semibold tracking-tight text-ink"
            >
              Tentang komunitas
            </h2>
            <p className="mt-3 max-w-[68ch] whitespace-pre-line break-words leading-relaxed text-ink-muted">
              {community.description}
            </p>

            <dl className="mt-5 grid gap-4 border-t border-line pt-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-ink-muted">Wilayah</dt>
                <dd className="mt-1 text-sm font-medium text-ink">
                  {community.city}, {community.province}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Fokus utama</dt>
                <dd className="mt-1 text-sm font-medium text-ink">
                  {community.focus.length} fokus komunitas
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Kontak publik</dt>
                <dd className="mt-1 break-words text-sm font-medium text-ink">
                  {community.contact}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-24">
          <section
            aria-labelledby="kontak-komunitas"
            className="rounded-card border border-line bg-surface p-5 shadow-xs"
          >
            <h2
              id="kontak-komunitas"
              className="text-lg font-semibold tracking-tight text-ink"
            >
              Kontak dan sosial
            </h2>
            <ContactList community={community} />
          </section>

          <section
            aria-labelledby="cara-bergabung"
            className="rounded-card border border-line bg-surface p-5 shadow-xs"
          >
            <h2
              id="cara-bergabung"
              className="text-lg font-semibold tracking-tight text-ink"
            >
              Cara bergabung
            </h2>
            <ol className="mt-4 space-y-3">
              {joinSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-100 text-xs font-semibold text-primary-800">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-ink-muted">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {community.verifiedAt ? (
            <section
              aria-labelledby="status-verifikasi"
              className="rounded-card border border-success-600/25 bg-success-50 p-5"
            >
              <h2
                id="status-verifikasi"
                className="flex items-center gap-2 text-base font-semibold text-ink"
              >
                <ShieldCheckIcon className="h-5 w-5 text-success-700" />
                Terverifikasi admin
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Profil ini sudah diperiksa admin Rangkul pada{" "}
                <span className="font-medium text-ink">
                  {shortDateFormatter.format(new Date(community.verifiedAt))}
                </span>
                .
              </p>
              <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
                <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-700" />
                Data pengurus dan kontak sudah sesuai saat verifikasi.
              </p>
            </section>
          ) : null}
        </aside>
      </div>

      {related.length > 0 ? (
        <section aria-labelledby="komunitas-lain" className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="komunitas-lain"
                className="text-2xl font-bold tracking-tight text-ink"
              >
                Komunitas lain yang mungkin cocok
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Berdasarkan wilayah dan fokus yang berdekatan.
              </p>
            </div>
            <ButtonLink href="/komunitas" variant="ghost" size="sm">
              Lihat semua
              <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
          </div>

          <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug} className="h-full min-w-0">
                <CommunityCard community={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/komunitas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);

  if (!community) {
    return { title: "Komunitas tidak ditemukan" };
  }

  return {
    title: community.name,
    description: community.description.slice(0, 160),
    openGraph: {
      title: `${community.name} — Komunitas Rangkul`,
      description: community.description.slice(0, 160),
      type: "website",
    },
  };
}

export default function CommunityDetailPage({
  params,
}: PageProps<"/komunitas/[slug]">) {
  return (
    <div className="container-page py-6 lg:py-10">
      <Suspense fallback={<DetailSkeleton />}>
        <CommunityDetail params={params} />
      </Suspense>
    </div>
  );
}
