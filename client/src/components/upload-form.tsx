import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMovieSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function UploadForm() {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertMovieSchema)
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/movies", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      form.reset();
      toast({
        title: "Success",
        description: "Movie uploaded successfully and pending review"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = form.handleSubmit((data) => {
    uploadMutation.mutate(data);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...form.register("title")} />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...form.register("description")} />
      </div>

      <div>
        <Label htmlFor="videoUrl">Video URL</Label>
        <Input id="videoUrl" {...form.register("videoUrl")} />
      </div>

      <div>
        <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
        <Input id="thumbnailUrl" {...form.register("thumbnailUrl")} />
      </div>

      <div>
        <Label htmlFor="duration">Duration (seconds)</Label>
        <Input
          id="duration"
          type="number"
          {...form.register("duration", { valueAsNumber: true })}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={uploadMutation.isPending}
      >
        Upload Movie
      </Button>
    </form>
  );
}
