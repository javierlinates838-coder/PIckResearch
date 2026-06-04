import { InventoryBoard } from "@/components/inventory/inventory-board";

export const metadata = {
  title: "Inventory",
};

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
        <p className="text-sm text-[var(--muted)]">
          Search and track drafts, listed, sold, and shipped items.
        </p>
      </div>
      <InventoryBoard />
    </div>
  );
}
