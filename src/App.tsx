import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { MainApp } from "./MainApp";
import { Login } from "./pages/Login";

/**
 * AppGate handles authentication-based routing and initialization.
 * If the user is unauthenticated, the app reliably presents the Login component
 * without mounting MainApp or attempting any redundant background synchronization.
 */
function AppGate() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center space-y-3">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-300">Loading Teacher Resource Hub...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <MainApp initialUser={user} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  );
}

// Re-export MainApp for modularity and backwards compatibility
export { MainApp };
