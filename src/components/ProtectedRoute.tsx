import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import type { AppRole } from "@/types/db";

export function ProtectedRoute({ children, requireRole }: { children: ReactNode; requireRole?: AppRole }) {
  const { user, role, loading } = useAuth();
  const { role: demoRole } = useDemo();
  const location = useLocation();

  // DEMO BYPASS: durante construção, permite ver as interfaces sem login real.
  if (demoRole) {
    if (requireRole && demoRole !== requireRole) {
      return <Navigate to={demoRole === "trainer" ? "/pt" : "/app"} replace />;
    }
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;

  if (requireRole && role && role !== requireRole) {
    return <Navigate to={role === "trainer" ? "/pt" : "/app"} replace />;
  }
  return <>{children}</>;
}
