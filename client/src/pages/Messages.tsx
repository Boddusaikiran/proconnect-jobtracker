import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Send, MoreVertical, Image, Paperclip, Smile } from "lucide-react";
import avatar1 from "@assets/generated_images/Female_professional_headshot_125267a8.png";
import avatar2 from "@assets/generated_images/Male_professional_headshot_d316bd07.png";
import avatar3 from "@assets/generated_images/Senior_female_professional_b467fc71.png";

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState("1");
  const [messageInput, setMessageInput] = useState("");

  const conversations = [
    {
      id: "1",
      name: "Sarah Johnson",
      avatar: avatar1,
      lastMessage: "That sounds great! When can we schedule a call?",
      time: "10m ago",
      unread: 2,
      online: true,
    },
    {
      id: "2",
      name: "Michael Chen",
      avatar: avatar2,
      lastMessage: "Thanks for connecting! I'd love to learn more about your work.",
      time: "1h ago",
      unread: 0,
      online: true,
    },
    {
      id: "3",
      name: "Dr. Emily Rodriguez",
      avatar: avatar3,
      lastMessage: "I'll send over the project details tomorrow.",
      time: "2h ago",
      unread: 0,
      online: false,
    },
  ];

  const messages = {
    "1": [
      {
        id: "1",
        sender: "Sarah Johnson",
        content: "Hi! I saw your profile and I'm really impressed with your design work.",
        time: "2:30 PM",
        isMe: false,
      },
      {
        id: "2",
        sender: "Me",
        content: "Thank you! I'd be happy to discuss potential collaboration opportunities.",
        time: "2:35 PM",
        isMe: true,
      },
      {
        id: "3",
        sender: "Sarah Johnson",
        content: "That sounds great! When can we schedule a call?",
        time: "2:40 PM",
        isMe: false,
      },
    ],
    "2": [
      {
        id: "1",
        sender: "Michael Chen",
        content: "Thanks for connecting! I'd love to learn more about your work.",
        time: "1:15 PM",
        isMe: false,
      },
    ],
    "3": [
      {
        id: "1",
        sender: "Dr. Emily Rodriguez",
        content: "I'll send over the project details tomorrow.",
        time: "12:45 PM",
        isMe: false,
      },
    ],
  };

  const selectedMessages = messages[selectedConversation as keyof typeof messages] || [];
  const currentConversation = conversations.find(c => c.id === selectedConversation);

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
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-4 border-b cursor-pointer hover-elevate ${
                      selectedConversation === conversation.id ? 'bg-muted/50' : ''
                    }`}
                    data-testid={`conversation-${conversation.id}`}
                  >
                    <div className="flex gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={conversation.avatar} />
                          <AvatarFallback>{conversation.name[0]}</AvatarFallback>
                        </Avatar>
                        {conversation.online && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-sm truncate">{conversation.name}</h4>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {conversation.time}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage}
                          </p>
                          {conversation.unread > 0 && (
                            <Badge variant="default" className="ml-2 h-5 min-w-5 rounded-full px-1.5 text-xs">
                              {conversation.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-8 flex flex-col">
              {currentConversation ? (
                <>
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={currentConversation.avatar} />
                          <AvatarFallback>{currentConversation.name[0]}</AvatarFallback>
                        </Avatar>
                        {currentConversation.online && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{currentConversation.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {currentConversation.online ? 'Active now' : 'Offline'}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" data-testid="button-message-options">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                        data-testid={`message-${message.id}`}
                      >
                        <div className={`max-w-md ${message.isMe ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`rounded-2xl px-4 py-2.5 ${
                              message.isMe
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 px-2">
                            {message.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" data-testid="button-attach-image">
                        <Image className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" data-testid="button-attach-file">
                        <Paperclip className="h-5 w-5" />
                      </Button>
                      <div className="flex-1 relative">
                        <Textarea
                          placeholder="Type a message..."
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          className="min-h-[44px] max-h-32 resize-none pr-12"
                          data-testid="input-message"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1"
                          data-testid="button-emoji"
                        >
                          <Smile className="h-5 w-5" />
                        </Button>
                      </div>
                      <Button size="icon" data-testid="button-send-message">
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
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
