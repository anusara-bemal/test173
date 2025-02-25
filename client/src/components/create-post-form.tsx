import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MapPin, ImagePlus, X } from "lucide-react";
import { useState } from "react";

interface CreatePostFormProps {
  onSuccess?: () => void;
}

export default function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const { toast } = useToast();
  const [attachments, setAttachments] = useState<{ type: string; url: string }[]>([]);

  const form = useForm({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      content: "",
      location: "",
      visibility: "public"
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        console.log("Submitting post data:", { ...data, attachments });
        const response = await apiRequest("POST", "/api/posts", {
          content: data.content,
          location: data.location || null,
          visibility: data.visibility || "public",
          attachments: attachments.length > 0 ? attachments : null
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Post creation failed:", errorText);
          throw new Error(errorText || 'Failed to create post');
        }

        const result = await response.json();
        console.log("Post creation successful:", result);
        return result;
      } catch (error) {
        console.error("Post creation error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
      form.reset();
      setAttachments([]);
      toast({
        title: "Success",
        description: "Post created successfully"
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive"
      });
    }
  });

  const onSubmit = form.handleSubmit((data) => {
    console.log("Form submission data:", data);
    createPostMutation.mutate(data);
  });

  const handleAttachment = (url: string) => {
    const type = url.match(/\.(jpg|jpeg|png|gif)$/i) ? "image" : 
           url.match(/\.(mp4|webm|ogg)$/i) ? "video" : "link";
    setAttachments([...attachments, { type, url }]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="content">What's on your mind?</Label>
        <Textarea
          id="content"
          className="min-h-[100px]"
          {...form.register("content")}
        />
        {form.formState.errors.content && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.content.message}
          </p>
        )}
      </div>

      {attachments.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {attachments.map((attachment, i) => (
            <div key={i} className="relative">
              {attachment.type === "image" ? (
                <img
                  src={attachment.url}
                  alt="Attachment"
                  className="w-full h-32 object-cover rounded-lg"
                />
              ) : attachment.type === "video" ? (
                <video
                  src={attachment.url}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Link attachment</p>
                </div>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => removeAttachment(i)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Add media URL"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const input = e.currentTarget;
              if (input.value) {
                handleAttachment(input.value);
                input.value = "";
              }
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => {
            const url = prompt("Enter media URL:");
            if (url) handleAttachment(url);
          }}
        >
          <ImagePlus className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="location"
            placeholder="Add location"
            className="pl-10"
            {...form.register("location")}
          />
        </div>
        {form.formState.errors.location && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.location.message}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => onSuccess?.()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={createPostMutation.isPending}
        >
          {createPostMutation.isPending ? "Posting..." : "Post"}
        </Button>
      </div>
    </form>
  );
}