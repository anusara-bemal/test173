import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";

import HomePage from "@/pages/home-page";
import AdminPage from "@/pages/admin-page";
import AuthPage from "@/pages/auth-page";
import MoviesPage from "@/pages/movies-page";
import ReelsPage from "@/pages/reels-page";
import FriendsPage from "@/pages/friends-page";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/navigation";
import AdminLayout from "@/components/admin-layout";
import { ProtectedRoute } from "./lib/protected-route";

interface AdminRouteProps {
  component: React.ComponentType<any>;
  path: string;
}

function AdminRoute({ component: Component, path }: AdminRouteProps) {
  return (
    <Route
      path={path}
      component={() => (
        <AdminLayout>
          <Component />
        </AdminLayout>
      )}
    />
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/movies" component={MoviesPage} />
      <ProtectedRoute path="/movies/:id" component={MoviesPage} />
      <ProtectedRoute path="/reels" component={ReelsPage} />
      <ProtectedRoute path="/friends" component={FriendsPage} />
      <AdminRoute path="/admin" component={AdminPage} />
      <AdminRoute path="/admin/:page" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const showNavigation = location !== "/auth";

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {showNavigation && <Navigation />}
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;