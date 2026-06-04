"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";

import { Badge, badgeTones } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { Listing, ListingStatus } from "@/types/reseller";

const STATUS_TONES: Record<ListingStatus, keyof typeof badgeTones> = {
  draft: "muted",
  listed: "accent",
  sold: "success",
  shipped: "warning",
};

export function InventoryBoard() {
  const [items, setItems] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ListingStatus | "">("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (status) params.set("status", status);
    const res = await fetch(`/api/listings?${params}`);
    const json = await res.json();
    setItems(json.data?.items ?? []);
    setTotal(json.data?.total ?? 0);
    setLoading(false);
  }, [search, status]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <Input
            className="pl-10"
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-11 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as ListingStatus | "")}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="listed">Listed</option>
          <option value="sold">Sold</option>
          <option value="shipped">Shipped</option>
        </select>
        <Link href="/listings/new">
          <Button>+ New listing</Button>
        </Link>
      </div>

      <p className="text-sm text-[var(--muted)]">{total} listings</p>

      {loading ? (
        <Card className="flex justify-center py-16">
          <Spinner className="h-8 w-8" />
        </Card>
      ) : items.length === 0 ? (
        <Card className="py-12 text-center text-[var(--muted)]">
          No listings found. Create your first listing to get started.
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 font-medium">
                  {item.title ?? item.brand ?? "Untitled"}
                </h3>
                <Badge tone={STATUS_TONES[item.status]}>{item.status}</Badge>
              </div>
              <p className="text-xs text-[var(--muted)]">
                {[item.brand, item.model].filter(Boolean).join(" · ") || "—"}
              </p>
              {item.netProfit != null ? (
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Profit: ${item.netProfit}
                </p>
              ) : item.salePrice != null ? (
                <p className="text-sm">${item.salePrice}</p>
              ) : null}
              {item.ebayListingUrl ? (
                <a
                  href={item.ebayListingUrl}
                  className="text-xs text-[var(--accent)] underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  View on eBay
                </a>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
