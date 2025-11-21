import { useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  UserPlus, Briefcase, MessageSquare, ThumbsUp, Eye, Check 
} from "lucide-react";
import { 
  getNotifications, 
  getUsers,
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  CURRENT_USER_ID 
} from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Notification } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function Notifications() {
  const { toast } = useToast();

  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID, "notifications"],
    queryFn: () => getNotifications(CURRENT_USER_ID),
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: getUsers,
  });

  const markAsReadMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", CURRENT_USER_ID, "notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(CURRENT_USER_ID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", CURRENT_USER_ID, "notifications"] });
      toast({ title: "All notifications marked as read" });
    },
    onError: () => {
      toast({ title: "Failed to mark all as read", variant: "destructive" });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "connection_request":
      case "connection_accepted":
        return UserPlus;
      case "message":
        return MessageSquare;
      case "job_application":
        return Briefcase;
      case "profile_view":
        return Eye;
      case "post_like":
        return ThumbsUp;
      default:
        return Check;
    }
  };

  const notificationsWithUsers = useMemo(() => {
    return notifications.map(notification => {
      const actor = notification.actorId 
        ? allUsers.find(u => u.id === notification.actorId)
        : null;
      
      return {
        ...notification,
        actor,
        icon: getNotificationIcon(notification.type),
      };
    });
  }, [notifications, allUsers]);

  const unreadNotifications = notificationsWithUsers.filter(n => !n.read);

  const handleNotificationClick = (notification: typeof notificationsWithUsers[0]) => {
    if (!notification.read) {
      markAsReadMutation.mutate({ id: notification.id });
    }
  };

  const NotificationItem = ({ notification }: { notification: typeof notificationsWithUsers[0] }) => {
    const Icon = notification.icon;
    const actorName = notification.actor?.fullName || "Someone";
    const actorAvatar = notification.actor?.avatarUrl;
    
    return (
      <div
        className={`p-4 border-b hover-elevate cursor-pointer ${
          !notification.read ? 'bg-primary/5' : ''
        }`}
        data-testid={`notification-${notification.id}`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex gap-3">
          <Avatar>
            <AvatarImage src={actorAvatar} />
            <AvatarFallback>{actorName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold">{actorName}</span>{' '}
                  <span className="text-muted-foreground">{notification.content}</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              {!notification.read && (
                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (notificationsLoading || usersLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-9 w-32" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-6 border-b">
                  <div className="flex gap-4 py-3">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
                <div>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="p-4 border-b">
                      <div className="flex gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Notifications</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  data-testid="button-mark-all-read"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending || unreadNotifications.length === 0}
                >
                  Mark all as read
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all">
                <div className="px-6 border-b">
                  <TabsList className="bg-transparent border-none h-auto p-0">
                    <TabsTrigger 
                      value="all" 
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-4"
                      data-testid="tab-all-notifications"
                    >
                      All ({notificationsWithUsers.length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="unread"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-4"
                      data-testid="tab-unread-notifications"
                    >
                      Unread ({unreadNotifications.length})
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="all" className="m-0">
                  {notificationsWithUsers.length > 0 ? (
                    <div>
                      {notificationsWithUsers.map((notification) => (
                        <NotificationItem key={notification.id} notification={notification} />
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-muted">
                        <Eye className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="mt-4 font-semibold">No notifications</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        You're all caught up! Check back later for updates.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="unread" className="m-0">
                  {unreadNotifications.length > 0 ? (
                    <div>
                      {unreadNotifications.map((notification) => (
                        <NotificationItem key={notification.id} notification={notification} />
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-muted">
                        <Check className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="mt-4 font-semibold">All caught up!</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        You have no unread notifications
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
