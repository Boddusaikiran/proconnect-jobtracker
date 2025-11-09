import { storage } from "./storage";

export async function seedData() {
  // Create the current user first with a predictable ID
  const user1Id = "current-user-id";
  const user1 = {
    id: user1Id,
    username: "alex_thompson",
    password: "",
    fullName: "Alex Thompson",
    headline: "Senior Product Designer | UX Specialist | Design Systems Advocate",
    email: "alex.thompson@email.com",
    location: "San Francisco, CA",
    about: "Passionate product designer with 8+ years of experience creating user-centric digital experiences. I specialize in design systems, interaction design, and leading cross-functional teams to deliver innovative solutions. Always excited to collaborate on projects that make a meaningful impact.",
    avatarUrl: "/assets/generated_images/Female_professional_headshot_125267a8.png",
    coverUrl: null,
    createdAt: new Date(),
  };

  // Manually insert the user with the specific ID
  (storage as any).users.set(user1Id, user1);

  const user2 = await storage.createUser({
    username: "sarah_johnson",
    password: "",
    fullName: "Sarah Johnson",
    headline: "Senior Product Designer at TechCorp",
    email: "sarah.johnson@techcorp.com",
    location: "San Francisco, CA",
    about: "Leading design initiatives for next-generation products. Focused on creating delightful user experiences that solve real problems.",
    avatarUrl: "/assets/generated_images/Female_professional_headshot_125267a8.png",
    coverUrl: null,
  });

  const user3 = await storage.createUser({
    username: "michael_chen",
    password: "",
    fullName: "Michael Chen",
    headline: "Software Engineer at Global Solutions Inc",
    email: "michael.chen@globalsolutions.com",
    location: "Remote",
    about: "Full-stack developer passionate about building scalable systems and clean code.",
    avatarUrl: "/assets/generated_images/Male_professional_headshot_d316bd07.png",
    coverUrl: null,
  });

  const user4 = await storage.createUser({
    username: "emily_rodriguez",
    password: "",
    fullName: "Dr. Emily Rodriguez",
    headline: "Chief Technology Officer at InnovateTech",
    email: "emily.rodriguez@innovatetech.com",
    location: "New York, NY",
    about: "Technology leader driving innovation in AI and machine learning. Building teams that create the future.",
    avatarUrl: "/assets/generated_images/Senior_female_professional_b467fc71.png",
    coverUrl: null,
  });

  const user5 = await storage.createUser({
    username: "david_kim",
    password: "",
    fullName: "David Kim",
    headline: "Full Stack Developer at StartupXYZ",
    email: "david.kim@startupxyz.com",
    location: "Austin, TX",
    about: "Building innovative web applications with modern technologies.",
    avatarUrl: "/assets/generated_images/Young_male_professional_8999059f.png",
    coverUrl: null,
  });

  // Add experiences for Alex Thompson
  await storage.createExperience({
    userId: user1.id,
    title: "Senior Product Designer",
    company: "TechCorp",
    companyLogo: "/assets/generated_images/Tech_company_logo_e733cc43.png",
    location: "San Francisco, CA",
    startDate: "Jan 2020",
    endDate: null,
    current: true,
    description: "Leading design initiatives for the core product platform, managing a team of 5 designers, and establishing design system standards across the organization.",
  });

  await storage.createExperience({
    userId: user1.id,
    title: "Product Designer",
    company: "Global Solutions Inc",
    companyLogo: "/assets/generated_images/Corporate_company_logo_fe87d296.png",
    location: "Remote",
    startDate: "Jun 2017",
    endDate: "Dec 2019",
    current: false,
    description: "Designed and shipped multiple product features serving 2M+ users. Collaborated with engineering and product teams to define and implement user experience improvements.",
  });

  // Add education for Alex Thompson
  await storage.createEducation({
    userId: user1.id,
    school: "Stanford University",
    degree: "Master of Science",
    field: "Human-Computer Interaction",
    startDate: "2015",
    endDate: "2017",
    current: false,
  });

  await storage.createEducation({
    userId: user1.id,
    school: "UC Berkeley",
    degree: "Bachelor of Arts",
    field: "Design",
    startDate: "2011",
    endDate: "2015",
    current: false,
  });

  // Add skills for Alex Thompson
  const skills = [
    { name: "Product Design", endorsements: 87 },
    { name: "User Experience (UX)", endorsements: 76 },
    { name: "Design Systems", endorsements: 64 },
    { name: "Figma", endorsements: 92 },
    { name: "Prototyping", endorsements: 58 },
    { name: "User Research", endorsements: 45 },
    { name: "Interaction Design", endorsements: 53 },
    { name: "Wireframing", endorsements: 41 },
  ];

  for (const skill of skills) {
    await storage.createSkill({
      userId: user1.id,
      ...skill,
    });
  }

  // Create connections
  await storage.createConnection({
    userId: user1.id,
    connectedUserId: user2.id,
    status: "accepted",
  });

  await storage.createConnection({
    userId: user1.id,
    connectedUserId: user3.id,
    status: "accepted",
  });

  await storage.createConnection({
    userId: user1.id,
    connectedUserId: user4.id,
    status: "accepted",
  });

  await storage.createConnection({
    userId: user5.id,
    connectedUserId: user1.id,
    status: "pending",
  });

  // Create jobs
  await storage.createJob({
    title: "Senior Product Designer",
    company: "TechCorp",
    companyLogo: "/assets/generated_images/Tech_company_logo_e733cc43.png",
    location: "San Francisco, CA",
    type: "Full-time",
    level: "Mid-Senior level",
    salary: "$120k - $180k",
    description: "Join our design team to create beautiful, user-centric products that millions of people use every day. You'll be working on our core platform, collaborating with product managers and engineers to ship features that delight users.",
    requirements: "5+ years of product design experience, strong portfolio showcasing user-centered design, proficiency in Figma, experience with design systems, excellent communication skills.",
  });

  await storage.createJob({
    title: "Software Engineer",
    company: "Global Solutions Inc",
    companyLogo: "/assets/generated_images/Corporate_company_logo_fe87d296.png",
    location: "Remote",
    type: "Full-time",
    level: "Entry level",
    salary: "$90k - $130k",
    description: "Build scalable backend systems and APIs that power our platform serving millions of users worldwide. Work with modern technologies and be part of a collaborative engineering team.",
    requirements: "Bachelor's degree in Computer Science or related field, experience with Node.js or Python, understanding of RESTful APIs, database knowledge (SQL or NoSQL), strong problem-solving skills.",
  });

  await storage.createJob({
    title: "Product Manager",
    company: "InnovateTech",
    companyLogo: "/assets/generated_images/Tech_company_logo_e733cc43.png",
    location: "New York, NY",
    type: "Full-time",
    level: "Mid-Senior level",
    salary: "$140k - $200k",
    description: "Lead product strategy and execution for our flagship AI-powered analytics platform. Define roadmap, work with engineering and design teams, and drive business impact.",
    requirements: "5+ years of product management experience, proven track record of shipping successful products, strong analytical skills, excellent stakeholder management, technical background preferred.",
  });

  await storage.createJob({
    title: "UX Researcher",
    company: "DesignHub",
    companyLogo: "/assets/generated_images/Corporate_company_logo_fe87d296.png",
    location: "Austin, TX",
    type: "Full-time",
    level: "Mid-Senior level",
    salary: "$100k - $150k",
    description: "Conduct user research to inform product decisions and improve user experience across our suite of tools. Plan and execute research studies, analyze data, and present findings to stakeholders.",
    requirements: "3+ years of UX research experience, proficiency in qualitative and quantitative research methods, experience with user testing tools, strong communication skills, portfolio of research projects.",
  });

  const job1 = await storage.createJob({
    title: "Frontend Developer",
    company: "WebWorks",
    companyLogo: "/assets/generated_images/Tech_company_logo_e733cc43.png",
    location: "Remote",
    type: "Full-time",
    level: "Entry level",
    salary: "$80k - $120k",
    description: "Build responsive and performant web applications using React and TypeScript. Collaborate with designers to implement pixel-perfect UIs.",
    requirements: "Strong JavaScript/TypeScript skills, experience with React, understanding of responsive design, knowledge of modern CSS, Git proficiency.",
  });

  // Create application for Alex
  await storage.createApplication({
    userId: user1.id,
    jobId: job1.id,
    status: "applied",
  });

  // Create messages
  await storage.createMessage({
    senderId: user2.id,
    receiverId: user1.id,
    content: "Hi! I saw your profile and I'm really impressed with your design work.",
    read: true,
  });

  await storage.createMessage({
    senderId: user1.id,
    receiverId: user2.id,
    content: "Thank you! I'd be happy to discuss potential collaboration opportunities.",
    read: true,
  });

  await storage.createMessage({
    senderId: user2.id,
    receiverId: user1.id,
    content: "That sounds great! When can we schedule a call?",
    read: false,
  });

  await storage.createMessage({
    senderId: user3.id,
    receiverId: user1.id,
    content: "Thanks for connecting! I'd love to learn more about your work.",
    read: true,
  });

  await storage.createMessage({
    senderId: user4.id,
    receiverId: user1.id,
    content: "I'll send over the project details tomorrow.",
    read: true,
  });

  // Create notifications
  await storage.createNotification({
    userId: user1.id,
    type: "connection_request",
    content: "sent you a connection request",
    actorId: user5.id,
    read: false,
  });

  await storage.createNotification({
    userId: user1.id,
    type: "connection_accepted",
    content: "accepted your connection request",
    actorId: user3.id,
    read: false,
  });

  await storage.createNotification({
    userId: user1.id,
    type: "message",
    content: "sent you a message",
    actorId: user2.id,
    read: true,
  });

  await storage.createNotification({
    userId: user1.id,
    type: "profile_view",
    content: "viewed your profile",
    actorId: user4.id,
    read: true,
  });

  await storage.createNotification({
    userId: user1.id,
    type: "job_application",
    content: "Your application for Frontend Developer is under review",
    actorId: null,
    read: true,
  });

  console.log("✅ Database seeded successfully");
}
