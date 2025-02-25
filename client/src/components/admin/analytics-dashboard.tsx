import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, Zap, TrendingUp, Film, MessageSquare } from "lucide-react";
import type { AdminStats } from "@/types/admin";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

// Optimized StatCard component with trend indicator
const StatCard = React.memo(({ title, value, icon: Icon, trend, subtext }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  subtext?: string;
}) => (
  <Card className="relative overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="flex items-center space-x-2">
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && (
          <span className={`flex items-center text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            <TrendingUp className={`h-4 w-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </CardContent>
  </Card>
));

// Loading skeleton
const StatCardSkeleton = () => (
  <Card>
    <CardHeader className="space-y-2">
      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
      <div className="h-8 w-32 bg-muted rounded animate-pulse" />
    </CardHeader>
  </Card>
);

// Sample engagement data (replace with real data from API)
const engagementData = [
  { name: "Mon", users: 400, posts: 240, movies: 180 },
  { name: "Tue", users: 300, posts: 139, movies: 220 },
  { name: "Wed", users: 520, posts: 280, movies: 250 },
  { name: "Thu", users: 500, posts: 320, movies: 230 },
  { name: "Fri", users: 600, posts: 400, movies: 280 },
  { name: "Sat", users: 450, posts: 250, movies: 190 },
  { name: "Sun", users: 400, posts: 220, movies: 180 },
];

export default function AnalyticsDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    staleTime: 30000, // Refresh every 30 seconds
    refetchInterval: 30000,
  });

  if (statsLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const config = {
    users: { label: "Users", theme: { light: "#2563eb", dark: "#3b82f6" } },
    posts: { label: "Posts", theme: { light: "#16a34a", dark: "#22c55e" } },
    movies: { label: "Movies", theme: { light: "#dc2626", dark: "#ef4444" } },
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Active Users"
          value={stats.dailyActiveUsers.toLocaleString()}
          icon={Users}
          trend={15}
          subtext="Daily active users"
        />
        <StatCard
          title="Content Engagement"
          value={stats.totalEngagements.toLocaleString()}
          icon={Heart}
          trend={8}
          subtext="Total interactions today"
        />
        <StatCard
          title="System Health"
          value="99.9%"
          icon={Zap}
          subtext="Platform uptime"
        />
        <StatCard
          title="Active Movies"
          value={stats.activeMovies.toLocaleString()}
          icon={Film}
          trend={5}
          subtext="Currently streaming"
        />
        <StatCard
          title="User Posts"
          value={stats.totalPosts.toLocaleString()}
          icon={MessageSquare}
          trend={12}
          subtext="Posts created today"
        />
        <StatCard
          title="Watch Time"
          value={`${stats.averageWatchTime}m`}
          icon={TrendingUp}
          trend={3}
          subtext="Avg. session duration"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-[350px]" config={config}>
            <AreaChart data={engagementData}>
              <defs>
                <linearGradient id="users" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-users)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="posts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-posts)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-posts)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="movies" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-movies)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-movies)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="users"
                name="users"
                stroke="var(--color-users)"
                fillOpacity={1}
                fill="url(#users)"
              />
              <Area
                type="monotone"
                dataKey="posts"
                name="posts"
                stroke="var(--color-posts)"
                fillOpacity={1}
                fill="url(#posts)"
              />
              <Area
                type="monotone"
                dataKey="movies"
                name="movies"
                stroke="var(--color-movies)"
                fillOpacity={1}
                fill="url(#movies)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}