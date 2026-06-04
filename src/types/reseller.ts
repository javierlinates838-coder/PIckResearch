export type ListingStatus = "draft" | "listed" | "sold" | "shipped";

export type ProductIdentification = {
  product: string;
  brand: string;
  model: string;
  color: string;
  condition: string;
  category: string;
  confidence: number;
  notes?: string;
};

export type MarketResearch = {
  query: string;
  avgSoldPrice: number;
  highestSoldPrice: number;
  lowestSoldPrice: number;
  soldCount: number;
  trend: "rising" | "stable" | "falling";
  suggestedBinPrice: number;
  suggestedAuctionPrice: number;
  recentSales: SoldComp[];
  source: "ebay" | "mock";
};

export type SoldComp = {
  title: string;
  soldPrice: number;
  soldDate: string;
  condition?: string;
};

export type PricingRecommendation = {
  aggressive: number;
  market: number;
  quickSale: number;
  opportunity?: string;
  confidence: number;
};

export type ListingCopy = {
  title: string;
  description: string;
  itemSpecifics: Record<string, string>;
  keywords: string[];
  shippingSuggestions: string[];
};

export type ProfitBreakdown = {
  salePrice: number;
  shippingCost: number;
  ebayFees: number;
  taxAmount: number;
  costBasis: number;
  netProfit: number;
  roiPct: number;
};

export type ListingPhoto = {
  id: string;
  url: string;
  enhancedUrl?: string;
  isPrimary?: boolean;
};

export type Listing = {
  id: string;
  userId: string;
  status: ListingStatus;
  title?: string;
  description?: string;
  category?: string;
  brand?: string;
  model?: string;
  color?: string;
  condition?: string;
  keywords: string[];
  itemSpecifics: Record<string, string>;
  photos: ListingPhoto[];
  enhancedPhotos: ListingPhoto[];
  aiIdentification?: ProductIdentification;
  marketResearch?: MarketResearch;
  pricing?: PricingRecommendation;
  listingCopy?: ListingCopy;
  profit?: ProfitBreakdown;
  ebayItemId?: string;
  ebayListingUrl?: string;
  costBasis?: number;
  salePrice?: number;
  shippingCost?: number;
  ebayFees?: number;
  taxAmount?: number;
  netProfit?: number;
  roiPct?: number;
  soldAt?: string;
  shippedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type AnalyticsSummary = {
  avgProfitPerItem: number;
  sellThroughRate: number;
  totalRevenue: number;
  totalProfit: number;
  listedCount: number;
  soldCount: number;
  revenueByMonth: { month: string; revenue: number; profit: number }[];
  topCategories: { category: string; revenue: number; count: number }[];
};

export type ProviderStatus = {
  supabase: boolean;
  openai: boolean;
  ebay: boolean;
  photoroom: boolean;
};
