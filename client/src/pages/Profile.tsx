import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, Mail, Edit, Plus, Briefcase, GraduationCap, 
  Award, Calendar 
} from "lucide-react";
import { getUser, getExperiences, getEducation, getSkills, CURRENT_USER_ID, getConnections } from "@/lib/api";

export default function Profile() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID],
    queryFn: () => getUser(CURRENT_USER_ID),
  });

  const { data: experiences = [], isLoading: experiencesLoading } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID, "experiences"],
    queryFn: () => getExperiences(CURRENT_USER_ID),
  });

  const { data: education = [], isLoading: educationLoading } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID, "education"],
    queryFn: () => getEducation(CURRENT_USER_ID),
  });

  const { data: skills = [], isLoading: skillsLoading } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID, "skills"],
    queryFn: () => getSkills(CURRENT_USER_ID),
  });

  const { data: connections = [] } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID, "connections"],
    queryFn: () => getConnections(CURRENT_USER_ID, "accepted"),
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-0">
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <div className="px-6 pb-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-20 sm:-mt-16">
                    <Skeleton className="h-32 w-32 sm:h-40 sm:w-40 rounded-full" />
                    <div className="flex-1 mt-16 sm:mt-0 space-y-2">
                      <Skeleton className="h-8 w-64" />
                      <Skeleton className="h-4 w-96" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-6 space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-0">
              {user.coverUrl ? (
                <img src={user.coverUrl} alt="Cover" className="h-48 w-full object-cover rounded-t-lg" />
              ) : (
                <div className="h-48 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/10 rounded-t-lg" />
              )}
              <div className="px-6 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-20 sm:-mt-16">
                  <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-card">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback className="text-2xl">{user.fullName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 mt-16 sm:mt-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <h1 className="text-2xl font-bold" data-testid="text-user-name">{user.fullName}</h1>
                        <p className="text-muted-foreground mt-1" data-testid="text-user-headline">{user.headline}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                          {user.location && (
                            <div className="flex items-center gap-1" data-testid="text-user-location">
                              <MapPin className="h-4 w-4" />
                              {user.location}
                            </div>
                          )}
                          <div className="flex items-center gap-1" data-testid="text-user-email">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </div>
                        </div>
                        <p className="text-sm text-primary mt-2 font-medium" data-testid="text-connections-count">
                          {connections.length} connections
                        </p>
                      </div>
                      <Button data-testid="button-edit-profile">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {user.about && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">About</h2>
                  <Button variant="ghost" size="icon" data-testid="button-edit-about">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground" data-testid="text-about">{user.about}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  <h2 className="text-xl font-bold">Experience</h2>
                </div>
                <Button variant="ghost" size="icon" data-testid="button-add-experience">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {experiencesLoading ? (
                <>
                  {[1, 2].map(i => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </div>
                  ))}
                </>
              ) : experiences.length > 0 ? (
                experiences.map((exp, index) => (
                  <div key={exp.id}>
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border bg-card">
                        {exp.companyLogo ? (
                          <img src={exp.companyLogo} alt={exp.company} className="h-10 w-10 object-contain" />
                        ) : (
                          <Briefcase className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold" data-testid={`text-experience-title-${exp.id}`}>{exp.title}</h3>
                            <p className="text-sm text-muted-foreground" data-testid={`text-experience-company-${exp.id}`}>{exp.company}</p>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span data-testid={`text-experience-dates-${exp.id}`}>
                                {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                              </span>
                              {exp.current && (
                                <Badge variant="secondary" className="text-xs">Current</Badge>
                              )}
                            </div>
                            {exp.location && (
                              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                {exp.location}
                              </div>
                            )}
                          </div>
                          <Button variant="ghost" size="icon" data-testid={`button-edit-experience-${exp.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        {exp.description && (
                          <p className="mt-3 text-sm text-muted-foreground leading-relaxed" data-testid={`text-experience-description-${exp.id}`}>
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {index < experiences.length - 1 && <Separator className="mt-6" />}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No experience added yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  <h2 className="text-xl font-bold">Education</h2>
                </div>
                <Button variant="ghost" size="icon" data-testid="button-add-education">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {educationLoading ? (
                <>
                  {[1, 2].map(i => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  ))}
                </>
              ) : education.length > 0 ? (
                education.map((edu, index) => (
                  <div key={edu.id}>
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold" data-testid={`text-education-school-${edu.id}`}>{edu.school}</h3>
                            <p className="text-sm text-muted-foreground" data-testid={`text-education-degree-${edu.id}`}>
                              {edu.degree} - {edu.field}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span data-testid={`text-education-dates-${edu.id}`}>
                                {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" data-testid={`button-edit-education-${edu.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {index < education.length - 1 && <Separator className="mt-6" />}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No education added yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <h2 className="text-xl font-bold">Skills</h2>
                </div>
                <Button variant="ghost" size="icon" data-testid="button-add-skill">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {skillsLoading ? (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Skeleton key={i} className="h-8 w-32 rounded-full" />
                  ))}
                </div>
              ) : skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm hover-elevate cursor-pointer"
                      data-testid={`skill-${skill.id}`}
                    >
                      {skill.name}
                      {skill.endorsements !== undefined && skill.endorsements > 0 && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {skill.endorsements}
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No skills added yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
