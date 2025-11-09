import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, Mail, Edit, Plus, Briefcase, GraduationCap, 
  Award, ExternalLink, Calendar 
} from "lucide-react";
import avatar1 from "@assets/generated_images/Female_professional_headshot_125267a8.png";
import techLogo from "@assets/generated_images/Tech_company_logo_e733cc43.png";
import corpLogo from "@assets/generated_images/Corporate_company_logo_fe87d296.png";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  const profile = {
    name: "Alex Thompson",
    headline: "Senior Product Designer | UX Specialist | Design Systems Advocate",
    location: "San Francisco, CA",
    email: "alex.thompson@email.com",
    avatar: avatar1,
    coverUrl: null,
    connections: 543,
    about: "Passionate product designer with 8+ years of experience creating user-centric digital experiences. I specialize in design systems, interaction design, and leading cross-functional teams to deliver innovative solutions. Always excited to collaborate on projects that make a meaningful impact.",
  };

  const experiences = [
    {
      id: "1",
      title: "Senior Product Designer",
      company: "TechCorp",
      logo: techLogo,
      location: "San Francisco, CA",
      startDate: "Jan 2020",
      endDate: null,
      current: true,
      description: "Leading design initiatives for the core product platform, managing a team of 5 designers, and establishing design system standards across the organization.",
    },
    {
      id: "2",
      title: "Product Designer",
      company: "Global Solutions Inc",
      logo: corpLogo,
      location: "Remote",
      startDate: "Jun 2017",
      endDate: "Dec 2019",
      current: false,
      description: "Designed and shipped multiple product features serving 2M+ users. Collaborated with engineering and product teams to define and implement user experience improvements.",
    },
  ];

  const education = [
    {
      id: "1",
      school: "Stanford University",
      degree: "Master of Science",
      field: "Human-Computer Interaction",
      startDate: "2015",
      endDate: "2017",
    },
    {
      id: "2",
      school: "UC Berkeley",
      degree: "Bachelor of Arts",
      field: "Design",
      startDate: "2011",
      endDate: "2015",
    },
  ];

  const skills = [
    { id: "1", name: "Product Design", endorsements: 87 },
    { id: "2", name: "User Experience (UX)", endorsements: 76 },
    { id: "3", name: "Design Systems", endorsements: 64 },
    { id: "4", name: "Figma", endorsements: 92 },
    { id: "5", name: "Prototyping", endorsements: 58 },
    { id: "6", name: "User Research", endorsements: 45 },
    { id: "7", name: "Interaction Design", endorsements: 53 },
    { id: "8", name: "Wireframing", endorsements: 41 },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="h-48 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/10 rounded-t-lg" />
              <div className="px-6 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-20 sm:-mt-16">
                  <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-card">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-2xl">{profile.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 mt-16 sm:mt-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <h1 className="text-2xl font-bold">{profile.name}</h1>
                        <p className="text-muted-foreground mt-1">{profile.headline}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {profile.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {profile.email}
                          </div>
                        </div>
                        <p className="text-sm text-primary mt-2 font-medium">
                          {profile.connections} connections
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
              <p className="text-sm leading-relaxed text-muted-foreground">{profile.about}</p>
            </CardContent>
          </Card>

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
              {experiences.map((exp, index) => (
                <div key={exp.id}>
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border bg-card">
                      <img src={exp.logo} alt={exp.company} className="h-10 w-10 object-contain" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{exp.title}</h3>
                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                            </span>
                            {exp.current && (
                              <Badge variant="secondary" className="text-xs">Current</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {exp.location}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" data-testid={`button-edit-experience-${exp.id}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                  {index < experiences.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
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
              {education.map((edu, index) => (
                <div key={edu.id}>
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{edu.school}</h3>
                          <p className="text-sm text-muted-foreground">
                            {edu.degree} - {edu.field}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{edu.startDate} - {edu.endDate}</span>
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
              ))}
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
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="secondary"
                    className="px-3 py-1.5 text-sm hover-elevate cursor-pointer"
                    data-testid={`skill-${skill.id}`}
                  >
                    {skill.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {skill.endorsements}
                    </span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
