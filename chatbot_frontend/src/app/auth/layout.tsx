export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ihub-flex ihub-min-h-screen ihub-flex-col ihub-items-center ihub-justify-center ihub-bg-gray-50">
      <div className="ihub-w-full ihub-max-w-md ihub-p-8 ihub-bg-white ihub-rounded-lg ihub-shadow-lg">
        {children}
      </div>
    </div>
  );
}
