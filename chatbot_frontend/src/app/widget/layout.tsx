export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ihub-flex ihub-flex-col ihub-min-h-screen ihub-max-h-screen ihub-overflow-hidden">
      {children}
    </div>
  );
}
