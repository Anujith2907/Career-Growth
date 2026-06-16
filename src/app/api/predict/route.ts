import { NextResponse } from "next/server";

export interface PredictorInput {
  tenthPercentage: number;
  twelfthPercentage: number;
  cgpa: number;
  leetcodeSolved: number;
  codechefRating: number;
  hackerrankScore: number;
  githubActivity: number; // Commits per year
  technicalSkills: string[];
  certifications: string[];
  internships: number; // Months
  projects: number;
  communicationScore: number; // 1 to 10
  aptitudeScore: number; // 1 to 10
  extracurriculars: string[];
}

export async function POST(request: Request) {
  try {
    const data: PredictorInput = await request.json();

    // 1. Calculate Technical Score (0 - 100)
    // CGPA contributes up to 20 pts
    const cgpaPoints = Math.min(data.cgpa / 10, 1) * 20;
    
    // Academics (10th & 12th) contribute up to 10 pts
    const schoolPoints = ((data.tenthPercentage + data.twelfthPercentage) / 200) * 10;
    
    // Coding platforms contribute up to 30 pts
    const leetcodePoints = Math.min(data.leetcodeSolved / 400, 1) * 15;
    const codechefPoints = Math.min(data.codechefRating / 2000, 1) * 10;
    const hackerrankPoints = Math.min(data.hackerrankScore / 500, 1) * 5;
    
    // Projects + GitHub + Internships contribute up to 30 pts
    const projectPoints = Math.min(data.projects / 4, 1) * 10;
    const githubPoints = Math.min(data.githubActivity / 150, 1) * 10;
    const internshipPoints = Math.min(data.internships / 6, 1) * 10;
    
    // Extra skills / certifications contribute up to 10 pts
    const skillPoints = Math.min(data.technicalSkills.length / 8, 1) * 5;
    const certPoints = Math.min(data.certifications.length / 4, 1) * 5;

    const technicalScore = Math.min(
      Math.round(
        cgpaPoints + schoolPoints + leetcodePoints + codechefPoints + 
        hackerrankPoints + projectPoints + githubPoints + internshipPoints + 
        skillPoints + certPoints
      ),
      100
    );

    // 2. Communication Score (0 - 100)
    const communicationScore = data.communicationScore * 10;

    // 3. Aptitude Score (0 - 100)
    const aptitudeScore = data.aptitudeScore * 10;

    // 4. Overrall Placement Score (0 - 100)
    // 50% Technical, 25% Communication, 25% Aptitude
    const placementScore = Math.round(
      (technicalScore * 0.5) + (communicationScore * 0.25) + (aptitudeScore * 0.25)
    );

    // 5. Placement Probability (%)
    // Sigmoid curve around a mid-point of score=60
    const probability = Math.round(
      (1 / (1 + Math.exp(-(placementScore - 55) / 12))) * 100
    );

    // 6. Readiness Level
    let readinessLevel = "Beginner";
    if (placementScore >= 85) readinessLevel = "Job Ready (Elite)";
    else if (placementScore >= 70) readinessLevel = "Advanced Ready";
    else if (placementScore >= 50) readinessLevel = "Intermediate";

    // 7. Strengths & Weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (data.cgpa >= 8.5) strengths.push("Exceptional academic performance (High CGPA).");
    if (data.leetcodeSolved >= 250 || data.codechefRating >= 1600) strengths.push("Strong competitive coding and problem-solving skills.");
    if (data.projects >= 3) strengths.push("Solid practical project building experience.");
    if (data.internships > 0) strengths.push("Valuable hands-on industry exposure through internships.");
    if (data.communicationScore >= 8) strengths.push("Excellent communication and articulate presentation style.");
    if (data.githubActivity >= 100) strengths.push("Active developer footprint on GitHub (Open source/Version control).");

    if (data.cgpa < 7.0) weaknesses.push("Academic performance (CGPA below 7.0) might limit eligibility for some top-tier recruiters.");
    if (data.leetcodeSolved < 100) weaknesses.push("Limited competitive coding experience. Needs more hands-on Data Structures & Algorithms practice.");
    if (data.projects < 2) weaknesses.push("Fewer portfolio projects. Needs to showcase more end-to-end applications.");
    if (data.communicationScore < 6) weaknesses.push("Communication skills need work to excel in behavioral and team-fit rounds.");
    if (data.aptitudeScore < 6) weaknesses.push("Aptitude assessment score is low. Standard technical tests often filter by aptitude first.");
    if (data.githubActivity < 20) weaknesses.push("Minimal GitHub portfolio. Lacks evidence of continuous coding practice.");

    if (strengths.length === 0) strengths.push("Motivated mindset and willingness to learn.");
    if (weaknesses.length === 0) weaknesses.push("Keep practicing to maintain your current high standards.");

    // 8. Skill Gap Analysis
    const criticalSkills = ["React", "Node.js", "Python", "SQL", "Git", "Docker", "Data Structures", "Algorithms"];
    const lowercaseUserSkills = data.technicalSkills.map(s => s.toLowerCase().trim());
    const missingSkills = criticalSkills.filter(s => !lowercaseUserSkills.includes(s.toLowerCase()));

    // 9. Industry Benchmark Comparison (vs Average Placement Criteria)
    const benchmark = {
      user: {
        cgpa: data.cgpa,
        leetcode: data.leetcodeSolved,
        communication: data.communicationScore,
        aptitude: data.aptitudeScore,
        projects: data.projects
      },
      average: {
        cgpa: 7.8,
        leetcode: 180,
        communication: 7.0,
        aptitude: 6.8,
        projects: 2.2
      },
      elite: {
        cgpa: 9.0,
        leetcode: 450,
        communication: 9.0,
        aptitude: 8.5,
        projects: 4.0
      }
    };

    // 10. Recommended Certifications & Projects
    const recCerts: string[] = [];
    const recProjects: { title: string; desc: string; difficulty: string }[] = [];

    // Cert recommendations
    if (lowercaseUserSkills.some(s => s.includes("cloud") || s.includes("aws") || s.includes("azure"))) {
      recCerts.push("AWS Certified Solutions Architect", "Azure Developer Associate");
    } else {
      recCerts.push("AWS Certified Cloud Practitioner");
    }
    if (lowercaseUserSkills.some(s => s.includes("machine learning") || s.includes("data science") || s.includes("python"))) {
      recCerts.push("TensorFlow Developer Certificate", "Google Professional Data Engineer");
    }
    if (data.leetcodeSolved < 150) {
      recCerts.push("Meta Front-End Developer Certificate (Coursera)");
    }
    recCerts.push("Oracle Certified Professional: Java SE");

    // Project recommendations
    if (data.leetcodeSolved > 200 && data.projects < 3) {
      recProjects.push({
        title: "Full-Stack SaaS Platform with Next.js & Stripe",
        desc: "Build a subscription-based tool showcasing webhooks, database indexing, and secure auth.",
        difficulty: "Advanced"
      });
    }
    if (lowercaseUserSkills.some(s => s.includes("python") || s.includes("ml"))) {
      recProjects.push({
        title: "AI-Powered Placement Matcher Engine",
        desc: "Develop an ML API that analyzes candidate profiles and predicts optimal job families using scikit-learn.",
        difficulty: "Advanced"
      });
    } else {
      recProjects.push({
        title: "Collaborative Real-time Project Management Dashboard",
        desc: "A rich Kanban layout utilizing web sockets for multi-client synchronizations.",
        difficulty: "Intermediate"
      });
    }
    recProjects.push({
      title: "Interactive Coding Portfolio & Web Playground",
      desc: "Compile an active showcase of your algorithms with real-time browser code compilation.",
      difficulty: "Intermediate"
    });

    // 11. Personalized Improvement Plan & Timeline Roadmap
    const improvementPlan: string[] = [];
    if (data.leetcodeSolved < 200) {
      improvementPlan.push("Solve at least 3 problems daily on LeetCode (Focus: Arrays, Strings, Hashing, Two Pointers).");
    }
    if (data.githubActivity < 50) {
      improvementPlan.push("Establish a daily green-dot streak on GitHub by publishing small utility scripts and project updates.");
    }
    if (data.communicationScore < 7) {
      improvementPlan.push("Participate in mock interviews or peer group discussions weekly to articulate your thoughts clearly under pressure.");
    }
    if (data.aptitudeScore < 7) {
      improvementPlan.push("Practice quantitative and logical reasoning worksheets on platforms like GeeksforGeeks or IndiaBIX for 30 mins daily.");
    }
    if (data.projects < 2) {
      improvementPlan.push("Build and deploy 1 comprehensive React/Node.js full-stack project from scratch and host it on Vercel/Render.");
    }
    if (improvementPlan.length === 0) {
      improvementPlan.push("Conduct mock interviews with senior industry developers to refine your system design capabilities.");
      improvementPlan.push("Contribute to open-source libraries or complete system design exercises.");
    }

    const preparationRoadmap = [
      {
        phase: "Phase 1: Foundations & Core Concepts",
        timeline: "Weeks 1-4",
        goals: [
          "Master basic DSA (Linked Lists, Stacks, Queues, Binary Trees).",
          "Solve 50 Easy/Medium LeetCode questions.",
          "Brush up on Operating Systems, Database Management Systems, and Computer Networks concepts."
        ]
      },
      {
        phase: "Phase 2: Project Building & Profiling",
        timeline: "Weeks 5-8",
        goals: [
          "Develop 1 major project and upload code repositories to GitHub with a clean README.",
          "Practice Aptitude tests and solve 4 logical worksheets weekly.",
          "Extract keywords from target job specs and integrate them into your resume."
        ]
      },
      {
        phase: "Phase 3: Simulation & Out-Reach",
        timeline: "Weeks 9-12",
        goals: [
          "Conduct 5+ mock coding and behavioral interviews.",
          "Solve Medium/Hard DSA questions (Dynamic Programming, Graphs).",
          "Polish communication skills, prepare strong elevator pitches, and apply directly to recruiters."
        ]
      }
    ];

    return NextResponse.json({
      placementScore,
      placementProbability: probability,
      readinessLevel,
      technicalScore,
      communicationScore,
      aptitudeScore,
      strengths,
      weaknesses,
      skillGap: missingSkills,
      benchmark,
      improvementPlan,
      recommendedCertifications: recCerts.slice(0, 3),
      recommendedProjects: recProjects.slice(0, 2),
      preparationRoadmap
    });
  } catch (error) {
    console.error("Predictor Error:", error);
    return NextResponse.json(
      { error: "Invalid payload or server-side estimation error." },
      { status: 400 }
    );
  }
}
