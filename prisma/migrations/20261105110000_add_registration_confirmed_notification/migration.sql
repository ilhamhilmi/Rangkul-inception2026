-- Notifikasi untuk peserta yang pendaftarannya dikonfirmasi penyelenggara.
-- Sifat: ADDITIVE. Nilai baru ditambahkan ke enum yang sudah ada.

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'REGISTRATION_CONFIRMED';
