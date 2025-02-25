import { Link, useLocation } from "wouter";
import {
  Home,
  Users,
  Search,
  Settings,
  LogOut,
  UserPlus,
  Bell,
  MessageSquare,
  Shield,
  Film,
  UsersRound,
  Clapperboard,
  UserPlus2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

export default function Navigation() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Check if user has admin role
  const isAdmin = user?.role === 'admin';

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#0A0A0A] border-b border-white/10 z-50">
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        {/* Left side with logo and navigation */}
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            className="text-lg font-bold text-purple-500 px-0"
            onClick={() => setLocation("/")}
          >
            Social App
          </Button>
          <nav className="hidden md:flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-white/90 hover:bg-white/10 ${location === "/" ? "bg-white/10" : ""}`}
              onClick={() => setLocation("/")}
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-white/90 hover:bg-white/10 ${location === "/movies" ? "bg-white/10" : ""}`}
              onClick={() => setLocation("/movies")}
            >
              <Film className="h-4 w-4 mr-2" />
              Movies
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-white/90 hover:bg-white/10 ${location === "/friends" ? "bg-white/10" : ""}`}
              onClick={() => setLocation("/friends")}
            >
              <UserPlus2 className="h-4 w-4 mr-2" />
              Friends
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-white/90 hover:bg-white/10 ${location === "/reels" ? "bg-white/10" : ""}`}
              onClick={() => setLocation("/reels")}
            >
              <Clapperboard className="h-4 w-4 mr-2" />
              Reels
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-white/90 hover:bg-white/10 ${location === "/groups" ? "bg-white/10" : ""}`}
              onClick={() => setLocation("/groups")}
            >
              <UsersRound className="h-4 w-4 mr-2" />
              Groups
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-white/90 hover:bg-white/10 ${location === "/notifications" ? "bg-white/10" : ""}`}
              onClick={() => setLocation("/notifications")}
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-white/90 hover:bg-white/10 ${location === "/messages" ? "bg-white/10" : ""}`}
              onClick={() => setLocation("/messages")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </Button>
          </nav>
        </div>

        {/* Right side with search and profile */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-[240px] pl-9 h-8 rounded-full bg-white/10 border-0 text-white placeholder:text-white/50 focus-visible:ring-1 focus-visible:ring-purple-500/50 focus-visible:ring-offset-0"
            />
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 p-0 rounded-full hover:bg-white/10">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
                    <AvatarFallback className="bg-purple-500/20 text-white">
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/profile")}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => setLocation("/admin")}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              size="sm" 
              className="bg-purple-500 hover:bg-purple-600"
              onClick={() => setLocation("/auth")}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}