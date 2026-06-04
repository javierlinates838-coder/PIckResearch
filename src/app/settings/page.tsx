import { ProviderStatusPanel } from "@/components/settings/provider-status";

export const metadata = {
  title: "Settings",
};

export default function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ebay?: string }>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-[var(--muted)]">API integrations and eBay OAuth.</p>
      </div>
      <EbayStatusMessage searchParams={searchParams} />
      <ProviderStatusPanel />
    </div>
  );
}

async function EbayStatusMessage({
  searchParams,
}: {
  searchParams: Promise<{ ebay?: string }>;
}) {
  const params = await searchParams;
  if (params.ebay === "connected") {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
        eBay account connected successfully.
      </div>
    );
  }
  if (params.ebay === "error") {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
        eBay connection failed. Check your credentials and redirect URI.
      </div>
    );
  }
  return null;
}
