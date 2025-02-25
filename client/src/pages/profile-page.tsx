import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Movie } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import MovieCard from "@/components/movie-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
  const { user } = useAuth();

  const { data: movies = [] } = useQuery<Movie[]>({
    queryKey: ["/api/movies"],
  });

  const userMovies = movies.filter((movie) => movie.uploaderId === user?.id);
  const userInitials = user?.username.slice(0, 2).toUpperCase() || "";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-xl">{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl mb-2">{user?.username}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Member since {new Date(user?.createdAt!).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="uploaded">
            <TabsList className="mb-4">
              <TabsTrigger value="uploaded">Uploaded Movies</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="uploaded">
              {userMovies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>You haven't uploaded any movies yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {userMovies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="stats">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Uploads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">{userMovies.length}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">
                      {userMovies.reduce((sum, movie) => sum + movie.views, 0)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Approval Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">
                      {userMovies.length
                        ? Math.round(
                            (userMovies.filter(
                              (m) => m.status === "approved"
                            ).length /
                              userMovies.length) *
                              100
                          )
                        : 0}
                      %
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
