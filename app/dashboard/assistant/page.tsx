import { PageHeader } from "@/components/dashboard/page-header";
import { AiChat } from "@/components/dashboard/ai-chat";

export default function AssistantPage() {
  return (
    <>
      <PageHeader
        title="AI Assistant"
        description="Ask about your projects and get smart recommendations."
      />
      <div className="flex-1 overflow-hidden">
        <AiChat />
      </div>
    </>
  );
}
