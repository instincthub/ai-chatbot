import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/lib/hooks/useAuth";
import { signOut } from "next-auth/react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <MainLayoutContent>{children}</MainLayoutContent>
    </ProtectedRoute>
  );
}

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const { session, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="ihub-flex ihub-min-h-screen ihub-flex-col">
      <header className="ihub-bg-blue-600 ihub-text-white ihub-p-4">
        <div className="ihub-container ihub-mx-auto ihub-flex ihub-justify-between ihub-items-center">
          <h1 className="ihub-text-xl ihub-font-bold">Support Chatbot Admin</h1>
          <nav className="ihub-flex ihub-items-center ihub-gap-4">
            <span className="ihub-text-sm">
              Welcome, {session?.user?.firstName || session?.user?.username}
            </span>
            <button
              onClick={handleLogout}
              className="ihub-bg-red-500 hover:ihub-bg-red-600 ihub-px-4 ihub-py-2 ihub-rounded ihub-text-sm ihub-transition-colors"
            >
              Logout
            </button>
          </nav>
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
