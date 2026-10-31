import ExcelJS from "exceljs";

import { getAuthorizedProfile } from "@/lib/auth/guards";
import { listEventRegistrations } from "@/lib/volunteer/data";
import { REGISTRATION_STATUS_META } from "@/lib/volunteer/status";

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Jakarta",
});

export async function GET(
  _request: Request,
  context: RouteContext<"/dashboard/kegiatan/[id]/pendaftar/export">,
) {
  const auth = await getAuthorizedProfile(["ORGANIZER", "ADMIN"]);

  if (!auth.allowed) {
    return new Response(
      auth.reason === "UNAUTHENTICATED" ? "Unauthorized" : "Forbidden",
      { status: auth.reason === "UNAUTHENTICATED" ? 401 : 403 },
    );
  }

  const { id } = await context.params;

  let data: Awaited<ReturnType<typeof listEventRegistrations>>;

  try {
    data = await listEventRegistrations(id, auth.profile);
  } catch {
    return new Response(
      "Data kegiatan belum tersedia. Migration Volunteer belum diterapkan.",
      { status: 503 },
    );
  }

  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Rangkul";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Pendaftar");
  sheet.columns = [
    { header: "Nama peserta", key: "name", width: 28 },
    { header: "Email", key: "email", width: 32 },
    { header: "Nomor telepon", key: "phone", width: 20 },
    {
      header: "Kebutuhan aksesibilitas",
      key: "accessibilityNeeds",
      width: 40,
    },
    { header: "Status pendaftaran", key: "status", width: 22 },
    { header: "Waktu pendaftaran", key: "createdAt", width: 22 },
  ];

  for (const registration of data.registrations) {
    sheet.addRow({
      name: registration.name,
      email: registration.email,
      phone: registration.phone,
      accessibilityNeeds: registration.accessibilityNeeds ?? "-",
      status: REGISTRATION_STATUS_META[registration.status].label,
      createdAt: dateTimeFormatter.format(registration.createdAt),
    });
  }

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEDE9FE" },
  };
  headerRow.alignment = { vertical: "middle" };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = { from: "A1", to: "F1" };

  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `pendaftar-${data.event.slug}.xlsx`;

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
