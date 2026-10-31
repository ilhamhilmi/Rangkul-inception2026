import type { Community, CommunityFocus } from "@/types/community";

export const communityFocusOptions: CommunityFocus[] = [
  "Disabilitas fisik",
  "Tuli & tunarungu",
  "Netra & tunanetra",
  "Disabilitas intelektual",
  "Autisme",
  "Inklusi pendidikan",
  "Kesehatan mental",
  "Seni & budaya",
  "Olahraga inklusif",
  "Pendampingan keluarga",
  "Advokasi & aksesibilitas",
];

export const communityProvinceOptions = [
  "Bali",
  "DI Yogyakarta",
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "Jawa Timur",
  "Sulawesi Selatan",
  "Sumatera Utara",
];

/**
 * Data contoh untuk fase UI. Nanti diganti oleh `server/communities/queries.ts`
 * tanpa mengubah bentuk data yang dipakai komponen.
 */
export const communities: Community[] = [
  {
    slug: "gerak-bersama-jakarta",
    name: "Gerak Bersama",
    tagline: "Olahraga dan mobilitas untuk semua tubuh",
    description:
      "Gerak Bersama mendampingi penyandang disabilitas fisik untuk tetap aktif lewat latihan mobilitas, renang, dan basket kursi roda. Kami rutin mengadakan sesi terbuka di Jakarta Selatan dan menyediakan pendamping latihan bagi peserta baru.",
    province: "DKI Jakarta",
    city: "Jakarta Selatan",
    focus: ["Disabilitas fisik", "Olahraga inklusif"],
    contact: {
      personName: "Nadia Prameswari",
      role: "Ketua komunitas",
      email: "halo@gerakbersama.id",
      phone: "0812-3456-7801",
      whatsapp: "0812-3456-7801",
    },
    socials: {
      instagram: "@gerakbersama.id",
      website: "gerakbersama.id",
    },
    joinUrl: "https://chat.whatsapp.com/contoh-gerak-bersama",
    status: "VERIFIED",
    ownerId: "mock-owner-01",
    verifiedAt: "2026-03-12T08:00:00+07:00",
    foundedYear: 2016,
    activities: [
      {
        title: "Sesi renang inklusif bulanan",
        category: "Olahraga inklusif",
        startsAt: "2026-11-14T08:00:00+07:00",
        location: "Kolam Renang GOR Bulungan, Jakarta Selatan",
      },
      {
        title: "Pendataan aksesibilitas halte MRT",
        category: "Pendataan aksesibilitas",
        startsAt: "2026-11-28T09:00:00+07:00",
        location: "Stasiun MRT Blok M, Jakarta Selatan",
      },
    ],
  },
  {
    slug: "rangkul-tuli-jakarta",
    name: "Rangkul Tuli Jakarta",
    tagline: "Ruang aman untuk bahasa isyarat dan budaya Tuli",
    description:
      "Rangkul Tuli Jakarta adalah ruang belajar bahasa isyarat Indonesia (BISINDO) dan bertemu teman Tuli di Jakarta. Kami membuka kelas bahasa isyarat gratis, pendampingan juru bahasa, dan diskusi budaya Tuli setiap dua minggu.",
    province: "DKI Jakarta",
    city: "Jakarta Pusat",
    focus: ["Tuli & tunarungu", "Inklusi pendidikan"],
    contact: {
      personName: "Bagas Adhitama",
      role: "Koordinator program",
      email: "kontak@rangkultuli.org",
      phone: "0813-2210-4477",
      whatsapp: "0813-2210-4477",
    },
    socials: {
      instagram: "@rangkultuli",
      website: "rangkultuli.org",
    },
    joinUrl: "https://chat.whatsapp.com/contoh-rangkul-tuli",
    status: "VERIFIED",
    ownerId: "mock-owner-02",
    verifiedAt: "2026-04-02T09:30:00+07:00",
    foundedYear: 2018,
    activities: [
      {
        title: "Kelas BISINDO pemula angkatan 12",
        category: "Program inklusif",
        startsAt: "2026-11-09T18:30:00+07:00",
        location: "Ruang komunitas Menteng, Jakarta Pusat",
      },
      {
        title: "Malam cerita budaya Tuli",
        category: "Kegiatan sosial",
        startsAt: "2026-12-05T17:00:00+07:00",
        location: "Taman Ismail Marzuki, Jakarta Pusat",
      },
    ],
  },
  {
    slug: "cahaya-netra-bandung",
    name: "Cahaya Netra",
    tagline: "Teknologi bantu dan pendampingan tunanetra",
    description:
      "Cahaya Netra mendampingi teman tunanetra dan low vision di Bandung untuk belajar teknologi bantu, orientasi mobilitas, dan keterampilan sehari-hari. Kami juga mendampingi keluarga dalam memahami kebutuhan anggota keluarganya.",
    province: "Jawa Barat",
    city: "Bandung",
    focus: ["Netra & tunanetra", "Pendampingan keluarga"],
    contact: {
      personName: "Rani Kusumawardhani",
      role: "Pendiri",
      email: "sapa@cahayanetra.id",
      phone: "0821-1188-2233",
      whatsapp: "0821-1188-2233",
    },
    socials: {
      instagram: "@cahayanetra",
      website: "cahayanetra.id",
    },
    joinUrl: "https://chat.whatsapp.com/contoh-cahaya-netra",
    status: "VERIFIED",
    ownerId: "mock-owner-03",
    verifiedAt: "2026-02-18T10:00:00+07:00",
    foundedYear: 2014,
    activities: [
      {
        title: "Pelatihan pembaca layar untuk pemula",
        category: "Program inklusif",
        startsAt: "2026-11-21T09:00:00+07:00",
        location: "Perpustakaan Kota Bandung",
      },
    ],
  },
  {
    slug: "sekolah-inklusi-kita",
    name: "Sekolah Inklusi Kita",
    tagline: "Pendampingan belajar untuk anak berkebutuhan khusus",
    description:
      "Sekolah Inklusi Kita menghubungkan orang tua, guru, dan relawan untuk mendukung pendidikan inklusif di Surabaya. Program kami mencakup pendampingan belajar mingguan, pelatihan guru, dan konsultasi sekolah inklusif.",
    province: "Jawa Timur",
    city: "Surabaya",
    focus: ["Inklusi pendidikan", "Autisme"],
    contact: {
      personName: "Dewi Anggraeni",
      role: "Koordinator relawan",
      email: "halo@sekolahinklusikita.org",
      phone: "0857-3300-1188",
      whatsapp: "0857-3300-1188",
    },
    socials: {
      instagram: "@sekolahinklusikita",
      website: "sekolahinklusikita.org",
    },
    joinUrl: "https://chat.whatsapp.com/contoh-sekolah-inklusi",
    status: "VERIFIED",
    ownerId: "mock-owner-04",
    verifiedAt: "2026-05-07T08:15:00+07:00",
    foundedYear: 2019,
    activities: [
      {
        title: "Pendampingan belajar akhir pekan",
        category: "Pendampingan acara",
        startsAt: "2026-11-15T09:00:00+07:00",
        location: "Ruang belajar Rungkut, Surabaya",
      },
      {
        title: "Pelatihan guru pendamping inklusif",
        category: "Program inklusif",
        startsAt: "2026-11-29T08:30:00+07:00",
        location: "Balai Kota Surabaya",
      },
    ],
  },
  {
    slug: "jiwa-tenang-yogyakarta",
    name: "Jiwa Tenang",
    tagline: "Ruang cerita dan dukungan kesehatan mental",
    description:
      "Jiwa Tenang menyediakan kelompok dukungan sebaya untuk penyandang disabilitas psikososial dan keluarga di Yogyakarta. Kami bertemu rutin untuk berbagi cerita, belajar mengelola stres, dan merujuk ke tenaga profesional bila dibutuhkan.",
    province: "DI Yogyakarta",
    city: "Yogyakarta",
    focus: ["Kesehatan mental", "Pendampingan keluarga"],
    contact: {
      personName: "Arif Nugroho",
      role: "Fasilitator",
      email: "halo@jiwatenang.id",
      phone: "0812-9090-4455",
      whatsapp: "0812-9090-4455",
    },
    socials: {
      instagram: "@jiwatenang.id",
    },
    joinUrl: "https://chat.whatsapp.com/contoh-jiwa-tenang",
    status: "VERIFIED",
    ownerId: "mock-owner-05",
    verifiedAt: "2026-06-11T13:00:00+07:00",
    foundedYear: 2020,
    activities: [
      {
        title: "Kelompok dukungan sebaya bulanan",
        category: "Kegiatan sosial",
        startsAt: "2026-11-22T16:00:00+07:00",
        location: "Ruang publik Kotabaru, Yogyakarta",
      },
    ],
  },
  {
    slug: "tangan-hangat-semarang",
    name: "Tangan Hangat",
    tagline: "Pendampingan harian untuk disabilitas intelektual",
    description:
      "Tangan Hangat mendampingi penyandang disabilitas intelektual dan keluarganya di Semarang melalui pelatihan kemandirian, keterampilan kerja, dan kegiatan seni. Kami percaya setiap orang punya cara sendiri untuk berkontribusi.",
    province: "Jawa Tengah",
    city: "Semarang",
    focus: ["Disabilitas intelektual", "Pendampingan keluarga"],
    contact: {
      personName: "Sri Lestari",
      role: "Pengurus harian",
      email: "kontak@tanganhangat.id",
      phone: "0815-6677-8899",
      whatsapp: "0815-6677-8899",
    },
    socials: {
      instagram: "@tanganhangat.smg",
    },
    joinUrl: "https://chat.whatsapp.com/contoh-tangan-hangat",
    status: "VERIFIED",
    ownerId: "mock-owner-06",
    verifiedAt: "2026-01-25T09:45:00+07:00",
    foundedYear: 2017,
    activities: [
      {
        title: "Kelas keterampilan kerja bersama",
        category: "Program inklusif",
        startsAt: "2026-11-18T10:00:00+07:00",
        location: "Balai Desa Tembalang, Semarang",
      },
      {
        title: "Pasar karya komunitas",
        category: "Kegiatan sosial",
        startsAt: "2026-12-12T09:00:00+07:00",
        location: "Lapangan Simpang Lima, Semarang",
      },
    ],
  },
  {
    slug: "seni-tanpa-batas-bali",
    name: "Seni Tanpa Batas",
    tagline: "Panggung seni untuk tubuh dan cerita yang beragam",
    description:
      "Seni Tanpa Batas mempertemukan seniman disabilitas dan non-disabilitas di Bali untuk menciptakan karya tari, musik, dan teater. Kami membuka kelas seni inklusif dan mementaskan karya di ruang publik yang aksesibel.",
    province: "Bali",
    city: "Denpasar",
    focus: ["Seni & budaya", "Disabilitas fisik"],
    contact: {
      personName: "Komang Ayu Sari",
      role: "Direktur artistik",
      email: "halo@senitanpabatas.id",
      phone: "0819-2233-5566",
      whatsapp: "0819-2233-5566",
    },
    socials: {
      instagram: "@senitanpabatas",
      website: "senitanpabatas.id",
    },
    joinUrl: "https://chat.whatsapp.com/contoh-seni-tanpa-batas",
    status: "VERIFIED",
    ownerId: "mock-owner-07",
    verifiedAt: "2026-07-03T11:20:00+07:00",
    foundedYear: 2015,
    activities: [
      {
        title: "Kelas teater inklusif",
        category: "Program inklusif",
        startsAt: "2026-11-20T16:00:00+07:00",
        location: "Sanggar Sanur, Denpasar",
      },
    ],
  },
  {
    slug: "sahabat-autisme-medan",
    name: "Sahabat Autisme Medan",
    tagline: "Dukungan untuk anak autistik dan keluarganya",
    description:
      "Sahabat Autisme Medan mendampingi keluarga dengan anak autistik melalui konsultasi awal, kelompok bermain inklusif, dan pelatihan pendampingan di rumah. Kami juga membangun jejaring terapis lokal yang bisa dijangkau keluarga.",
    province: "Sumatera Utara",
    city: "Medan",
    focus: ["Autisme", "Pendampingan keluarga"],
    contact: {
      personName: "Fitri Ramadhani",
      role: "Ketua komunitas",
      email: "halo@sahabatautismemedan.org",
      phone: "0811-7788-9900",
      whatsapp: "0811-7788-9900",
    },
    socials: {
      instagram: "@sahabatautismemedan",
    },
    joinUrl: "https://chat.whatsapp.com/contoh-sahabat-autisme",
    status: "VERIFIED",
    ownerId: "mock-owner-08",
    verifiedAt: "2026-08-19T10:30:00+07:00",
    foundedYear: 2013,
    activities: [
      {
        title: "Kelompok bermain inklusif",
        category: "Kegiatan sosial",
        startsAt: "2026-11-23T14:00:00+07:00",
        location: "Taman Cadika Pramuka, Medan",
      },
    ],
  },
  {
    slug: "lintas-akses-makassar",
    name: "Lintas Akses Makassar",
    tagline: "Advokasi aksesibilitas ruang publik di Makassar",
    description:
      "Lintas Akses Makassar mendampingi warga dalam memetakan dan menyuarakan aksesibilitas ruang publik di Makassar. Kami rutin memeriksa trotoar, transportasi umum, dan fasilitas kesehatan untuk mendorong perbaikan yang nyata.",
    province: "Sulawesi Selatan",
    city: "Makassar",
    focus: ["Advokasi & aksesibilitas", "Disabilitas fisik"],
    contact: {
      personName: "Syamsul Bahri",
      role: "Koordinator advokasi",
      email: "halo@lintasakses.id",
      phone: "0823-4455-6677",
      whatsapp: "0823-4455-6677",
    },
    socials: {
      instagram: "@lintasakses",
      website: "lintasakses.id",
    },
    joinUrl: "https://chat.whatsapp.com/contoh-lintas-akses",
    status: "VERIFIED",
    ownerId: "mock-owner-09",
    verifiedAt: "2026-09-02T08:00:00+07:00",
    foundedYear: 2021,
    activities: [
      {
        title: "Survei aksesibilitas angkot",
        category: "Pendataan aksesibilitas",
        startsAt: "2026-11-16T08:00:00+07:00",
        location: "Terminal Daya, Makassar",
      },
      {
        title: "Diskusi publik rancangan trotoar",
        category: "Program inklusif",
        startsAt: "2026-11-30T15:00:00+07:00",
        location: "Balai Kota Makassar",
      },
    ],
  },
];

export function getCommunityBySlug(slug: string): Community | undefined {
  return communities.find((community) => community.slug === slug);
}

export function getRelatedCommunities(community: Community, limit = 3): Community[] {
  const others = communities.filter((item) => item.slug !== community.slug);

  const scored = others
    .map((item) => {
      const sameFocus = item.focus.filter((focus) =>
        community.focus.includes(focus),
      ).length;
      const sameProvince = item.province === community.province ? 2 : 0;
      return { item, score: sameFocus + sameProvince };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((entry) => entry.item);
}
