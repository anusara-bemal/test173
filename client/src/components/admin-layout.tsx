import { Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  Film,
  MessageSquare,
  Settings,
  Shield,
  Bell,
  Tag,
  AlertTriangle,
  Activity,
  HelpCircle,
  Search,
  Filter,
  Plus,
  Upload,
  Library,
  Tags,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AdminNavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  isActive?: boolean;
  notificationCount?: number;
}

const AdminNavItem = ({ href, icon: Icon, title, isActive, notificationCount }: AdminNavItemProps) => (
  <Link href={href}>
    <a
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
        isActive ? "bg-accent" : "transparent"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{title}</span>
      {notificationCount && notificationCount > 0 && (
        <Badge variant="destructive" className="ml-auto">
          {notificationCount}
        </Badge>
      )}
    </a>
  </Link>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = window.location.pathname;

  return (
    <div className="grid h-screen grid-cols-[280px_1fr]">
      <aside className="border-r bg-muted/10">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin">
            <a className="flex items-center gap-2 font-semibold">
              <Shield className="h-6 w-6" />
              <span>Admin Console</span>
            </a>
          </Link>
        </div>
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          <div className="p-6">
            <Button className="w-full mb-6" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add New Content
            </Button>

            <nav className="grid gap-2">
              <div className="text-xs font-semibold text-muted-foreground">Overview</div>
              <AdminNavItem
                href="/admin"
                icon={BarChart3}
                title="Dashboard"
                isActive={pathname === "/admin"}
              />
              <AdminNavItem
                href="/admin/analytics"
                icon={Activity}
                title="Analytics"
                isActive={pathname === "/admin/analytics"}
              />

              <div className="mt-6 text-xs font-semibold text-muted-foreground">Movies</div>
              <AdminNavItem
                href="/admin/movies/list"
                icon={Film}
                title="Movie List"
                isActive={pathname === "/admin/movies/list"}
              />
              <AdminNavItem
                href="/admin/movies/upload"
                icon={Upload}
                title="Upload Movie"
                isActive={pathname === "/admin/movies/upload"}
              />
              <AdminNavItem
                href="/admin/movies/import"
                icon={Library}
                title="Bulk Import"
                isActive={pathname === "/admin/movies/import"}
              />
              <AdminNavItem
                href="/admin/movies/metadata"
                icon={Tags}
                title="Metadata"
                isActive={pathname === "/admin/movies/metadata"}
              />

              <div className="mt-6 text-xs font-semibold text-muted-foreground">Reports & Content</div>
              <AdminNavItem
                href="/admin/reports"
                icon={AlertTriangle}
                title="Reports"
                isActive={pathname === "/admin/reports"}
                notificationCount={3}
              />
              <AdminNavItem
                href="/admin/metadata"
                icon={Tag}
                title="Content Tags"
                isActive={pathname === "/admin/metadata"}
              />

              <div className="mt-6 text-xs font-semibold text-muted-foreground">Users</div>
              <AdminNavItem
                href="/admin/users"
                icon={Users}
                title="User Management"
                isActive={pathname === "/admin/users"}
              />
              <AdminNavItem
                href="/admin/messages"
                icon={MessageSquare}
                title="Messages"
                isActive={pathname === "/admin/messages"}
                notificationCount={2}
              />

              <div className="mt-6 text-xs font-semibold text-muted-foreground">Settings</div>
              <AdminNavItem
                href="/admin/settings"
                icon={Settings}
                title="Settings"
                isActive={pathname === "/admin/settings"}
              />
              <AdminNavItem
                href="/admin/help"
                icon={HelpCircle}
                title="Help & Support"
                isActive={pathname === "/admin/help"}
              />
            </nav>
          </div>

          <div className="mt-auto p-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium">Quick Filters</h4>
              <Button variant="ghost" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <AdminNavItem
                href="/admin/notifications"
                icon={Bell}
                title="Notifications"
                isActive={pathname === "/admin/notifications"}
                notificationCount={5}
              />
              <Button variant="outline" size="sm" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                Pending Movies
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2 text-green-500" />
                Active Movies
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Film className="h-4 w-4 mr-2 text-blue-500" />
                New Releases
              </Button>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}