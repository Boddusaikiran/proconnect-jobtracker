import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MoreHorizontal, MapPin, Calendar, Building2 } from "lucide-react";
import { getApplications, createApplication, updateApplication, CURRENT_USER_ID } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const COLUMNS = [
    { id: "Applied", title: "Applied", color: "bg-blue-500/10 text-blue-500" },
    { id: "HR Call", title: "HR Call", color: "bg-yellow-500/10 text-yellow-500" },
    { id: "Interview", title: "Interview", color: "bg-purple-500/10 text-purple-500" },
    { id: "Offer", title: "Offer", color: "bg-green-500/10 text-green-500" },
    { id: "Rejected", title: "Rejected", color: "bg-red-500/10 text-red-500" },
];

export default function JobPipeline() {
    const { toast } = useToast();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newApp, setNewApp] = useState({
        jobTitle: "",
        company: "",
        location: "",
        status: "Applied",
        priority: "Medium",
        notes: "",
    });

    const { data: applications = [], isLoading } = useQuery({
        queryKey: ["/api/users", CURRENT_USER_ID, "applications"],
        queryFn: () => getApplications(CURRENT_USER_ID),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => createApplication({ ...data, userId: CURRENT_USER_ID }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/users", CURRENT_USER_ID, "applications"] });
            toast({ title: "Application added successfully" });
            setIsAddOpen(false);
            setNewApp({
                jobTitle: "",
                company: "",
                location: "",
                status: "Applied",
                priority: "Medium",
                notes: "",
            });
        },
        onError: () => {
            toast({ title: "Failed to add application", variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateApplication(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/users", CURRENT_USER_ID, "applications"] });
            toast({ title: "Application updated" });
        },
    });

    const handleDragStart = (e: React.DragEvent, appId: string) => {
        e.dataTransfer.setData("appId", appId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, status: string) => {
        e.preventDefault();
        const appId = e.dataTransfer.getData("appId");
        if (appId) {
            updateMutation.mutate({ id: appId, data: { status } });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newApp.jobTitle || !newApp.company) {
            toast({ title: "Job title and company are required", variant: "destructive" });
            return;
        }
        createMutation.mutate(newApp);
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading pipeline...</div>;
    }

    return (
        <div className="min-h-screen bg-muted/30 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Application Pipeline</h1>
                    <p className="text-muted-foreground">Track and manage your job applications</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Application
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Application</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Job Title *</label>
                                    <Input
                                        value={newApp.jobTitle}
                                        onChange={(e) => setNewApp({ ...newApp, jobTitle: e.target.value })}
                                        placeholder="e.g. Frontend Developer"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Company *</label>
                                    <Input
                                        value={newApp.company}
                                        onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
                                        placeholder="e.g. Google"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Location</label>
                                    <Input
                                        value={newApp.location}
                                        onChange={(e) => setNewApp({ ...newApp, location: e.target.value })}
                                        placeholder="e.g. Remote"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Priority</label>
                                    <Select
                                        value={newApp.priority}
                                        onValueChange={(val) => setNewApp({ ...newApp, priority: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="High">High</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="Low">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select
                                    value={newApp.status}
                                    onValueChange={(val) => setNewApp({ ...newApp, status: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COLUMNS.map(col => (
                                            <SelectItem key={col.id} value={col.id}>{col.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Notes</label>
                                <Textarea
                                    value={newApp.notes}
                                    onChange={(e) => setNewApp({ ...newApp, notes: e.target.value })}
                                    placeholder="Add any notes about the application..."
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? "Adding..." : "Add Application"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-12rem)]">
                {COLUMNS.map((column) => (
                    <div
                        key={column.id}
                        className="flex-1 min-w-[300px] flex flex-col bg-muted/50 rounded-lg border border-border/50"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, column.id)}
                    >
                        <div className={`p-4 border-b flex items-center justify-between ${column.color} bg-opacity-10`}>
                            <h3 className="font-semibold">{column.title}</h3>
                            <Badge variant="secondary" className="bg-background/50">
                                {applications.filter((app: any) => app.status === column.id).length}
                            </Badge>
                        </div>

                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-3">
                                {applications
                                    .filter((app: any) => app.status === column.id)
                                    .map((app: any) => (
                                        <motion.div
                                            layoutId={app.id}
                                            key={app.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e as any, app.id)}
                                            className="cursor-grab active:cursor-grabbing"
                                        >
                                            <Card className="hover:shadow-md transition-shadow">
                                                <CardContent className="p-4 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-semibold">{app.jobTitle}</h4>
                                                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                                                                <Building2 className="h-3 w-3 mr-1" />
                                                                {app.company}
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        {app.location && (
                                                            <div className="flex items-center">
                                                                <MapPin className="h-3 w-3 mr-1" />
                                                                {app.location}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center ml-auto">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {new Date(app.appliedAt).toLocaleDateString()}
                                                        </div>
                                                    </div>

                                                    {app.priority && (
                                                        <Badge
                                                            variant="outline"
                                                            className={`
                                text-xs 
                                ${app.priority === 'High' ? 'border-red-200 text-red-700 bg-red-50' :
                                                                    app.priority === 'Medium' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                                                                        'border-green-200 text-green-700 bg-green-50'}
                              `}
                                                        >
                                                            {app.priority}
                                                        </Badge>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                            </div>
                        </ScrollArea>
                    </div>
                ))}
            </div>
        </div>
    );
}
