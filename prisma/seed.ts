import {
  PrismaClient,
  type CommunityStatus,
} from "@prisma/client";
import { SEED_FEATURES } from "./seed-data";

const prisma = new PrismaClient();

async function seedFeatures() {
  const features = new Map<string, string>();

  for (const feature of SEED_FEATURES) {
    const row = await prisma.accessibilityFeature.upsert({
      where: { key: feature.key },
      update: {
        label: feature.label,
        shortLabel: feature.shortLabel,
        category: feature.category,
        icon: feature.icon,
        description: feature.description,
        sortOrder: feature.sortOrder,
        isActive: true,
      },
      create: {
        id: crypto.randomUUID(),
        key: feature.key,
        label: feature.label,
        shortLabel: feature.shortLabel,
        category: feature.category,
        icon: feature.icon,
        description: feature.description,
        sortOrder: feature.sortOrder,
      },
    });

    features.set(row.key, row.id);
  }

  return features;
}

type SeedCommunity = {
  slug: string;
  name: string;
  description: string;
  province: string;
  city: string;
  focus: string[];
  contact: string;
  socials: { instagram?: string; website?: string };
  joinUrl: string;
  verifiedAt: string;
};

const communities: SeedCommunity[] = [
  {
    slug: "gerak-bersama-jakarta",
    name: "Gerak Bersama",
    description:
      "Gerak Bersama mendampingi penyandang disabilitas fisik untuk tetap aktif lewat latihan mobilitas, renang, dan basket kursi roda. Kami rutin mengadakan sesi terbuka di Jakarta Selatan dan menyediakan pendamping latihan bagi peserta baru.",
    province: "DKI Jakarta",
    city: "Jakarta Selatan",
    focus: ["Disabilitas fisik", "Olahraga inklusif"],
    contact: "halo@gerakbersama.id",
    socials: { instagram: "@gerakbersama.id", website: "https://gerakbersama.id" },
    joinUrl: "https://chat.whatsapp.com/contoh-gerak-bersama",
    verifiedAt: "2026-03-12T08:00:00+07:00",
  },
  {
    slug: "rangkul-tuli-jakarta",
    name: "Rangkul Tuli Jakarta",
    description:
      "Rangkul Tuli Jakarta adalah ruang belajar bahasa isyarat Indonesia (BISINDO) dan bertemu teman Tuli di Jakarta. Kami membuka kelas bahasa isyarat gratis, pendampingan juru bahasa, dan diskusi budaya Tuli setiap dua minggu.",
    province: "DKI Jakarta",
    city: "Jakarta Pusat",
    focus: ["Tuli & tunarungu", "Inklusi pendidikan"],
    contact: "kontak@rangkultuli.org",
    socials: { instagram: "@rangkultuli", website: "https://rangkultuli.org" },
    joinUrl: "https://chat.whatsapp.com/contoh-rangkul-tuli",
    verifiedAt: "2026-04-02T09:30:00+07:00",
  },
  {
    slug: "cahaya-netra-bandung",
    name: "Cahaya Netra",
    description:
      "Cahaya Netra mendampingi teman tunanetra dan low vision di Bandung untuk belajar teknologi bantu, orientasi mobilitas, dan keterampilan sehari-hari. Kami juga mendampingi keluarga dalam memahami kebutuhan anggota keluarganya.",
    province: "Jawa Barat",
    city: "Bandung",
    focus: ["Netra & tunanetra", "Pendampingan keluarga"],
    contact: "sapa@cahayanetra.id",
    socials: { instagram: "@cahayanetra", website: "https://cahayanetra.id" },
    joinUrl: "https://chat.whatsapp.com/contoh-cahaya-netra",
    verifiedAt: "2026-02-18T10:00:00+07:00",
  },
  {
    slug: "sekolah-inklusi-kita",
    name: "Sekolah Inklusi Kita",
    description:
      "Sekolah Inklusi Kita menghubungkan orang tua, guru, dan relawan untuk mendukung pendidikan inklusif di Surabaya. Program kami mencakup pendampingan belajar mingguan, pelatihan guru, dan konsultasi sekolah inklusif.",
    province: "Jawa Timur",
    city: "Surabaya",
    focus: ["Inklusi pendidikan", "Autisme"],
    contact: "halo@sekolahinklusikita.org",
    socials: {
      instagram: "@sekolahinklusikita",
      website: "https://sekolahinklusikita.org",
    },
    joinUrl: "https://chat.whatsapp.com/contoh-sekolah-inklusi",
    verifiedAt: "2026-05-07T08:15:00+07:00",
  },
  {
    slug: "jiwa-tenang-yogyakarta",
    name: "Jiwa Tenang",
    description:
      "Jiwa Tenang menyediakan kelompok dukungan sebaya untuk penyandang disabilitas psikososial dan keluarga di Yogyakarta. Kami bertemu rutin untuk berbagi cerita, belajar mengelola stres, dan merujuk ke tenaga profesional bila dibutuhkan.",
    province: "DI Yogyakarta",
    city: "Yogyakarta",
    focus: ["Kesehatan mental", "Pendampingan keluarga"],
    contact: "halo@jiwatenang.id",
    socials: { instagram: "@jiwatenang.id" },
    joinUrl: "https://chat.whatsapp.com/contoh-jiwa-tenang",
    verifiedAt: "2026-06-11T13:00:00+07:00",
  },
  {
    slug: "tangan-hangat-semarang",
    name: "Tangan Hangat",
    description:
      "Tangan Hangat mendampingi penyandang disabilitas intelektual dan keluarganya di Semarang melalui pelatihan kemandirian, keterampilan kerja, dan kegiatan seni. Kami percaya setiap orang punya cara sendiri untuk berkontribusi.",
    province: "Jawa Tengah",
    city: "Semarang",
    focus: ["Disabilitas intelektual", "Pendampingan keluarga"],
    contact: "kontak@tanganhangat.id",
    socials: { instagram: "@tanganhangat.smg" },
    joinUrl: "https://chat.whatsapp.com/contoh-tangan-hangat",
    verifiedAt: "2026-01-25T09:45:00+07:00",
  },
  {
    slug: "seni-tanpa-batas-bali",
    name: "Seni Tanpa Batas",
    description:
      "Seni Tanpa Batas mempertemukan seniman disabilitas dan non-disabilitas di Bali untuk menciptakan karya tari, musik, dan teater. Kami membuka kelas seni inklusif dan mementaskan karya di ruang publik yang aksesibel.",
    province: "Bali",
    city: "Denpasar",
    focus: ["Seni & budaya", "Disabilitas fisik"],
    contact: "halo@senitanpabatas.id",
    socials: { instagram: "@senitanpabatas", website: "https://senitanpabatas.id" },
    joinUrl: "https://chat.whatsapp.com/contoh-seni-tanpa-batas",
    verifiedAt: "2026-07-03T11:20:00+07:00",
  },
  {
    slug: "sahabat-autisme-medan",
    name: "Sahabat Autisme Medan",
    description:
      "Sahabat Autisme Medan mendampingi keluarga dengan anak autistik melalui konsultasi awal, kelompok bermain inklusif, dan pelatihan pendampingan di rumah. Kami juga membangun jejaring terapis lokal yang bisa dijangkau keluarga.",
    province: "Sumatera Utara",
    city: "Medan",
    focus: ["Autisme", "Pendampingan keluarga"],
    contact: "halo@sahabatautismemedan.org",
    socials: { instagram: "@sahabatautismemedan" },
    joinUrl: "https://chat.whatsapp.com/contoh-sahabat-autisme",
    verifiedAt: "2026-08-19T10:30:00+07:00",
  },
  {
    slug: "lintas-akses-makassar",
    name: "Lintas Akses Makassar",
    description:
      "Lintas Akses Makassar mendampingi warga dalam memetakan dan menyuarakan aksesibilitas ruang publik di Makassar. Kami rutin memeriksa trotoar, transportasi umum, dan fasilitas kesehatan untuk mendorong perbaikan yang nyata.",
    province: "Sulawesi Selatan",
    city: "Makassar",
    focus: ["Advokasi & aksesibilitas", "Disabilitas fisik"],
    contact: "halo@lintasakses.id",
    socials: { instagram: "@lintasakses", website: "https://lintasakses.id" },
    joinUrl: "https://chat.whatsapp.com/contoh-lintas-akses",
    verifiedAt: "2026-09-02T08:00:00+07:00",
  },
];

async function seedCommunities() {
  // Komunitas butuh pemilik dari tabel profiles. Kalau belum ada akun,
  // lewati seeding komunitas tanpa menggagalkan seluruh proses.
  const profiles = await prisma.profile.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (profiles.length === 0) {
    console.warn(
      "Seed komunitas dilewati: belum ada profil. Buat satu akun lewat /daftar lalu jalankan ulang seed.",
    );
    return;
  }

  let created = 0;
  let updated = 0;

  for (const [index, community] of communities.entries()) {
    const ownerId = profiles[index % profiles.length]!.id;
    const data = {
      name: community.name,
      description: community.description,
      province: community.province,
      city: community.city,
      focus: community.focus,
      contact: community.contact,
      socials: community.socials,
      joinUrl: community.joinUrl,
      status: "VERIFIED" as CommunityStatus,
      ownerId,
      verifiedAt: new Date(community.verifiedAt),
      verifiedBy: ownerId,
      archivedAt: null,
    } satisfies Parameters<typeof prisma.community.upsert>[0]["update"];

    const existing = await prisma.community.findUnique({
      where: { slug: community.slug },
      select: { id: true },
    });

    await prisma.community.upsert({
      where: { slug: community.slug },
      create: { slug: community.slug, ...data },
      update: data,
    });

    if (existing) updated += 1;
    else created += 1;
  }

  console.log(
    `Seed komunitas selesai: ${created} dibuat, ${updated} diperbarui, total ${communities.length}.`,
  );
}

async function main() {
  console.log("Seeding fasilitas aksesibilitas dan komunitas…");

  await seedFeatures();
  console.log(
    `Selesai: ${SEED_FEATURES.length} fasilitas aksesibilitas.`,
  );

  console.log("Seeding komunitas…");
  await seedCommunities();
}

main()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
