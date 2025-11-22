import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Clock, XCircle, AlertTriangle } from "lucide-react";

export default function ColorShowcase() {
    return (
        <div className="p-8 space-y-8 bg-background">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold text-foreground">Vivid Indigo Color Palette</h1>
                <p className="text-muted-foreground">ProConnect Job Tracker - Modern Design System</p>
            </div>

            {/* Primary Colors */}
            <Card className="border-2">
                <CardHeader>
                    <CardTitle>Primary Colors - Vivid Indigo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-16 text-lg font-semibold">
                            Primary Button (#4F46E5)
                        </Button>
                        <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground h-16 text-lg font-semibold">
                            Outline Primary
                        </Button>
                        <Button variant="secondary" className="h-16 text-lg font-semibold">
                            Secondary Button
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Status Colors */}
            <Card className="border-2">
                <CardHeader>
                    <CardTitle>Job Status Colors</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-status-applied text-white p-6 rounded-lg text-center space-y-2">
                        <CheckCircle2 className="h-8 w-8 mx-auto" />
                        <div className="font-bold text-lg">Applied</div>
                        <div className="text-sm opacity-90">Emerald Green</div>
                    </div>
                    <div className="bg-status-interview text-white p-6 rounded-lg text-center space-y-2">
                        <Clock className="h-8 w-8 mx-auto" />
                        <div className="font-bold text-lg">Interview</div>
                        <div className="text-sm opacity-90">Electric Blue</div>
                    </div>
                    <div className="bg-status-offer text-white p-6 rounded-lg text-center space-y-2">
                        <CheckCircle2 className="h-8 w-8 mx-auto" />
                        <div className="font-bold text-lg">Offer</div>
                        <div className="text-sm opacity-90">Purple</div>
                    </div>
                    <div className="bg-status-rejected text-white p-6 rounded-lg text-center space-y-2">
                        <XCircle className="h-8 w-8 mx-auto" />
                        <div className="font-bold text-lg">Rejected</div>
                        <div className="text-sm opacity-90">Rose Red</div>
                    </div>
                    <div className="bg-status-pending text-foreground p-6 rounded-lg text-center space-y-2">
                        <AlertCircle className="h-8 w-8 mx-auto" />
                        <div className="font-bold text-lg">Pending</div>
                        <div className="text-sm opacity-90">Amber</div>
                    </div>
                </CardContent>
            </Card>

            {/* Alert Colors */}
            <Card className="border-2">
                <CardHeader>
                    <CardTitle>Alert & Notification Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-success text-success-foreground p-4 rounded-lg flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6" />
                        <div>
                            <div className="font-semibold">Success Message</div>
                            <div className="text-sm opacity-90">Application submitted successfully!</div>
                        </div>
                    </div>
                    <div className="bg-warning text-warning-foreground p-4 rounded-lg flex items-center gap-3">
                        <AlertTriangle className="h-6 w-6" />
                        <div>
                            <div className="font-semibold">Warning Message</div>
                            <div className="text-sm opacity-90">Application deadline approaching in 2 days</div>
                        </div>
                    </div>
                    <div className="bg-destructive text-destructive-foreground p-4 rounded-lg flex items-center gap-3">
                        <XCircle className="h-6 w-6" />
                        <div>
                            <div className="font-semibold">Error Message</div>
                            <div className="text-sm opacity-90">Failed to submit application. Please try again.</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Priority Colors */}
            <Card className="border-2">
                <CardHeader>
                    <CardTitle>Priority Indicators</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border-l-4 border-priority-high bg-card p-4 rounded">
                        <div className="text-priority-high font-bold text-lg mb-2">High Priority</div>
                        <p className="text-sm text-muted-foreground">Critical applications requiring immediate attention</p>
                    </div>
                    <div className="border-l-4 border-priority-medium bg-card p-4 rounded">
                        <div className="text-priority-medium font-bold text-lg mb-2">Medium Priority</div>
                        <p className="text-sm text-muted-foreground">Important applications to follow up soon</p>
                    </div>
                    <div className="border-l-4 border-priority-low bg-card p-4 rounded">
                        <div className="text-priority-low font-bold text-lg mb-2">Low Priority</div>
                        <p className="text-sm text-muted-foreground">Applications with flexible timelines</p>
                    </div>
                </CardContent>
            </Card>

            {/* Cards with Shadows */}
            <Card className="border-2">
                <CardHeader>
                    <CardTitle>Card Styles & Shadows</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="font-semibold mb-2">Subtle Shadow</div>
                            <p className="text-sm text-muted-foreground">Default card style with minimal elevation</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="font-semibold mb-2">Medium Shadow</div>
                            <p className="text-sm text-muted-foreground">Elevated card for important content</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                            <div className="font-semibold mb-2">Large Shadow</div>
                            <p className="text-sm text-muted-foreground">Prominent card for key features</p>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>

            {/* Gradient Buttons */}
            <Card className="border-2">
                <CardHeader>
                    <CardTitle>Gradient Buttons</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    <Button
                        className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground h-12 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                        Gradient Primary
                    </Button>
                    <Button
                        className="bg-gradient-to-r from-success to-success/80 text-success-foreground h-12 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                        Gradient Success
                    </Button>
                    <Button
                        className="bg-gradient-to-r from-warning to-warning/80 text-warning-foreground h-12 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                        Gradient Warning
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
