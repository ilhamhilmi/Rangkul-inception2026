import type { EventStatus, RegistrationStatus } from "@prisma/client";

type StatusMeta = {
  label: string;
  tone: "primary" | "secondary" | "success" | "neutral" | "info" | "danger";
  description: string;
};

export const EVENT_STATUS_META: Record<EventStatus, StatusMeta> = {
  DRAFT: {
    label: "Draft",
    tone: "neutral",
    description: "Belum diajukan. Lengkapi data lalu ajukan untuk ditinjau admin.",
  },
  PENDING: {
    label: "Menunggu tinjauan",
    tone: "info",
    description: "Pengajuan sedang ditinjau admin. Kegiatan belum tampil publik.",
  },
  PUBLISHED: {
    label: "Terbit",
    tone: "success",
    description: "Kegiatan tampil di halaman Volunteer dan dapat didaftari.",
  },
  CLOSED: {
    label: "Ditutup",
    tone: "secondary",
    description: "Pendaftaran ditutup. Kegiatan tidak lagi menerima peserta baru.",
  },
  REJECTED: {
    label: "Ditolak",
    tone: "danger",
    description: "Pengajuan ditolak admin. Perbaiki data lalu ajukan kembali.",
  },
  CANCELLED: {
    label: "Dibatalkan",
    tone: "danger",
    description:
      "Kegiatan dibatalkan penyelenggara. Peserta sudah menerima notifikasi.",
  },
};

export const REGISTRATION_STATUS_META: Record<RegistrationStatus, StatusMeta> = {
  PENDING: {
    label: "Menunggu konfirmasi",
    tone: "info",
    description: "Pendaftaran diterima dan menunggu konfirmasi penyelenggara.",
  },
  CONFIRMED: {
    label: "Terkonfirmasi",
    tone: "success",
    description: "Kamu terdaftar sebagai peserta kegiatan ini.",
  },
  CANCELLED: {
    label: "Dibatalkan",
    tone: "neutral",
    description: "Pendaftaran dibatalkan. Kamu dapat mendaftar ulang bila kuota tersedia.",
  },
};
