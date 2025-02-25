import { useAuth } from "@/hooks/use-auth";
import { Redirect, Route } from "wouter";
import Navigation from "@/components/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ProtectedRouteProps {
  path: string;
  component: () => React.JSX.Element;
  requiresAdmin?: boolean;
}

export function ProtectedRoute({
  path,
  component: Component,
  requiresAdmin = false,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
              <LoadingSpinner size="lg" className="text-primary" />
              <p className="text-muted-foreground animate-pulse">Loading...</p>
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/auth" />;
        }

        if (requiresAdmin && user.role !== 'admin') {
          return <Redirect to="/" />;
        }

        return requiresAdmin ? (
          <Component />
        ) : (
          <>
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              <Component />
            </main>
          </>
        );
      }}
    </Route>
  );
}