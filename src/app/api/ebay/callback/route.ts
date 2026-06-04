import { exchangeEbayCode } from "@/lib/ebay/client";
import { getAppUrl } from "@/lib/config/providers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const base = getAppUrl();

  if (error || !code) {
    return Response.redirect(`${base}/settings?ebay=error`);
  }

  try {
    await exchangeEbayCode(code);
    return Response.redirect(`${base}/settings?ebay=connected`);
  } catch {
    return Response.redirect(`${base}/settings?ebay=error`);
  }
}
