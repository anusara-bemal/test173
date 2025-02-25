import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Post } from "@shared/schema";
import { useLocation } from "wouter";
import PostCard from "@/components/post-card";
import StoryFeed from "@/components/story-feed";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp } from "lucide-react";
import CreatePostForm from "@/components/create-post-form";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

// Mock friends data - replace with actual data from API
const friends = [
  { id: 1, name: "John Doe", status: "online", avatar: "1" },
  { id: 2, name: "Jane Smith", status: "offline", avatar: "2" },
  { id: 3, name: "Mike Johnson", status: "online", avatar: "3" },
  { id: 4, name: "Sarah Wilson", status: "away", avatar: "4" },
  { id: 5, name: "David Brown", status: "online", avatar: "5" },
];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Wait for authentication state to be determined
  if (typeof user === 'undefined') {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500"></div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!user) {
    setLocation("/auth");
    return null;
  }

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts/feed"],
    enabled: !!user // Only fetch posts if user is authenticated
  });

  const filteredPosts = posts.filter((post) =>
    post.content.toLowerCase().includes(search.toLowerCase()) ||
    post.hashtags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="container mx-auto pt-20 px-4">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            {/* Profile Section */}
            <Card className="p-6 rounded-xl bg-[#1A1A1A] border-[#2A2A2A]">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user?.avatarUrl || "https://github.com/shadcn.png"} />
                  <AvatarFallback>{user?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold mb-1 text-white">{user?.username}</h2>
                <p className="text-sm text-gray-400 mb-4">{user?.email}</p>
                <Button onClick={() => setShowCreatePost(true)} className="w-full bg-purple-600 hover:bg-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Post
                </Button>
              </div>
            </Card>

            {/* Trending Section */}
            <Card className="p-6 sticky top-32 rounded-xl mt-6 bg-[#1A1A1A] border-[#2A2A2A]">
              <h3 className="font-semibold mb-4 text-white">Trending</h3>
              <nav className="space-y-3">
                <Button variant="ghost" className="w-full justify-start font-medium text-gray-300 hover:text-white hover:bg-[#2A2A2A]" size="lg">
                  <TrendingUp className="mr-3 h-5 w-5" />
                  Popular Posts
                </Button>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <main className="col-span-12 lg:col-span-6 space-y-6">
            <Card className="overflow-hidden rounded-xl bg-[#1A1A1A] border-[#2A2A2A]">
              <div className="p-4">
                <StoryFeed />
              </div>
            </Card>

            {isLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <Card
                    key={i}
                    className="h-[280px] animate-pulse bg-[#1A1A1A] rounded-xl border-[#2A2A2A]"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                  />
                ))}
                {filteredPosts.length === 0 && (
                  <Card className="p-12 text-center rounded-xl bg-[#1A1A1A] border-[#2A2A2A]">
                    <p className="text-gray-400">
                      No posts found matching your search.
                    </p>
                  </Card>
                )}
              </div>
            )}
          </main>

          {/* Right Sidebar - Friends List */}
          <div className="hidden lg:block lg:col-span-3">
            <Card className="p-6 sticky top-32 rounded-xl bg-[#1A1A1A] border-[#2A2A2A]">
              <h3 className="font-semibold mb-6 text-white">Friends</h3>
              <div className="space-y-4">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-[#2A2A2A] transition-colors">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://avatar.vercel.sh/${friend.avatar}.png`} />
                        <AvatarFallback>{friend.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1A1A1A] ${
                        friend.status === 'online' ? 'bg-green-500' :
                        friend.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{friend.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{friend.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
        <DialogContent className="max-w-md">
          <CreatePostForm onSuccess={() => setShowCreatePost(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}