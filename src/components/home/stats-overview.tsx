"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { Metric } from "@/components/ui/metric";
import { Spinner } from "@/components/ui/spinner";
import type { AnalyticsSummary } from "@/types/reseller";

export function StatsOverview() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((json) => setData(json.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className="flex items-center justify-center py-12">
        <Spinner />
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Metric label="Revenue" value={`$${data.totalRevenue.toLocaleString()}`} />
        <Metric label="Net profit" value={`$${data.totalProfit.toLocaleString()}`} />
        <Metric
          label="Avg profit / item"
          value={`$${data.avgProfitPerItem.toLocaleString()}`}
        />
        <Metric
          label="Sell-through"
          value={`${data.sellThroughRate}%`}
          hint={`${data.soldCount} sold / ${data.listedCount} listed`}
        />
      </div>
    </Card>
  );
}
