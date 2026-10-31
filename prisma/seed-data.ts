export type SeedFeature = {
  key: string;
  label: string;
  shortLabel: string;
  category: string;
  icon: string;
  description: string;
  sortOrder: number;
};

export type SeedEntrance = {
  label: string;
  isMain: boolean;
  notes: string;
  latitude: number;
  longitude: number;
  routeDistanceM: number;
  routeDurationMin: number;
  routeCondition: string;
  routeSteps: string[];
  available: string[];
  unavailable: string[];
};

export type SeedReview = {
  author: string;
  email: string;
  rating: number;
  body: string;
  accessibilityNote?: string;
  date: string;
};

export type SeedPlace = {
  slug: string;
  name: string;
  category: "WISATA" | "KULINER" | "TRANSPORTASI" | "IBADAH" | "KESEHATAN";
  description: string;
  address: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  contributor: { name: string; email: string };
  defaultOrigin: { label: string; latitude: number; longitude: number };
  entrances: SeedEntrance[];
  reviews: SeedReview[];
};

export const SEED_FEATURES: SeedFeature[] = [
  {
    key: "ramp",
    label: "Ramp landai",
    shortLabel: "Ramp",
    category: "entrance",
    icon: "RampIcon",
    description: "Ada jalur landai untuk kursi roda di pintu ini.",
    sortOrder: 1,
  },
  {
    key: "lift",
    label: "Lift aksesibel",
    shortLabel: "Lift",
    category: "building",
    icon: "LiftIcon",
    description: "Lift dengan tombol rendah dan ruang manuver cukup.",
    sortOrder: 2,
  },
  {
    key: "accessible-toilet",
    label: "Toilet aksesibel",
    shortLabel: "Toilet",
    category: "building",
    icon: "ToiletIcon",
    description: "Toilet dengan pegangan, ruang luas, dan pintu lebar.",
    sortOrder: 3,
  },
  {
    key: "guiding-block",
    label: "Guiding block",
    shortLabel: "Guiding block",
    category: "entrance",
    icon: "GuidingBlockIcon",
    description: "Ubin pemandu taktil menuju pintu dan area utama.",
    sortOrder: 4,
  },
  {
    key: "accessible-parking",
    label: "Parkir aksesibel",
    shortLabel: "Parkir",
    category: "service",
    icon: "ParkingIcon",
    description: "Slot parkir lebar yang dekat dengan pintu aksesibel.",
    sortOrder: 5,
  },
  {
    key: "automatic-door",
    label: "Pintu otomatis",
    shortLabel: "Pintu otomatis",
    category: "entrance",
    icon: "DoorIcon",
    description: "Pintu terbuka otomatis tanpa perlu menarik gagang.",
    sortOrder: 6,
  },
  {
    key: "wide-entrance",
    label: "Pintu lebar",
    shortLabel: "Pintu lebar",
    category: "entrance",
    icon: "AccessibilityIcon",
    description: "Lebar bukaan minimal 90 cm untuk kursi roda.",
    sortOrder: 7,
  },
];

export const SEED_PLACES: SeedPlace[] = [
  {
    slug: "taman-kota-menteng",
    name: "Taman Kota Menteng",
    category: "WISATA",
    description:
      "Taman kota dengan jalur pedestrian lebar, area bermain anak, dan amphitheater kecil. Akses utama paling nyaman lewat Pintu Utara karena ramp-nya landai dan langsung terhubung ke jalur utama tanpa tangga.",
    address: "Jl. HOS Cokroaminoto No. 12, Menteng, Jakarta Pusat",
    city: "Jakarta Pusat",
    province: "DKI Jakarta",
    latitude: -6.1954,
    longitude: 106.832,
    contributor: { name: "Dinda Prameswari", email: "dinda.prameswari@example.com" },
    defaultOrigin: {
      label: "Halte Menteng, Jl. HOS Cokroaminoto",
      latitude: -6.1963,
      longitude: 106.8315,
    },
    entrances: [
      {
        label: "Pintu Utara",
        isMain: true,
        notes:
          "Ramp landai 1:12, pintu otomatis, dan jalur paving halus menuju area utama. Lebar bukaan 100 cm.",
        latitude: -6.1948,
        longitude: 106.8321,
        routeDistanceM: 350,
        routeDurationMin: 5,
        routeCondition: "Jalur datar tanpa tangga, permukaan paving halus.",
        routeSteps: [
          "Turun di halte Menteng, lalu berjalan 120 meter ke arah timur.",
          "Ambil jalur pedestrian di sisi kiri jalan sampai bertemu papan nama taman.",
          "Masuk lewat Pintu Utara; ramp berada di sisi kanan gerbang.",
          "Ikuti jalur paving ke area utama dan amphitheater.",
        ],
        available: [
          "ramp",
          "accessible-toilet",
          "accessible-parking",
          "automatic-door",
          "wide-entrance",
        ],
        unavailable: ["lift", "guiding-block"],
      },
      {
        label: "Pintu Selatan",
        isMain: false,
        notes:
          "Tiga anak tangga tanpa ramp. Alternatif terdekat adalah Pintu Utara, sekitar 40 meter.",
        latitude: -6.1961,
        longitude: 106.8319,
        routeDistanceM: 410,
        routeDurationMin: 8,
        routeCondition: "Ada tiga anak tangga, tidak disarankan untuk kursi roda.",
        routeSteps: [
          "Dari halte, berjalan ke arah selatan mengikuti pagar taman.",
          "Pintu Selatan memiliki tiga anak tangga tanpa pegangan.",
          "Jika memakai kursi roda, lanjutkan 40 meter ke Pintu Utara.",
        ],
        available: ["wide-entrance"],
        unavailable: [
          "ramp",
          "lift",
          "accessible-toilet",
          "guiding-block",
          "accessible-parking",
          "automatic-door",
        ],
      },
      {
        label: "Pintu Timur",
        isMain: false,
        notes:
          "Ramp tersedia dan ada guiding block dari trotoar. Jalur menuju toilet aksesibel sekitar 15 meter.",
        latitude: -6.1953,
        longitude: 106.833,
        routeDistanceM: 390,
        routeDurationMin: 7,
        routeCondition: "Ramp pendek, guiding block tersedia sampai area toilet.",
        routeSteps: [
          "Turun di sisi timur taman, dekat halte bus.",
          "Ikuti guiding block sepanjang trotoar menuju gerbang.",
          "Masuk lewat ramp di sisi kiri Pintu Timur.",
        ],
        available: [
          "ramp",
          "guiding-block",
          "accessible-toilet",
          "wide-entrance",
        ],
        unavailable: ["lift", "accessible-parking", "automatic-door"],
      },
    ],
    reviews: [
      {
        author: "Rani",
        email: "rani@example.com",
        rating: 5,
        body: "Ramp di Pintu Utara benar-benar landai dan jalurnya lebar. Saya pakai kursi roda manual dan tidak perlu minta bantuan untuk masuk.",
        accessibilityNote: "Kursi roda manual",
        date: "2026-09-20",
      },
      {
        author: "Bagas",
        email: "bagas@example.com",
        rating: 4,
        body: "Toilet aksesibel bersih, tapi pintunya agak berat. Pegangan di dalam toilet tinggi dan nyaman.",
        accessibilityNote: "Teman tuli",
        date: "2026-09-18",
      },
    ],
  },
  {
    slug: "kopi-rangkul-bandung",
    name: "Kopi Rangkul",
    category: "KULINER",
    description:
      "Kedai kopi dua lantai dengan area duduk outdoor. Lantai dasar bisa diakses lewat ramp di pintu depan, sedangkan lantai dua hanya bisa dicapai lewat tangga.",
    address: "Jl. Cihampelas No. 88, Bandung",
    city: "Bandung",
    province: "Jawa Barat",
    latitude: -6.8955,
    longitude: 107.6045,
    contributor: { name: "Yoga Pratama", email: "yoga.pratama@example.com" },
    defaultOrigin: {
      label: "Halte Cihampelas",
      latitude: -6.8962,
      longitude: 107.604,
    },
    entrances: [
      {
        label: "Pintu Depan",
        isMain: true,
        notes:
          "Ramp portabel dipasang saat jam operasional. Pintu kaca selebar 95 cm, meja lantai dasar bisa digeser.",
        latitude: -6.8953,
        longitude: 107.6047,
        routeDistanceM: 180,
        routeDurationMin: 3,
        routeCondition: "Ramp portabel, trotoar agak bergelombang di depan toko.",
        routeSteps: [
          "Turun di depan Jl. Cihampelas, dekat toko oleh-oleh.",
          "Berjalan 60 meter ke arah utara mengikuti trotoar.",
          "Minta petugas memasang ramp portabel di pintu depan.",
          "Meja lantai dasar berada tepat di sebelah kiri pintu.",
        ],
        available: ["ramp", "accessible-toilet", "wide-entrance"],
        unavailable: [
          "lift",
          "guiding-block",
          "accessible-parking",
          "automatic-door",
        ],
      },
      {
        label: "Pintu Samping",
        isMain: false,
        notes:
          "Dua anak tangga tanpa pegangan. Jalur alternatif adalah pintu depan dengan ramp portabel.",
        latitude: -6.8957,
        longitude: 107.6042,
        routeDistanceM: 200,
        routeDurationMin: 4,
        routeCondition: "Dua anak tangga, tidak disarankan untuk pengguna kursi roda.",
        routeSteps: [
          "Dari jalan utama, masuk melalui gang kecil di sisi kanan gedung.",
          "Pintu samping memiliki dua anak tangga.",
          "Gunakan pintu depan jika membawa kursi roda atau kereta bayi.",
        ],
        available: ["wide-entrance"],
        unavailable: [
          "ramp",
          "lift",
          "accessible-toilet",
          "guiding-block",
          "accessible-parking",
          "automatic-door",
        ],
      },
    ],
    reviews: [
      {
        author: "Sinta",
        email: "sinta@example.com",
        rating: 4,
        body: "Ramp portabelnya berfungsi, tapi perlu minta bantuan barista dulu. Staf cepat tanggap dan ramah.",
        accessibilityNote: "Kursi roda elektrik",
        date: "2026-09-19",
      },
      {
        author: "Adit",
        email: "adit@example.com",
        rating: 5,
        body: "Toilet aksesibel ada di lantai dasar dan bersih. Ruang gerak di antara meja cukup lega.",
        date: "2026-09-15",
      },
    ],
  },
  {
    slug: "stasiun-tugu-yogyakarta",
    name: "Stasiun Tugu Yogyakarta",
    category: "TRANSPORTASI",
    description:
      "Stasiun utama Yogyakarta dengan jalur guiding block dari area parkir ke peron. Lift menuju peron bawah tanah tersedia, tetapi antrean bisa panjang saat jam sibuk.",
    address: "Jl. Margo Utomo No. 1, Gowongan, Yogyakarta",
    city: "Yogyakarta",
    province: "DI Yogyakarta",
    latitude: -7.7887,
    longitude: 110.367,
    contributor: { name: "Komunitas Jalan Aman", email: "jalan.aman@example.com" },
    defaultOrigin: {
      label: "Drop-off Jl. Margo Utomo",
      latitude: -7.7878,
      longitude: 110.3676,
    },
    entrances: [
      {
        label: "Pintu Utama",
        isMain: true,
        notes:
          "Akses dari drop-off langsung ke hall. Guiding block menyambung ke loket dan lift peron. Petugas siap membantu.",
        latitude: -7.7882,
        longitude: 110.3673,
        routeDistanceM: 120,
        routeDurationMin: 2,
        routeCondition: "Permukaan rata, guiding block jelas, lift tersedia.",
        routeSteps: [
          "Turun di area drop-off sisi timur stasiun.",
          "Ikuti guiding block menuju pintu utama.",
          "Masuk ke hall, lalu menuju lift di sebelah kanan loket.",
          "Gunakan lift ke peron sesuai nomor kereta.",
        ],
        available: [
          "lift",
          "accessible-toilet",
          "guiding-block",
          "accessible-parking",
          "wide-entrance",
        ],
        unavailable: ["ramp", "automatic-door"],
      },
      {
        label: "Pintu Barat",
        isMain: false,
        notes:
          "Ramp panjang dari area parkir barat. Jarak ke hall sekitar 80 meter, melewati jalur barang.",
        latitude: -7.7889,
        longitude: 110.3663,
        routeDistanceM: 260,
        routeDurationMin: 5,
        routeCondition: "Ramp panjang, jalur bercampur dengan troli barang.",
        routeSteps: [
          "Masuk dari area parkir barat.",
          "Ikuti ramp panjang di sisi kiri gedung.",
          "Lanjutkan 80 meter ke hall utama.",
          "Minta petugas mengantar ke lift peron jika perlu.",
        ],
        available: [
          "ramp",
          "lift",
          "accessible-toilet",
          "accessible-parking",
          "wide-entrance",
        ],
        unavailable: ["guiding-block", "automatic-door"],
      },
      {
        label: "Pintu Selatan",
        isMain: false,
        notes:
          "Hanya tangga. Pintu ini biasanya dipakai penumpang tanpa barang banyak.",
        latitude: -7.7893,
        longitude: 110.367,
        routeDistanceM: 300,
        routeDurationMin: 6,
        routeCondition: "Tangga tanpa ramp, tidak disarankan untuk kursi roda.",
        routeSteps: [
          "Dari sisi selatan, naik tangga menuju hall.",
          "Jika membawa kursi roda, gunakan Pintu Utama atau Pintu Barat.",
        ],
        available: ["wide-entrance"],
        unavailable: [
          "ramp",
          "lift",
          "accessible-toilet",
          "guiding-block",
          "accessible-parking",
          "automatic-door",
        ],
      },
    ],
    reviews: [
      {
        author: "Hendra",
        email: "hendra@example.com",
        rating: 5,
        body: "Petugas langsung menawarkan bantuan begitu melihat saya memakai tongkat. Lift bersih dan tombolnya mudah dijangkau.",
        accessibilityNote: "Tunanetra sebagian",
        date: "2026-09-22",
      },
      {
        author: "Maya",
        email: "maya@example.com",
        rating: 4,
        body: "Guiding block-nya jelas, tapi di jam sibuk jalur ke lift agak terhalang antrean penumpang.",
        date: "2026-09-12",
      },
    ],
  },
  {
    slug: "masjid-agung-al-akbar",
    name: "Masjid Agung Al-Akbar",
    category: "IBADAH",
    description:
      "Masjid dengan area wudu aksesibel dan ramp menuju ruang salat utama. Parkir khusus tersedia di sisi utara, dekat pintu utama.",
    address: "Jl. Raya Pagesangan No. 2, Jambangan, Surabaya",
    city: "Surabaya",
    province: "Jawa Timur",
    latitude: -7.3455,
    longitude: 112.7157,
    contributor: { name: "Aulia Rahman", email: "aulia.rahman@example.com" },
    defaultOrigin: {
      label: "Gerbang utara masjid",
      latitude: -7.3442,
      longitude: 112.7156,
    },
    entrances: [
      {
        label: "Pintu Utama",
        isMain: true,
        notes:
          "Ramp landai menuju ruang salat utama. Area wudu aksesibel berada 10 meter di sisi kanan pintu.",
        latitude: -7.3449,
        longitude: 112.7158,
        routeDistanceM: 90,
        routeDurationMin: 2,
        routeCondition: "Jalur datar, ramp landai, dan parkir khusus di dekat pintu.",
        routeSteps: [
          "Masuk dari gerbang utara dan parkir di slot khusus.",
          "Ikuti jalur paving menuju pintu utama.",
          "Naik ramp di sisi kiri pintu menuju ruang salat.",
          "Area wudu aksesibel ada 10 meter di sisi kanan.",
        ],
        available: [
          "ramp",
          "accessible-toilet",
          "accessible-parking",
          "wide-entrance",
        ],
        unavailable: ["lift", "guiding-block", "automatic-door"],
      },
      {
        label: "Pintu Selatan",
        isMain: false,
        notes:
          "Lima anak tangga tanpa pegangan. Gunakan Pintu Utara untuk akses tanpa tangga.",
        latitude: -7.346,
        longitude: 112.7154,
        routeDistanceM: 140,
        routeDurationMin: 4,
        routeCondition: "Lima anak tangga, tidak ada ramp.",
        routeSteps: [
          "Dari area parkir selatan, berjalan ke pintu samping.",
          "Naik lima anak tangga tanpa pegangan.",
          "Alternatif aksesibel adalah Pintu Utama di sisi utara.",
        ],
        available: ["wide-entrance"],
        unavailable: [
          "ramp",
          "lift",
          "accessible-toilet",
          "guiding-block",
          "accessible-parking",
          "automatic-door",
        ],
      },
    ],
    reviews: [
      {
        author: "Fajar",
        email: "fajar@example.com",
        rating: 5,
        body: "Ramp ke ruang salat cukup landai. Area wudu aksesibel luas dan ada pegangan di kedua sisi.",
        accessibilityNote: "Kursi roda manual",
        date: "2026-09-21",
      },
    ],
  },
  {
    slug: "rumah-sakit-sehat-makassar",
    name: "Rumah Sakit Sehat Makassar",
    category: "KESEHATAN",
    description:
      "Rumah sakit dengan akses IGD langsung dari drop-off, pintu otomatis, dan lift prioritas. Jalur dari parkir ke IGD memiliki guiding block.",
    address: "Jl. Perintis Kemerdekaan No. 45, Makassar",
    city: "Makassar",
    province: "Sulawesi Selatan",
    latitude: -5.126,
    longitude: 119.489,
    contributor: { name: "Nurul Hidayah", email: "nurul.hidayah@example.com" },
    defaultOrigin: {
      label: "Drop-off IGD",
      latitude: -5.1252,
      longitude: 119.4898,
    },
    entrances: [
      {
        label: "Pintu IGD",
        isMain: true,
        notes:
          "Pintu otomatis selebar 110 cm, ramp landai dari drop-off, dan lift prioritas 15 meter dari pintu.",
        latitude: -5.1255,
        longitude: 119.4896,
        routeDistanceM: 60,
        routeDurationMin: 1,
        routeCondition: "Jalur khusus kendaraan darurat, permukaan rata.",
        routeSteps: [
          "Masuk dari gerbang IGD di sisi timur.",
          "Turun di drop-off khusus, tepat di depan pintu otomatis.",
          "Masuk ke IGD, lift prioritas berada 15 meter di sisi kiri.",
        ],
        available: [
          "ramp",
          "lift",
          "accessible-toilet",
          "guiding-block",
          "automatic-door",
          "wide-entrance",
        ],
        unavailable: ["accessible-parking"],
      },
      {
        label: "Pintu Utama",
        isMain: false,
        notes:
          "Ramp dan lift tersedia. Jalur lebih panjang, sekitar 120 meter dari parkir umum.",
        latitude: -5.1266,
        longitude: 119.4885,
        routeDistanceM: 210,
        routeDurationMin: 4,
        routeCondition: "Jalur datar, ramp landai, lift di lobi utama.",
        routeSteps: [
          "Parkir di area umum sisi utara.",
          "Ikuti jalur pejalan kaki menuju lobi utama.",
          "Naik ramp di sebelah kiri pintu masuk.",
          "Gunakan lift di lobi untuk menuju lantai tujuan.",
        ],
        available: [
          "ramp",
          "lift",
          "accessible-toilet",
          "accessible-parking",
          "automatic-door",
          "wide-entrance",
        ],
        unavailable: ["guiding-block"],
      },
    ],
    reviews: [
      {
        author: "Ibu Tuti",
        email: "tuti@example.com",
        rating: 5,
        body: "Pintu IGD otomatis dan rampa landai. Saya datang dengan kursi roda dan proses masuk cepat.",
        date: "2026-09-25",
      },
      {
        author: "Rizky",
        email: "rizky@example.com",
        rating: 4,
        body: "Lift prioritas jelas petunjuknya. Parkir umum agak jauh, tapi ada kursi roda pinjaman di lobi.",
        accessibilityNote: "Pendamping",
        date: "2026-09-16",
      },
    ],
  },
  {
    slug: "pantai-kuta",
    name: "Pantai Kuta",
    category: "WISATA",
    description:
      "Pantai dengan boardwalk kayu menuju area pandang. Jalur pasir tetap sulit untuk kursi roda, terutama saat pasang.",
    address: "Jl. Pantai Kuta, Kuta, Badung, Bali",
    city: "Badung",
    province: "Bali",
    latitude: -8.7185,
    longitude: 115.1686,
    contributor: { name: "Komunitas Akses Bali", email: "akses.bali@example.com" },
    defaultOrigin: {
      label: "Gerbang Pantai Kuta",
      latitude: -8.7193,
      longitude: 115.1676,
    },
    entrances: [
      {
        label: "Pintu Utama",
        isMain: true,
        notes:
          "Boardwalk kayu sepanjang 80 meter menuju area pandang. Tidak sampai ke garis air.",
        latitude: -8.7188,
        longitude: 115.1682,
        routeDistanceM: 150,
        routeDurationMin: 3,
        routeCondition: "Boardwalk kayu, ada celah kecil di beberapa titik.",
        routeSteps: [
          "Masuk dari gerbang utama Pantai Kuta.",
          "Ikuti boardwalk kayu di sisi kanan area parkir.",
          "Berhenti di dek pandang; jalur pasir tidak disarankan untuk kursi roda.",
        ],
        available: [
          "accessible-toilet",
          "accessible-parking",
          "wide-entrance",
        ],
        unavailable: ["ramp", "lift", "guiding-block", "automatic-door"],
      },
      {
        label: "Akses Timur",
        isMain: false,
        notes:
          "Jalur pasir tanpa boardwalk. Hanya cocok untuk pengunjung tanpa kursi roda.",
        latitude: -8.718,
        longitude: 115.1693,
        routeDistanceM: 180,
        routeDurationMin: 5,
        routeCondition: "Jalur pasir, tidak bisa dilalui kursi roda.",
        routeSteps: [
          "Dari sisi timur pantai, berjalan melewati jalan setapak.",
          "Lanjutkan di jalur pasir menuju area pantai.",
          "Gunakan Pintu Utama jika membutuhkan boardwalk.",
        ],
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
      },
    ],
    reviews: [
      {
        author: "Dewi",
        email: "dewi@example.com",
        rating: 4,
        body: "Boardwalk membantu sampai area pandang. Untuk mendekat ke air memang perlu bantuan karena pasirnya dalam.",
        accessibilityNote: "Kursi roda manual",
        date: "2026-09-14",
      },
    ],
  },
  {
    slug: "museum-benteng-vredeburg",
    name: "Museum Benteng Vredeburg",
    category: "WISATA",
    description:
      "Museum sejarah dengan halaman luas dan ramp menuju gedung pameran. Lift tersedia di gedung utama, tetapi beberapa ruang lama masih memiliki ambang pintu tinggi.",
    address: "Jl. Margo Mulyo No. 6, Ngupasan, Yogyakarta",
    city: "Yogyakarta",
    province: "DI Yogyakarta",
    latitude: -7.8003,
    longitude: 110.3657,
    contributor: { name: "Sekar Ayu", email: "sekar.ayu@example.com" },
    defaultOrigin: {
      label: "Halte Malioboro",
      latitude: -7.7992,
      longitude: 110.3659,
    },
    entrances: [
      {
        label: "Pintu Utama",
        isMain: true,
        notes:
          "Ramp lebar dari halaman ke gedung pameran. Lift berada 20 meter di dalam gedung.",
        latitude: -7.8,
        longitude: 110.3655,
        routeDistanceM: 220,
        routeDurationMin: 4,
        routeCondition: "Halaman paving, ramp lebar, lift tersedia.",
        routeSteps: [
          "Masuk dari gerbang utama di Jl. Margo Mulyo.",
          "Lewati halaman menuju gedung pameran utama.",
          "Naik ramp lebar di sisi kanan pintu.",
          "Lift berada 20 meter di dalam gedung, di sebelah tangga.",
        ],
        available: [
          "ramp",
          "lift",
          "accessible-toilet",
          "accessible-parking",
          "wide-entrance",
        ],
        unavailable: ["guiding-block", "automatic-door"],
      },
      {
        label: "Pintu Samping",
        isMain: false,
        notes:
          "Pintu lama dengan ambang tinggi. Tidak disarankan untuk kursi roda.",
        latitude: -7.8006,
        longitude: 110.365,
        routeDistanceM: 260,
        routeDurationMin: 6,
        routeCondition: "Ambang pintu tinggi, jalur sempit.",
        routeSteps: [
          "Dari sisi barat benteng, masuk melalui pintu samping.",
          "Ada ambang pintu setinggi 15 cm.",
          "Gunakan Pintu Utama untuk akses tanpa hambatan.",
        ],
        available: ["wide-entrance"],
        unavailable: [
          "ramp",
          "lift",
          "accessible-toilet",
          "guiding-block",
          "accessible-parking",
          "automatic-door",
        ],
      },
    ],
    reviews: [
      {
        author: "Galih",
        email: "galih@example.com",
        rating: 4,
        body: "Ramp masuk bagus dan lift berfungsi. Beberapa ruang pameran punya ambang pintu yang perlu dilangkahi.",
        accessibilityNote: "Kursi roda manual",
        date: "2026-09-17",
      },
      {
        author: "Nadia",
        email: "nadia@example.com",
        rating: 5,
        body: "Petugas museum membantu mengarahkan ke rute tanpa tangga. Toilet aksesibel bersih.",
        date: "2026-09-09",
      },
    ],
  },
  {
    slug: "terminal-pulo-gebang",
    name: "Terminal Pulo Gebang",
    category: "TRANSPORTASI",
    description:
      "Terminal bus terpadu dengan jalur guiding block dari hall keberangkatan ke area tunggu. Lift dan eskalator tersedia, tetapi jalur keberangkatan bus masih melewati area ramai.",
    address: "Jl. Pulo Gebang Raya, Cakung, Jakarta Timur",
    city: "Jakarta Timur",
    province: "DKI Jakarta",
    latitude: -6.174,
    longitude: 106.955,
    contributor: { name: "Arif Setiawan", email: "arif.setiawan@example.com" },
    defaultOrigin: {
      label: "Drop-off terminal sisi utara",
      latitude: -6.173,
      longitude: 106.9551,
    },
    entrances: [
      {
        label: "Pintu Utama",
        isMain: true,
        notes:
          "Ramp lebar dari drop-off, guiding block ke hall, dan lift menuju lantai keberangkatan.",
        latitude: -6.1736,
        longitude: 106.9553,
        routeDistanceM: 180,
        routeDurationMin: 4,
        routeCondition: "Jalur rata, guiding block jelas, lift tersedia.",
        routeSteps: [
          "Turun di drop-off sisi utara terminal.",
          "Ikuti guiding block menuju pintu utama.",
          "Masuk ke hall dan gunakan lift ke lantai keberangkatan.",
          "Ikuti petunjuk ke gerbang bus sesuai tiket.",
        ],
        available: [
          "ramp",
          "lift",
          "accessible-toilet",
          "guiding-block",
          "accessible-parking",
          "wide-entrance",
        ],
        unavailable: ["automatic-door"],
      },
      {
        label: "Pintu Timur",
        isMain: false,
        notes:
          "Tangga dan eskalator saja. Gunakan Pintu Utama untuk akses lift.",
        latitude: -6.1744,
        longitude: 106.9558,
        routeDistanceM: 220,
        routeDurationMin: 5,
        routeCondition: "Tangga dan eskalator, tanpa ramp.",
        routeSteps: [
          "Dari area parkir timur, masuk melalui pintu samping.",
          "Naik tangga atau eskalator ke hall.",
          "Alternatif aksesibel adalah Pintu Utama.",
        ],
        available: ["accessible-parking"],
        unavailable: [
          "ramp",
          "lift",
          "accessible-toilet",
          "guiding-block",
          "automatic-door",
          "wide-entrance",
        ],
      },
    ],
    reviews: [
      {
        author: "Putri",
        email: "putri@example.com",
        rating: 4,
        body: "Guiding block dari drop-off sampai hall cukup jelas. Lift agak jauh dari gerbang bus, tapi petugas membantu.",
        accessibilityNote: "Tunanetra",
        date: "2026-09-10",
      },
    ],
  },
];
