"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import type { ProviderStatus } from "@/types/reseller";

export function ProviderStatusPanel() {
  const [status, setStatus] = useState<ProviderStatus | null>(null);

  useEffect(() => {
    fetch("/api/providers/status")
      .then((r) => r.json())
      .then((json) => setStatus(json.data));
  }, []);

  const rows = status
    ? [
        { name: "Supabase", ok: status.supabase },
        { name: "OpenAI", ok: status.openai },
        { name: "eBay API", ok: status.ebay },
        { name: "PhotoRoom", ok: status.photoroom },
      ]
    : [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Integrations"
          description="Connect services for production use. Demo mode works without keys."
        />
        <ul className="space-y-2">
          {rows.map((row) => (
            <li
              key={row.name}
              className="flex items-center justify-between rounded-2xl bg-black/5 px-4 py-3 dark:bg-white/5"
            >
              <span className="font-medium">{row.name}</span>
              <Badge tone={row.ok ? "success" : "warning"}>
                {row.ok ? "Connected" : "Not configured"}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader title="eBay account" description="OAuth for one-click listing" />
        <Link href="/api/ebay/connect">
          <Button className="w-full sm:w-auto">Connect eBay account</Button>
        </Link>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Requires EBAY_APP_ID, EBAY_CERT_ID, and EBAY_OAUTH_REDIRECT_URI in environment.
        </p>
      </Card>
    </div>
  );
}
