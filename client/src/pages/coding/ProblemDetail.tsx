import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Play, CheckCircle, AlertCircle, ChevronLeft } from "lucide-react";
import CodeEditor from "@/components/CodeEditor";
import { CodingProblem, CodingSubmission } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ProblemDetail() {
    const [, params] = useRoute("/coding/:slug");
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const slug = params?.slug;

    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [activeTab, setActiveTab] = useState("description");
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Fetch problem details
    const { data: problem, isLoading } = useQuery<CodingProblem>({
        queryKey: [`/api/coding/problems/${slug}`],
        enabled: !!slug,
    });

    // Fetch previous submissions
    const { data: submissions } = useQuery<CodingSubmission[]>({
        queryKey: [`/api/coding/user/submissions/${problem?.id}`],
        enabled: !!problem?.id,
    });

    // Set initial code when problem loads
    useEffect(() => {
        if (problem?.starterCode) {
            try {
                const starter = JSON.parse(problem.starterCode);
                setCode(starter[language] || "");
            } catch (e) {
                console.error("Failed to parse starter code");
            }
        }
    }, [problem, language]);

    // Submit mutation
    const submitMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/coding/submit", {
                problemId: problem?.id,
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

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!problem) {
        return <div>Problem not found</div>;
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="h-12 border-b flex items-center px-4 justify-between bg-card">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setLocation("/coding")}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <h1 className="font-semibold">{problem.title}</h1>
                        <Badge variant="outline">{problem.difficulty}</Badge>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => submitMutation.mutate()}
                        disabled={submitMutation.isPending}
                    >
                        <Play className="h-4 w-4 mr-2" />
                        Run
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => submitMutation.mutate()}
                        disabled={submitMutation.isPending}
                    >
                        {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"} className="flex-1 min-h-0">
                {/* Left Panel: Description & Submissions */}
                <ResizablePanel defaultSize={40} minSize={30} className="min-w-[300px]">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                        <div className="border-b px-4">
                            <TabsList className="w-full justify-start bg-transparent p-0 h-10">
                                <TabsTrigger value="description" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4">
                                    Description
                                </TabsTrigger>
                                <TabsTrigger value="submissions" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4">
                                    Submissions
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="description" className="flex-1 p-0 m-0 overflow-hidden">
                            <ScrollArea className="h-full p-4">
                                <div className="prose dark:prose-invert max-w-none pb-10">
                                    <div dangerouslySetInnerHTML={{ __html: problem.description }} />

                                    <div className="mt-8">
                                        <h3 className="font-semibold mb-2">Constraints:</h3>
                                        <ul className="list-disc pl-5 space-y-1">
                                            {problem.constraints?.split('\n').map((c, i) => (
                                                <li key={i}>{c}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="font-semibold mb-2">Company Tags:</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {problem.companyTags?.map(tag => (
                                                <Badge key={tag} variant="secondary">{tag}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="submissions" className="flex-1 p-0 m-0 overflow-hidden">
                            <ScrollArea className="h-full p-4">
                                <div className="space-y-4">
                                    {submissions?.map((sub) => (
                                        <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
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
                                    ))}
                                    {(!submissions || submissions.length === 0) && (
                                        <div className="text-center text-muted-foreground py-8">
                                            No submissions yet.
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>

                <ResizableHandle />

                {/* Right Panel: Code Editor */}
                <ResizablePanel defaultSize={60} minSize={30} className="min-w-[300px]">
                    <div className="h-full flex flex-col bg-[#1e1e1e]">
                        <div className="h-10 border-b border-[#2d2d2d] flex items-center px-4 justify-between bg-[#1e1e1e]">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-transparent text-sm border-none focus:ring-0 cursor-pointer text-gray-300"
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="cpp">C++</option>
                                <option value="java">Java</option>
                            </select>
                        </div>
                        <div className="flex-1 relative min-h-[200px]">
                            <CodeEditor
                                language={language}
                                value={code}
                                onChange={setCode}
                                height="100%"
                            />
                        </div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
