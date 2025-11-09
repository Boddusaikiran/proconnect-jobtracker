import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Search, Send, MoreVertical, Image, Paperclip, Smile, MessageSquare } from "lucide-react";
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  getUsers, 
  CURRENT_USER_ID 
} from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Message, User } from "@shared/schema";

const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(2000, "Message is too long"),
});

type MessageFormData = z.infer<typeof messageSchema>;

export default function Messages() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  // Fetch all users for avatar/name mapping
  const { data: allUsers = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: getUsers,
  });

  // Fetch conversations
  const { data: conversationsData = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID, "conversations"],
    queryFn: () => getConversations(CURRENT_USER_ID),
  });

  // Fetch messages for selected conversation
  const { data: messagesData = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/messages", CURRENT_USER_ID, selectedUserId],
    queryFn: () => getMessages(CURRENT_USER_ID, selectedUserId!),
    enabled: !!selectedUserId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ receiverId, content }: { receiverId: string; content: string }) =>
      sendMessage(CURRENT_USER_ID, receiverId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", CURRENT_USER_ID, selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", CURRENT_USER_ID, "conversations"] });
      form.reset();
      toast({ title: "Message sent successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  // Process conversations to get unique users and their last messages
  const conversations = useMemo(() => {
    const conversationMap = new Map<string, { user: User; lastMessage: Message; unreadCount: number }>();

    conversationsData.forEach(msg => {
      const otherUserId = msg.senderId === CURRENT_USER_ID ? msg.receiverId : msg.senderId;
      const existingConv = conversationMap.get(otherUserId);

      if (!existingConv || new Date(msg.createdAt) > new Date(existingConv.lastMessage.createdAt)) {
        const user = allUsers.find(u => u.id === otherUserId);
        if (user) {
          const unreadCount = conversationsData.filter(
            m => m.senderId === otherUserId && m.receiverId === CURRENT_USER_ID && !m.read
          ).length;

          conversationMap.set(otherUserId, {
            user,
            lastMessage: msg,
            unreadCount,
          });
        }
      }
    });

    return Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  }, [conversationsData, allUsers]);

  const currentUser = selectedUserId ? allUsers.find(u => u.id === selectedUserId) : null;

  const onSubmit = (data: MessageFormData) => {
    if (!selectedUserId) return;
    sendMessageMutation.mutate({ receiverId: selectedUserId, content: data.content });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  if (conversationsLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <Card className="h-[calc(100vh-8rem)]">
            <div className="grid grid-cols-1 md:grid-cols-12 h-full">
              <div className="md:col-span-4 border-r">
                <div className="p-4 border-b">
                  <Skeleton className="h-8 w-32 mb-3" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:col-span-8 flex items-center justify-center">
                <div className="text-center">
                  <Skeleton className="h-16 w-16 mx-auto rounded-lg" />
                  <Skeleton className="h-6 w-48 mx-auto mt-4" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-6">
        <Card className="h-[calc(100vh-8rem)]">
          <div className="grid grid-cols-1 md:grid-cols-12 h-full">
            <div className="md:col-span-4 border-r">
              <div className="p-4 border-b">
                <h2 className="text-xl font-bold mb-3">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search conversations..."
                    className="pl-9"
                    data-testid="input-search-messages"
                  />
                </div>
              </div>
              <div className="overflow-y-auto h-[calc(100%-120px)]">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <p className="text-sm">No conversations yet</p>
                  </div>
                ) : (
                  conversations.map(({ user, lastMessage, unreadCount }) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`p-4 border-b cursor-pointer hover-elevate ${
                        selectedUserId === user.id ? 'bg-muted/50' : ''
                      }`}
                      data-testid={`conversation-${user.id}`}
                    >
                      <div className="flex gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={user.avatarUrl || undefined} />
                            <AvatarFallback>{user.fullName[0]}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-sm truncate">{user.fullName}</h4>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                              {formatTime(lastMessage.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-muted-foreground truncate">
                              {lastMessage.senderId === CURRENT_USER_ID && "You: "}
                              {lastMessage.content}
                            </p>
                            {unreadCount > 0 && (
                              <Badge variant="default" className="ml-2 h-5 min-w-5 rounded-full px-1.5 text-xs">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="md:col-span-8 flex flex-col">
              {currentUser ? (
                <>
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={currentUser.avatarUrl || undefined} />
                          <AvatarFallback>{currentUser.fullName[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <h3 className="font-semibold">{currentUser.fullName}</h3>
                        <p className="text-xs text-muted-foreground">
                          {currentUser.headline}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" data-testid="button-message-options">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messagesLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                            <Skeleton className="h-16 w-64 rounded-2xl" />
                          </div>
                        ))}
                      </div>
                    ) : messagesData.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messagesData.map((message) => {
                        const isMe = message.senderId === CURRENT_USER_ID;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            data-testid={`message-${message.id}`}
                          >
                            <div className={`max-w-md ${isMe ? 'order-2' : 'order-1'}`}>
                              <div
                                className={`rounded-2xl px-4 py-2.5 ${
                                  isMe
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 px-2">
                                {formatMessageTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="p-4 border-t">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
                        <Button variant="ghost" size="icon" type="button" data-testid="button-attach-image">
                          <Image className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" type="button" data-testid="button-attach-file">
                          <Paperclip className="h-5 w-5" />
                        </Button>
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <div className="relative">
                                  <Textarea
                                    placeholder="Type a message..."
                                    className="min-h-[44px] max-h-32 resize-none pr-12"
                                    data-testid="input-message"
                                    {...field}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        form.handleSubmit(onSubmit)();
                                      }
                                    }}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                    className="absolute right-1 top-1"
                                    data-testid="button-emoji"
                                  >
                                    <Smile className="h-5 w-5" />
                                  </Button>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button 
                          size="icon" 
                          type="submit" 
                          disabled={sendMessageMutation.isPending}
                          data-testid="button-send-message"
                        >
                          <Send className="h-5 w-5" />
                        </Button>
                      </form>
                    </Form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground/50" />
                    <h3 className="mt-4 font-semibold">Select a conversation</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Choose a conversation to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
