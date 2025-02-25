import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, Clapperboard, UsersRound } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { z } from "zod";

// Define login schema separately since it doesn't need all user fields
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof insertUserSchema>;

export default function AuthPage() {
  const [location, setLocation] = useLocation();
  const { user, loginMutation, registerMutation, googleLoginMutation } = useAuth();

  // Check for Google auth error in a type-safe way
  const params = new URLSearchParams(window.location.search);
  const googleError = params.get("error");

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      email: ""
    }
  });

  const onLogin = loginForm.handleSubmit((data) => {
    loginMutation.mutate(data);
  });

  const onRegister = registerForm.handleSubmit((data) => {
    registerMutation.mutate(data);
  });

  const handleGoogleLogin = () => {
    googleLoginMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center bg-dot-pattern">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                MovieStream
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Your ultimate destination for movies, reels, and entertainment groups.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 backdrop-blur-lg bg-background/50 border-primary/20">
                <Film className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold">Movies</h3>
                <p className="text-sm text-muted-foreground">Watch latest movies</p>
              </Card>
              <Card className="p-4 backdrop-blur-lg bg-background/50 border-primary/20">
                <Clapperboard className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold">Reels</h3>
                <p className="text-sm text-muted-foreground">Short video content</p>
              </Card>
              <Card className="p-4 backdrop-blur-lg bg-background/50 border-primary/20">
                <UsersRound className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold">Groups</h3>
                <p className="text-sm text-muted-foreground">Join movie communities</p>
              </Card>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <Card className="backdrop-blur-xl bg-background/95 border-primary/20">
              <CardHeader>
                <CardTitle>Welcome to MovieStream</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {googleError && (
                  <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                    Failed to sign in with Google. Please try again.
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleGoogleLogin}
                >
                  <SiGoogle className="h-4 w-4" />
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={onLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-username">Username</Label>
                        <Input
                          id="login-username"
                          className="bg-background/50"
                          {...loginForm.register("username")}
                        />
                        {loginForm.formState.errors.username && (
                          <p className="text-sm text-destructive">{loginForm.formState.errors.username.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          className="bg-background/50"
                          {...loginForm.register("password")}
                        />
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={onRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-username">Username</Label>
                        <Input
                          id="register-username"
                          className="bg-background/50"
                          {...registerForm.register("username")}
                        />
                        {registerForm.formState.errors.username && (
                          <p className="text-sm text-destructive">{registerForm.formState.errors.username.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input
                          id="register-email"
                          type="email"
                          className="bg-background/50"
                          {...registerForm.register("email")}
                        />
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <Input
                          id="register-password"
                          type="password"
                          className="bg-background/50"
                          {...registerForm.register("password")}
                        />
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Register"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}