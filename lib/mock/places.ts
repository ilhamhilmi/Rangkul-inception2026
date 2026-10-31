import type {
  AccessibilityFeature,
  AccessibilityKey,
  Entrance,
  FeatureStatus,
  Place,
  PlaceCategory,
  PlaceDetail,
  PlaceSummary,
} from "@/types/place";

export const PLACE_CATEGORIES: {
  value: PlaceCategory;
  label: string;
  description: string;
}[] = [
  {
    value: "wisata",
    label: "Wisata",
    description: "Taman, museum, pantai, dan ruang publik",
  },
  {
    value: "kuliner",
    label: "Kuliner",
    description: "Kafe, restoran, dan tempat makan",
  },
  {
    value: "transportasi",
    label: "Transportasi",
    description: "Stasiun, terminal, dan halte",
  },
  {
    value: "ibadah",
    label: "Ibadah",
    description: "Masjid, gereja, pura, dan vihara",
  },
  {
    value: "kesehatan",
    label: "Kesehatan",
    description: "Rumah sakit, puskesmas, dan klinik",
  },
];

export const ACCESSIBILITY_FEATURES: AccessibilityFeature[] = [
  {
    key: "ramp",
    label: "Ramp landai",
    shortLabel: "Ramp",
    description: "Ada jalur landai untuk kursi roda di pintu ini.",
  },
  {
    key: "lift",
    label: "Lift aksesibel",
    shortLabel: "Lift",
    description: "Lift dengan tombol rendah dan ruang manuver cukup.",
  },
  {
    key: "accessible-toilet",
    label: "Toilet aksesibel",
    shortLabel: "Toilet",
    description: "Toilet dengan pegangan, ruang luas, dan pintu lebar.",
  },
  {
    key: "guiding-block",
    label: "Guiding block",
    shortLabel: "Guiding block",
    description: "Ubin pemandu taktil menuju pintu dan area utama.",
  },
  {
    key: "accessible-parking",
    label: "Parkir aksesibel",
    shortLabel: "Parkir",
    description: "Slot parkir lebar yang dekat dengan pintu aksesibel.",
  },
  {
    key: "automatic-door",
    label: "Pintu otomatis",
    shortLabel: "Pintu otomatis",
    description: "Pintu terbuka otomatis tanpa perlu menarik gagang.",
  },
  {
    key: "wide-entrance",
    label: "Pintu lebar",
    shortLabel: "Pintu lebar",
    description: "Lebar bukaan minimal 90 cm untuk kursi roda.",
  },
];

export const FEATURE_MAP: Record<AccessibilityKey, AccessibilityFeature> =
  Object.fromEntries(
    ACCESSIBILITY_FEATURES.map((feature) => [feature.key, feature]),
  ) as Record<AccessibilityKey, AccessibilityFeature>;

export function getCategoryMeta(category: PlaceCategory) {
  return (
    PLACE_CATEGORIES.find((item) => item.value === category) ??
    PLACE_CATEGORIES[0]
  );
}

function features(
  available: AccessibilityKey[],
  unavailable: AccessibilityKey[] = [],
): Record<AccessibilityKey, FeatureStatus> {
  const result = Object.fromEntries(
    ACCESSIBILITY_FEATURES.map((feature) => [feature.key, "unknown"]),
  ) as Record<AccessibilityKey, FeatureStatus>;

  for (const key of available) result[key] = "available";
  for (const key of unavailable) result[key] = "unavailable";

  return result;
}

function entrance(
  values: Omit<Entrance, "features"> & {
    available: AccessibilityKey[];
    unavailable?: AccessibilityKey[];
  },
): Entrance {
  const { available, unavailable, ...rest } = values;
  return { ...rest, features: features(available, unavailable) };
}

export const places: Place[] = [
  {
    slug: "taman-kota-menteng",
    name: "Taman Kota Menteng",
    category: "wisata",
    city: "Jakarta Pusat",
    province: "DKI Jakarta",
    address: "Jl. HOS Cokroaminoto No. 12, Menteng, Jakarta Pusat",
    description:
      "Taman kota dengan jalur pedestrian lebar, area bermain anak, dan amphitheater kecil. Akses utama paling nyaman lewat Pintu Utara karena ramp-nya landai dan langsung terhubung ke jalur utama tanpa tangga.",
    contributor: "Dinda Prameswari",
    createdAt: "2026-09-14",
    rating: 4.6,
    reviewCount: 24,
    entrances: [
      entrance({
        id: "utara",
        label: "Pintu Utara",
        isMain: true,
        notes:
          "Ramp landai 1:12, pintu otomatis, dan jalur paving halus menuju area utama. Lebar bukaan 100 cm.",
        route: {
          distance: "350 m",
          duration: "5 menit",
          condition: "Jalur datar tanpa tangga, permukaan paving halus.",
          steps: [
            "Turun di halte Menteng, lalu berjalan 120 meter ke arah timur.",
            "Ambil jalur pedestrian di sisi kiri jalan sampai bertemu papan nama taman.",
            "Masuk lewat Pintu Utara; ramp berada di sisi kanan gerbang.",
            "Ikuti jalur paving ke area utama dan amphitheater.",
          ],
        },
        available: [
          "ramp",
          "accessible-toilet",
          "accessible-parking",
          "automatic-door",
          "wide-entrance",
        ],
        unavailable: ["lift", "guiding-block"],
      }),
      entrance({
        id: "selatan",
        label: "Pintu Selatan",
        isMain: false,
        notes:
          "Tiga anak tangga tanpa ramp. Alternatif terdekat adalah Pintu Utara, sekitar 40 meter.",
        route: {
          distance: "410 m",
          duration: "8 menit",
          condition: "Ada tiga anak tangga, tidak disarankan untuk kursi roda.",
          steps: [
            "Dari halte, berjalan ke arah selatan mengikuti pagar taman.",
            "Pintu Selatan memiliki tiga anak tangga tanpa pegangan.",
            "Jika memakai kursi roda, lanjutkan 40 meter ke Pintu Utara.",
          ],
        },
        available: ["wide-entrance"],
        unavailable: [
          "ramp",
          "lift",
          "accessible-toilet",
          "guiding-block",
          "accessible-parking",
          "automatic-door",
        ],
      }),
      entrance({
        id: "timur",
        label: "Pintu Timur",
        isMain: false,
        notes:
          "Ramp tersedia dan ada guiding block dari trotoar. Jalur menuju toilet aksesibel sekitar 15 meter.",
        route: {
          distance: "390 m",
          duration: "7 menit",
          condition: "Ramp pendek, guiding block tersedia sampai area toilet.",
          steps: [
            "Turun di sisi timur taman, dekat halte bus.",
            "Ikuti guiding block sepanjang trotoar menuju gerbang.",
            "Masuk lewat ramp di sisi kiri Pintu Timur.",
          ],
        },
        available: [
          "ramp",
          "guiding-block",
          "accessible-toilet",
          "wide-entrance",
        ],
        unavailable: ["lift", "accessible-parking", "automatic-door"],
      }),
    ],
    reviews: [
      {
        id: "r1",
        author: "Rani",
        rating: 5,
        date: "2026-09-20",
        body: "Ramp di Pintu Utara benar-benar landai dan jalurnya lebar. Saya pakai kursi roda manual dan tidak perlu minta bantuan untuk masuk.",
        accessibilityNote: "Kursi roda manual",
      },
      {
        id: "r2",
        author: "Bagas",
        rating: 4,
        date: "2026-09-18",
        body: "Toilet aksesibel bersih, tapi pintunya agak berat. Pegangan di dalam toilet tinggi dan nyaman.",
        accessibilityNote: "Teman tuli",
      },
    ],
  },
  {
    slug: "kopi-rangkul-bandung",
    name: "Kopi Rangkul",
    category: "kuliner",
    city: "Bandung",
    province: "Jawa Barat",
    address: "Jl. Cihampelas No. 88, Bandung",
    description:
      "Kedai kopi dua lantai dengan area duduk outdoor. Lantai dasar bisa diakses lewat ramp di pintu depan, sedangkan lantai dua hanya bisa dicapai lewat tangga.",
    contributor: "Yoga Pratama",
    createdAt: "2026-09-11",
    rating: 4.3,
    reviewCount: 17,
    entrances: [
      entrance({
        id: "depan",
        label: "Pintu Depan",
        isMain: true,
        notes:
          "Ramp portabel dipasang saat jam operasional. Pintu kaca selebar 95 cm, meja lantai dasar bisa digeser.",
        route: {
          distance: "180 m",
          duration: "3 menit",
          condition: "Ramp portabel, trotoar agak bergelombang di depan toko.",
          steps: [
            "Turun di depan Jl. Cihampelas, dekat toko oleh-oleh.",
            "Berjalan 60 meter ke arah utara mengikuti trotoar.",
            "Minta petugas memasang ramp portabel di pintu depan.",
            "Meja lantai dasar berada tepat di sebelah kiri pintu.",
          ],
        },
        available: [
          "ramp",
          "accessible-toilet",
          "wide-entrance",
        ],
        unavailable: ["lift", "guiding-block", "accessible-parking", "automatic-door"],
      }),
      entrance({
        id: "samping",
        label: "Pintu Samping",
        isMain: false,
        notes:
          "Dua anak tangga tanpa pegangan. Jalur alternatif adalah pintu depan dengan ramp portabel.",
        route: {
          distance: "200 m",
          duration: "4 menit",
          condition: "Dua anak tangga, tidak disarankan untuk pengguna kursi roda.",
          steps: [
            "Dari jalan utama, masuk melalui gang kecil di sisi kanan gedung.",
            "Pintu samping memiliki dua anak tangga.",
            "Gunakan pintu depan jika membawa kursi roda atau kereta bayi.",
          ],
        },
        available: ["wide-entrance"],
        unavailable: [
          "ramp",
          "lift",
          "accessible-toilet",
          "guiding-block",
          "accessible-parking",
          "automatic-door",
        ],
      }),
    ],
    reviews: [
      {
        id: "r1",
        author: "Sinta",
        rating: 4,
        date: "2026-09-19",
        body: "Ramp portabelnya berfungsi, tapi perlu minta bantuan barista dulu. Staf cepat tanggap dan ramah.",
        accessibilityNote: "Kursi roda elektrik",
      },
      {
        id: "r2",
        author: "Adit",
        rating: 5,
        date: "2026-09-15",
        body: "Toilet aksesibel ada di lantai dasar dan bersih. Ruang gerak di antara meja cukup lega.",
      },
    ],
  },
  {
    slug: "stasiun-tugu-yogyakarta",
    name: "Stasiun Tugu Yogyakarta",
    category: "transportasi",
    city: "Yogyakarta",
    province: "DI Yogyakarta",
    address: "Jl. Margo Utomo No. 1, Gowongan, Yogyakarta",
    description:
      "Stasiun utama Yogyakarta dengan jalur guiding block dari area parkir ke peron. Lift menuju peron bawah tanah tersedia, tetapi antrean bisa panjang saat jam sibuk.",
    contributor: "Komunitas Jalan Aman",
    createdAt: "2026-09-08",
    rating: 4.4,
    reviewCount: 38,
    entrances: [
      entrance({
        id: "utama",
        label: "Pintu Utama",
        isMain: true,
        notes:
          "Akses dari drop-off langsung ke hall. Guiding block menyambung ke loket dan lift peron. Petugas siap membantu.",
        route: {
          distance: "120 m",
          duration: "2 menit",
          condition: "Permukaan rata, guiding block jelas, lift tersedia.",
          steps: [
            "Turun di area drop-off sisi timur stasiun.",
            "Ikuti guiding block menuju pintu utama.",
            "Masuk ke hall, lalu menuju lift di sebelah kanan loket.",
            "Gunakan lift ke peron sesuai nomor kereta.",
          ],
        },
        available: [
          "lift",
          "accessible-toilet",
          "guiding-block",
          "accessible-parking",
          "wide-entrance",
        ],
        unavailable: ["ramp", "automatic-door"],
      }),
      entrance({
        id: "barat",
        label: "Pintu Barat",
        isMain: false,
        notes:
          "Ramp panjang dari area parkir barat. Jarak ke hall sekitar 80 meter, melewati jalur barang.",
        route: {
          distance: "260 m",
          duration: "5 menit",
          condition: "Ramp panjang, jalur bercampur dengan troli barang.",
          steps: [
            "Masuk dari area parkir barat.",
            "Ikuti ramp panjang di sisi kiri gedung.",
            "Lanjutkan 80 meter ke hall utama.",
            "Minta petugas mengantar ke lift peron jika perlu.",
          ],
        },
        available: [
          "ramp",
          "lift",
          "accessible-toilet",
          "accessible-parking",
          "wide-entrance",
        ],
        unavailable: ["guiding-block", "automatic-door"],
      }),
      entrance({
        id: "selatan",
        label: "Pintu Selatan",
        isMain: false,
        notes:
          "Hanya tangga. Pintu ini biasanya dipakai penumpang tanpa barang banyak.",
        route: {
          distance: "300 m",
          duration: "6 menit",
          condition: "Tangga tanpa ramp, tidak disarankan untuk kursi roda.",
          steps: [
            "Dari sisi selatan, naik tangga menuju hall.",
            "Jika membawa kursi roda, gunakan Pintu Utama atau Pintu Barat.",
          ],
        },
        available: ["wide-entrance"],
        unavailable: [
          "ramp",
          "lift",
          "accessible-toilet",
          "guiding-block",
          "accessible-parking",
          "automatic-door",
        ],
      }),
    ],
    reviews: [
      {
        id: "r1",
        author: "Hendra",
        rating: 5,
        date: "2026-09-22",
        body: "Petugas langsung menawarkan bantuan begitu melihat saya memakai tongkat. Lift bersih dan tombolnya mudah dijangkau.",
        accessibilityNote: "Tunanetra sebagian",
      },
      {
        id: "r2",
        author: "Maya",
        rating: 4,
        date: "2026-09-12",
        body: "Guiding block-nya jelas, tapi di jam sibuk jalur ke lift agak terhalang antrean penumpang.",
      },
    ],
  },
  {
    slug: "masjid-agung-al-akbar",
    name: "Masjid Agung Al-Akbar",
    category: "ibadah",
    city: "Surabaya",
    province: "Jawa Timur",
    address: "Jl. Raya Pagesangan No. 2, Jambangan, Surabaya",
    description:
      "Masjid dengan area wudu aksesibel dan ramp menuju ruang salat utama. Parkir khusus tersedia di sisi utara, dekat pintu utama.",
    contributor: "Aulia Rahman",
    createdAt: "2026-09-05",
    rating: 4.7,
    reviewCount: 21,
    entrances: [
      entrance({
        id: "utama",
        label: "Pintu Utama",
        isMain: true,
        notes:
          "Ramp landai menuju ruang salat utama. Area wudu aksesibel berada 10 meter di sisi kanan pintu.",
        route: {
          distance: "90 m",
          duration: "2 menit",
          condition: "Jalur datar, ramp landai, dan parkir khusus di dekat pintu.",
          steps: [
            "Masuk dari gerbang utara dan parkir di slot khusus.",
            "Ikuti jalur paving menuju pintu utama.",
            "Naik ramp di sisi kiri pintu menuju ruang salat.",
            "Area wudu aksesibel ada 10 meter di sisi kanan.",
          ],
        },
        available: [
          "ramp",
          "accessible-toilet",
          "accessible-parking",
          "wide-entrance",
        ],
        unavailable: ["lift", "guiding-block", "automatic-door"],
      }),
      entrance({
        id: "selatan",
        label: "Pintu Selatan",
        isMain: false,
        notes:
          "Lima anak tangga tanpa pegangan. Gunakan Pintu Utara untuk akses tanpa tangga.",
        route: {
          distance: "140 m",
          duration: "4 menit",
          condition: "Lima anak tangga, tidak ada ramp.",
          steps: [
            "Dari area parkir selatan, berjalan ke pintu samping.",
            "Naik lima anak tangga tanpa pegangan.",
            "Alternatif aksesibel adalah Pintu Utama di sisi utara.",
          ],
        },
        available: ["wide-entrance"],
        unavailable: [
          "ramp",
          "lift",
          "accessible-toilet",
          "guiding-block",
          "accessible-parking",
          "automatic-door",
        ],
      }),
    ],
    reviews: [
      {
        id: "r1",
        author: "Fajar",
        rating: 5,
        date: "2026-09-21",
        body: "Ramp ke ruang salat cukup landai. Area wudu aksesibel luas dan ada pegangan di kedua sisi.",
        accessibilityNote: "Kursi roda manual",
      },
    ],
  },
  {
    slug: "rumah-sakit-sehat-makassar",
    name: "Rumah Sakit Sehat Makassar",
    category: "kesehatan",
    city: "Makassar",
    province: "Sulawesi Selatan",
    address: "Jl. Perintis Kemerdekaan No. 45, Makassar",
    description:
      "Rumah sakit dengan akses IGD langsung dari drop-off, pintu otomatis, dan lift prioritas. Jalur dari parkir ke IGD memiliki guiding block.",
    contributor: "Nurul Hidayah",
    createdAt: "2026-09-02",
    rating: 4.5,
    reviewCount: 31,
    entrances: [
      entrance({
        id: "igd",
        label: "Pintu IGD",
        isMain: true,
        notes:
          "Pintu otomatis selebar 110 cm, ramp landai dari drop-off, dan lift prioritas 15 meter dari pintu.",
        route: {
          distance: "60 m",
          duration: "1 menit",
          condition: "Jalur khusus kendaraan darurat, permukaan rata.",
          steps: [
            "Masuk dari gerbang IGD di sisi timur.",
            "Turun di drop-off khusus, tepat di depan pintu otomatis.",
            "Masuk ke IGD, lift prioritas berada 15 meter di sisi kiri.",
          ],
        },
        available: [
          "ramp",
          "lift",
          "accessible-toilet",
          "guiding-block",
          "automatic-door",
          "wide-entrance",
        ],
        unavailable: ["accessible-parking"],
      }),
      entrance({
        id: "utama",
        label: "Pintu Utama",
        isMain: false,
        notes:
          "Ramp dan lift tersedia. Jalur lebih panjang, sekitar 120 meter dari parkir umum.",
        route: {
          distance: "210 m",
          duration: "4 menit",
          condition: "Jalur datar, ramp landai, lift di lobi utama.",
          steps: [
            "Parkir di area umum sisi utara.",
            "Ikuti jalur pejalan kaki menuju lobi utama.",
            "Naik ramp di sebelah kiri pintu masuk.",
            "Gunakan lift di lobi untuk menuju lantai tujuan.",
          ],
        },
        available: [
          "ramp",
          "lift",
          "accessible-toilet",
          "accessible-parking",
          "automatic-door",
          "wide-entrance",
        ],
        unavailable: ["guiding-block"],
      }),
    ],
    reviews: [
      {
        id: "r1",
        author: "Ibu Tuti",
        rating: 5,
        date: "2026-09-25",
        body: "Pintu IGD otomatis dan rampa landai. Saya datang dengan kursi roda dan proses masuk cepat.",
      },
      {
        id: "r2",
        author: "Rizky",
        rating: 4,
        date: "2026-09-16",
        body: "Lift prioritas jelas petunjuknya. Parkir umum agak jauh, tapi ada kursi roda pinjaman di lobi.",
        accessibilityNote: "Pendamping",
      },
    ],
  },
  {
    slug: "pantai-kuta",
    name: "Pantai Kuta",
    category: "wisata",
    city: "Badung",
    province: "Bali",
    address: "Jl. Pantai Kuta, Kuta, Badung, Bali",
    description:
      "Pantai dengan boardwalk kayu menuju area pandang. Jalur pasir tetap sulit untuk kursi roda, terutama saat pasang.",
    contributor: "Komunitas Akses Bali",
    createdAt: "2026-08-30",
    rating: 4.1,
    reviewCount: 19,
    entrances: [
      entrance({
        id: "utama",
        label: "Pintu Utama",
        isMain: true,
        notes:
          "Boardwalk kayu sepanjang 80 meter menuju area pandang. Tidak sampai ke garis air.",
        route: {
          distance: "150 m",
          duration: "3 menit",
          condition: "Boardwalk kayu, ada celah kecil di beberapa titik.",
          steps: [
            "Masuk dari gerbang utama Pantai Kuta.",
            "Ikuti boardwalk kayu di sisi kanan area parkir.",
            "Berhenti di dek pandang; jalur pasir tidak disarankan untuk kursi roda.",
          ],
        },
        available: [
          "accessible-toilet",
          "accessible-parking",
          "wide-entrance",
        ],
        unavailable: ["ramp", "lift", "guiding-block", "automatic-door"],
      }),
      entrance({
        id: "timur",
        label: "Akses Timur",
        isMain: false,
        notes:
          "Jalur pasir tanpa boardwalk. Hanya cocok untuk pengunjung tanpa kursi roda.",
        route: {
          distance: "180 m",
          duration: "5 menit",
          condition: "Jalur pasir, tidak bisa dilalui kursi roda.",
          steps: [
            "Dari sisi timur pantai, berjalan melewati jalan setapak.",
            "Lanjutkan di jalur pasir menuju area pantai.",
            "Gunakan Pintu Utama jika membutuhkan boardwalk.",
          ],
        },
        available: [],
        unavailable: [
          "ramp",
          "lift",
          "accessible-toilet",
          "guiding-block",
          "accessible-parking",
          "automatic-door",
          "wide-entrance",
        ],
      }),
    ],
    reviews: [
      {
        id: "r1",
        author: "Dewi",
        rating: 4,
        date: "2026-09-14",
        body: "Boardwalk membantu sampai area pandang. Untuk mendekat ke air memang perlu bantuan karena pasirnya dalam.",
        accessibilityNote: "Kursi roda manual",
      },
    ],
  },
  {
    slug: "museum-benteng-vredeburg",
    name: "Museum Benteng Vredeburg",
    category: "wisata",
    city: "Yogyakarta",
    province: "DI Yogyakarta",
    address: "Jl. Margo Mulyo No. 6, Ngupasan, Yogyakarta",
    description:
      "Museum sejarah dengan halaman luas dan ramp menuju gedung pameran. Lift tersedia di gedung utama, tetapi beberapa ruang lama masih memiliki ambang pintu tinggi.",
    contributor: "Sekar Ayu",
    createdAt: "2026-08-27",
    rating: 4.4,
    reviewCount: 26,
    entrances: [
      entrance({
        id: "utama",
        label: "Pintu Utama",
        isMain: true,
        notes:
          "Ramp lebar dari halaman ke gedung pameran. Lift berada 20 meter di dalam gedung.",
        route: {
          distance: "220 m",
          duration: "4 menit",
          condition: "Halaman paving, ramp lebar, lift tersedia.",
          steps: [
            "Masuk dari gerbang utama di Jl. Margo Mulyo.",
            "Lewati halaman menuju gedung pameran utama.",
            "Naik ramp lebar di sisi kanan pintu.",
            "Lift berada 20 meter di dalam gedung, di sebelah tangga.",
          ],
        },
        available: [
          "ramp",
          "lift",
          "accessible-toilet",
          "accessible-parking",
          "wide-entrance",
        ],
        unavailable: ["guiding-block", "automatic-door"],
      }),
      entrance({
        id: "samping",
        label: "Pintu Samping",
        isMain: false,
        notes:
          "Pintu lama dengan ambang tinggi. Tidak disarankan untuk kursi roda.",
        route: {
          distance: "260 m",
          duration: "6 menit",
          condition: "Ambang pintu tinggi, jalur sempit.",
          steps: [
            "Dari sisi barat benteng, masuk melalui pintu samping.",
            "Ada ambang pintu setinggi 15 cm.",
            "Gunakan Pintu Utama untuk akses tanpa hambatan.",
          ],
        },
        available: ["wide-entrance"],
        unavailable: [
          "ramp",
          "lift",
          "accessible-toilet",
          "guiding-block",
          "accessible-parking",
          "automatic-door",
        ],
      }),
    ],
    reviews: [
      {
        id: "r1",
        author: "Galih",
        rating: 4,
        date: "2026-09-17",
        body: "Ramp masuk bagus dan lift berfungsi. Beberapa ruang pameran punya ambang pintu yang perlu dilangkahi.",
        accessibilityNote: "Kursi roda manual",
      },
      {
        id: "r2",
        author: "Nadia",
        rating: 5,
        date: "2026-09-09",
        body: "Petugas museum membantu mengarahkan ke rute tanpa tangga. Toilet aksesibel bersih.",
      },
    ],
  },
  {
    slug: "terminal-pulo-gebang",
    name: "Terminal Pulo Gebang",
    category: "transportasi",
    city: "Jakarta Timur",
    province: "DKI Jakarta",
    address: "Jl. Pulo Gebang Raya, Cakung, Jakarta Timur",
    description:
      "Terminal bus terpadu dengan jalur guiding block dari hall keberangkatan ke area tunggu. Lift dan eskalator tersedia, tetapi jalur keberangkatan bus masih melewati area ramai.",
    contributor: "Arif Setiawan",
    createdAt: "2026-08-22",
    rating: 4.0,
    reviewCount: 14,
    entrances: [
      entrance({
        id: "utama",
        label: "Pintu Utama",
        isMain: true,
        notes:
          "Ramp lebar dari drop-off, guiding block ke hall, dan lift menuju lantai keberangkatan.",
        route: {
          distance: "180 m",
          duration: "4 menit",
          condition: "Jalur rata, guiding block jelas, lift tersedia.",
          steps: [
            "Turun di drop-off sisi utara terminal.",
            "Ikuti guiding block menuju pintu utama.",
            "Masuk ke hall dan gunakan lift ke lantai keberangkatan.",
            "Ikuti petunjuk ke gerbang bus sesuai tiket.",
          ],
        },
        available: [
          "ramp",
          "lift",
          "accessible-toilet",
          "guiding-block",
          "accessible-parking",
          "wide-entrance",
        ],
        unavailable: ["automatic-door"],
      }),
      entrance({
        id: "timur",
        label: "Pintu Timur",
        isMain: false,
        notes:
          "Tangga dan eskalator saja. Gunakan Pintu Utama untuk akses lift.",
        route: {
          distance: "220 m",
          duration: "5 menit",
          condition: "Tangga dan eskalator, tanpa ramp.",
          steps: [
            "Dari area parkir timur, masuk melalui pintu samping.",
            "Naik tangga atau eskalator ke hall.",
            "Alternatif aksesibel adalah Pintu Utama.",
          ],
        },
        available: ["accessible-parking"],
        unavailable: [
          "ramp",
          "lift",
          "accessible-toilet",
          "guiding-block",
          "automatic-door",
          "wide-entrance",
        ],
      }),
    ],
    reviews: [
      {
        id: "r1",
        author: "Putri",
        rating: 4,
        date: "2026-09-10",
        body: "Guiding block dari drop-off sampai hall cukup jelas. Lift agak jauh dari gerbang bus, tapi petugas membantu.",
        accessibilityNote: "Tunanetra",
      },
    ],
  },
];

function summarize(place: Place): PlaceSummary {
  const available = new Set<AccessibilityKey>();
  for (const item of place.entrances) {
    for (const feature of ACCESSIBILITY_FEATURES) {
      if (item.features[feature.key] === "available") {
        available.add(feature.key);
      }
    }
  }

  return {
    slug: place.slug,
    name: place.name,
    category: place.category,
    city: place.city,
    province: place.province,
    address: place.address,
    description: place.description,
    contributor: place.contributor,
    createdAt: place.createdAt,
    rating: place.rating,
    reviewCount: place.reviewCount,
    entranceCount: place.entrances.length,
    availableFeatures: ACCESSIBILITY_FEATURES.filter((feature) =>
      available.has(feature.key),
    ).map((feature) => feature.key),
  };
}

export function getPlaceSummaries(): PlaceSummary[] {
  return places.map(summarize);
}

export function getPlaceBySlug(slug: string): PlaceDetail | undefined {
  const place = places.find((item) => item.slug === slug);
  if (!place) return undefined;

  return {
    ...place,
    entranceCount: place.entrances.length,
    availableFeatures: summarize(place).availableFeatures,
  };
}

export function getMainEntrance(place: Pick<Place, "entrances">): Entrance {
  return place.entrances.find((item) => item.isMain) ?? place.entrances[0];
}

export type PlaceFilter = {
  q?: string;
  kategori?: string;
  fasilitas?: string;
};

export function filterPlaces(
  filters: PlaceFilter,
  source: PlaceSummary[] = getPlaceSummaries(),
): PlaceSummary[] {
  const query = filters.q?.trim().toLowerCase() ?? "";
  const category = filters.kategori?.trim() ?? "";
  const facility = filters.fasilitas?.trim() ?? "";

  return source.filter((place) => {
    const matchesQuery =
      query.length === 0 ||
      [place.name, place.city, place.province, place.description, place.address]
        .join(" ")
        .toLowerCase()
        .includes(query);

    const matchesCategory =
      category.length === 0 || category === "semua"
        ? true
        : place.category === category;

    const matchesFacility =
      facility.length === 0 || facility === "semua"
        ? true
        : place.availableFeatures.includes(facility as AccessibilityKey);

    return matchesQuery && matchesCategory && matchesFacility;
  });
}

export function isPlaceCategory(value: string): value is PlaceCategory {
  return PLACE_CATEGORIES.some((item) => item.value === value);
}

export function isAccessibilityKey(value: string): value is AccessibilityKey {
  return ACCESSIBILITY_FEATURES.some((item) => item.key === value);
}
