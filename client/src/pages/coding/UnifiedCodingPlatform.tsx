import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Play, CheckCircle, AlertCircle, Terminal, Trophy, Flame, Target, Award, BookOpen, Users, TrendingUp } from "lucide-react";
import CodeEditor from "@/components/CodeEditor";
import { CodingProblem, CodingSubmission, UserCodingProgress, UserBadge } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function UnifiedCodingPlatform() {
    const { toast } = useToast();

    // State
    const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [difficulty, setDifficulty] = useState<string>("all");
    const [category, setCategory] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("description");
    const [mainView, setMainView] = useState<"problems" | "leaderboard" | "profile">("problems");

    // Fetch problems
    const { data: problems, isLoading: problemsLoading } = useQuery<CodingProblem[]>({
        queryKey: ["/api/coding/problems", difficulty, category],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (difficulty !== "all") params.append("difficulty", difficulty);
            if (category !== "all") params.append("category", category);
            const res = await fetch(`/api/coding/problems?${params}`);
            return res.json();
        },
    });

    // Fetch user progress
    const { data: progress } = useQuery<UserCodingProgress>({
        queryKey: ["/api/coding/user/progress"],
    });

    // Fetch leaderboard
    const { data: leaderboard } = useQuery<UserCodingProgress[]>({
        queryKey: ["/api/coding/leaderboard"],
        enabled: mainView === "leaderboard",
    });

    // Fetch user badges
    const { data: badges } = useQuery<UserBadge[]>({
        queryKey: [`/api/coding/badges/${progress?.userId}`],
        enabled: !!progress?.userId && mainView === "profile",
    });

    // Fetch submissions for selected problem
    const { data: submissions } = useQuery<CodingSubmission[]>({
        queryKey: [`/api/coding/user/submissions/${selectedProblem?.id}`],
        enabled: !!selectedProblem?.id,
    });

    // Fetch editorial
    const { data: editorial } = useQuery({
        queryKey: [`/api/coding/editorial/${selectedProblem?.id}`],
        enabled: !!selectedProblem?.id && activeTab === "editorial",
    });

    // Set initial code when problem loads
    useEffect(() => {
        if (selectedProblem?.starterCode) {
            try {
                const starter = JSON.parse(selectedProblem.starterCode);
                setCode(starter[language] || "");
            } catch (e) {
                console.error("Failed to parse starter code");
            }
        }
    }, [selectedProblem, language]);

    // Submit mutation
    const submitMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/coding/submit", {
                problemId: selectedProblem?.id,
                code,
                language,
            });
            return res.json();
        },
        onSuccess: (data) => {
            if (data.result.error) {
                toast({
                    title: "Runtime Error",
                    description: data.result.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Success!",
                    description: "Your solution has been submitted.",
                });
            }
        },
        onError: (err: any) => {
            toast({
                title: "Submission Failed",
                description: err.message,
                variant: "destructive",
            });
        },
    });

    const filteredProblems = problems?.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
    );

    const getDifficultyColor = (diff: string) => {
        switch (diff.toLowerCase()) {
            case "easy":
                return "text-green-500 bg-green-500/10";
            case "medium":
                return "text-yellow-500 bg-yellow-500/10";
            case "hard":
                return "text-red-500 bg-red-500/10";
            default:
                return "text-gray-500";
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Top Navigation Bar */}
            <div className="h-16 border-b bg-card px-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Terminal className="h-5 w-5 text-primary" />
                        <h1 className="text-xl font-bold">Coding Platform</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={mainView === "problems" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setMainView("problems")}
                        >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Problems
                        </Button>
                        <Button
                            variant={mainView === "leaderboard" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setMainView("leaderboard")}
                        >
                            <Trophy className="h-4 w-4 mr-2" />
                            Leaderboard
                        </Button>
                        <Button
                            variant={mainView === "profile" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setMainView("profile")}
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Profile
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{progress?.solvedCount || 0} Solved</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">{progress?.streak || 0} Day Streak</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{progress?.xp || 0} XP</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {mainView === "problems" ? (
                <ResizablePanelGroup direction="horizontal" className="flex-1">
                    {/* Left Panel: Problem List */}
                    <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                        <div className="h-full flex flex-col bg-muted/30">
                            {/* Filters */}
                            <div className="p-4 space-y-3 border-b">
                                <Input
                                    placeholder="Search problems..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-9"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <Select value={difficulty} onValueChange={setDifficulty}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Difficulty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="easy">Easy</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="hard">Hard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="Arrays">Arrays</SelectItem>
                                            <SelectItem value="Strings">Strings</SelectItem>
                                            <SelectItem value="Dynamic Programming">DP</SelectItem>
                                            <SelectItem value="Graphs">Graphs</SelectItem>
                                            <SelectItem value="Trees">Trees</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Problem List */}
                            <ScrollArea className="flex-1">
                                {problemsLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <div className="p-2 space-y-1">
                                        {filteredProblems?.map((problem) => (
                                            <div
                                                key={problem.id}
                                                onClick={() => setSelectedProblem(problem)}
                                                className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedProblem?.id === problem.id
                                                    ? "bg-primary/10 border-l-2 border-primary"
                                                    : "hover:bg-muted"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-sm truncate">{problem.title}</span>
                                                    <Badge variant="secondary" className={`${getDifficultyColor(problem.difficulty)} text-[10px] px-1.5 py-0`}>
                                                        {problem.difficulty}
                                                    </Badge>
                                                </div>
                                                <div className="flex gap-1 flex-wrap">
                                                    {problem.companyTags?.slice(0, 2).map(tag => (
                                                        <Badge key={tag} variant="outline" className="text-[9px] px-1 py-0 h-4">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </ResizablePanel>

                    <ResizableHandle />

                    {/* Middle Panel: Problem Description */}
                    <ResizablePanel defaultSize={35} minSize={25}>
                        {selectedProblem ? (
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                                <div className="border-b px-4 flex items-center justify-between">
                                    <TabsList className="bg-transparent p-0 h-10">
                                        <TabsTrigger value="description" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                                            Description
                                        </TabsTrigger>
                                        <TabsTrigger value="editorial" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                                            Editorial
                                        </TabsTrigger>
                                        <TabsTrigger value="submissions" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                                            Submissions
                                        </TabsTrigger>
                                    </TabsList>
                                    <Badge variant="outline" className={getDifficultyColor(selectedProblem.difficulty)}>
                                        {selectedProblem.difficulty}
                                    </Badge>
                                </div>

                                <TabsContent value="description" className="flex-1 p-0 m-0 overflow-hidden">
                                    <ScrollArea className="h-full p-4">
                                        <div className="prose dark:prose-invert max-w-none">
                                            <h2 className="text-xl font-bold mb-4">{selectedProblem.title}</h2>
                                            <div dangerouslySetInnerHTML={{ __html: selectedProblem.description }} />

                                            {selectedProblem.constraints && (
                                                <div className="mt-6">
                                                    <h3 className="font-semibold mb-2">Constraints:</h3>
                                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                                        {selectedProblem.constraints.split('\n').map((c, i) => (
                                                            <li key={i}>{c}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {selectedProblem.companyTags && selectedProblem.companyTags.length > 0 && (
                                                <div className="mt-6">
                                                    <h3 className="font-semibold mb-2">Companies:</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedProblem.companyTags.map(tag => (
                                                            <Badge key={tag} variant="secondary">{tag}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                <TabsContent value="editorial" className="flex-1 p-0 m-0 overflow-hidden">
                                    <ScrollArea className="h-full p-4">
                                        <div className="prose dark:prose-invert max-w-none">
                                            <h3 className="text-lg font-bold mb-4">Solution Approach</h3>
                                            {editorial?.editorial ? (
                                                <>
                                                    <p className="mb-4">{editorial.editorial}</p>

                                                    {editorial.timeComplexity && (
                                                        <div className="mb-4">
                                                            <h4 className="font-semibold">Time Complexity:</h4>
                                                            <code className="text-sm bg-muted px-2 py-1 rounded">{editorial.timeComplexity}</code>
                                                        </div>
                                                    )}

                                                    {editorial.spaceComplexity && (
                                                        <div className="mb-4">
                                                            <h4 className="font-semibold">Space Complexity:</h4>
                                                            <code className="text-sm bg-muted px-2 py-1 rounded">{editorial.spaceComplexity}</code>
                                                        </div>
                                                    )}

                                                    {editorial.editorialCode && (
                                                        <div className="mt-6">
                                                            <h4 className="font-semibold mb-2">Solution Code:</h4>
                                                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                                                                <code>{JSON.parse(editorial.editorialCode)[language] || "No solution available for this language"}</code>
                                                            </pre>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-muted-foreground">Editorial solution coming soon...</p>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                <TabsContent value="submissions" className="flex-1 p-0 m-0 overflow-hidden">
                                    <ScrollArea className="h-full p-4">
                                        <div className="space-y-3">
                                            {submissions?.map((sub) => (
                                                <Card key={sub.id}>
                                                    <CardContent className="p-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                {sub.status === "Accepted" ? (
                                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                                ) : (
                                                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                                                )}
                                                                <div>
                                                                    <p className="font-medium text-sm">{sub.status}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {new Date(sub.submittedAt).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right text-xs text-muted-foreground">
                                                                <p>{sub.runtime}ms</p>
                                                                <p>{sub.memory}KB</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                            {(!submissions || submissions.length === 0) && (
                                                <div className="text-center text-muted-foreground py-8 text-sm">
                                                    No submissions yet. Write your solution and submit!
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>
                            </Tabs>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                    <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium">Select a problem to start coding</p>
                                    <p className="text-sm mt-2">Choose from the list on the left</p>
                                </div>
                            </div>
                        )}
                    </ResizablePanel>

                    <ResizableHandle />

                    {/* Right Panel: Code Editor */}
                    <ResizablePanel defaultSize={40} minSize={30}>
                        <div className="h-full flex flex-col bg-[#1e1e1e]">
                            {/* Editor Header */}
                            <div className="h-12 border-b border-[#2d2d2d] flex items-center px-4 justify-between bg-[#1e1e1e]">
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="bg-[#2d2d2d] text-gray-300 text-sm border-none rounded px-3 py-1.5 cursor-pointer focus:ring-2 focus:ring-primary"
                                    disabled={!selectedProblem}
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="cpp">C++</option>
                                    <option value="java">Java</option>
                                    <option value="typescript">TypeScript</option>
                                    <option value="go">Go</option>
                                    <option value="csharp">C#</option>
                                    <option value="rust">Rust</option>
                                </select>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => submitMutation.mutate()}
                                        disabled={submitMutation.isPending || !selectedProblem}
                                    >
                                        <Play className="h-4 w-4 mr-2" />
                                        Run
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => submitMutation.mutate()}
                                        disabled={submitMutation.isPending || !selectedProblem}
                                    >
                                        {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                                    </Button>
                                </div>
                            </div>

                            {/* Code Editor */}
                            <div className="flex-1 relative">
                                {selectedProblem ? (
                                    <CodeEditor
                                        language={language}
                                        value={code}
                                        onChange={setCode}
                                        height="100%"
                                    />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-500">
                                        <div className="text-center">
                                            <p className="text-sm">Select a problem to start coding</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            ) : mainView === "leaderboard" ? (
                <div className="flex-1 p-8 overflow-auto">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <Trophy className="h-8 w-8 text-yellow-500" />
                            <h2 className="text-3xl font-bold">Global Leaderboard</h2>
                        </div>
                        <div className="space-y-2">
                            {leaderboard?.map((user, index) => (
                                <Card key={user.id} className={index < 3 ? "border-2 border-yellow-500/50" : ""}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`text-2xl font-bold ${index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : index === 2 ? "text-orange-600" : "text-muted-foreground"}`}>
                                                    #{index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">User {user.userId.slice(0, 8)}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {user.solvedCount} problems solved
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-primary">{user.xp} XP</p>
                                                <p className="text-sm text-muted-foreground">{user.streak} day streak</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 p-8 overflow-auto">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Users className="h-8 w-8 text-primary" />
                            <h2 className="text-3xl font-bold">Your Profile</h2>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Solved</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{progress?.solvedCount || 0}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Easy: {progress?.easySolved || 0} | Medium: {progress?.mediumSolved || 0} | Hard: {progress?.hardSolved || 0}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold flex items-center gap-2">
                                        <Flame className="h-8 w-8 text-orange-500" />
                                        {progress?.streak || 0} days
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total XP</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold flex items-center gap-2">
                                        <TrendingUp className="h-8 w-8 text-green-500" />
                                        {progress?.xp || 0}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Badges */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5" />
                                    Badges & Achievements
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {badges && badges.length > 0 ? (
                                        badges.map((badge) => (
                                            <div key={badge.id} className="text-center p-4 border rounded-lg">
                                                <Award className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
                                                <p className="font-semibold text-sm">{badge.badgeName}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{badge.badgeDescription}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center text-muted-foreground py-8">
                                            <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>No badges earned yet. Keep solving problems!</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
