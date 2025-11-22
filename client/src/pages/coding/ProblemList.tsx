import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, CheckCircle, Terminal } from "lucide-react";
import { CodingProblem } from "@shared/schema";

export default function ProblemList() {
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState<string>("all");
    const [category, setCategory] = useState<string>("all");
    const [company, setCompany] = useState<string>("all");

    const { data: problems, isLoading } = useQuery<CodingProblem[]>({
        queryKey: ["/api/coding/problems", difficulty, category, company],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (difficulty !== "all") params.append("difficulty", difficulty);
            if (category !== "all") params.append("category", category);
            if (company !== "all") params.append("company", company);
            const res = await fetch(`/api/coding/problems?${params}`);
            return res.json();
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
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Terminal className="h-8 w-8 text-primary" />
                        Problem Library
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Master Data Structures & Algorithms with our curated collection.
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Add streak/progress summary here later */}
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search problems..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                        <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Difficulties</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Arrays">Arrays</SelectItem>
                        <SelectItem value="Strings">Strings</SelectItem>
                        <SelectItem value="DP">Dynamic Programming</SelectItem>
                        <SelectItem value="Graphs">Graphs</SelectItem>
                        <SelectItem value="Trees">Trees</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={company} onValueChange={setCompany}>
                    <SelectTrigger>
                        <SelectValue placeholder="Company" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Companies</SelectItem>
                        <SelectItem value="Google">Google</SelectItem>
                        <SelectItem value="Amazon">Amazon</SelectItem>
                        <SelectItem value="Microsoft">Microsoft</SelectItem>
                        <SelectItem value="Meta">Meta</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Problems Table */}
            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">Status</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead>Acceptance</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : filteredProblems?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No problems found matching your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProblems?.map((problem) => (
                                <TableRow key={problem.id} className="hover:bg-muted/50">
                                    <TableCell>
                                        {/* Placeholder for solved status */}
                                        <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <Link href={`/coding/${problem.slug}`} className="hover:text-primary transition-colors cursor-pointer">
                                            {problem.title}
                                        </Link>
                                        <div className="flex gap-2 mt-1">
                                            {problem.companyTags?.slice(0, 3).map(tag => (
                                                <Badge key={tag} variant="outline" className="text-[10px] px-1 py-0 h-4">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={getDifficultyColor(problem.difficulty)}>
                                            {problem.difficulty}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        -- %
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/coding/${problem.slug}`}>
                                            <Button size="sm" variant="ghost">Solve</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
