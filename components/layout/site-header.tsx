import Link from "next/link";
import { Suspense } from "react";
import { AuthNav } from "@/components/layout/auth-nav";
import { Brand } from "@/components/layout/brand";
import { NotificationMenu } from "@/components/layout/notification-menu";
import { Button, ButtonLink } from "@/components/ui/button";
import { CalendarIcon, UserIcon } from "@/components/ui/icons";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { getCurrentUser } from "@/lib/auth/session";
import { signOutAction } from "@/server/auth/actions";
import { getNotificationsForUser } from "@/server/notifications/queries";

const navigation = [
  { href: "/jelajahi", label: "Jelajahi" },
  { href: "/komunitas", label: "Komunitas" },
  { href: "/volunteer", label: "Volunteer" },
];

async function AccountNav() {
  const user = await getCurrentUser();

  if (!user) {
    return <AuthNav />;
  }

  const notifications = await getNotificationsForUser(user.id);
  const canManageEvents =
    user.role === "ORGANIZER" || user.role === "ADMIN";

  return (
    <div className="flex items-center gap-1.5">
      {canManageEvents ? (
        <ButtonLink
          href="/dashboard/kegiatan"
          variant="secondary"
          size="sm"
          aria-label="Kelola Kegiatan"
          className="px-3 sm:px-4"
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Kelola Kegiatan</span>
        </ButtonLink>
      ) : null}
      <NotificationMenu
        items={notifications.items}
        unreadCount={notifications.unreadCount}
      />
      <span className="hidden max-w-32 items-center gap-1.5 text-sm font-medium text-ink sm:flex sm:max-w-44">
        <UserIcon className="h-4 w-4 shrink-0 text-primary-700" />
        <span className="truncate">{user.name}</span>
        {user.role === "ORGANIZER" ? <VerifiedBadge /> : null}
      </span>
      <form action={signOutAction}>
        <Button type="submit" variant="ghost" size="sm">
          Keluar
        </Button>
      </form>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Brand />

        <nav aria-label="Navigasi utama" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex h-11 items-center rounded-button px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Suspense
          fallback={
            <div
              aria-hidden="true"
              className="h-11 w-32 animate-pulse rounded-button bg-surface-muted"
            />
          }
        >
          <AccountNav />
        </Suspense>
      </div>
    </header>
  );
}
