import { isEbaySandbox } from "@/lib/config/providers";
import type { MarketResearch, SoldComp } from "@/types/reseller";

const SANDBOX_API = "https://api.sandbox.ebay.com";
const PROD_API = "https://api.ebay.com";

function getApiBase() {
  return isEbaySandbox() ? SANDBOX_API : PROD_API;
}

type BrowseItemSummary = {
  title?: string;
  price?: { value?: string };
  condition?: string;
  itemEndDate?: string;
};

export async function searchSoldListings(
  query: string,
  accessToken?: string,
): Promise<MarketResearch> {
  const hasCredentials = Boolean(
    process.env.EBAY_APP_ID && process.env.EBAY_CERT_ID,
  );

  if (!hasCredentials || !accessToken) {
    return buildMockMarketResearch(query);
  }

  try {
    const marketplaceId = process.env.EBAY_MARKETPLACE_ID ?? "EBAY_US";
    const params = new URLSearchParams({
      q: query,
      limit: "25",
      filter: "buyingOptions:{FIXED_PRICE|AUCTION},conditions:{USED|NEW}",
    });

    const response = await fetch(
      `${getApiBase()}/buy/browse/v1/item_summary/search?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-EBAY-C-MARKETPLACE-ID": marketplaceId,
          "Content-Type": "application/json",
        },
        next: { revalidate: 300 },
      },
    );

    if (!response.ok) {
      return buildMockMarketResearch(query);
    }

    const payload = (await response.json()) as {
      itemSummaries?: BrowseItemSummary[];
    };
    const items = payload.itemSummaries ?? [];
    const prices = items
      .map((item) => Number(item.price?.value ?? 0))
      .filter((p) => p > 0);

    if (prices.length === 0) {
      return buildMockMarketResearch(query);
    }

    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const highest = Math.max(...prices);
    const lowest = Math.min(...prices);
    const recentSales: SoldComp[] = items.slice(0, 8).map((item) => ({
      title: item.title ?? "Unknown",
      soldPrice: Number(item.price?.value ?? 0),
      soldDate: item.itemEndDate ?? new Date().toISOString(),
      condition: item.condition,
    }));

    const trend = detectTrend(prices);
    const suggestedBin = Number((avg * 1.05).toFixed(2));
    const suggestedAuction = Number((avg * 0.92).toFixed(2));

    return {
      query,
      avgSoldPrice: Number(avg.toFixed(2)),
      highestSoldPrice: Number(highest.toFixed(2)),
      lowestSoldPrice: Number(lowest.toFixed(2)),
      soldCount: prices.length,
      trend,
      suggestedBinPrice: suggestedBin,
      suggestedAuctionPrice: suggestedAuction,
      recentSales,
      source: "ebay",
    };
  } catch {
    return buildMockMarketResearch(query);
  }
}

function detectTrend(prices: number[]): "rising" | "stable" | "falling" {
  if (prices.length < 4) return "stable";
  const mid = Math.floor(prices.length / 2);
  const recent = prices.slice(0, mid);
  const older = prices.slice(mid);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  const delta = (recentAvg - olderAvg) / olderAvg;
  if (delta > 0.05) return "rising";
  if (delta < -0.05) return "falling";
  return "stable";
}

export function buildMockMarketResearch(query: string): MarketResearch {
  const seed = hashString(query);
  const base = 25 + (seed % 175);
  const spread = 8 + (seed % 40);
  const avg = base + spread / 2;
  const count = 12 + (seed % 88);

  const recentSales: SoldComp[] = Array.from({ length: 6 }, (_, i) => ({
    title: `${query} — comp ${i + 1}`,
    soldPrice: Number((avg + (i - 3) * (spread / 6)).toFixed(2)),
    soldDate: new Date(Date.now() - i * 86400000 * 3).toISOString(),
    condition: i % 2 === 0 ? "Used" : "Pre-owned",
  }));

  return {
    query,
    avgSoldPrice: Number(avg.toFixed(2)),
    highestSoldPrice: Number((avg + spread).toFixed(2)),
    lowestSoldPrice: Number((avg - spread).toFixed(2)),
    soldCount: count,
    trend: seed % 3 === 0 ? "rising" : seed % 3 === 1 ? "stable" : "falling",
    suggestedBinPrice: Number((avg * 1.05).toFixed(2)),
    suggestedAuctionPrice: Number((avg * 0.9).toFixed(2)),
    recentSales,
    source: "mock",
  };
}

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getEbayOAuthUrl(state: string) {
  const base = isEbaySandbox()
    ? "https://auth.sandbox.ebay.com/oauth2/authorize"
    : "https://auth.ebay.com/oauth2/authorize";
  const redirect = encodeURIComponent(
    process.env.EBAY_OAUTH_REDIRECT_URI ??
      `${process.env.NEXT_PUBLIC_APP_URL}/api/ebay/callback`,
  );
  const scopes = encodeURIComponent(
    "https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory",
  );
  return `${base}?client_id=${process.env.EBAY_APP_ID}&redirect_uri=${redirect}&response_type=code&scope=${scopes}&state=${state}`;
}

export async function exchangeEbayCode(code: string) {
  const tokenUrl = isEbaySandbox()
    ? "https://api.sandbox.ebay.com/identity/v1/oauth2/token"
    : "https://api.ebay.com/identity/v1/oauth2/token";

  const credentials = Buffer.from(
    `${process.env.EBAY_APP_ID}:${process.env.EBAY_CERT_ID}`,
  ).toString("base64");

  const redirectUri =
    process.env.EBAY_OAUTH_REDIRECT_URI ??
    `${process.env.NEXT_PUBLIC_APP_URL}/api/ebay/callback`;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error("Failed to exchange eBay authorization code");
  }

  return response.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>;
}
