-- Pembatalan kegiatan oleh penyelenggara.
-- Sifat: ADDITIVE. Nilai enum baru ditambahkan ke enum yang sudah ada.

ALTER TYPE "EventStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'EVENT_CANCELLED';
