export default function DashboardPage() {
  return (
    <>
      <aside className="hidden md:block w-64 border-r border-border shrink-0 p-4">
        <h2 className="text-muted-foreground text-sm font-medium">Sidebar</h2>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <h2 className="text-muted-foreground text-sm font-medium">Main</h2>
      </main>
    </>
  );
}
