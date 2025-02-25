import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus2, UserMinus2, Check, X, Search, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface FriendRequest {
  id: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

interface User {
  id: number;
  username: string;
  avatarUrl?: string;
  isFriend: boolean;
  mutualFriends: number;
}

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch friend requests
  const { data: friendRequests = [], isLoading: isLoadingRequests } = useQuery<FriendRequest[]>({
    queryKey: ["/api/friends/requests"],
  });

  // Fetch friends list
  const { data: friends = [], isLoading: isLoadingFriends } = useQuery<User[]>({
    queryKey: ["/api/friends"],
  });

  // Fetch friend suggestions
  const { data: suggestions = [], isLoading: isLoadingSuggestions } = useQuery<User[]>({
    queryKey: ["/api/friends/suggestions"],
  });

  // Search users
  const { data: searchResults = [], isLoading: isSearching } = useQuery<User[]>({
    queryKey: ["/api/users/search", searchQuery],
    enabled: searchQuery.length > 2,
  });

  // Add friend mutation
  const addFriendMutation = useMutation({
    mutationFn: (userId: number) => apiRequest("POST", "/api/friends/requests", { receiverId: userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/suggestions"] });
      toast({
        title: "Friend request sent",
        description: "They will be notified of your request",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error sending friend request",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Handle friend request mutation
  const handleRequestMutation = useMutation({
    mutationFn: ({ requestId, action }: { requestId: number; action: 'accept' | 'reject' }) =>
      apiRequest("PUT", `/api/friends/requests/${requestId}`, { status: action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/suggestions"] });
      toast({
        title: "Friend request updated",
        description: "Your friends list has been updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating friend request",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Remove friend mutation
  const removeFriendMutation = useMutation({
    mutationFn: (friendId: number) => apiRequest("DELETE", `/api/friends/${friendId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/suggestions"] });
      toast({
        title: "Friend removed",
        description: "This person has been removed from your friends list",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error removing friend",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  const LoadingCard = () => (
    <Card className="p-4 bg-[#1A1A1A] border-[#2A2A2A] animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-[#2A2A2A]" />
        <div className="flex-1">
          <div className="h-4 w-24 bg-[#2A2A2A] rounded mb-2" />
          <div className="h-3 w-32 bg-[#2A2A2A] rounded" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#121212] pt-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-[#1A1A1A]">
              <TabsTrigger value="all" className="data-[state=active]:bg-[#2A2A2A]">
                All Friends
              </TabsTrigger>
              <TabsTrigger value="requests" className="data-[state=active]:bg-[#2A2A2A]">
                Friend Requests {friendRequests.length > 0 && `(${friendRequests.length})`}
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="data-[state=active]:bg-[#2A2A2A]">
                Suggestions
              </TabsTrigger>
            </TabsList>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                type="search"
                placeholder="Search Friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[300px] pl-9 bg-[#1A1A1A] border-[#2A2A2A]"
              />
            </div>
          </div>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingFriends || (searchQuery && isSearching) ? (
                Array(6).fill(null).map((_, i) => <LoadingCard key={i} />)
              ) : (searchQuery ? searchResults : friends).map((friend) => (
                <Card key={friend.id} className="p-4 bg-[#1A1A1A] border-[#2A2A2A]">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={friend.avatarUrl} />
                      <AvatarFallback>{friend.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{friend.username}</h3>
                      <p className="text-sm text-white/50">
                        {friend.mutualFriends} mutual friends
                      </p>
                    </div>
                    {friend.isFriend ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFriendMutation.mutate(friend.id)}
                        disabled={removeFriendMutation.isPending}
                      >
                        {removeFriendMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserMinus2 className="h-4 w-4" />
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => addFriendMutation.mutate(friend.id)}
                        disabled={addFriendMutation.isPending}
                      >
                        {addFriendMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserPlus2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            {isLoadingRequests ? (
              Array(3).fill(null).map((_, i) => <LoadingCard key={i} />)
            ) : friendRequests.map((request) => (
              <Card key={request.id} className="p-4 bg-[#1A1A1A] border-[#2A2A2A]">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={request.senderAvatar} />
                    <AvatarFallback>{request.senderName[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{request.senderName}</h3>
                    <p className="text-sm text-white/50">
                      Sent you a friend request
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleRequestMutation.mutate({ requestId: request.id, action: 'accept' })}
                      disabled={handleRequestMutation.isPending}
                    >
                      {handleRequestMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRequestMutation.mutate({ requestId: request.id, action: 'reject' })}
                      disabled={handleRequestMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {!isLoadingRequests && friendRequests.length === 0 && (
              <Card className="p-8 bg-[#1A1A1A] border-[#2A2A2A] text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-white/20" />
                <h3 className="text-white/50">No pending friend requests</h3>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingSuggestions ? (
                Array(6).fill(null).map((_, i) => <LoadingCard key={i} />)
              ) : suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="p-4 bg-[#1A1A1A] border-[#2A2A2A]">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={suggestion.avatarUrl} />
                      <AvatarFallback>{suggestion.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{suggestion.username}</h3>
                      <p className="text-sm text-white/50">
                        {suggestion.mutualFriends} mutual friends
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => addFriendMutation.mutate(suggestion.id)}
                      disabled={addFriendMutation.isPending}
                    >
                      {addFriendMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}