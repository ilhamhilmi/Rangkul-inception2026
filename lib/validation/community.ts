import { z } from "zod";
import {
  communityFocusOptions,
  communityProvinceOptions,
} from "@/lib/constants/communities";

const focusValues = communityFocusOptions as [string, ...string[]];
const provinceValues = communityProvinceOptions as [string, ...string[]];

const optionalSocial = z
  .string()
  .trim()
  .max(200, "Maksimal 200 karakter.")
  .optional()
  .transform((value) => value ?? "");

const optionalWebsite = optionalSocial.refine(
  (value) => !value || /^https?:\/\/\S+$/i.test(value),
  "Tulis tautan lengkap yang diawali https://",
);

export const communitySchema = z.object({
  picName: z
    .string()
    .trim()
    .min(1, "Nama pengurus wajib diisi.")
    .max(80, "Nama pengurus maksimal 80 karakter."),
  picPhone: z
    .string()
    .trim()
    .regex(
      /^(\+62|62|0)[0-9\s-]{8,18}$/,
      "Gunakan nomor Indonesia yang valid, misalnya 0812-3456-7890.",
    ),
  picEmail: z.string().trim().email("Format email belum benar."),
  logoPath: z
    .string()
    .trim()
    .max(300, "Path logo terlalu panjang.")
    .optional()
    .transform((value) => value ?? ""),
  name: z
    .string()
    .trim()
    .min(2, "Nama komunitas minimal 2 karakter.")
    .max(120, "Nama komunitas maksimal 120 karakter."),
  description: z
    .string()
    .trim()
    .min(20, "Deskripsi minimal 20 karakter.")
    .max(3000, "Deskripsi maksimal 3000 karakter."),
  province: z.enum(provinceValues, {
    error: "Pilih provinsi komunitas.",
  }),
  city: z
    .string()
    .trim()
    .min(1, "Kota atau kabupaten wajib diisi.")
    .max(80, "Nama kota maksimal 80 karakter."),
  focus: z
    .array(z.enum(focusValues))
    .min(1, "Pilih minimal satu fokus komunitas.")
    .max(8, "Pilih maksimal 8 fokus komunitas."),
  channel: z
    .string()
    .trim()
    .url("Tulis tautan grup atau kanal yang valid, diawali https://"),
  instagram: optionalSocial,
  website: optionalWebsite,
  consent: z.literal(true, {
    error: "Kamu perlu menyetujui pernyataan verifikasi.",
  }),
});

export type CommunityInput = z.infer<typeof communitySchema>;

export const communityFormSchema = communitySchema;
