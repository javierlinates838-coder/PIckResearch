import { createSupabaseServiceClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type {
  Listing,
  ListingStatus,
  MarketResearch,
  PricingRecommendation,
  ProductIdentification,
  ListingCopy,
  ProfitBreakdown,
  ListingPhoto,
} from "@/types/reseller";

const DEMO_USER = "00000000-0000-4000-8000-000000000001";

type ListingRow = {
  id: string;
  user_id: string;
  status: ListingStatus;
  title: string | null;
  description: string | null;
  category: string | null;
  brand: string | null;
  model: string | null;
  color: string | null;
  condition: string | null;
  keywords: string[];
  item_specifics: Record<string, string>;
  photos: ListingPhoto[];
  enhanced_photos: ListingPhoto[];
  ai_identification: ProductIdentification | null;
  market_research: MarketResearch | null;
  pricing: PricingRecommendation | null;
  listing_copy: ListingCopy | null;
  profit: ProfitBreakdown | null;
  ebay_item_id: string | null;
  ebay_listing_url: string | null;
  cost_basis: number | null;
  sale_price: number | null;
  shipping_cost: number | null;
  ebay_fees: number | null;
  tax_amount: number | null;
  net_profit: number | null;
  roi_pct: number | null;
  sold_at: string | null;
  shipped_at: string | null;
  created_at: string;
  updated_at: string;
};

const memoryStore = new Map<string, Listing>();

function rowToListing(row: ListingRow): Listing {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    title: row.title ?? undefined,
    description: row.description ?? undefined,
    category: row.category ?? undefined,
    brand: row.brand ?? undefined,
    model: row.model ?? undefined,
    color: row.color ?? undefined,
    condition: row.condition ?? undefined,
    keywords: row.keywords ?? [],
    itemSpecifics: row.item_specifics ?? {},
    photos: row.photos ?? [],
    enhancedPhotos: row.enhanced_photos ?? [],
    aiIdentification: row.ai_identification ?? undefined,
    marketResearch: row.market_research ?? undefined,
    pricing: row.pricing ?? undefined,
    listingCopy: row.listing_copy ?? undefined,
    profit: row.profit ?? undefined,
    ebayItemId: row.ebay_item_id ?? undefined,
    ebayListingUrl: row.ebay_listing_url ?? undefined,
    costBasis: row.cost_basis ?? undefined,
    salePrice: row.sale_price ?? undefined,
    shippingCost: row.shipping_cost ?? undefined,
    ebayFees: row.ebay_fees ?? undefined,
    taxAmount: row.tax_amount ?? undefined,
    netProfit: row.net_profit ?? undefined,
    roiPct: row.roi_pct ?? undefined,
    soldAt: row.sold_at ?? undefined,
    shippedAt: row.shipped_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function listingToRow(
  listing: Partial<Listing> & { id: string; userId: string },
): Partial<ListingRow> {
  return {
    id: listing.id,
    user_id: listing.userId,
    status: listing.status,
    title: listing.title ?? null,
    description: listing.description ?? null,
    category: listing.category ?? null,
    brand: listing.brand ?? null,
    model: listing.model ?? null,
    color: listing.color ?? null,
    condition: listing.condition ?? null,
    keywords: listing.keywords ?? [],
    item_specifics: listing.itemSpecifics ?? {},
    photos: listing.photos ?? [],
    enhanced_photos: listing.enhancedPhotos ?? [],
    ai_identification: listing.aiIdentification ?? null,
    market_research: listing.marketResearch ?? null,
    pricing: listing.pricing ?? null,
    listing_copy: listing.listingCopy ?? null,
    profit: listing.profit ?? null,
    ebay_item_id: listing.ebayItemId ?? null,
    ebay_listing_url: listing.ebayListingUrl ?? null,
    cost_basis: listing.costBasis ?? null,
    sale_price: listing.salePrice ?? null,
    shipping_cost: listing.shippingCost ?? null,
    ebay_fees: listing.ebayFees ?? null,
    tax_amount: listing.taxAmount ?? null,
    net_profit: listing.netProfit ?? null,
    roi_pct: listing.roiPct ?? null,
    sold_at: listing.soldAt ?? null,
    shipped_at: listing.shippedAt ?? null,
    updated_at: new Date().toISOString(),
  };
}

export function getDemoUserId() {
  return DEMO_USER;
}

export async function listListings(
  userId: string,
  options: { search?: string; status?: ListingStatus; limit?: number; offset?: number } = {},
): Promise<{ items: Listing[]; total: number }> {
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;

  if (!hasSupabaseConfig()) {
    let items = [...memoryStore.values()].filter((l) => l.userId === userId);
    if (options.status) items = items.filter((l) => l.status === options.status);
    if (options.search) {
      const q = options.search.toLowerCase();
      items = items.filter(
        (l) =>
          l.title?.toLowerCase().includes(q) ||
          l.brand?.toLowerCase().includes(q) ||
          l.model?.toLowerCase().includes(q),
      );
    }
    items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const total = items.length;
    return { items: items.slice(offset, offset + limit), total };
  }

  const supabase = createSupabaseServiceClient();
  let query = supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options.status) query = query.eq("status", options.status);
  if (options.search) {
    query = query.or(
      `title.ilike.%${options.search}%,brand.ilike.%${options.search}%,model.ilike.%${options.search}%`,
    );
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return {
    items: (data as ListingRow[]).map(rowToListing),
    total: count ?? 0,
  };
}

export async function getListing(
  id: string,
  userId: string,
): Promise<Listing | null> {
  if (!hasSupabaseConfig()) {
    const item = memoryStore.get(id);
    return item && item.userId === userId ? item : null;
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToListing(data as ListingRow) : null;
}

export async function createListing(
  userId: string,
  partial: Partial<Listing> = {},
): Promise<Listing> {
  const now = new Date().toISOString();
  const listing: Listing = {
    id: crypto.randomUUID(),
    userId,
    status: "draft",
    keywords: [],
    itemSpecifics: {},
    photos: [],
    enhancedPhotos: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };

  if (!hasSupabaseConfig()) {
    memoryStore.set(listing.id, listing);
    return listing;
  }

  const supabase = createSupabaseServiceClient();
  const row = {
    ...listingToRow(listing),
    created_at: now,
    updated_at: now,
  };
  const { data, error } = await supabase
    .from("listings")
    .insert(row)
    .select()
    .single();

  if (error) throw error;
  return rowToListing(data as ListingRow);
}

export async function updateListing(
  id: string,
  userId: string,
  updates: Partial<Listing>,
): Promise<Listing> {
  const existing = await getListing(id, userId);
  if (!existing) throw new Error("Listing not found");

  const merged: Listing = {
    ...existing,
    ...updates,
    id,
    userId,
    updatedAt: new Date().toISOString(),
  };

  if (!hasSupabaseConfig()) {
    memoryStore.set(id, merged);
    return merged;
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("listings")
    .update(listingToRow(merged))
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return rowToListing(data as ListingRow);
}

export async function deleteListing(id: string, userId: string) {
  if (!hasSupabaseConfig()) {
    memoryStore.delete(id);
    return;
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function getAnalyticsSummary(userId: string) {
  const { items } = await listListings(userId, { limit: 5000 });
  const sold = items.filter((l) => l.status === "sold" || l.status === "shipped");
  const listed = items.filter((l) => l.status === "listed" || l.status === "sold" || l.status === "shipped");

  const totalRevenue = sold.reduce((s, l) => s + (l.salePrice ?? 0), 0);
  const totalProfit = sold.reduce((s, l) => s + (l.netProfit ?? 0), 0);
  const avgProfitPerItem = sold.length ? totalProfit / sold.length : 0;
  const sellThroughRate = listed.length ? (sold.length / listed.length) * 100 : 0;

  const byMonth = new Map<string, { revenue: number; profit: number }>();
  for (const item of sold) {
    const d = new Date(item.soldAt ?? item.updatedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const cur = byMonth.get(key) ?? { revenue: 0, profit: 0 };
    cur.revenue += item.salePrice ?? 0;
    cur.profit += item.netProfit ?? 0;
    byMonth.set(key, cur);
  }

  const revenueByMonth = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, v]) => ({ month, ...v }));

  const catMap = new Map<string, { revenue: number; count: number }>();
  for (const item of sold) {
    const cat = item.category ?? "Uncategorized";
    const cur = catMap.get(cat) ?? { revenue: 0, count: 0 };
    cur.revenue += item.salePrice ?? 0;
    cur.count += 1;
    catMap.set(cat, cur);
  }

  const topCategories = [...catMap.entries()]
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    avgProfitPerItem: Number(avgProfitPerItem.toFixed(2)),
    sellThroughRate: Number(sellThroughRate.toFixed(1)),
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalProfit: Number(totalProfit.toFixed(2)),
    listedCount: listed.length,
    soldCount: sold.length,
    revenueByMonth,
    topCategories,
  };
}

/** Seed demo inventory when empty */
export async function ensureDemoListings(userId: string) {
  const { total } = await listListings(userId, { limit: 1 });
  if (total > 0) return;

  const demos = [
    { title: "Nike Air Max 90 White Red", brand: "Nike", status: "listed" as const, salePrice: 89.99, netProfit: 42.5 },
    { title: "Apple iPhone 13 128GB Midnight", brand: "Apple", status: "sold" as const, salePrice: 349, netProfit: 118 },
    { title: "Levi's 501 Vintage Jeans 32x32", brand: "Levi's", status: "draft" as const },
  ];

  for (const d of demos) {
    await createListing(userId, {
      ...d,
      category: "General",
      costBasis: 20,
      roiPct: d.netProfit ? Number(((d.netProfit / 20) * 100).toFixed(1)) : undefined,
      soldAt: d.status === "sold" ? new Date().toISOString() : undefined,
    });
  }
}
