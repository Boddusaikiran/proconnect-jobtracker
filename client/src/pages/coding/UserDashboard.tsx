import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Trophy, Flame, Target, Calendar } from "lucide-react";
import { UserCodingProgress } from "@shared/schema";

export default function UserDashboard() {
    const { data: progress, isLoading } = useQuery<UserCodingProgress>({
        queryKey: ["/api/coding/user/progress"],
    });

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const stats = progress || {
        solvedCount: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        xp: 0,
        streak: 0,
    };

    const totalProblems = 200; // Mock total
    const easyTotal = 60;
    const mediumTotal = 100;
    const hardTotal = 40;

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">My Coding Profile</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Solved</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.solvedCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Top 10% of users
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                        <Flame className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.streak} Days</div>
                        <p className="text-xs text-muted-foreground">
                            Keep it up!
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total XP</CardTitle>
                        <Trophy className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.xp}</div>
                        <p className="text-xs text-muted-foreground">
                            Level 5 Coder
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Days</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">
                            This month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Difficulty Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Difficulty Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-green-500 font-medium">Easy</span>
                                <span className="text-muted-foreground">{stats.easySolved} / {easyTotal}</span>
                            </div>
                            <Progress value={(stats.easySolved / easyTotal) * 100} className="bg-green-500/10" indicatorClassName="bg-green-500" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-yellow-500 font-medium">Medium</span>
                                <span className="text-muted-foreground">{stats.mediumSolved} / {mediumTotal}</span>
                            </div>
                            <Progress value={(stats.mediumSolved / mediumTotal) * 100} className="bg-yellow-500/10" indicatorClassName="bg-yellow-500" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-red-500 font-medium">Hard</span>
                                <span className="text-muted-foreground">{stats.hardSolved} / {hardTotal}</span>
                            </div>
                            <Progress value={(stats.hardSolved / hardTotal) * 100} className="bg-red-500/10" indicatorClassName="bg-red-500" />
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity (Mock Heatmap) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Activity Calendar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-1">
                            {Array.from({ length: 365 }).map((_, i) => {
                                const active = Math.random() > 0.8;
                                return (
                                    <div
                                        key={i}
                                        className={`h-3 w-3 rounded-sm ${active ? "bg-green-500" : "bg-muted"
                                            }`}
                                        title={active ? "Solved problems" : "No activity"}
                                    />
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
