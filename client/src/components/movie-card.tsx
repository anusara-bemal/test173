import { Movie } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, Play } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
  onClick?: () => void;
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-300"
      onClick={onClick}
    >
      <CardHeader className="relative p-0">
        <div className="relative">
          <img
            src={movie.thumbnailUrl || ''}
            alt={movie.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          {/* Dark overlay and play button on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
            <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
          </div>
          <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded-md text-white text-sm flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {Math.floor(movie.duration / 60)}:{(movie.duration % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg mb-2">{movie.title}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {movie.description}
        </p>
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <Eye className="w-4 h-4 mr-1" />
          {movie.views} views
        </div>
        <div className="flex gap-2">
          {movie.metadata?.genre?.slice(0, 2).map((genre) => (
            <Badge key={genre} variant="secondary">
              {genre}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}