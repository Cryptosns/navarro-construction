import { PageHeader } from "@/components/dashboard/page-header";

export default function AssistantPage() {
  return (
    <>
      <PageHeader
        title="AI Assistant"
        description="Chat with Dave on the right panel — ask about projects, budgets, materials and tasks."
      />
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-blue-100 text-2xl">
            🤖
          </div>
          <h2 className="mt-4 text-lg font-semibold text-zinc-900">
            Dave is ready to help
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Use the panel on the right to type or tap the microphone to speak.
            Try asking about active projects or budget alerts.
          </p>
        </div>
      </main>
    </>
  );
}
