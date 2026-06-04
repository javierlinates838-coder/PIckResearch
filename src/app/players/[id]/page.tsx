import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DfsPlayerDetail } from "@/components/players/dfs-player-detail";
import { getDfsResearch } from "@/lib/repositories/research";

export const metadata: Metadata = {
  title: "Player DFS Prop Research",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const research = await getDfsResearch(id);

  if (!research) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <DfsPlayerDetail research={research} />
    </div>
  );
}
