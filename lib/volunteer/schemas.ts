import { z } from "zod";

export const EVENT_CATEGORY_ENUM = z.enum([
  "EVENT_SUPPORT",
  "ACCESSIBILITY_AUDIT",
  "SOCIAL_ACTIVITY",
  "INCLUSIVE_PROGRAM",
  "OTHER",
]);

/**
 * Menerima nilai `datetime-local` (tanpa zona waktu) dan menganggapnya WIB,
 * sehingga waktu tidak bergeser bila server berjalan di zona waktu lain.
 */
const dateTimeString = z
  .string()
  .trim()
  .min(1, "Waktu wajib diisi.")
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Format waktu tidak valid.",
  })
  .transform((value) =>
    /(?:z|[+-]\d{2}:\d{2})$/i.test(value)
      ? value
      : `${value.length === 16 ? `${value}:00` : value}+07:00`,
  );

export const eventFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, "Judul minimal 5 karakter.")
      .max(150, "Judul maksimal 150 karakter."),
    description: z
      .string()
      .trim()
      .min(20, "Deskripsi minimal 20 karakter.")
      .max(5000, "Deskripsi maksimal 5000 karakter."),
    category: EVENT_CATEGORY_ENUM,
    locationName: z
      .string()
      .trim()
      .min(1, "Nama lokasi wajib diisi.")
      .max(200, "Nama lokasi maksimal 200 karakter."),
    address: z
      .string()
      .trim()
      .min(1, "Alamat wajib diisi.")
      .max(300, "Alamat maksimal 300 karakter."),
    city: z.string().trim().min(1, "Kota wajib diisi.").max(80),
    province: z.string().trim().min(1, "Provinsi wajib dipilih.").max(80),
    startsAt: dateTimeString,
    endsAt: dateTimeString,
    requirements: z
      .string()
      .trim()
      .max(2000, "Persyaratan maksimal 2000 karakter.")
      .optional()
      .default(""),
    accessibilityNotes: z
      .string()
      .trim()
      .max(2000, "Catatan aksesibilitas maksimal 2000 karakter.")
      .optional()
      .default(""),
    slots: z
      .string()
      .trim()
      .min(1, "Kapasitas wajib diisi.")
      .regex(/^\d+$/, "Kapasitas harus berupa angka.")
      .transform(Number)
      .refine((value) => value > 0, {
        message: "Kapasitas minimal 1 peserta.",
      })
      .refine((value) => value <= 10000, {
        message: "Kapasitas maksimal 10000 peserta.",
      }),
    coverUrl: z
      .string()
      .trim()
      .max(500)
      .optional()
      .default("")
      .refine(
        (value) =>
          value === "" ||
          value.startsWith("/") ||
          /^https?:\/\//.test(value) ||
          /^[a-zA-Z0-9._/-]+$/.test(value),
        { message: "Path cover tidak valid." },
      ),
    coverAlt: z
      .string()
      .trim()
      .max(200, "Teks alternatif maksimal 200 karakter.")
      .optional()
      .default(""),
    intent: z.enum(["DRAFT", "PENDING"]).optional().default("DRAFT"),
  })
  .superRefine((value, context) => {
    if (Date.parse(value.endsAt) <= Date.parse(value.startsAt)) {
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "Waktu selesai harus setelah waktu mulai.",
      });
    }

    if (value.coverUrl && value.coverAlt.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["coverAlt"],
        message: "Teks alternatif wajib diisi bila cover diunggah.",
      });
    }
  });

export type EventFormInput = z.infer<typeof eventFormSchema>;

export const registrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama wajib diisi.")
    .max(80, "Nama maksimal 80 karakter."),
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .max(200, "Email terlalu panjang.")
    .email("Format email belum benar."),
  phone: z
    .string()
    .trim()
    .min(8, "Nomor telepon wajib diisi.")
    .max(20, "Nomor telepon maksimal 20 karakter.")
    .regex(/^\+?[0-9 -]{8,20}$/, "Gunakan format nomor telepon yang valid."),
  accessibilityNeeds: z
    .string()
    .trim()
    .max(500, "Kebutuhan aksesibilitas maksimal 500 karakter.")
    .optional()
    .default(""),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const organizerApplicationSchema = z.object({
  organizationName: z
    .string()
    .trim()
    .min(2, "Nama organisasi minimal 2 karakter.")
    .max(120, "Nama organisasi maksimal 120 karakter."),
  contactName: z
    .string()
    .trim()
    .min(2, "Nama kontak minimal 2 karakter.")
    .max(80, "Nama kontak maksimal 80 karakter."),
  phone: z
    .string()
    .trim()
    .min(8, "Nomor telepon wajib diisi.")
    .max(20, "Nomor telepon maksimal 20 karakter.")
    .regex(/^\+?[0-9 -]{8,20}$/, "Gunakan format nomor telepon yang valid."),
  city: z.string().trim().min(1, "Kota wajib diisi.").max(80),
  province: z.string().trim().min(1, "Provinsi wajib dipilih.").max(80),
  experience: z
    .string()
    .trim()
    .min(20, "Ceritakan pengalaman minimal 20 karakter.")
    .max(1000, "Pengalaman maksimal 1000 karakter."),
  documentPath: z
    .string()
    .trim()
    .min(1, "Dokumen verifikasi wajib diunggah.")
    .max(500),
});

export type OrganizerApplicationInput = z.infer<
  typeof organizerApplicationSchema
>;

export const registrationStatusSchema = z.enum(["CONFIRMED", "CANCELLED"]);

export const uploadRequestSchema = z.object({
  fileName: z.string().trim().min(1).max(200),
  contentType: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ]),
  size: z
    .number()
    .int()
    .positive()
    .max(5 * 1024 * 1024, "Ukuran file maksimal 5 MB."),
});
