import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Movie } from "@shared/schema";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, StarHalf, Clock, Calendar, Award, Languages, Play, Heart, BookmarkPlus, MessageSquare, Share2, Flag } from "lucide-react";
import { apiRequest } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

interface MovieWithUserInteractions extends Movie {
  isLiked?: boolean;
  isInWatchlist?: boolean;
  averageRating?: number;
}

const Rating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
      ))}
      {hasHalfStar && <StarHalf className="w-4 h-4 fill-yellow-500 text-yellow-500" />}
      {[...Array(5 - Math.ceil(rating))].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-400" />
      ))}
      <span className="ml-1 text-sm text-white/70">{rating.toFixed(1)}</span>
    </div>
  );
};

export default function MovieDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: movie, isLoading } = useQuery<MovieWithUserInteractions>({
    queryKey: ["/api/movies", id],
  });

  const likeMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/movies/${id}/like`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/movies", id] }),
  });

  const watchlistMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/movies/${id}/watchlist`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({
        title: "Added to watchlist",
        description: "This movie has been added to your watchlist",
      });
    },
  });

  if (isLoading || !movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-[70vh]">
        <img
          src={movie.thumbnailUrl || "/placeholder-movie.jpg"}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="flex gap-8">
              {/* Poster */}
              <div className="flex-shrink-0 w-64 aspect-[2/3] rounded-lg overflow-hidden border-2 border-white/10">
                <img
                  src={movie.thumbnailUrl || "/placeholder-movie.jpg"}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <h1 className="text-4xl font-bold">{movie.title}</h1>

                <div className="flex flex-wrap gap-2">
                  {movie.metadata?.genre?.map((genre) => (
                    <Badge key={genre} variant="outline" className="border-purple-500/50">
                      {genre}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-sm text-white/70">
                  {movie.metadata?.releaseYear && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {movie.metadata.releaseYear}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {Math.floor(movie.duration / 60)}m
                  </span>
                  {movie.metadata?.language && (
                    <span className="flex items-center gap-1">
                      <Languages className="w-4 h-4" />
                      {movie.metadata.language.toUpperCase()}
                    </span>
                  )}
                  {movie.metadata?.contentRating && (
                    <Badge variant="outline" className="border-white/20">
                      {movie.metadata.contentRating}
                    </Badge>
                  )}
                </div>

                {movie.averageRating && (
                  <div className="flex items-center gap-2">
                    <Rating rating={movie.averageRating} />
                    <span className="text-sm text-white/50">
                      ({movie.totalRatings} ratings)
                    </span>
                  </div>
                )}

                <p className="text-lg text-white/90 max-w-2xl">
                  {movie.description}
                </p>

                <div className="flex gap-2 pt-4">
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                    <Play className="w-5 h-5 mr-2" />
                    Play
                  </Button>

                  {movie.metadata?.trailerUrl && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-purple-500/50 text-purple-500 hover:bg-purple-500/10"
                      onClick={() => setLocation(`/movies/${id}/trailer`)}
                    >
                      Watch Trailer
                    </Button>
                  )}

                  <Button
                    size="icon"
                    variant="outline"
                    className="border-purple-500/50"
                    onClick={() => likeMutation.mutate()}
                  >
                    <Heart
                      className="w-5 h-5"
                      fill={movie.isLiked ? "currentColor" : "none"}
                    />
                  </Button>

                  <Button
                    size="icon"
                    variant="outline"
                    className="border-purple-500/50"
                    onClick={() => watchlistMutation.mutate()}
                  >
                    <BookmarkPlus className="w-5 h-5" />
                  </Button>

                  <Button
                    size="icon"
                    variant="outline"
                    className="border-purple-500/50"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>

                  <Button
                    size="icon"
                    variant="outline"
                    className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                  >
                    <Flag className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cast & Crew */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Cast & Crew</h2>
            {movie.metadata?.cast?.map((actor) => (
              <div key={actor} className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-white/10" />
                <span>{actor}</span>
              </div>
            ))}
            {movie.metadata?.director && (
              <div className="mt-4">
                <h3 className="text-sm text-white/50">Director</h3>
                <p>{movie.metadata.director}</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Details</h2>
            {movie.metadata?.productionStudio && (
              <div className="mb-2">
                <h3 className="text-sm text-white/50">Production Studio</h3>
                <p>{movie.metadata.productionStudio}</p>
              </div>
            )}
            {movie.metadata?.awards?.length > 0 && (
              <div className="mb-2">
                <h3 className="text-sm text-white/50">Awards</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.metadata.awards.map((award) => (
                    <Badge key={award} className="bg-yellow-500/20 text-yellow-500">
                      <Award className="w-3 h-3 mr-1" />
                      {award}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Stats</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/50">Views</span>
                <span>{movie.views?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Likes</span>
                <span>{movie.likes?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Average Watch Time</span>
                <span>{Math.floor(movie.averageWatchTime / 60)}m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
