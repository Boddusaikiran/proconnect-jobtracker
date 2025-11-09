import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UserPlus, UserMinus, Check, X, Users } from "lucide-react";
import { 
  getUsers, 
  getConnections, 
  createConnection, 
  updateConnection, 
  deleteConnection, 
  CURRENT_USER_ID 
} from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Connection, User } from "@shared/schema";

export default function Network() {
  const [activeTab, setActiveTab] = useState("connections");
  const { toast } = useToast();

  // Fetch accepted connections
  const { data: acceptedConnections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID, "connections", "accepted"],
    queryFn: () => getConnections(CURRENT_USER_ID, "accepted"),
  });

  // Fetch pending invitations (where current user is the connected user)
  const { data: allPending = [], isLoading: invitationsLoading } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID, "connections", "pending"],
    queryFn: () => getConnections(CURRENT_USER_ID, "pending"),
  });

  // Fetch all users for suggestions
  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: getUsers,
  });

  // Accept connection mutation
  const acceptMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => updateConnection(id, "accepted"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", CURRENT_USER_ID, "connections"] });
      toast({ title: "Connection accepted!" });
    },
    onError: () => {
      toast({ title: "Failed to accept connection", variant: "destructive" });
    },
  });

  // Reject connection mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => updateConnection(id, "rejected"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", CURRENT_USER_ID, "connections"] });
      toast({ title: "Connection request ignored" });
    },
    onError: () => {
      toast({ title: "Failed to reject connection", variant: "destructive" });
    },
  });

  // Send connection request mutation
  const connectMutation = useMutation({
    mutationFn: ({ connectedUserId }: { connectedUserId: string }) => 
      createConnection(CURRENT_USER_ID, connectedUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", CURRENT_USER_ID, "connections"] });
      toast({ title: "Connection request sent!" });
    },
    onError: () => {
      toast({ title: "Failed to send connection request", variant: "destructive" });
    },
  });

  // Remove connection mutation
  const removeMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", CURRENT_USER_ID, "connections"] });
      toast({ title: "Connection removed" });
    },
    onError: () => {
      toast({ title: "Failed to remove connection", variant: "destructive" });
    },
  });

  // Get user details for connections
  const connectionsWithUsers = acceptedConnections.map(conn => {
    const otherUserId = conn.userId === CURRENT_USER_ID ? conn.connectedUserId : conn.userId;
    const user = allUsers.find(u => u.id === otherUserId);
    return { connection: conn, user };
  }).filter(item => item.user);

  // Get pending invitations (where current user received the request)
  const invitations = allPending
    .filter(conn => conn.connectedUserId === CURRENT_USER_ID)
    .map(conn => {
      const user = allUsers.find(u => u.id === conn.userId);
      return { connection: conn, user };
    })
    .filter(item => item.user);

  // Get suggestions (users who are not connected and not pending)
  const connectedUserIds = new Set([
    ...acceptedConnections.map(c => c.userId === CURRENT_USER_ID ? c.connectedUserId : c.userId),
    ...allPending.map(c => c.userId === CURRENT_USER_ID ? c.connectedUserId : c.userId),
    ...allPending.map(c => c.connectedUserId === CURRENT_USER_ID ? c.userId : c.connectedUserId),
  ]);
  
  const suggestions = allUsers.filter(
    user => user.id !== CURRENT_USER_ID && !connectedUserIds.has(user.id)
  );

  if (connectionsLoading || invitationsLoading || usersLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <aside className="lg:col-span-3">
              <Card>
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </aside>
            <main className="lg:col-span-9">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-5 w-48" />
                              <Skeleton className="h-4 w-64" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <h3 className="font-semibold">Manage Network</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-md hover-elevate cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Connections</span>
                  </div>
                  <Badge variant="secondary">{connectionsWithUsers.length}</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md hover-elevate cursor-pointer">
                  <div className="flex items-center gap-3">
                    <UserPlus className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Invitations</span>
                  </div>
                  <Badge variant="secondary">{invitations.length}</Badge>
                </div>
              </CardContent>
            </Card>
          </aside>

          <main className="lg:col-span-9">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">My Network</h2>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search connections..."
                      className="pl-9"
                      data-testid="input-search-connections"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="connections" data-testid="tab-connections">
                      Connections ({connectionsWithUsers.length})
                    </TabsTrigger>
                    <TabsTrigger value="invitations" data-testid="tab-invitations">
                      Invitations ({invitations.length})
                    </TabsTrigger>
                    <TabsTrigger value="suggestions" data-testid="tab-suggestions">
                      Suggestions ({suggestions.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="connections" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {connectionsWithUsers.map(({ connection, user }) => (
                        <Card key={connection.id} className="hover-elevate" data-testid={`card-connection-${connection.id}`}>
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={user!.avatarUrl || undefined} />
                                <AvatarFallback>{user!.fullName[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">{user!.fullName}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {user!.headline}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {user!.location || "No location"}
                                </p>
                                <div className="flex gap-2 mt-3">
                                  <Button variant="outline" size="sm" className="flex-1" data-testid={`button-message-${connection.id}`}>
                                    Message
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeMutation.mutate({ id: connection.id })}
                                    disabled={removeMutation.isPending}
                                    data-testid={`button-remove-${connection.id}`}
                                  >
                                    <UserMinus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {connectionsWithUsers.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                          No connections yet. Start connecting with people!
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="invitations" className="mt-6">
                    <div className="space-y-4">
                      {invitations.map(({ connection, user }) => (
                        <Card key={connection.id} data-testid={`card-invitation-${connection.id}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={user!.avatarUrl || undefined} />
                                <AvatarFallback>{user!.fullName[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-semibold">{user!.fullName}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {user!.headline}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {user!.location || "No location"} · {new Date(connection.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                  <Button 
                                    size="sm" 
                                    onClick={() => acceptMutation.mutate({ id: connection.id })}
                                    disabled={acceptMutation.isPending}
                                    data-testid={`button-accept-${connection.id}`}
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Accept
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => rejectMutation.mutate({ id: connection.id })}
                                    disabled={rejectMutation.isPending}
                                    data-testid={`button-ignore-${connection.id}`}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Ignore
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {invitations.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          No pending invitations
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="suggestions" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {suggestions.map((user) => (
                        <Card key={user.id} className="hover-elevate" data-testid={`card-suggestion-${user.id}`}>
                          <CardContent className="p-4">
                            <div className="flex flex-col items-center text-center">
                              <Avatar className="h-20 w-20">
                                <AvatarImage src={user.avatarUrl || undefined} />
                                <AvatarFallback>{user.fullName[0]}</AvatarFallback>
                              </Avatar>
                              <h4 className="font-semibold mt-3">{user.fullName}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {user.headline}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {user.location || "No location"}
                              </p>
                              {user.location && (
                                <Badge variant="secondary" className="mt-2 text-xs">
                                  {user.location}
                                </Badge>
                              )}
                              <Button 
                                className="w-full mt-4" 
                                size="sm" 
                                onClick={() => connectMutation.mutate({ connectedUserId: user.id })}
                                disabled={connectMutation.isPending}
                                data-testid={`button-connect-${user.id}`}
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Connect
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {suggestions.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                          No suggestions available
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
