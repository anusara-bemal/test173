import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Settings as SettingsIcon, BarChart3, Film } from "lucide-react";
import { Loader2 } from "lucide-react";
import * as React from 'react';

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

// Lazy load components
const AnalyticsDashboard = React.lazy(() => import('@/components/admin/analytics-dashboard'));
const UserManagement = React.lazy(() => import('@/components/admin/user-management'));
const ContentModerationComponent = React.lazy(() => import('@/components/admin/content-moderation'));
const SystemSettingsComponent = React.lazy(() => import('@/components/admin/system-settings'));

export default function AdminPage() {
  const { user } = useAuth();
  const pathname = window.location.pathname;
  const activeTab = pathname.split("/")[2] || "dashboard";

  // Debug user role and permissions
  console.log("Current user:", user);

  // Check for admin role only
  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-6 max-w-md">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
          <pre className="mt-4 p-2 bg-muted rounded text-sm">
            {JSON.stringify({ role: user?.role }, null, 2)}
          </pre>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Tabs value={activeTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="content">
            <Film className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <React.Suspense fallback={<LoadingFallback />}>
            <AnalyticsDashboard />
          </React.Suspense>
        </TabsContent>

        <TabsContent value="users">
          <React.Suspense fallback={<LoadingFallback />}>
            <UserManagement />
          </React.Suspense>
        </TabsContent>

        <TabsContent value="content">
          <React.Suspense fallback={<LoadingFallback />}>
            <ContentModerationComponent />
          </React.Suspense>
        </TabsContent>

        <TabsContent value="settings">
          <React.Suspense fallback={<LoadingFallback />}>
            <SystemSettingsComponent />
          </React.Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}