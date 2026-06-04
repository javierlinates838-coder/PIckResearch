import { z } from "zod";

export const listingStatusSchema = z.enum([
  "draft",
  "listed",
  "sold",
  "shipped",
]);

export const createListingSchema = z.object({
  photos: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        isPrimary: z.boolean().optional(),
      }),
    )
    .min(1)
    .max(10)
    .optional(),
});

export const updateListingSchema = z.object({
  status: listingStatusSchema.optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  condition: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  itemSpecifics: z.record(z.string(), z.string()).optional(),
  photos: z.array(z.object({ id: z.string(), url: z.string() })).optional(),
  enhancedPhotos: z
    .array(z.object({ id: z.string(), url: z.string(), enhancedUrl: z.string().optional() }))
    .optional(),
  aiIdentification: z.record(z.string(), z.unknown()).optional(),
  marketResearch: z.record(z.string(), z.unknown()).optional(),
  pricing: z.record(z.string(), z.unknown()).optional(),
  listingCopy: z.record(z.string(), z.unknown()).optional(),
  profit: z.record(z.string(), z.unknown()).optional(),
  costBasis: z.number().optional(),
  salePrice: z.number().optional(),
  shippingCost: z.number().optional(),
  ebayItemId: z.string().optional(),
  ebayListingUrl: z.string().optional(),
});

export const analyzePhotosSchema = z.object({
  images: z.array(z.string()).min(1).max(10),
  listingId: z.string().uuid().optional(),
});

export const marketResearchSchema = z.object({
  query: z.string().min(2),
  listingId: z.string().uuid().optional(),
});

export const generateListingSchema = z.object({
  listingId: z.string().uuid(),
});

export const enhancePhotoSchema = z.object({
  image: z.string(),
  listingId: z.string().uuid().optional(),
  photoId: z.string().optional(),
});

export const profitCalcSchema = z.object({
  salePrice: z.number().min(0),
  shippingCost: z.number().min(0).default(0),
  costBasis: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(1).default(0),
  listingId: z.string().uuid().optional(),
});

export const publishListingSchema = z.object({
  listingId: z.string().uuid(),
  price: z.number().positive(),
  format: z.enum(["fixed_price", "auction"]).default("fixed_price"),
});
