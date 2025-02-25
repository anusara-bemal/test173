import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, User as UserIcon, Loader2 } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { useDebouncedCallback } from "use-debounce";
import { useAdminSocket } from "@/hooks/use-admin-socket";

const PAGE_SIZE = 50;

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [page, setPage] = useState(1);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users", page, search],
    staleTime: 30000,
  });

  // Set up WebSocket for real-time updates
  useAdminSocket({
    onUserVerified: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });

  const { toast } = useToast();
  const parentRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const debouncedSearch = useDebouncedCallback(
    (value: string) => {
      setSearch(value);
      setPage(1);
    },
    300
  );

  // Memoized filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  // Virtual list setup
  const rowVirtualizer = useVirtualizer({
    count: filteredUsers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 60, []),
    overscan: 5,
  });

  // Optimized handler functions
  const handleVerification = useCallback(async (userId: number, verify: boolean) => {
    try {
      await apiRequest("POST", `/api/admin/users/${userId}/verify`, { verify });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: `User ${verify ? "verified" : "unverified"}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user verification status",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleBulkAction = useCallback(async (action: 'verify' | 'unverify') => {
    try {
      await Promise.all(
        selectedUsers.map(userId =>
          apiRequest("POST", `/api/admin/users/${userId}/verify`, { verify: action === 'verify' })
        )
      );
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setSelectedUsers([]);
      toast({
        title: "Success",
        description: `Successfully ${action}ed ${selectedUsers.length} users`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} users`,
        variant: "destructive",
      });
    }
  }, [selectedUsers, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search users..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="w-[300px]"
          />
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-2">
            <Button onClick={() => handleBulkAction('verify')}>
              Verify Selected ({selectedUsers.length})
            </Button>
            <Button variant="destructive" onClick={() => handleBulkAction('unverify')}>
              Unverify Selected
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedUsers.length === filteredUsers.length}
                  onCheckedChange={(checked) => {
                    setSelectedUsers(checked ? filteredUsers.map(u => u.id) : []);
                  }}
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <div
              ref={parentRef}
              style={{ height: '600px', overflow: 'auto' }}
            >
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const user = filteredUsers[virtualRow.index];
                  return (
                    <div
                      key={user.id}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <TableRow>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={(checked) => {
                              setSelectedUsers(prev =>
                                checked
                                  ? [...prev, user.id]
                                  : prev.filter(id => id !== user.id)
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.username}
                                className="h-10 w-10 rounded-full"
                                loading="lazy"
                              />
                            ) : (
                              <UserIcon className="h-10 w-10" />
                            )}
                            <div>
                              <p className="font-medium">{user.username}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isVerified ? "default" : "secondary"}>
                            {user.isVerified ? "Verified" : "Unverified"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={user.isVerified ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleVerification(user.id, !user.isVerified)}
                          >
                            {user.isVerified ? "Unverify" : "Verify"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    </div>
                  );
                })}
              </div>
            </div>
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <p className="text-sm text-muted-foreground">
          Showing {Math.min(PAGE_SIZE, filteredUsers.length)} of {users.length} users
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={filteredUsers.length < PAGE_SIZE}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}