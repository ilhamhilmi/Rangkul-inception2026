import Link from "next/link";
import { Suspense } from "react";
import { AuthNav } from "@/components/layout/auth-nav";
import { Brand } from "@/components/layout/brand";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NotificationMenu } from "@/components/layout/notification-menu";
import { PrimaryNav } from "@/components/layout/primary-nav";
import { Button, ButtonLink } from "@/components/ui/button";
import { CalendarIcon, UserIcon } from "@/components/ui/icons";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { getCurrentUser } from "@/lib/auth/session";
import { signOutAction } from "@/server/auth/actions";
import { getNotificationsForUser } from "@/server/notifications/queries";

async function HeaderActions() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="hidden lg:block">
          <AuthNav />
        </div>
        <MobileNav user={null} />
      </div>
    );
  }

  const notifications = await getNotificationsForUser(user.id);
  const canManageEvents =
    user.role === "ORGANIZER" || user.role === "ADMIN";

  return (
    <div className="flex items-center gap-1.5">
      {canManageEvents ? (
        <div className="hidden lg:block">
          <ButtonLink
            href="/dashboard/kegiatan"
            variant="secondary"
            size="sm"
            aria-label="Kelola Kegiatan"
            className="px-3 lg:px-4"
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Kelola Kegiatan</span>
          </ButtonLink>
        </div>
      ) : null}
      <NotificationMenu
        items={notifications.items}
        unreadCount={notifications.unreadCount}
      />
      <Link
        href="/profil"
        className="hidden max-w-32 items-center gap-1.5 rounded-button px-1.5 py-2 text-sm font-medium text-ink transition-colors hover:text-primary-800 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-focus lg:flex lg:max-w-44"
      >
        <UserIcon className="h-4 w-4 shrink-0 text-primary-700" />
        <span className="truncate">{user.name}</span>
        {user.role === "ORGANIZER" ? <VerifiedBadge /> : null}
      </Link>
      <form action={signOutAction} className="hidden lg:block">
        <Button type="submit" variant="ghost" size="sm">
          Keluar
        </Button>
      </form>
      <MobileNav
        user={{ name: user.name, email: user.email, role: user.role }}
      />
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Brand />

        <Suspense
          fallback={<div aria-hidden="true" className="hidden h-11 w-60 lg:block" />}
        >
          <PrimaryNav />
        </Suspense>

        <Suspense
          fallback={
            <div
              aria-hidden="true"
              className="h-11 w-32 animate-pulse rounded-button bg-surface-muted"
            />
          }
        >
          <HeaderActions />
        </Suspense>
      </div>
    </header>
  );
}
