export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ihub-flex ihub-min-h-screen ihub-flex-col">
      <header className="ihub-bg-blue-600 ihub-text-white ihub-p-4">
        <div className="ihub-container ihub-mx-auto ihub-flex ihub-justify-between ihub-items-center">
          <h1 className="ihub-text-xl ihub-font-bold">Support Chatbot Admin</h1>
          <nav>{/* Nav items will go here */}</nav>
        </div>
      </header>
      <main className="ihub-flex-1 ihub-container ihub-mx-auto ihub-p-4">
        {children}
      </main>
      <footer className="ihub-bg-gray-100 ihub-p-4 ihub-text-center ihub-text-gray-500">
        <div className="ihub-container ihub-mx-auto">
          &copy; {new Date().getFullYear()} Support Chatbot
        </div>
      </footer>
    </div>
  );
}
