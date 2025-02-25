import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Movie } from "@shared/schema";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { CarouselItem, Carousel, CarouselContent, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Search, ChevronRight, Loader2, Play, Info, Heart, BookmarkPlus, MessageSquare, Settings2, Flag, Upload, Filter, Clapperboard, Star, StarHalf, Clock, Calendar, Award, Languages } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/utils/api";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface MovieWithUserInteractions extends Movie {
  isLiked?: boolean;
  isInWatchlist?: boolean;
  averageRating?: number;
}

type SortType = "latest" | "popular" | "rating";
type ContentType = "all" | "movie" | "series";

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

const ContinueWatching = ({ history }: { history: any[] }) => {
  const [, setLocation] = useLocation();
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Continue Watching</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {history.map((item) => (
          <div key={item.movieId} className="relative aspect-video bg-black/20 rounded-lg overflow-hidden group">
            <img
              src={item.movie.thumbnailUrl}
              alt={item.movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h4 className="text-sm font-medium truncate">{item.movie.title}</h4>
              <Progress value={(item.lastPosition / item.movie.duration) * 100} className="h-1 mt-2" />
            </div>
            <Button
              className="absolute inset-0 m-auto w-12 h-12 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setLocation(`/movies/${item.movieId}?t=${item.lastPosition}`)}
            >
              <Play className="w-6 h-6" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const MovieStories = ({ movies }: { movies: MovieWithUserInteractions[] }) => {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-6 overflow-x-auto pb-4 hide-scrollbar">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="flex-shrink-0 cursor-pointer group"
            onClick={() => setLocation(`/movies/${movie.id}`)}
          >
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500 p-0.5 relative">
              <img
                src={movie.thumbnailUrl || "/placeholder-movie.jpg"}
                alt={movie.title}
                className="w-full h-full object-cover rounded-full transform transition-transform duration-300 group-hover:scale-110"
              />
              {movie.metadata?.type === "series" && (
                <div className="absolute bottom-0 right-0 bg-purple-600 text-white text-xs px-1 rounded">
                  TV
                </div>
              )}
            </div>
            <p className="text-xs text-center mt-2 text-white/70 truncate w-24">
              {movie.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function MoviesPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<ContentType>("all");
  const [selectedSort, setSelectedSort] = useState<SortType>("latest");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: movies = [], isLoading, error } = useQuery<MovieWithUserInteractions[]>({
    queryKey: ["/api/movies"],
  });

  const { data: watchHistory = [] } = useQuery({
    queryKey: ["/api/movies/watch-history"],
  });

  const likeMutation = useMutation({
    mutationFn: (movieId: number) => apiRequest("POST", `/api/movies/${movieId}/like`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/movies"] }),
  });

  const watchlistMutation = useMutation({
    mutationFn: (movieId: number) => apiRequest("POST", `/api/movies/${movieId}/watchlist`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] }),
  });

  const rateMutation = useMutation({
    mutationFn: ({ movieId, rating, review }: { movieId: number; rating: number; review?: string }) =>
      apiRequest("POST", `/api/movies/${movieId}/rate`, { rating, review }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      toast({
        title: "Rating submitted",
        description: "Thank you for rating this movie!",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          <div className="absolute inset-0 animate-pulse blur-xl bg-purple-600/20"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="p-8 bg-black/50 border-red-500/50 backdrop-blur-xl">
          <p className="text-red-500 mb-4">Error loading movies: {(error as Error).message}</p>
          <Button onClick={() => window.location.reload()} className="bg-red-500/20 hover:bg-red-500/30 text-red-500">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  const featuredMovies = movies
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const filteredMovies = movies.filter(movie => {
    if (selectedType !== "all" && movie.metadata?.type !== selectedType) return false;
    if (selectedCategory !== "all" && !movie.metadata?.genre?.includes(selectedCategory)) return false;
    if (selectedYear && movie.metadata?.releaseYear !== selectedYear) return false;
    if (selectedLanguage !== "all" && movie.metadata?.language !== selectedLanguage) return false;
    return true;
  });

  const sortedMovies = [...filteredMovies].sort((a, b) => {
    switch (selectedSort) {
      case "popular":
        return (b.views || 0) - (a.views || 0);
      case "rating":
        return (b.likes || 0) - (a.likes || 0);
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-14 z-40 bg-black/95 backdrop-blur-sm border-b border-white/10 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                type="search"
                placeholder="Search movies and series..."
                className="w-full pl-9 bg-white/10 border-0 text-white placeholder:text-white/50 focus-visible:ring-1 focus-visible:ring-purple-500/50 focus-visible:ring-offset-0"
              />
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-500">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Movies</SheetTitle>
                  <SheetDescription>
                    Customize your movie browsing experience
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={selectedCategory} onValueChange={(value: string) => setSelectedCategory(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {["Action", "Drama", "Comedy", "Horror", "Sci-Fi", "Romance"].map((category) => (
                          <SelectItem key={category} value={category.toLowerCase()}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select value={selectedType} onValueChange={(value: ContentType) => setSelectedType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="movie">Movies</SelectItem>
                        <SelectItem value="series">TV Series</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Release Year</label>
                    <Select
                      value={selectedYear?.toString() || "all"}
                      onValueChange={(value) => setSelectedYear(value === "all" ? null : parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {[...Array(30)].map((_, i) => {
                          const year = new Date().getFullYear() - i;
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Language</label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Languages</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="ko">Korean</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort By</label>
                    <Select value={selectedSort} onValueChange={(value: SortType) => setSelectedSort(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest">Latest</SelectItem>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="rating">Top Rated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {user?.role === "admin" && (
              <Button
                variant="default"
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setLocation("/admin/upload")}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            )}
          </div>
        </div>
      </div>

      <MovieStories movies={movies} />

      {watchHistory.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <ContinueWatching history={watchHistory} />
        </div>
      )}

      <div className="relative">
        <Carousel
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent>
            {featuredMovies.map((movie) => (
              <CarouselItem key={movie.id}>
                <div className="relative aspect-[21/9] overflow-hidden group">
                  <img
                    src={movie.thumbnailUrl || "/placeholder-movie.jpg"}
                    alt={movie.title}
                    className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                  <div className="absolute bottom-0 left-0 right-0 p-8 transform transition-transform duration-500">
                    <div className="flex items-center gap-2 mb-4">
                      {movie.metadata?.type === "series" && (
                        <Badge variant="outline" className="text-purple-400 border-purple-400">
                          TV Series
                        </Badge>
                      )}
                      {movie.metadata?.contentRating && (
                        <Badge variant="outline" className="border-white/20">
                          {movie.metadata.contentRating}
                        </Badge>
                      )}
                    </div>

                    <h2 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-500">
                      {movie.title}
                    </h2>
                    <p className="text-xl text-white/90 mb-6 max-w-2xl line-clamp-2 font-light">
                      {movie.description}
                    </p>

                    <div className="flex gap-4">
                      <Button
                        size="lg"
                        onClick={() => setLocation(`/movies/${movie.id}`)}
                        className="bg-purple-600 hover:bg-purple-700 text-white group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Play className="w-5 h-5 mr-2" />
                        Watch Now
                      </Button>

                      {movie.metadata?.trailerUrl && (
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => setLocation(`/movies/${movie.id}/trailer`)}
                          className="border-purple-500/50 text-purple-500 hover:bg-purple-500/10"
                        >
                          <Clapperboard className="w-5 h-5 mr-2" />
                          Watch Trailer
                        </Button>
                      )}

                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => setLocation(`/movies/${movie.id}/details`)}
                        className="border-purple-500/50 text-purple-500 hover:bg-purple-500/10"
                      >
                        <Info className="w-5 h-5 mr-2" />
                        More Info
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 bg-black/20 hover:bg-black/40 backdrop-blur-xl border-purple-500/50" />
          <CarouselNext className="right-4 bg-black/20 hover:bg-black/40 backdrop-blur-xl border-purple-500/50" />
        </Carousel>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="all" className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="movies">Movies</TabsTrigger>
            <TabsTrigger value="series">TV Series</TabsTrigger>
            <TabsTrigger value="watchlist">My Watchlist</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {sortedMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} likeMutation={likeMutation} watchlistMutation={watchlistMutation} setLocation={setLocation} rateMutation={rateMutation} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="movies">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {sortedMovies.filter((movie) => movie.metadata?.type === "movie").map((movie) => (
                <MovieCard key={movie.id} movie={movie} likeMutation={likeMutation} watchlistMutation={watchlistMutation} setLocation={setLocation} rateMutation={rateMutation} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="series">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {sortedMovies.filter((movie) => movie.metadata?.type === "series").map((movie) => (
                <MovieCard key={movie.id} movie={movie} likeMutation={likeMutation} watchlistMutation={watchlistMutation} setLocation={setLocation} rateMutation={rateMutation} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="watchlist">
            {/* Implement watchlist display here */}
            <p>Watchlist implementation needed</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface MovieCardProps {
  movie: MovieWithUserInteractions;
  likeMutation: any;
  watchlistMutation: any;
  setLocation: (path: string) => void;
  rateMutation: any;
}

const MovieCard = ({ movie, likeMutation, watchlistMutation, setLocation, rateMutation }: MovieCardProps) => {
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState<string>("");

  return (
    <div className="group/card relative aspect-[2/3] overflow-hidden rounded-lg cursor-pointer bg-white/5">
      <img
        src={movie.thumbnailUrl || "/placeholder-movie.jpg"}
        alt={movie.title}
        className="w-full h-full object-cover transform transition-transform duration-500 group-hover/card:scale-110"
        onClick={() => setLocation(`/movie/${movie.id}`)}
      />

      {movie.averageRating > 0 && (
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
          <Rating rating={movie.averageRating} />
        </div>
      )}

      <div className="absolute top-2 right-2 flex flex-col gap-2 translate-x-full group-hover/card:translate-x-0 transition-transform duration-300">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 bg-black/40 backdrop-blur-sm hover:bg-purple-500/20 text-white"
          onClick={(e) => {
            e.stopPropagation();
            likeMutation.mutate(movie.id);
          }}
        >
          <Heart className="h-4 w-4" fill={movie.isLiked ? "currentColor" : "none"} />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 bg-black/40 backdrop-blur-sm hover:bg-purple-500/20 text-white"
          onClick={(e) => {
            e.stopPropagation();
            watchlistMutation.mutate(movie.id);
          }}
        >
          <BookmarkPlus className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 bg-black/40 backdrop-blur-sm hover:bg-purple-500/20 text-white"
          onClick={(e) => {
            e.stopPropagation();
            setLocation(`/movies/${movie.id}/comments`);
          }}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 bg-black/40 backdrop-blur-sm hover:bg-red-500/20 text-white"
          onClick={(e) => {
            e.stopPropagation();
            setLocation(`/movies/${movie.id}/report`);
          }}
        >
          <Flag className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover/card:translate-y-0 transition-transform duration-300" onClick={() => setLocation(`/movies/${movie.id}`)}>
        <div className="space-y-2 mb-3">
          <h4 className="font-semibold text-white truncate">{movie.title}</h4>
          <p className="text-sm text-white/70 line-clamp-2">{movie.description}</p>

          <div className="flex flex-wrap gap-2 text-xs text-white/60">
            {movie.metadata?.releaseYear && (
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {movie.metadata.releaseYear}
              </span>
            )}
            {movie.metadata?.language && (
              <span className="flex items-center">
                <Languages className="h-3 w-3 mr-1" />
                {movie.metadata.language.toUpperCase()}
              </span>
            )}
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {Math.floor(movie.duration / 60)}m
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-white/60">
            <Heart className="h-3 w-3" /> {movie.likes || 0}
            <MessageSquare className="h-3 w-3 ml-2" /> {movie.comments || 0}
          </div>
        </div>

        <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
          <Play className="w-4 h-4 mr-1" /> Play
        </Button>
      </div>
    </div>
  );
};

interface BadgeProps {
  variant: "default" | "outline";
  children: React.ReactNode;
  className?: string;
}

const Badge = ({ variant, children, className = "" }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        variant === "outline" ? "border border-purple-400" : ""
      } ${className}`}
    >
      {children}
    </span>
  );
};