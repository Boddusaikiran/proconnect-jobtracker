import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Image, Video, Calendar, FileText, ThumbsUp, MessageCircle, Share2, TrendingUp, Briefcase } from "lucide-react";
import { getUser, getUsers, getConnections, CURRENT_USER_ID } from "@/lib/api";
import avatar1 from "@assets/generated_images/Female_professional_headshot_125267a8.png";
import avatar2 from "@assets/generated_images/Male_professional_headshot_d316bd07.png";
import avatar3 from "@assets/generated_images/Senior_female_professional_b467fc71.png";

export default function Home() {
  // Fetch current user data
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID],
    queryFn: () => getUser(CURRENT_USER_ID),
  });

  // Fetch connections for sidebar
  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID, "connections"],
    queryFn: () => getConnections(CURRENT_USER_ID, "accepted"),
  });

  // Fetch all users to map to post authors
  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: getUsers,
  });

  const { toast } = useToast();
  const [postContent, setPostContent] = useState("");
  const [localPosts, setLocalPosts] = useState([
    {
      id: "1",
      authorId: "user-1",
      time: "2h",
      content: "Excited to share that our team just launched a new AI-powered feature that revolutionizes how developers approach functional testing and debugging. This journey from concept to launch taught us invaluable lessons about user-centric design and innovative problem-solving. #TechInnovation #Teamwork",
      likes: 127,
      comments: 23,
      shares: 8,
      liked: false,
    },
    {
      id: "2",
      authorId: "user-2",
      time: "5h",
      content: "Just completed a fascinating project on microservices architecture. Here are 5 key takeaways that transformed our development workflow and improved system reliability by 40%. Would love to hear your thoughts!",
      likes: 89,
      comments: 15,
      shares: 12,
      liked: false,
    },
    {
      id: "3",
      authorId: "user-3",
      time: "1d",
      content: "Thrilled to announce that we're hiring! Looking for passionate engineers who want to make an impact in the AI and machine learning space. DM me if you're interested in joining our innovative team.",
      likes: 234,
      comments: 47,
      shares: 19,
      liked: false,
    },
  ]);

  const handlePostSubmit = () => {
    if (!postContent.trim()) {
      toast({ title: "Please enter some content", variant: "destructive" });
      return;
    }

    const newPost = {
      id: Date.now().toString(),
      authorId: CURRENT_USER_ID,
      time: "Just now",
      content: postContent,
      likes: 0,
      comments: 0,
      shares: 0,
      liked: false,
    };

    setLocalPosts([newPost, ...localPosts]);
    setPostContent("");
    toast({ title: "Post created successfully!" });
  };

  const handleLike = (postId: string) => {
    setLocalPosts(localPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.liked ? post.likes - 1 : post.likes + 1,
          liked: !post.liked
        };
      }
      return post;
    }));
  };

  const handleShare = (postId: string) => {
    toast({ title: "Post shared to your network!" });
    setLocalPosts(localPosts.map(post =>
      post.id === postId ? { ...post, shares: post.shares + 1 } : post
    ));
  };

  const handleComment = (postId: string) => {
    toast({ title: "Comments coming soon!" });
  };

  // Mock posts data (keeping as-is since backend doesn't have posts endpoints)
  const posts = localPosts;

  // Create a map of userId to user for quick lookups
  const usersMap = new Map(allUsers.map(user => [user.id, user]));

  // Fallback avatars for mock posts
  const fallbackAvatars: Record<string, string> = {
    "user-1": avatar1,
    "user-2": avatar2,
    "user-3": avatar3,
  };

  // Loading state
  if (userLoading || connectionsLoading || usersLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <aside className="lg:col-span-3 space-y-4">
              <Card>
                <CardContent className="p-0">
                  <Skeleton className="h-16 w-full rounded-t-lg" />
                  <div className="px-4 pb-4">
                    <Skeleton className="h-16 w-16 -mt-8 rounded-full" />
                    <Skeleton className="h-5 w-32 mt-2" />
                    <Skeleton className="h-4 w-48 mt-1" />
                    <Separator className="my-3" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>
            <main className="lg:col-span-6 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-16 w-full mt-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </main>
            <aside className="lg:col-span-3">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="h-16 bg-gradient-to-r from-primary/20 to-primary/10 rounded-t-lg" />
                <div className="px-4 pb-4">
                  <Avatar className="h-16 w-16 -mt-8 border-4 border-card" data-testid="avatar-current-user">
                    <AvatarImage src={currentUser?.avatarUrl || undefined} />
                    <AvatarFallback>{currentUser?.fullName?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <h3 className="mt-2 font-semibold" data-testid="text-current-user-name">
                    {currentUser?.fullName || "User"}
                  </h3>
                  <p className="text-sm text-muted-foreground" data-testid="text-current-user-headline">
                    {currentUser?.headline || "Professional"}
                  </p>
                  <Separator className="my-3" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profile views</span>
                      <span className="font-medium text-primary">127</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Connections</span>
                      <span className="font-medium text-primary" data-testid="text-connections-count">
                        {connections.length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-sm">Trending Topics</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { tag: "#TechInnovation", posts: "1.2K posts" },
                  { tag: "#RemoteWork", posts: "890 posts" },
                  { tag: "#AIRevolution", posts: "2.3K posts" },
                  { tag: "#ProductDesign", posts: "567 posts" },
                ].map((topic) => (
                  <div key={topic.tag} className="flex items-start justify-between hover-elevate rounded-md p-2 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{topic.tag}</p>
                        <p className="text-xs text-muted-foreground">{topic.posts}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>

          <main className="lg:col-span-6 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar data-testid="avatar-post-creator">
                    <AvatarImage src={currentUser?.avatarUrl || undefined} />
                    <AvatarFallback>{currentUser?.fullName?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <Textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Share your thoughts with your network..."
                    className="resize-none min-h-[60px]"
                    data-testid="input-post"
                  />
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" data-testid="button-add-image">
                      <Image className="h-4 w-4 mr-2 text-primary" />
                      <span className="hidden sm:inline">Image</span>
                    </Button>
                    <Button variant="ghost" size="sm" data-testid="button-add-video">
                      <Video className="h-4 w-4 mr-2 text-primary" />
                      <span className="hidden sm:inline">Video</span>
                    </Button>
                    <Button variant="ghost" size="sm" data-testid="button-add-article">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      <span className="hidden sm:inline">Article</span>
                    </Button>
                  </div>
                  <Button size="sm" onClick={handlePostSubmit} data-testid="button-post-submit">Post</Button>
                </div>
              </CardContent>
            </Card>

            {posts.map((post) => {
              const author = usersMap.get(post.authorId);
              const avatarUrl = author?.avatarUrl || fallbackAvatars[post.authorId];
              const authorName = author?.fullName || "Unknown User";
              const authorHeadline = author?.headline || "Professional";
              const authorInitial = authorName ? authorName[0] : "U";

              return (
                <Card key={post.id} data-testid={`card-post-${post.id}`}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar data-testid={`avatar-post-author-${post.id}`}>
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback>{authorInitial}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold" data-testid={`text-post-author-${post.id}`}>
                              {authorName}
                            </h4>
                            <p className="text-sm text-muted-foreground" data-testid={`text-post-author-headline-${post.id}`}>
                              {authorHeadline}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{post.time} ago</p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed">{post.content}</p>
                        <div className="flex items-center gap-6 mt-4 pt-3 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`gap-2 hover-elevate ${post.liked ? 'text-primary' : ''}`}
                            onClick={() => handleLike(post.id)}
                            data-testid={`button-like-${post.id}`}
                          >
                            <ThumbsUp className={`h-4 w-4 ${post.liked ? 'fill-current' : ''}`} />
                            <span className="text-sm">{post.likes}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 hover-elevate"
                            onClick={() => handleComment(post.id)}
                            data-testid={`button-comment-${post.id}`}
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-sm">{post.comments}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 hover-elevate"
                            onClick={() => handleShare(post.id)}
                            data-testid={`button-share-${post.id}`}
                          >
                            <Share2 className="h-4 w-4" />
                            <span className="text-sm">{post.shares}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </main>

          <aside className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-sm">Featured Jobs</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { title: "Senior UX Designer", company: "TechCorp", type: "Full-time" },
                  { title: "Product Manager", company: "Global Solutions", type: "Full-time" },
                  { title: "Software Engineer", company: "InnovateTech", type: "Remote" },
                ].map((job, i) => (
                  <div key={i} className="hover-elevate rounded-md p-3 cursor-pointer border" data-testid={`card-featured-job-${i}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{job.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">{job.company}</p>
                        <Badge variant="secondary" className="mt-1 text-xs">{job.type}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
