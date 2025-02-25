import { Story } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/utils/api";

export default function StoryFeed() {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stories = [] } = useQuery<Story[]>({
    queryKey: ["/api/stories/feed"],
  });

  const createStoryMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest("POST", "/api/stories", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories/feed"] });
      setShowCreateDialog(false);
      setSelectedFile(null);
      setCaption("");
      toast({
        title: "Story created successfully",
        description: "Your story is now visible to your followers",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating story",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image or video file",
          variant: "destructive",
        });
      }
    }
  };

  const handleCreateStory = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image or video to upload",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("media", selectedFile);
    if (caption) {
      formData.append("caption", caption);
    }

    createStoryMutation.mutate(formData);
  };

  return (
    <>
      <Carousel className="w-full">
        <CarouselContent>
          <CarouselItem className="basis-24">
            <Button
              variant="outline"
              className="w-24 h-24 rounded-xl p-0 border-2 border-primary/20 hover:border-primary/40 transition-colors bg-transparent"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-10 w-10 text-primary/60" />
            </Button>
          </CarouselItem>
          {stories.map((story) => (
            <CarouselItem key={story.id} className="basis-24">
              <button
                className="w-24 h-24 rounded-xl overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors bg-transparent"
                onClick={() => handleStoryClick(story)}
              >
                <img
                  src={story.mediaUrl}
                  alt="Story"
                  className="w-full h-full object-cover"
                />
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* Story Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Upload Media</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="story-media"
                />
                <Label
                  htmlFor="story-media"
                  className="cursor-pointer flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors"
                >
                  {selectedFile ? (
                    <div className="relative w-full h-full">
                      {selectedFile.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <video
                          src={URL.createObjectURL(selectedFile)}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedFile(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-primary/60" />
                      <p className="text-sm text-gray-500">Click to upload image or video</p>
                    </div>
                  )}
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Caption (Optional)</Label>
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption to your story..."
              />
            </div>

            <Button
              onClick={handleCreateStory}
              disabled={!selectedFile || createStoryMutation.isPending}
              className="w-full"
            >
              {createStoryMutation.isPending ? "Creating..." : "Create Story"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Story View Dialog */}
      <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
        <DialogContent className="max-w-2xl p-0">
          {selectedStory && (
            <div className="aspect-square relative">
              {selectedStory.mediaType === "image" ? (
                <img
                  src={selectedStory.mediaUrl}
                  alt="Story"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <video
                  src={selectedStory.mediaUrl}
                  autoPlay
                  muted
                  loop
                  className="w-full h-full object-cover rounded-xl"
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                <div className="flex items-center gap-2">
                  <Avatar />
                  <p className="font-semibold">{selectedStory.userId}</p>
                </div>
                {selectedStory.caption && (
                  <p className="mt-2">{selectedStory.caption}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}