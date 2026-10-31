import { z } from "zod";
import { PLACE_CATEGORIES } from "@/lib/constants/places";

const categoryValues = PLACE_CATEGORIES.map(
  (category) => category.value,
) as [string, ...string[]];

function coordinate(
  min: number,
  max: number,
  message: string,
) {
  return z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.coerce
      .number({ error: message })
      .min(min, message)
      .max(max, message),
  );
}

export const placePostSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nama tempat minimal 3 karakter.")
    .max(120, "Nama tempat maksimal 120 karakter."),
  category: z.enum(categoryValues, {
    error: "Pilih salah satu kategori tempat.",
  }),
  description: z
    .string()
    .trim()
    .min(40, "Ceritakan pengalamanmu minimal 40 karakter.")
    .max(2000, "Deskripsi maksimal 2000 karakter."),
  latitude: coordinate(-90, 90, "Latitude harus antara -90 dan 90."),
  longitude: coordinate(-180, 180, "Longitude harus antara -180 dan 180."),
});

export type PlacePostInput = z.infer<typeof placePostSchema>;

export type PlacePostFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
  result?: {
    name: string;
    slug: string;
    tayang: boolean;
  };
};
