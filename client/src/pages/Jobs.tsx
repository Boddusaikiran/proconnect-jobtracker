import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, MapPin, Briefcase, DollarSign, Clock, BookmarkPlus, 
  Bookmark, Building2, TrendingUp, Filter 
} from "lucide-react";
import { getJobs, getApplications, getSavedJobs, applyToJob, saveJob, unsaveJob, CURRENT_USER_ID } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Job } from "@shared/schema";

export default function Jobs() {
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const { toast } = useToast();

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs"],
    queryFn: getJobs,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID, "applications"],
    queryFn: () => getApplications(CURRENT_USER_ID),
  });

  const { data: savedJobsData = [] } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID, "saved-jobs"],
    queryFn: () => getSavedJobs(CURRENT_USER_ID),
  });

  const applyMutation = useMutation({
    mutationFn: ({ jobId }: { jobId: string }) => applyToJob(CURRENT_USER_ID, jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", CURRENT_USER_ID, "applications"] });
      toast({ title: "Application submitted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to submit application", variant: "destructive" });
    },
  });

  const saveMutation = useMutation({
    mutationFn: ({ jobId }: { jobId: string }) => saveJob(CURRENT_USER_ID, jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", CURRENT_USER_ID, "saved-jobs"] });
      toast({ title: "Job saved successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to save job", variant: "destructive" });
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: ({ jobId }: { jobId: string }) => unsaveJob(CURRENT_USER_ID, jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", CURRENT_USER_ID, "saved-jobs"] });
      toast({ title: "Job removed from saved" });
    },
  });

  const appliedJobIds = new Set(applications.map(app => app.jobId));
  const savedJobIds = new Set(savedJobsData.map(saved => saved.jobId));

  const jobsWithStatus = jobs.map(job => ({
    ...job,
    applied: appliedJobIds.has(job.id),
    saved: savedJobIds.has(job.id),
  }));

  const appliedJobs = jobsWithStatus.filter(job => job.applied);
  const savedJobs = jobsWithStatus.filter(job => job.saved);

  const jobTypes = ["Full-time", "Part-time", "Contract", "Internship"];
  const experienceLevels = ["Entry level", "Mid-Senior level", "Director", "Executive"];
  const locations = ["Remote", "San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA"];

  const JobCard = ({ job }: { job: typeof jobsWithStatus[0] }) => (
    <Card className="hover-elevate" data-testid={`card-job-${job.id}`}>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border bg-card">
            {job.companyLogo ? (
              <img src={job.companyLogo} alt={job.company} className="h-12 w-12 object-contain" />
            ) : (
              <Building2 className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <p className="text-sm text-muted-foreground">{job.company}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {job.type}
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {job.level}
                  </div>
                  {job.salary && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {job.salary}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (job.saved) {
                    unsaveMutation.mutate({ jobId: job.id });
                  } else {
                    saveMutation.mutate({ jobId: job.id });
                  }
                }}
                data-testid={`button-save-${job.id}`}
              >
                {job.saved ? (
                  <Bookmark className="h-5 w-5 fill-primary text-primary" />
                ) : (
                  <BookmarkPlus className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
              {job.description}
            </p>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-4 w-4" />
                {new Date(job.postedAt).toLocaleDateString()}
              </div>
              <div className="flex gap-2">
                {job.applied ? (
                  <Badge variant="secondary">Applied</Badge>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={() => applyMutation.mutate({ jobId: job.id })}
                    disabled={applyMutation.isPending}
                    data-testid={`button-apply-${job.id}`}
                  >
                    Easy Apply
                  </Button>
                )}
                <Button variant="outline" size="sm" data-testid={`button-view-${job.id}`}>
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (jobsLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Skeleton className="h-14 w-14" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-64" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by job title, company, or keyword..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-jobs"
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Location"
                  className="pl-9"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  data-testid="input-location"
                />
              </div>
              <Button data-testid="button-search">Search Jobs</Button>
              <Button
                variant="outline"
                className="md:hidden"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-toggle-filters"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className={`lg:col-span-3 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Filters</h3>
                  <Button variant="ghost" size="sm" data-testid="button-clear-filters">
                    Clear all
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-sm mb-3">Job Type</h4>
                  <div className="space-y-2">
                    {jobTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox id={type} data-testid={`checkbox-${type.toLowerCase().replace(/\s+/g, '-')}`} />
                        <label
                          htmlFor={type}
                          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-sm mb-3">Experience Level</h4>
                  <div className="space-y-2">
                    {experienceLevels.map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox id={level} data-testid={`checkbox-${level.toLowerCase().replace(/\s+/g, '-')}`} />
                        <label
                          htmlFor={level}
                          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {level}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-sm mb-3">Location</h4>
                  <div className="space-y-2">
                    {locations.map((location) => (
                      <div key={location} className="flex items-center space-x-2">
                        <Checkbox id={location} data-testid={`checkbox-${location.toLowerCase().replace(/\s+/g, '-').replace(/,/g, '')}`} />
                        <label
                          htmlFor={location}
                          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {location}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          <main className="lg:col-span-9">
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="all" data-testid="tab-all-jobs">
                  All Jobs ({jobsWithStatus.length})
                </TabsTrigger>
                <TabsTrigger value="saved" data-testid="tab-saved-jobs">
                  Saved ({savedJobs.length})
                </TabsTrigger>
                <TabsTrigger value="applied" data-testid="tab-applied-jobs">
                  Applied ({appliedJobs.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {jobsWithStatus.map(job => <JobCard key={job.id} job={job} />)}
              </TabsContent>

              <TabsContent value="saved" className="space-y-4">
                {savedJobs.length > 0 ? (
                  savedJobs.map(job => <JobCard key={job.id} job={job} />)
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/50" />
                      <h3 className="mt-4 font-semibold">No saved jobs</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Save jobs to easily apply to them later
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="applied" className="space-y-4">
                {appliedJobs.length > 0 ? (
                  appliedJobs.map(job => (
                    <Card key={job.id} className="hover-elevate">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border bg-card">
                            {job.companyLogo ? (
                              <img src={job.companyLogo} alt={job.company} className="h-12 w-12 object-contain" />
                            ) : (
                              <Building2 className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{job.title}</h3>
                                <p className="text-sm text-muted-foreground">{job.company}</p>
                                <Badge variant="secondary" className="mt-2">Application under review</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50" />
                      <h3 className="mt-4 font-semibold">No applications yet</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Start applying to jobs to track your applications here
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
}
