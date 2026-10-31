import type { VolunteerEvent } from "@/types/volunteer";

/**
 * Data mock untuk Tahap 1 UI.
 *
 * Saat data layer siap, array ini bisa diganti dengan hasil
 * `server/volunteer/queries.ts` tanpa mengubah komponen presentational.
 */
export const volunteerEvents: VolunteerEvent[] = [
  {
    slug: "pendampingan-acara-pekan-inklusi",
    title: "Pendampingan Acara Pekan Inklusi",
    category: "Bantuan Acara",
    city: "Jakarta",
    location: "Taman Ismail Marzuki, Jakarta Pusat",
    startsAt: "2026-11-07T08:00:00+07:00",
    endsAt: "2026-11-07T12:00:00+07:00",
    organizer: "Komunitas Langkah Bersama",
    registeredCount: 62,
    slots: 80,
    description:
      "Bantu menyambut peserta, mendampingi tamu yang membutuhkan bantuan, dan menjaga alur acara tetap nyaman untuk semua orang. Kamu akan bekerja bersama tim acara yang sudah berpengalaman.",
    requirements: [
      "Ramah dan komunikatif",
      "Bersedia mengikuti briefing pagi",
      "Mampu bekerja dalam tim",
    ],
    accessibilityNotes:
      "Lokasi memiliki ramp, toilet aksesibel, area istirahat, dan jalur khusus kursi roda. Relawan dengan disabilitas sangat didorong untuk ikut.",
    coverImage: "/images/volunteer/event-1.svg",
    coverAlt:
      "Ilustrasi relawan menyambut peserta di acara inklusif dengan kursi roda dan panggung",
  },
  {
    slug: "pemetaan-aksesibilitas-stasiun-kota",
    title: "Pemetaan Aksesibilitas Stasiun Kota",
    category: "Pendataan Aksesibilitas",
    city: "Bandung",
    location: "Stasiun Bandung, Jalan Kebon Kawung",
    startsAt: "2026-11-14T09:00:00+07:00",
    endsAt: "2026-11-14T15:00:00+07:00",
    organizer: "Relawan Akses Nusantara",
    registeredCount: 18,
    slots: 30,
    description:
      "Bersama tim Relawan Akses Nusantara, catat kondisi ramp, lift, toilet, dan jalur masuk stasiun. Data yang kamu kumpulkan akan membantu penyandang disabilitas merencanakan perjalanan dengan lebih percaya diri.",
    requirements: [
      "Teliti dan senang mencatat detail",
      "Bisa menggunakan ponsel untuk dokumentasi",
      "Bersedia berjalan mengelilingi area stasiun",
    ],
    accessibilityNotes:
      "Area pendataan dapat dijangkau dengan kursi roda. Tersedia pendamping dan waktu istirahat yang cukup.",
    coverImage: "/images/volunteer/event-2.svg",
    coverAlt:
      "Ilustrasi gedung stasiun dengan ramp aksesibel dan papan pendataan",
  },
  {
    slug: "festival-seni-inklusif-2026",
    title: "Festival Seni Inklusif 2026",
    category: "Bantuan Acara",
    city: "Yogyakarta",
    location: "Taman Budaya Yogyakarta",
    startsAt: "2026-11-21T10:00:00+07:00",
    endsAt: "2026-11-21T17:00:00+07:00",
    organizer: "Sanggar Cahaya",
    registeredCount: 94,
    slots: 100,
    description:
      "Festival seni yang menampilkan karya seniman disabilitas dan inklusif. Relawan membantu menyambut pengunjung, mendampingi panggung, dan memastikan area festival mudah diakses semua orang.",
    requirements: [
      "Antusias membantu acara seni",
      "Bersedia bertugas bergantian",
      "Mengikuti arahan koordinator acara",
    ],
    accessibilityNotes:
      "Seluruh area utama menggunakan jalur datar, tersedia area khusus kursi roda, juru bahasa isyarat, dan toilet aksesibel.",
    coverImage: "/images/volunteer/event-3.svg",
    coverAlt:
      "Ilustrasi panggung festival seni dengan penari dan simbol aksesibilitas",
  },
  {
    slug: "berbagi-cerita-sahabat-tuli",
    title: "Berbagi Cerita bersama Sahabat Tuli",
    category: "Kegiatan Sosial",
    city: "Surabaya",
    location: "Ruang Komunitas Sahabat Tuli, Tegalsari",
    startsAt: "2026-12-05T13:00:00+07:00",
    endsAt: "2026-12-05T16:00:00+07:00",
    organizer: "Komunitas Sahabat Tuli",
    registeredCount: 24,
    slots: 40,
    description:
      "Ikut dalam sesi berbagi cerita yang hangat bersama teman-teman Tuli. Relawan membantu memfasilitasi diskusi, menyiapkan ruang, dan mendukung komunikasi yang inklusif.",
    requirements: [
      "Terbuka untuk belajar bahasa isyarat dasar",
      "Sabar dan empatik",
      "Bersedia hadir tepat waktu",
    ],
    accessibilityNotes:
      "Tersedia juru bahasa isyarat, teks real-time, dan ruang yang tenang. Kegiatan ramah untuk peserta dengan sensitivitas sensorik.",
    coverImage: "/images/volunteer/event-4.svg",
    coverAlt:
      "Ilustrasi dua orang bercakap-cakap dengan balon percakapan dan simbol hati",
  },
  {
    slug: "kelas-kreatif-anak-disabilitas",
    title: "Kelas Kreatif untuk Anak Disabilitas",
    category: "Program Inklusif",
    city: "Makassar",
    location: "Yayasan Ruang Inklusi, Panakkukang",
    startsAt: "2026-12-12T09:00:00+07:00",
    endsAt: "2026-12-12T13:00:00+07:00",
    organizer: "Yayasan Ruang Inklusi",
    registeredCount: 12,
    slots: 25,
    description:
      "Dampingi anak-anak disabilitas dalam kelas seni, menggambar, dan membuat prakarya. Relawan membantu menyiapkan alat, mendampingi anak, dan merayakan setiap karya yang dibuat.",
    requirements: [
      "Sabar dan hangat terhadap anak",
      "Bersedia membantu kegiatan seni",
      "Tidak perlu pengalaman mengajar",
    ],
    accessibilityNotes:
      "Ruang kelas dapat diakses kursi roda. Alat seni disesuaikan untuk kebutuhan motorik yang berbeda, dan tersedia area istirahat.",
    coverImage: "/images/volunteer/event-5.svg",
    coverAlt:
      "Ilustrasi anak dan pendamping membuat karya seni di meja kreatif",
  },
  {
    slug: "aksi-bersih-pantai-ramah-akses",
    title: "Aksi Bersih Pantai Ramah Akses",
    category: "Kegiatan Sosial",
    city: "Denpasar",
    location: "Pantai Matahari Terbit, Sanur",
    startsAt: "2027-01-09T07:00:00+07:00",
    endsAt: "2027-01-09T11:00:00+07:00",
    organizer: "Komunitas Laut Ramah",
    registeredCount: 55,
    slots: 60,
    description:
      "Bersih-bersih pantai bersama komunitas dan warga sekitar. Relawan membantu memilah sampah, membagikan alat, dan memastikan jalur pantai tetap bisa dilalui semua orang.",
    requirements: [
      "Bersedia mengenakan pakaian yang nyaman",
      "Siap beraktivitas di area pantai",
      "Membawa botol minum sendiri",
    ],
    accessibilityNotes:
      "Tersedia jalur boardwalk menuju area kegiatan, toilet aksesibel, dan pendampingan untuk peserta dengan kebutuhan khusus.",
    coverImage: "/images/volunteer/event-6.svg",
    coverAlt:
      "Ilustrasi relawan membersihkan pantai dengan kursi roda di jalur boardwalk",
  },
];
