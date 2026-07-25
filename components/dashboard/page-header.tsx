type PageHeaderProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-zinc-200 bg-white px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-5 lg:px-8 lg:py-6">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">{title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
