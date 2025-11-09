import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Image, Video, Calendar, FileText, ThumbsUp, MessageCircle, Share2, TrendingUp, Briefcase } from "lucide-react";
import avatar1 from "@assets/generated_images/Female_professional_headshot_125267a8.png";
import avatar2 from "@assets/generated_images/Male_professional_headshot_d316bd07.png";
import avatar3 from "@assets/generated_images/Senior_female_professional_b467fc71.png";

export default function Home() {
  const posts = [
    {
      id: "1",
      author: "Sarah Johnson",
      headline: "Senior Product Designer at TechCorp",
      avatar: avatar1,
      time: "2h",
      content: "Excited to share that our team just launched a new AI-powered feature that revolutionizes how developers approach functional testing and debugging. This journey from concept to launch taught us invaluable lessons about user-centric design and innovative problem-solving. #TechInnovation #Teamwork",
      likes: 127,
      comments: 23,
      shares: 8,
    },
    {
      id: "2",
      author: "Michael Chen",
      headline: "Software Engineer at Global Solutions Inc",
      avatar: avatar2,
      time: "5h",
      content: "Just completed a fascinating project on microservices architecture. Here are 5 key takeaways that transformed our development workflow and improved system reliability by 40%. Would love to hear your thoughts!",
      likes: 89,
      comments: 15,
      shares: 12,
    },
    {
      id: "3",
      author: "Dr. Emily Rodriguez",
      headline: "Chief Technology Officer at InnovateTech",
      avatar: avatar3,
      time: "1d",
      content: "Thrilled to announce that we're hiring! Looking for passionate engineers who want to make an impact in the AI and machine learning space. DM me if you're interested in joining our innovative team.",
      likes: 234,
      comments: 47,
      shares: 19,
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="h-16 bg-gradient-to-r from-primary/20 to-primary/10 rounded-t-lg" />
                <div className="px-4 pb-4">
                  <Avatar className="h-16 w-16 -mt-8 border-4 border-card">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>ME</AvatarFallback>
                  </Avatar>
                  <h3 className="mt-2 font-semibold">Alex Thompson</h3>
                  <p className="text-sm text-muted-foreground">Senior Product Designer</p>
                  <Separator className="my-3" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profile views</span>
                      <span className="font-medium text-primary">127</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Connections</span>
                      <span className="font-medium text-primary">543</span>
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
                  <Avatar>
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>ME</AvatarFallback>
                  </Avatar>
                  <Textarea
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
                  <Button size="sm" data-testid="button-post-submit">Post</Button>
                </div>
              </CardContent>
            </Card>

            {posts.map((post) => (
              <Card key={post.id} data-testid={`card-post-${post.id}`}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarImage src={post.avatar} />
                      <AvatarFallback>{post.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{post.author}</h4>
                          <p className="text-sm text-muted-foreground">{post.headline}</p>
                          <p className="text-xs text-muted-foreground mt-1">{post.time} ago</p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed">{post.content}</p>
                      <div className="flex items-center gap-6 mt-4 pt-3 border-t">
                        <Button variant="ghost" size="sm" className="gap-2 hover-elevate" data-testid={`button-like-${post.id}`}>
                          <ThumbsUp className="h-4 w-4" />
                          <span className="text-sm">{post.likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2 hover-elevate" data-testid={`button-comment-${post.id}`}>
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm">{post.comments}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2 hover-elevate" data-testid={`button-share-${post.id}`}>
                          <Share2 className="h-4 w-4" />
                          <span className="text-sm">{post.shares}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
