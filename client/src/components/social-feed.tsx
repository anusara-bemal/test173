import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Post, Comment } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Image, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StoryFeed from "./story-feed";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import PostCard from "./post-card";

interface ProgressEvent {
  loaded: number;
  total?: number;
}

export default function SocialFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newPost, setNewPost] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: posts = [], isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: ["/api/posts/feed"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type here as it's automatically set for FormData
        },
        onUploadProgress: (progressEvent: ProgressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
      setNewPost("");
      setSelectedFiles([]);
      setUploadProgress(0);
      toast({
        title: "Success",
        description: "Your post has been shared!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() && selectedFiles.length === 0) return;

    const formData = new FormData();
    formData.append("content", newPost);

    selectedFiles.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    createPostMutation.mutate(formData);
  };

  const handleLike = (postId: number, isLiked: boolean) => {
    likeMutation.mutate({
      postId,
      action: isLiked ? "unlike" : "like",
    });
  };

  const likeMutation = useMutation({
    mutationFn: async ({ postId, action }: { postId: number; action: "like" | "unlike" }) => {
      if (action === "like") {
        await apiRequest("POST", `/api/posts/${postId}/like`);
      } else {
        await apiRequest("DELETE", `/api/posts/${postId}/like`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      const res = await apiRequest("POST", `/api/posts/${postId}/comments`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
      // queryClient.invalidateQueries({ queryKey: ["/api/posts", selectedPost, "comments"] }); //selectedPost is undefined, commented out as per instructions
    },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Stories Section */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-8"
        >
          <StoryFeed />
        </motion.div>
      </AnimatePresence>

      {/* Create Post */}
      <Card 
        className={`overflow-hidden transition-all duration-200 ${
          isDragging ? 'ring-2 ring-primary' : ''
        }`}
      >
        <form 
          onSubmit={handleSubmit}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                <AvatarImage src={`https://avatar.vercel.sh/${user?.username}.png`} />
                <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="What's on your mind?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="mb-2 resize-none min-h-[100px] bg-muted/50"
                />

                {/* File Preview */}
                <AnimatePresence>
                  {selectedFiles.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-2 gap-2 mb-2"
                    >
                      {selectedFiles.map((file, index) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="relative rounded-lg overflow-hidden"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="w-full h-32 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                            className="absolute top-1 right-1 bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
                          >
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => setSelectedFiles(prev => [...prev, ...Array.from(e.target.files || [])])}
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="hover:bg-primary/5"
                    >
                      <Image className="h-4 w-4 mr-2" />
                      Add Media
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    disabled={createPostMutation.isPending || (!newPost.trim() && selectedFiles.length === 0)}
                    className="px-6"
                  >
                    {createPostMutation.isPending ? (
                      <>
                        <LoadingSpinner className="mr-2 h-4 w-4" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Post
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </form>
      </Card>

      {/* Posts Feed */}
      <AnimatePresence>
        {isLoadingPosts ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <LoadingSpinner size="lg" className="text-primary" />
            <p className="text-muted-foreground animate-pulse">Loading posts...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
            {posts.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}