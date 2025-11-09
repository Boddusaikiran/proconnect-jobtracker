import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserPlus, Briefcase, MessageSquare, ThumbsUp, Eye, Check 
} from "lucide-react";
import avatar1 from "@assets/generated_images/Female_professional_headshot_125267a8.png";
import avatar2 from "@assets/generated_images/Male_professional_headshot_d316bd07.png";
import avatar3 from "@assets/generated_images/Senior_female_professional_b467fc71.png";
import avatar4 from "@assets/generated_images/Young_male_professional_8999059f.png";

export default function Notifications() {
  const notifications = [
    {
      id: "1",
      type: "connection_request",
      actor: "Jessica Martinez",
      avatar: avatar1,
      content: "sent you a connection request",
      time: "10m ago",
      read: false,
      icon: UserPlus,
    },
    {
      id: "2",
      type: "connection_accepted",
      actor: "Robert Taylor",
      avatar: avatar2,
      content: "accepted your connection request",
      time: "1h ago",
      read: false,
      icon: Check,
    },
    {
      id: "3",
      type: "message",
      actor: "Sarah Johnson",
      avatar: avatar1,
      content: "sent you a message",
      time: "2h ago",
      read: true,
      icon: MessageSquare,
    },
    {
      id: "4",
      type: "profile_view",
      actor: "David Kim",
      avatar: avatar4,
      content: "viewed your profile",
      time: "3h ago",
      read: true,
      icon: Eye,
    },
    {
      id: "5",
      type: "job_application",
      actor: "TechCorp",
      avatar: avatar3,
      content: "Your application for Senior Product Designer is under review",
      time: "5h ago",
      read: true,
      icon: Briefcase,
    },
    {
      id: "6",
      type: "post_like",
      actor: "Michael Chen",
      avatar: avatar2,
      content: "liked your post about AI innovation",
      time: "1d ago",
      read: true,
      icon: ThumbsUp,
    },
  ];

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const NotificationItem = ({ notification }: { notification: typeof notifications[0] }) => {
    const Icon = notification.icon;
    
    return (
      <div
        className={`p-4 border-b hover-elevate cursor-pointer ${
          !notification.read ? 'bg-primary/5' : ''
        }`}
        data-testid={`notification-${notification.id}`}
      >
        <div className="flex gap-3">
          <Avatar>
            <AvatarImage src={notification.avatar} />
            <AvatarFallback>{notification.actor[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold">{notification.actor}</span>{' '}
                  <span className="text-muted-foreground">{notification.content}</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground">{notification.time}</span>
                </div>
              </div>
              {!notification.read && (
                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
              )}
            </div>
            {notification.type === 'connection_request' && (
              <div className="flex gap-2 mt-3">
                <Button size="sm" data-testid={`button-accept-${notification.id}`}>Accept</Button>
                <Button variant="outline" size="sm" data-testid={`button-ignore-${notification.id}`}>Ignore</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Notifications</h2>
                <Button variant="ghost" size="sm" data-testid="button-mark-all-read">
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
                      All ({notifications.length})
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
                  {notifications.length > 0 ? (
                    <div>
                      {notifications.map((notification) => (
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
