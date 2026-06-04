import { ListingWizard } from "@/components/listings/listing-wizard";

export const metadata = {
  title: "New Listing",
};

export default function NewListingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create listing</h1>
        <p className="text-sm text-[var(--muted)]">
          Upload photos → AI identify → research → generate → enhance → profit → publish
        </p>
      </div>
      <ListingWizard />
    </div>
  );
}
