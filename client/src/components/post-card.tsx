import { Post } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  MoreHorizontal,
  ThumbsUp,
  Laugh,
  Angry,
  Frown,
  HeartCrack,
  Download,
  Link2,
  Flag,
  Bookmark,
  Eye,
  Edit,
  History,
  X,
  Send,
  Smile,
  Image as ImageIcon,
  Sticker,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useRef } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Textarea } from "@/components/ui/textarea";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PostCardProps {
  post: Post;
}

type Reaction = 'like' | 'love' | 'haha' | 'sad' | 'angry' | null;

interface Comment {
  id: number;
  content: string;
  userId: number;
  username?: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  attachments?: {
    type: 'image' | 'sticker';
    url: string;
  }[];
}

interface ReactionStats {
  [key: string]: number;
  total: number;
}

export default function PostCard({ post }: PostCardProps) {
  const [reaction, setReaction] = useState<Reaction>(null);
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [comments, setComments] = useState<Comment[]>(Array.isArray(post.comments) ? post.comments : []);
  const { toast } = useToast();
  const { user } = useAuth();
  const isOwner = user?.id === post.userId;

  const reactions: ReactionStats = post.reactions || { total: post.likes || 0 };

  const handleReaction = async (newReaction: Reaction) => {
    try {
      if (reaction) {
        await apiRequest("DELETE", `/api/posts/${post.id}/reaction`);
      }
      if (newReaction && newReaction !== reaction) {
        await apiRequest("POST", `/api/posts/${post.id}/reaction`, { type: newReaction });
      }
      setReaction(newReaction === reaction ? null : newReaction);
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
      toast({
        title: "Success",
        description: newReaction === reaction ? "Reaction removed" : "Reaction added"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive"
      });
    }
  };

  const handleCommentLike = async (commentId: number, isLiked: boolean) => {
    try {
      if (isLiked) {
        await apiRequest("DELETE", `/api/posts/${post.id}/comments/${commentId}/like`);
      } else {
        await apiRequest("POST", `/api/posts/${post.id}/comments/${commentId}/like`);
      }
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                likes: isLiked ? comment.likes - 1 : comment.likes + 1,
                isLiked: !isLiked
              }
            : comment
        )
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleComment = async () => {
    if (!commentText.trim() && selectedFiles.length === 0) return;

    try {
      const formData = new FormData();
      formData.append("content", commentText.trim());

      selectedFiles.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      const response = await apiRequest("POST", `/api/posts/${post.id}/comments`, formData);
      const newComment = await response.json();

      setComments(prev => [...prev, newComment]);
      setCommentText("");
      setSelectedFiles([]);
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });

      toast({
        title: "Success",
        description: "Comment added successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setCommentText(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleShare = async () => {
    try {
      await apiRequest("POST", `/api/posts/${post.id}/share`);
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
      toast({
        title: "Success",
        description: "Post shared successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share post",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    try {
      await apiRequest("POST", `/api/posts/${post.id}/save`);
      toast({
        title: "Success",
        description: "Post saved to your collection"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save post",
        variant: "destructive"
      });
    }
  };

  const handleReport = async () => {
    try {
      await apiRequest("POST", `/api/posts/${post.id}/report`);
      toast({
        title: "Success",
        description: "Post reported successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to report post",
        variant: "destructive"
      });
    }
  };

  const handleHidePost = () => {
    toast({
      title: "Success",
      description: "Post hidden from your feed"
    });
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Success",
      description: "Link copied to clipboard"
    });
  };

  const getReactionIcon = (type: Reaction) => {
    switch (type) {
      case 'like': return <ThumbsUp className="w-4 h-4 text-blue-500" />;
      case 'love': return <Heart className="w-4 h-4 text-red-500" />;
      case 'haha': return <Laugh className="w-4 h-4 text-yellow-500" />;
      case 'sad': return <Frown className="w-4 h-4 text-yellow-500" />;
      case 'angry': return <Angry className="w-4 h-4 text-orange-500" />;
      default: return <ThumbsUp className="w-4 h-4" />;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Card Header */}
      <CardHeader className="flex flex-row items-center gap-4 pb-4">
        <Avatar className="h-10 w-10 ring-2 ring-primary/10">
          <AvatarImage src={`https://avatar.vercel.sh/${post.userId}.png`} />
          <AvatarFallback>{post.username?.[0]?.toUpperCase() || `U${post.userId}`}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{post.username || `User ${post.userId}`}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <time>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</time>
                {post.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {post.location}
                    </span>
                  </>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isOwner ? (
                  <>
                    <DropdownMenuItem className="gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Post
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-red-500">
                      <X className="h-4 w-4" />
                      Delete Post
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={handleSave} className="gap-2">
                      <Bookmark className="h-4 w-4" />
                      Save Post
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleHidePost} className="gap-2">
                      <Eye className="h-4 w-4" />
                      Hide Post
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleReport} className="gap-2 text-red-500">
                      <Flag className="h-4 w-4" />
                      Report Post
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCopyLink} className="gap-2">
                  <Link2 className="h-4 w-4" />
                  Copy Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Card Content */}
      <CardContent className="px-6 pb-4">
        <p className="whitespace-pre-wrap mb-4">{post.content}</p>

        {post.attachments && post.attachments.length > 0 && (
          <div className={`grid gap-2 ${post.attachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} mb-4`}>
            {post.attachments.map((attachment, i) => (
              <div
                key={i}
                className={`rounded-lg overflow-hidden ${
                  post.attachments!.length === 1 ? 'col-span-2' : ''
                }`}
              >
                {attachment.type === "image" ? (
                  <img
                    src={attachment.url}
                    alt="Post attachment"
                    className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-200"
                    style={{ maxHeight: post.attachments!.length === 1 ? '512px' : '256px' }}
                  />
                ) : attachment.type === "video" ? (
                  <video
                    src={attachment.url}
                    controls
                    className="w-full"
                    poster={attachment.thumbnailUrl}
                  />
                ) : null}
              </div>
            ))}
          </div>
        )}

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.hashtags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="hover:bg-secondary/80 cursor-pointer"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      {/* Card Footer */}
      <CardFooter className="px-6 py-3 border-t bg-muted/5 flex flex-col gap-3">
        {/* Reactions */}
        {reactions.total > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex -space-x-1">
              {Object.entries(reactions)
                .filter(([key]) => key !== 'total' && reactions[key] > 0)
                .map(([type], i) => (
                  <div key={type} className="rounded-full bg-background p-1 border">
                    {getReactionIcon(type as Reaction)}
                  </div>
                ))}
            </div>
            <span>{reactions.total} reactions</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between w-full">
          <div className="flex gap-2">
            {/* React Button */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-2 ${reaction ? 'text-primary' : ''}`}
                onMouseEnter={() => setShowReactions(true)}
                onMouseLeave={() => setShowReactions(false)}
                onClick={() => handleReaction('like')}
              >
                {getReactionIcon(reaction)}
                <span>{reaction || 'React'}</span>
              </Button>

              <AnimatePresence>
                {showReactions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: -45 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 flex gap-1 bg-background border rounded-full p-1 shadow-lg z-50"
                    onMouseEnter={() => setShowReactions(true)}
                    onMouseLeave={() => setShowReactions(false)}
                  >
                    {(['like', 'love', 'haha', 'sad', 'angry'] as Reaction[]).map((type) => (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReaction(type);
                        }}
                        className="p-2 rounded-full hover:bg-muted"
                      >
                        {getReactionIcon(type)}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Comment Button */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Comment</span>
            </Button>

            {/* Share Button */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>

          {/* Save Button */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={handleSave}
          >
            <Bookmark className="h-4 w-4" />
            <span>Save</span>
          </Button>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-3 border-t w-full"
            >
              {/* Comment Input */}
              <div className="flex gap-3 mb-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://avatar.vercel.sh/${user?.id}.png`} />
                  <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-col gap-2">
                    <Textarea
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-[60px] resize-none"
                    />

                    {/* Preview selected files */}
                    {selectedFiles.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt="Preview"
                              className="w-20 h-20 object-cover rounded"
                            />
                            <button
                              onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                              className="absolute -top-2 -right-2 bg-background rounded-full p-1 shadow-md hover:bg-destructive/10"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Smile className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Picker
                              data={data}
                              onEmojiSelect={handleEmojiSelect}
                              theme="light"
                              set="apple"
                            />
                          </PopoverContent>
                        </Popover>

                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept="image/*"
                          multiple
                          className="hidden"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>

                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Sticker className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        onClick={handleComment}
                        disabled={!commentText.trim() && selectedFiles.length === 0}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment, i) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://avatar.vercel.sh/${comment.userId}.png`} />
                      <AvatarFallback>
                        {comment.username?.[0]?.toUpperCase() || `U${comment.userId}`}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="font-medium text-sm">
                          {comment.username || `User ${comment.userId}`}
                        </p>
                        <p className="text-sm">{comment.content}</p>

                        {/* Comment Attachments */}
                        {comment.attachments && comment.attachments.length > 0 && (
                          <div className="mt-2 flex gap-2 flex-wrap">
                            {comment.attachments.map((attachment, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={attachment.url}
                                  alt={attachment.type === 'sticker' ? 'Sticker' : 'Attachment'}
                                  className={`rounded ${
                                    attachment.type === 'sticker' ? 'w-12 h-12' : 'w-32 h-32 object-cover'
                                  }`}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <time>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</time>
                        <button
                          className={`hover:text-foreground flex items-center gap-1 ${
                            comment.isLiked ? 'text-primary' : ''
                          }`}
                          onClick={() => handleCommentLike(comment.id, !!comment.isLiked)}
                        >
                          <Heart className={`h-3 w-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                          {comment.likes > 0 && <span>{comment.likes}</span>}
                          Like
                        </button>
                        <button className="hover:text-foreground">Reply</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardFooter>
    </Card>
  );
}