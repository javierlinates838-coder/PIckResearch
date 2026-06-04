"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardHeader } from "@/components/ui/card";
import { Metric } from "@/components/ui/metric";
import { Spinner } from "@/components/ui/spinner";
import type { AnalyticsSummary } from "@/types/reseller";

export function AnalyticsDashboard() {
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
      <Card className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </Card>
    );
  }

  if (!data) return null;

  const chartData = data.revenueByMonth.length
    ? data.revenueByMonth
    : [{ month: "N/A", revenue: 0, profit: 0 }];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <Metric label="Total revenue" value={`$${data.totalRevenue}`} />
        </Card>
        <Card>
          <Metric label="Total profit" value={`$${data.totalProfit}`} />
        </Card>
        <Card>
          <Metric label="Avg profit / item" value={`$${data.avgProfitPerItem}`} />
        </Card>
        <Card>
          <Metric label="Sell-through rate" value={`${data.sellThroughRate}%`} />
        </Card>
      </div>

      <Card>
        <CardHeader title="Revenue & profit" description="Last 6 months" />
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="revenue" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="profit" fill="#34c759" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader title="Top categories" description="By revenue" />
        {data.topCategories.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No sold items yet.</p>
        ) : (
          <ul className="space-y-3">
            {data.topCategories.map((cat) => (
              <li
                key={cat.category}
                className="flex items-center justify-between rounded-2xl bg-black/5 px-4 py-3 dark:bg-white/5"
              >
                <div>
                  <p className="font-medium">{cat.category}</p>
                  <p className="text-xs text-[var(--muted)]">{cat.count} items</p>
                </div>
                <p className="font-semibold">${cat.revenue}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
