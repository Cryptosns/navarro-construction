import { PageHeader } from "@/components/dashboard/page-header";
import { ReceiptsList } from "@/components/dashboard/receipts-list";
import { createClient } from "@/lib/supabase/server";

export default async function ReceiptsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .order("created_at", { ascending: false });

  const usingMockData = Boolean(error || !data?.length);

  const receipts = usingMockData
    ? (await import("@/lib/mock-data")).receipts
    : (data ?? []).map((row) => ({
        id: row.id,
        vendor: row.vendor,
        project: row.project,
        amount: Number(row.amount),
        category: row.category,
        date: row.date,
        status: row.status,
        fileName: row.file_name ?? undefined,
      }));

  return (
    <>
      <PageHeader
        title="Upload Receipts"
        description="Upload, edit and track expense receipts by project."
      />
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <ReceiptsList receipts={receipts} usingMockData={usingMockData} />
      </main>
    </>
  );
}
