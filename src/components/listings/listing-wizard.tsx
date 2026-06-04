"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Search,
  FileText,
  Sparkles,
  DollarSign,
  Upload,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type {
  Listing,
  ListingCopy,
  MarketResearch,
  PricingRecommendation,
  ProductIdentification,
  ProfitBreakdown,
} from "@/types/reseller";

const STEPS = [
  { id: "photos", label: "Photos", icon: Camera },
  { id: "identify", label: "Identify", icon: Sparkles },
  { id: "research", label: "Research", icon: Search },
  { id: "listing", label: "Listing", icon: FileText },
  { id: "enhance", label: "Enhance", icon: Sparkles },
  { id: "profit", label: "Profit", icon: DollarSign },
  { id: "publish", label: "Publish", icon: Upload },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export function ListingWizard() {
  const [step, setStep] = useState<StepId>("photos");
  const [listingId, setListingId] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [identification, setIdentification] = useState<ProductIdentification | null>(null);
  const [market, setMarket] = useState<MarketResearch | null>(null);
  const [pricing, setPricing] = useState<PricingRecommendation | null>(null);
  const [listingCopy, setListingCopy] = useState<ListingCopy | null>(null);
  const [profit, setProfit] = useState<ProfitBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishPrice, setPublishPrice] = useState("");
  const [listing, setListing] = useState<Listing | null>(null);

  const [costBasis, setCostBasis] = useState("0");
  const [shippingCost, setShippingCost] = useState("8.5");
  const [taxRate, setTaxRate] = useState("0");

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const readFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files).slice(0, 10);
    list.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          setImages((prev) => [...prev, result].slice(0, 10));
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  async function ensureListing() {
    if (listingId) return listingId;
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message ?? "Failed to create listing");
    setListingId(json.data.id);
    return json.data.id as string;
  }

  async function runIdentify() {
    setLoading(true);
    setError(null);
    try {
      const id = await ensureListing();
      await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photos: images.map((url, i) => ({ id: `p-${i}`, url, isPrimary: i === 0 })),
        }),
      });
      const res = await fetch("/api/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, listingId: id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Analysis failed");
      setIdentification(json.data.identification);
      setStep("identify");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  async function runResearch() {
    if (!identification) return;
    setLoading(true);
    setError(null);
    try {
      const id = listingId ?? (await ensureListing());
      const query = `${identification.brand} ${identification.model} ${identification.color}`;
      const res = await fetch("/api/market-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, listingId: id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Research failed");
      setMarket(json.data.market);
      setPricing(json.data.pricing);
      setPublishPrice(String(json.data.pricing.market));
      setStep("research");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Research failed");
    } finally {
      setLoading(false);
    }
  }

  async function runGenerate() {
    setLoading(true);
    setError(null);
    try {
      const id = listingId ?? (await ensureListing());
      const res = await fetch("/api/generate-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Generation failed");
      setListingCopy(json.data.listingCopy);
      setStep("listing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function runEnhance() {
    if (!images[0]) return;
    setLoading(true);
    setError(null);
    try {
      const id = listingId ?? (await ensureListing());
      const res = await fetch("/api/enhance-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: images[0], listingId: id, photoId: "p-0" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Enhance failed");
      setImages((prev) => [json.data.enhancedUrl, ...prev.slice(1)]);
      setStep("enhance");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enhance failed");
    } finally {
      setLoading(false);
    }
  }

  async function runProfit() {
    setLoading(true);
    setError(null);
    try {
      const id = listingId ?? (await ensureListing());
      const salePrice = Number(publishPrice) || market?.suggestedBinPrice || 0;
      const res = await fetch("/api/profit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salePrice,
          shippingCost: Number(shippingCost),
          costBasis: Number(costBasis),
          taxRate: Number(taxRate),
          listingId: id,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Profit calc failed");
      setProfit(json.data.profit);
      setStep("profit");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Profit calc failed");
    } finally {
      setLoading(false);
    }
  }

  async function runPublish() {
    setLoading(true);
    setError(null);
    try {
      const id = listingId ?? (await ensureListing());
      const res = await fetch("/api/ebay/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: id,
          price: Number(publishPrice),
          format: "fixed_price",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Publish failed");
      setListing(json.data.listing);
      setStep("publish");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-1 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
              i <= stepIndex
                ? "bg-[var(--accent)] text-white"
                : "bg-black/5 text-[var(--muted)] dark:bg-white/10"
            }`}
          >
            <s.icon className="h-3.5 w-3.5" />
            {s.label}
          </div>
        ))}
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.25 }}
        >
          {step === "photos" && (
            <Card>
              <CardHeader
                eyebrow="Step 1"
                title="Upload photos"
                description="1–10 images. AI will identify product details."
              />
              <label className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--card-border)] bg-black/[0.02] transition hover:border-[var(--accent)] dark:bg-white/[0.02]">
                <Camera className="mb-2 h-8 w-8 text-[var(--muted)]" />
                <span className="text-sm font-medium">Tap to upload or drag photos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => readFiles(e.target.files)}
                />
              </label>
              {images.length > 0 ? (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {images.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`Upload ${i + 1}`}
                      className="aspect-square rounded-xl object-cover"
                    />
                  ))}
                </div>
              ) : null}
              <div className="mt-4 flex justify-end">
                <Button disabled={!images.length || loading} onClick={runIdentify}>
                  {loading ? <Spinner /> : null}
                  Analyze with AI
                </Button>
              </div>
            </Card>
          )}

          {step === "identify" && identification && (
            <Card>
              <CardHeader
                eyebrow="Step 2"
                title="Product identification"
                description="Review AI-detected attributes"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Product", identification.product],
                  ["Brand", identification.brand],
                  ["Model", identification.model],
                  ["Color", identification.color],
                  ["Condition", identification.condition],
                  ["Category", identification.category],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-black/5 p-3 dark:bg-white/5">
                    <p className="text-xs text-[var(--muted)]">{k}</p>
                    <p className="text-sm font-medium">{v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Badge tone="accent">
                  Confidence: {Math.round(identification.confidence * 100)}%
                </Badge>
                {identification.notes ? (
                  <span className="text-xs text-[var(--muted)]">{identification.notes}</span>
                ) : null}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setStep("photos")}>
                  Back
                </Button>
                <Button disabled={loading} onClick={runResearch}>
                  {loading ? <Spinner /> : null}
                  Run market research
                </Button>
              </div>
            </Card>
          )}

          {step === "research" && market && pricing && (
            <Card>
              <CardHeader
                eyebrow="Step 3"
                title="Market research"
                description={
                  market.source === "mock"
                    ? "Demo comps — connect eBay API for live sold data"
                    : "Live eBay sold comps"
                }
              />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-[var(--muted)]">Avg sold</p>
                  <p className="text-lg font-semibold">${market.avgSoldPrice}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">High / Low</p>
                  <p className="text-lg font-semibold">
                    ${market.highestSoldPrice} / ${market.lowestSoldPrice}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">Sold count</p>
                  <p className="text-lg font-semibold">{market.soldCount}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">Trend</p>
                  <Badge
                    tone={
                      market.trend === "rising"
                        ? "success"
                        : market.trend === "falling"
                          ? "warning"
                          : "muted"
                    }
                  >
                    {market.trend}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[var(--card-border)] p-3">
                  <p className="text-xs text-[var(--muted)]">Aggressive</p>
                  <p className="text-xl font-semibold">${pricing.aggressive}</p>
                </div>
                <div className="rounded-2xl border-2 border-[var(--accent)] p-3">
                  <p className="text-xs text-[var(--muted)]">Market</p>
                  <p className="text-xl font-semibold">${pricing.market}</p>
                </div>
                <div className="rounded-2xl border border-[var(--card-border)] p-3">
                  <p className="text-xs text-[var(--muted)]">Quick sale</p>
                  <p className="text-xl font-semibold">${pricing.quickSale}</p>
                </div>
              </div>
              {pricing.opportunity ? (
                <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
                  {pricing.opportunity}
                </p>
              ) : null}
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setStep("identify")}>
                  Back
                </Button>
                <Button disabled={loading} onClick={runGenerate}>
                  {loading ? <Spinner /> : null}
                  Generate listing
                </Button>
              </div>
            </Card>
          )}

          {step === "listing" && listingCopy && (
            <Card>
              <CardHeader eyebrow="Step 4" title="AI listing copy" />
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[var(--muted)]">Title ({listingCopy.title.length}/80)</p>
                  <p className="font-medium">{listingCopy.title}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">Description</p>
                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-2xl bg-black/5 p-3 text-xs dark:bg-white/5">
                    {listingCopy.description}
                  </pre>
                </div>
                <div className="flex flex-wrap gap-1">
                  {listingCopy.keywords.map((k) => (
                    <Badge key={k}>{k}</Badge>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setStep("research")}>
                  Back
                </Button>
                <Button disabled={loading} onClick={runEnhance}>
                  {loading ? <Spinner /> : null}
                  Enhance photos
                </Button>
              </div>
            </Card>
          )}

          {step === "enhance" && (
            <Card>
              <CardHeader
                eyebrow="Step 5"
                title="Photo enhanced"
                description="White background applied (PhotoRoom when configured)"
              />
              {images[0] ? (
                <img
                  src={images[0]}
                  alt="Enhanced"
                  className="mx-auto max-h-64 rounded-2xl object-contain"
                />
              ) : null}
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setStep("listing")}>
                  Back
                </Button>
                <Button onClick={() => setStep("profit")}>Calculate profit</Button>
              </div>
            </Card>
          )}

          {step === "profit" && (
            <Card>
              <CardHeader eyebrow="Step 6" title="Profit calculator" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-[var(--muted)]">Sale price</label>
                  <Input
                    type="number"
                    value={publishPrice}
                    onChange={(e) => setPublishPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--muted)]">Cost basis</label>
                  <Input value={costBasis} onChange={(e) => setCostBasis(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-[var(--muted)]">Shipping cost</label>
                  <Input
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--muted)]">Tax rate (0–1)</label>
                  <Input value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
                </div>
              </div>
              {profit ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-emerald-500/10 p-3">
                    <p className="text-xs text-[var(--muted)]">Net profit</p>
                    <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                      ${profit.netProfit}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-black/5 p-3 dark:bg-white/5">
                    <p className="text-xs text-[var(--muted)]">eBay fees</p>
                    <p className="text-xl font-semibold">${profit.ebayFees}</p>
                  </div>
                  <div className="rounded-2xl bg-black/5 p-3 dark:bg-white/5">
                    <p className="text-xs text-[var(--muted)]">ROI</p>
                    <p className="text-xl font-semibold">{profit.roiPct}%</p>
                  </div>
                </div>
              ) : null}
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setStep("enhance")}>
                  Back
                </Button>
                <Button disabled={loading} onClick={profit ? () => setStep("publish") : runProfit}>
                  {loading ? <Spinner /> : profit ? "Continue" : "Calculate"}
                </Button>
              </div>
            </Card>
          )}

          {step === "publish" && (
            <Card>
              <CardHeader eyebrow="Step 7" title="Publish to eBay" />
              {listing?.ebayListingUrl ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-5 w-5" />
                  <span>Listing published!</span>
                  <a
                    href={listing.ebayListingUrl}
                    className="text-sm underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View listing
                  </a>
                </div>
              ) : (
                <>
                  <Input
                    type="number"
                    value={publishPrice}
                    onChange={(e) => setPublishPrice(e.target.value)}
                    placeholder="Listing price"
                  />
                  <div className="mt-4 flex justify-end">
                    <Button disabled={loading || !publishPrice} onClick={runPublish}>
                      {loading ? <Spinner /> : <Upload className="h-4 w-4" />}
                      Publish listing
                    </Button>
                  </div>
                </>
              )}
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
