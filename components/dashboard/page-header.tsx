type PageHeaderProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-zinc-200 bg-white px-8 py-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>
      {action}
    </header>
  );
}
