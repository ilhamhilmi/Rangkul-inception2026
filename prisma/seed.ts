import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type AuthUserRow = {
  id: string;
  email: string | null;
  raw_user_meta_data: Record<string, unknown> | null;
};

function readOrganizerEmail() {
  return process.env.SEED_ORGANIZER_EMAIL?.trim().toLowerCase() ?? "";
}

const isDevelopment = process.env.NODE_ENV === "development";
// Promosi role hanya untuk lingkungan development dan harus diminta eksplisit.
// Seed tidak boleh menjadi jalur verifikasi organizer di produksi/staging.
const allowRolePromotion =
  isDevelopment && process.env.SEED_ALLOW_ROLE_PROMOTION === "true";

/**
 * Seed aman:
 * - Tidak membuat auth.users atau profil demo tanpa pasangan auth.
 * - Hanya menyiapkan profil untuk user Supabase Auth yang benar-benar ada.
 * - Idempoten: aman dijalankan berulang.
 */
async function main() {
  const email = readOrganizerEmail();

  if (!email) {
    console.info(
      "[seed] SEED_ORGANIZER_EMAIL kosong. Tidak ada profil/event yang dibuat.",
    );
    return;
  }

  const rows = await prisma.$queryRaw<AuthUserRow[]>`
    SELECT id, email, raw_user_meta_data
    FROM auth.users
    WHERE lower(email) = ${email}
    LIMIT 1
  `;

  const authUser = rows[0];

  if (!authUser) {
    throw new Error(
      `[seed] Tidak ada auth.users dengan email ${email}. Daftarkan user lewat Supabase Auth terlebih dahulu.`,
    );
  }

  const metadata = authUser.raw_user_meta_data ?? {};
  const rawName = metadata.full_name ?? metadata.name;
  const name =
    typeof rawName === "string" && rawName.trim().length > 0
      ? rawName.trim().slice(0, 80)
      : email.split("@")[0].slice(0, 80);

  const profile = await prisma.profile.upsert({
    where: { id: authUser.id },
    create: {
      id: authUser.id,
      email,
      name,
      role: "ORGANIZER",
    },
    update: { email },
  });

  if (profile.role === "USER") {
    if (!allowRolePromotion) {
      console.warn(
        "[seed] Role USER tidak dinaikkan. Promosi role hanya tersedia di development dengan SEED_ALLOW_ROLE_PROMOTION=true.",
      );
      return;
    }

    await prisma.profile.update({
      where: { id: profile.id },
      data: { role: "ORGANIZER" },
    });
  }

  console.info(`[seed] Profil organizer siap: ${profile.id} (${email})`);

  if (!isDevelopment) {
    console.info(
      "[seed] Mode non-development: data event demo tidak dibuat. Jalankan dengan NODE_ENV=development untuk seed lokal.",
    );
    return;
  }

  const event = await prisma.volunteerEvent.upsert({
    where: { slug: "pendampingan-acara-pekan-inklusi" },
    update: {},
    create: {
      slug: "pendampingan-acara-pekan-inklusi",
      organizerId: profile.id,
      title: "Pendampingan Acara Pekan Inklusi",
      description:
        "Bantu menyambut peserta, mendampingi tamu yang membutuhkan bantuan, dan menjaga alur acara tetap nyaman untuk semua orang. Kamu akan bekerja bersama tim acara yang sudah berpengalaman.",
      category: "EVENT_SUPPORT",
      locationName: "Taman Ismail Marzuki",
      address: "Jalan Cikini Raya No. 73, Jakarta Pusat",
      city: "Jakarta",
      province: "DKI Jakarta",
      startsAt: new Date("2026-11-07T01:00:00.000Z"),
      endsAt: new Date("2026-11-07T05:00:00.000Z"),
      requirements:
        "Ramah dan komunikatif\nBersedia mengikuti briefing pagi\nMampu bekerja dalam tim",
      accessibilityNotes:
        "Lokasi memiliki ramp, toilet aksesibel, area istirahat, dan jalur khusus kursi roda. Relawan dengan disabilitas sangat didorong untuk ikut.",
      slots: 80,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  console.info(`[seed] Event siap: ${event.slug}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
