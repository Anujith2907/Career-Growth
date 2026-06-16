import { NextResponse } from "next/server";

interface Job {
  id: string;
  title: string;
  company: string;
  logo: string; // Tailwind color name
  roleCategory: string; // web-developer, full-stack, ml-engineer, data-science, cloud-engineer, cybersecurity-analyst, devops-engineer, mobile-app-developer
  requiredSkills: string[];
  salaryRange: string;
  location: string;
  description: string;
  applyLink: string;
}

const JOBS_DATABASE: Job[] = [
  {
    id: "job-1",
    title: "Junior Web Developer",
    company: "Figma",
    logo: "amber",
    roleCategory: "web-developer",
    requiredSkills: ["HTML", "CSS", "JavaScript", "React", "Git", "REST APIs"],
    salaryRange: "$80,000 - $110,000",
    location: "San Francisco, CA (Hybrid)",
    description: "Build user-focused interactive vector boards and design asset tools utilizing semantic HTML elements and CSS transitions.",
    applyLink: "https://figma.com/careers"
  },
  {
    id: "job-2",
    title: "Full-Stack Software Engineer",
    company: "Stripe",
    logo: "indigo",
    roleCategory: "full-stack",
    requiredSkills: ["React", "Next.js", "TypeScript", "Node.js", "SQL", "Git"],
    salaryRange: "$105,000 - $145,000",
    location: "Remote (US/Canada)",
    description: "Contribute to core developer integrations, optimizing payment checkout flows and schema structure configurations.",
    applyLink: "https://stripe.com/jobs"
  },
  {
    id: "job-3",
    title: "Machine Learning Engineer",
    company: "OpenAI",
    logo: "purple",
    roleCategory: "ml-engineer",
    requiredSkills: ["Python", "Statistics", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch"],
    salaryRange: "$170,000 - $240,000",
    location: "San Francisco, CA",
    description: "Scale distributed training algorithms and customize PyTorch tensor loaders feeding neural text completion platforms.",
    applyLink: "https://openai.com/careers"
  },
  {
    id: "job-4",
    title: "Data Scientist",
    company: "Google",
    logo: "blue",
    roleCategory: "data-science",
    requiredSkills: ["Python", "SQL", "Statistics", "Pandas/NumPy", "Tableau", "Machine Learning"],
    salaryRange: "$120,000 - $165,000",
    location: "Mountain View, CA (Hybrid)",
    description: "Formulate user growth hypothesis frameworks, parsing usage behaviors, extracting tabular features, and building dashboards.",
    applyLink: "https://google.com/about/careers"
  },
  {
    id: "job-5",
    title: "Cloud Infrastructure Architect",
    company: "Amazon Web Services",
    logo: "orange",
    roleCategory: "cloud-engineer",
    requiredSkills: ["AWS", "Docker", "Kubernetes", "Linux", "Networking", "Terraform"],
    salaryRange: "$135,000 - $185,000",
    location: "Seattle, WA",
    description: "Design highly-available cloud networks (VPCs, transit gateways) and orchestrate containerized elastic compute services.",
    applyLink: "https://amazon.jobs"
  },
  {
    id: "job-6",
    title: "Cybersecurity Incident Analyst",
    company: "Cloudflare",
    logo: "orange",
    roleCategory: "cybersecurity-analyst",
    requiredSkills: ["Networking", "Linux", "Firewalls", "Cryptography", "IAM", "SIEM"],
    salaryRange: "$110,000 - $148,000",
    location: "London, UK (Hybrid)",
    description: "Track global DDoS attacks, config port blockades in firewall rules, and audit anomalous activity SIEM logs.",
    applyLink: "https://cloudflare.com/careers"
  },
  {
    id: "job-7",
    title: "DevOps Engineer (Pipelines)",
    company: "Netflix",
    logo: "red",
    roleCategory: "devops-engineer",
    requiredSkills: ["Git", "Docker", "Kubernetes", "CI/CD", "Terraform", "AWS"],
    salaryRange: "$140,000 - $190,000",
    location: "Los Gatos, CA",
    description: "Automate code packing, deploy container environments, audit config matrices, and monitor application health dashboards.",
    applyLink: "https://netflix.com/jobs"
  },
  {
    id: "job-8",
    title: "Mobile App Developer (iOS/Android)",
    company: "Uber",
    logo: "black",
    roleCategory: "mobile-app-developer",
    requiredSkills: ["Swift", "Kotlin", "Flutter", "React Native", "Git", "REST APIs"],
    salaryRange: "$115,000 - $150,000",
    location: "San Francisco, CA (Hybrid)",
    description: "Build reactive layouts using Jetpack Compose & SwiftUI, linking native APIs to high-throughput routing servers.",
    applyLink: "https://uber.com/careers"
  },
  {
    id: "job-9",
    title: "Web Frontend Developer",
    company: "Vercel",
    logo: "zinc",
    roleCategory: "web-developer",
    requiredSkills: ["HTML", "CSS", "JavaScript", "React", "Git", "REST APIs"],
    salaryRange: "$100,000 - $135,000",
    location: "Remote",
    description: "Craft responsive dashboards, optimizing loading speeds and dynamic assets compiling on web page headers.",
    applyLink: "https://vercel.com/careers"
  },
  {
    id: "job-10",
    title: "Senior Full-Stack Engineer",
    company: "Airbnb",
    logo: "rose",
    roleCategory: "full-stack",
    requiredSkills: ["React", "Next.js", "TypeScript", "Node.js", "SQL", "Git"],
    salaryRange: "$130,000 - $170,000",
    location: "Remote (Europe & US)",
    description: "Maintain and upgrade host directory portals, modeling database layouts and coding strict server endpoints.",
    applyLink: "https://airbnb.com/careers"
  }
];

export async function POST(request: Request) {
  try {
    const { skills, preferredCategory } = await request.json();

    const candidateSkills: string[] = Array.isArray(skills) 
      ? skills.map((s: string) => s.toLowerCase().trim()) 
      : [];

    const matchedJobs = JOBS_DATABASE.map(job => {
      const requiredSkillsLower = job.requiredSkills.map(s => s.toLowerCase());
      const matchingSkills = job.requiredSkills.filter(skill => 
        candidateSkills.includes(skill.toLowerCase())
      );
      
      const missingSkills = job.requiredSkills.filter(skill => 
        !candidateSkills.includes(skill.toLowerCase())
      );

      // Percentage calculation
      let matchPercentage = 0;
      if (requiredSkillsLower.length > 0) {
        matchPercentage = Math.round((matchingSkills.length / requiredSkillsLower.length) * 100);
      }

      // Boost score if job matches the preferred category
      let scoreBoost = 0;
      if (preferredCategory && job.roleCategory === preferredCategory) {
        scoreBoost = 20;
      }
      
      const rank = Math.min(matchPercentage + scoreBoost, 100);

      return {
        ...job,
        matchPercentage,
        matchingSkills,
        missingSkills,
        rank
      };
    });

    const sortedJobs = matchedJobs.sort((a, b) => b.rank - a.rank);

    const recommendations = sortedJobs
      .filter(job => job.matchPercentage >= 25)
      .slice(0, 3)
      .map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        matchPercentage: job.matchPercentage,
        salaryRange: job.salaryRange,
        applyLink: job.applyLink
      }));

    return NextResponse.json({
      jobs: sortedJobs,
      recommendations,
      totalCount: JOBS_DATABASE.length
    });
  } catch (error) {
    console.error("Job Finder Error:", error);
    return NextResponse.json(
      { error: "Invalid query parameters or backend retrieval error." },
      { status: 500 }
    );
  }
}
