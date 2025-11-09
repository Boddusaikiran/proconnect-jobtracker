import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, UserMinus, Check, X, Users } from "lucide-react";
import avatar1 from "@assets/generated_images/Female_professional_headshot_125267a8.png";
import avatar2 from "@assets/generated_images/Male_professional_headshot_d316bd07.png";
import avatar3 from "@assets/generated_images/Senior_female_professional_b467fc71.png";
import avatar4 from "@assets/generated_images/Young_male_professional_8999059f.png";

export default function Network() {
  const [activeTab, setActiveTab] = useState("connections");

  const connections = [
    {
      id: "1",
      name: "Sarah Johnson",
      headline: "Senior Product Designer at TechCorp",
      avatar: avatar1,
      mutualConnections: 12,
      connected: true,
    },
    {
      id: "2",
      name: "Michael Chen",
      headline: "Software Engineer at Global Solutions Inc",
      avatar: avatar2,
      mutualConnections: 8,
      connected: true,
    },
    {
      id: "3",
      name: "Dr. Emily Rodriguez",
      headline: "Chief Technology Officer at InnovateTech",
      avatar: avatar3,
      mutualConnections: 15,
      connected: true,
    },
    {
      id: "4",
      name: "David Kim",
      headline: "Full Stack Developer at StartupXYZ",
      avatar: avatar4,
      mutualConnections: 6,
      connected: true,
    },
  ];

  const invitations = [
    {
      id: "5",
      name: "Jessica Martinez",
      headline: "Marketing Director at BrandCo",
      avatar: avatar1,
      mutualConnections: 5,
      time: "2d ago",
    },
    {
      id: "6",
      name: "Robert Taylor",
      headline: "Data Scientist at Analytics Pro",
      avatar: avatar2,
      mutualConnections: 3,
      time: "1w ago",
    },
  ];

  const suggestions = [
    {
      id: "7",
      name: "Amanda Wilson",
      headline: "UX Researcher at DesignHub",
      avatar: avatar3,
      mutualConnections: 18,
      reason: "Works at TechCorp",
    },
    {
      id: "8",
      name: "James Anderson",
      headline: "Product Manager at InnovateTech",
      avatar: avatar4,
      mutualConnections: 7,
      reason: "Attended Stanford University",
    },
    {
      id: "9",
      name: "Lisa Brown",
      headline: "Frontend Developer at WebWorks",
      avatar: avatar1,
      mutualConnections: 11,
      reason: "Based in San Francisco",
    },
  ];

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
                  <Badge variant="secondary">{connections.length}</Badge>
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
                      Connections ({connections.length})
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
                      {connections.map((connection) => (
                        <Card key={connection.id} className="hover-elevate" data-testid={`card-connection-${connection.id}`}>
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={connection.avatar} />
                                <AvatarFallback>{connection.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">{connection.name}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {connection.headline}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {connection.mutualConnections} mutual connections
                                </p>
                                <div className="flex gap-2 mt-3">
                                  <Button variant="outline" size="sm" className="flex-1" data-testid={`button-message-${connection.id}`}>
                                    Message
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
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
                    </div>
                  </TabsContent>

                  <TabsContent value="invitations" className="mt-6">
                    <div className="space-y-4">
                      {invitations.map((invitation) => (
                        <Card key={invitation.id} data-testid={`card-invitation-${invitation.id}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={invitation.avatar} />
                                <AvatarFallback>{invitation.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-semibold">{invitation.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {invitation.headline}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {invitation.mutualConnections} mutual connections · {invitation.time}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                  <Button size="sm" data-testid={`button-accept-${invitation.id}`}>
                                    <Check className="h-4 w-4 mr-2" />
                                    Accept
                                  </Button>
                                  <Button variant="outline" size="sm" data-testid={`button-ignore-${invitation.id}`}>
                                    <X className="h-4 w-4 mr-2" />
                                    Ignore
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="suggestions" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {suggestions.map((suggestion) => (
                        <Card key={suggestion.id} className="hover-elevate" data-testid={`card-suggestion-${suggestion.id}`}>
                          <CardContent className="p-4">
                            <div className="flex flex-col items-center text-center">
                              <Avatar className="h-20 w-20">
                                <AvatarImage src={suggestion.avatar} />
                                <AvatarFallback>{suggestion.name[0]}</AvatarFallback>
                              </Avatar>
                              <h4 className="font-semibold mt-3">{suggestion.name}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {suggestion.headline}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {suggestion.mutualConnections} mutual connections
                              </p>
                              <Badge variant="secondary" className="mt-2 text-xs">
                                {suggestion.reason}
                              </Badge>
                              <Button className="w-full mt-4" size="sm" data-testid={`button-connect-${suggestion.id}`}>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Connect
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
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
