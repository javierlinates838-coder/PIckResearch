"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, TrendingUp, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function DashboardHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="space-y-3">
        <p className="text-sm font-medium text-[var(--accent)]">eBay Reseller Assistant</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          List faster.
          <br />
          <span className="text-[var(--muted)]">Profit smarter.</span>
        </h1>
        <p className="max-w-xl text-base text-[var(--muted)]">
          AI identifies your items, researches sold comps, generates SEO listings, enhances photos,
          and publishes to eBay — all in one flow.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/listings/new">
            <Button size="lg">
              <Camera className="h-4 w-4" />
              Start listing
            </Button>
          </Link>
          <Link href="/inventory">
            <Button variant="secondary" size="lg">
              View inventory
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Camera,
            title: "Photo → Product ID",
            desc: "Upload 1–10 photos. AI extracts brand, model, condition & category with confidence.",
          },
          {
            icon: TrendingUp,
            title: "Market research",
            desc: "Sold comps, pricing tiers, and trend detection from eBay data.",
          },
          {
            icon: Zap,
            title: "One-click publish",
            desc: "SEO title, description, specifics, enhanced photos, profit calc, then list.",
          },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.4 }}
          >
            <Card className="h-full">
              <item.icon className="mb-3 h-6 w-6 text-[var(--accent)]" />
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{item.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
