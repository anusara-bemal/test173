import { useState } from "react";
import { Movie } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ReactPlayer from "react-player";

interface MoviePlayerProps {
  movie: Movie;
}

export default function MoviePlayer({ movie }: MoviePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async () => {
    if (!isPlaying) {
      setIsPlaying(true);
      try {
        await apiRequest("POST", `/api/movies/${movie.id}/view`);
        queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      } catch (error) {
        console.error("Failed to record view:", error);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="aspect-video rounded-lg overflow-hidden mb-4">
          <ReactPlayer
            url={movie.videoUrl}
            width="100%"
            height="100%"
            controls
            onPlay={handlePlay}
          />
        </div>
        <h1 className="text-2xl font-bold mb-2">{movie.title}</h1>
        <p className="text-muted-foreground mb-4">{movie.description}</p>
        <div className="flex flex-wrap gap-2">
          {movie.metadata?.genre?.map((genre) => (
            <Badge key={genre} variant="outline">
              {genre}
            </Badge>
          ))}
          {movie.metadata?.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
