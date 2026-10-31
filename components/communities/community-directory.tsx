"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { CommunityCard } from "@/components/communities/community-card";
import { CommunityFilters } from "@/components/communities/community-filters";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { UsersIcon } from "@/components/ui/icons";
import type { Community, CommunityFocus } from "@/types/community";

type CommunityDirectoryProps = {
  communities: Community[];
  totalVerified: number;
  initialQuery: string;
  initialProvince: string;
  initialFocus: string;
};

function normalize(value: string) {
  return value.toLocaleLowerCase("id-ID");
}

export function CommunityDirectory({
  communities,
  totalVerified,
  initialQuery,
  initialProvince,
  initialFocus,
}: CommunityDirectoryProps) {
  const [query, setQuery] = useState(initialQuery);
  const [province, setProvince] = useState(initialProvince);
  const [focus, setFocus] = useState(initialFocus);

  const deferredQuery = useDeferredValue(query);
  const isFiltering = query !== deferredQuery;

  const filtered = useMemo(() => {
    const keyword = normalize(deferredQuery.trim());

    return communities.filter((community) => {
      if (province && community.province !== province) return false;
      if (focus && !community.focus.includes(focus as CommunityFocus)) return false;
      if (!keyword) return true;

      return [community.name, community.city, community.province, community.description]
        .map(normalize)
        .some((value) => value.includes(keyword));
    });
  }, [communities, deferredQuery, province, focus]);

  useEffect(() => {
    const params = new URLSearchParams();
    const trimmedQuery = query.trim();

    if (trimmedQuery) params.set("q", trimmedQuery);
    if (province) params.set("wilayah", province);
    if (focus) params.set("fokus", focus);

    const queryString = params.toString();
    window.history.replaceState(
      null,
      "",
      queryString ? `/komunitas?${queryString}` : "/komunitas",
    );
  }, [query, province, focus]);

  function resetFilters() {
    setQuery("");
    setProvince("");
    setFocus("");
  }

  const filterLabels = [
    query.trim() ? `kata kunci “${query.trim()}”` : "",
    province ? `wilayah ${province}` : "",
    focus ? `fokus ${focus}` : "",
  ].filter(Boolean);

  const summary = `Menampilkan ${filtered.length} dari ${totalVerified} komunitas terverifikasi${
    filterLabels.length ? ` untuk ${filterLabels.join(", ")}` : ""
  }.`;

  return (
    <>
      <CommunityFilters
        query={query}
        province={province}
        focus={focus}
        onQueryChange={setQuery}
        onProvinceChange={setProvince}
        onFocusChange={setFocus}
        onReset={resetFilters}
      />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ink">
            Komunitas terverifikasi
          </h2>
          <p
            role="status"
            aria-live="polite"
            aria-busy={isFiltering}
            className="mt-1 text-sm leading-relaxed text-ink-muted"
          >
            {isFiltering ? "Memuat hasil pencarian…" : summary}
          </p>
        </div>
        <Badge tone="success">Terverifikasi admin</Badge>
      </div>

      {filtered.length > 0 ? (
        <ul
          className={[
            "mt-6 grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 sm:gap-5 lg:grid-cols-3",
            isFiltering ? "opacity-60" : "opacity-100",
          ].join(" ")}
          aria-busy={isFiltering}
        >
          {filtered.map((community) => (
            <li key={community.slug} className="h-full min-w-0">
              <CommunityCard community={community} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          className="mt-6"
          icon={UsersIcon}
          title="Belum ada komunitas yang cocok"
          description="Coba kata kunci lain, pilih wilayah yang lebih luas, atau hapus filter fokus. Kamu juga bisa mendaftarkan komunitas yang belum ada di sini."
          action={
            <>
              <Button type="button" onClick={resetFilters}>
                Hapus semua filter
              </Button>
              <ButtonLink href="/komunitas/daftar" variant="secondary">
                Daftarkan komunitas
              </ButtonLink>
            </>
          }
        />
      )}
    </>
  );
}
