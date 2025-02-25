import { z } from "zod";

export interface AdminStats {
  totalUsers: number;
  activeMovies: number;
  totalPosts: number;
  activeStories: number;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  totalEngagements: number;
  averageWatchTime: number;
  contentReports: number;
  newUsersToday: number;
  revenueThisMonth: number;
}

export interface PendingContent {
  id: number;
  title?: string;
  content?: string;
  description?: string;
  thumbnailUrl?: string;
  type: 'movie' | 'series' | 'post' | 'comment';
  duration?: number;
  genre?: string[];
  aiTags?: string[];
  reportCount?: number;
  createdAt: string;
  userId: number;
  status: 'pending' | 'approved' | 'rejected';
}

export const contentFilterSchema = z.object({
  searchTerm: z.string(),
  selectedType: z.enum(['all', 'movies', 'posts', 'comments'])
});
