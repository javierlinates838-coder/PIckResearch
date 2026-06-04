import type { ProviderStatus } from "@/types/reseller";

export function getProviderStatus(): ProviderStatus {
  return {
    supabase: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
    openai: Boolean(process.env.OPENAI_API_KEY),
    ebay: Boolean(process.env.EBAY_APP_ID && process.env.EBAY_CERT_ID),
    photoroom: Boolean(process.env.PHOTOROOM_API_KEY),
  };
}

export function isEbaySandbox() {
  return (process.env.EBAY_ENV ?? "sandbox") !== "production";
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
