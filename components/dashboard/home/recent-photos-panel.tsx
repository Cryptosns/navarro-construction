import Link from "next/link";
import type { ProjectPhoto } from "@/lib/types";
import { formatDate } from "@/lib/format";

export function RecentPhotosPanel({ photos }: { photos: ProjectPhoto[] }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-zinc-900">Recent Photos</h2>
        <Link
          href="/dashboard/receipts"
          className="text-xs font-medium text-amber-600 hover:text-amber-700"
        >
          Upload →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {photos.map((photo) => (
          <div key={photo.id} className="group overflow-hidden rounded-lg">
            <div
              className={`flex aspect-square items-center justify-center bg-gradient-to-br ${photo.gradient} text-3xl transition group-hover:scale-105`}
            >
              🏗️
            </div>
            <div className="mt-2">
              <p className="truncate text-xs font-medium text-zinc-900">
                {photo.caption}
              </p>
              <p className="truncate text-xs text-zinc-500">{photo.project}</p>
              <p className="text-xs text-zinc-400">{formatDate(photo.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
