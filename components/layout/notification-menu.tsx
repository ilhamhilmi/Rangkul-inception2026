"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { BellIcon, CheckIcon } from "@/components/ui/icons";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/server/notifications/actions";
import type { NotificationItem } from "@/server/notifications/queries";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

function formatNotificationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${dateFormatter.format(date)} WIB`;
}

export function NotificationMenu({
  items,
  unreadCount,
}: {
  items: NotificationItem[];
  unreadCount: number;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function markAllRead() {
    setError(null);
    startTransition(async () => {
      const result = await markAllNotificationsReadAction();
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  function markRead(item: NotificationItem) {
    setOpen(false);
    if (item.readAt) return;

    startTransition(async () => {
      await markNotificationReadAction(item.id);
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="menu-notifikasi"
        aria-label={
          unreadCount > 0
            ? `Notifikasi, ${unreadCount} belum dibaca`
            : "Notifikasi"
        }
        className="relative inline-grid h-11 w-11 place-items-center rounded-button text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary-700 px-1 text-[11px] font-semibold leading-none text-white ring-2 ring-canvas">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id="menu-notifikasi"
          className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-card border border-line bg-surface shadow-card"
        >
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Notifikasi</p>
              <p className="text-xs text-ink-muted">
                {unreadCount > 0
                  ? `${unreadCount} belum dibaca`
                  : "Semua sudah dibaca"}
              </p>
            </div>
            {unreadCount > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={markAllRead}
                disabled={isPending}
              >
                <CheckIcon className="h-4 w-4" />
                Tandai semua
              </Button>
            ) : null}
          </div>

          {error ? (
            <p
              role="alert"
              className="border-b border-line bg-danger-50 px-4 py-2 text-xs text-danger-700"
            >
              {error}
            </p>
          ) : null}

          {items.length > 0 ? (
            <ul className="max-h-96 overflow-y-auto">
              {items.map((item) => {
                const content = (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-snug text-ink">
                        {item.title}
                      </p>
                      {!item.readAt ? (
                        <span
                          aria-label="Belum dibaca"
                          className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-700"
                        />
                      ) : null}
                    </div>
                    <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-ink-muted">
                      {item.body}
                    </p>
                    <time
                      dateTime={item.createdAt}
                      className="mt-1.5 block text-[11px] text-ink-muted"
                    >
                      {formatNotificationDate(item.createdAt)}
                    </time>
                  </>
                );

                return (
                  <li
                    key={item.id}
                    className={[
                      "border-b border-line last:border-b-0",
                      item.readAt ? "bg-surface" : "bg-primary-50/50",
                    ].join(" ")}
                  >
                    {item.href ? (
                      <Link
                        href={item.href}
                        onClick={() => markRead(item)}
                        className="block px-4 py-3 transition-colors hover:bg-surface-muted focus-visible:outline-[3px] focus-visible:outline-offset-[-3px] focus-visible:outline-focus"
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => markRead(item)}
                        className="block w-full px-4 py-3 text-left transition-colors hover:bg-surface-muted focus-visible:outline-[3px] focus-visible:outline-offset-[-3px] focus-visible:outline-focus"
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center">
              <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-surface-muted text-ink-muted">
                <BellIcon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-medium text-ink">
                Belum ada notifikasi
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                Kabar tentang kegiatan yang kamu ikuti akan muncul di sini.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
