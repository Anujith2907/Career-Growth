import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { text, targetRole } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Resume text content is required for ATS screening." },
        { status: 400 }
      );
    }

    const lowercaseText = text.toLowerCase();
    
    // 1. Section Presence Audit (30 pts max)
    const sections = {
      experience: ["experience", "work history", "employment", "professional background"],
      projects: ["projects", "personal projects", "academic projects", "key projects"],
      education: ["education", "academic qualification", "academic background", "university"],
      skills: ["skills", "technical skills", "skills & expertise", "core competencies"],
      certifications: ["certifications", "licenses", "courses", "achievements"]
    };

    let sectionScore = 0;
    const foundSections: string[] = [];
    const missingSections: string[] = [];

    for (const [key, aliases] of Object.entries(sections)) {
      const found = aliases.some(alias => lowercaseText.includes(alias));
      if (found) {
        sectionScore += 6; // 5 sections * 6 = 30 pts max
        foundSections.push(key.charAt(0).toUpperCase() + key.slice(1));
      } else {
        missingSections.push(key.charAt(0).toUpperCase() + key.slice(1));
      }
    }

    // 2. Contact Information Audit (20 pts max)
    let contactScore = 0;
    const contactInfo = {
      email: /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i.test(text),
      phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text),
      github: /github\.com/i.test(lowercaseText),
      linkedin: /linkedin\.com/i.test(lowercaseText)
    };

    const missingContact: string[] = [];
    if (contactInfo.email) contactScore += 5; else missingContact.push("Email");
    if (contactInfo.phone) contactScore += 5; else missingContact.push("Phone Number");
    if (contactInfo.github) contactScore += 5; else missingContact.push("GitHub Link");
    if (contactInfo.linkedin) contactScore += 5; else missingContact.push("LinkedIn Link");

    // 3. Skill Density Analysis (30 pts max)
    const skillsList = [
      "javascript", "typescript", "python", "java", "c++", "c#", "golang", "rust", "php", "ruby", "swift", "kotlin",
      "react", "next.js", "nextjs", "vue", "angular", "node.js", "nodejs", "express", "django", "flask", "fastapi", "spring boot",
      "mongodb", "postgresql", "mysql", "redis", "elasticsearch", "sqlite", "cassandra", "firebase", "supabase",
      "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "git", "github", "gitlab", "ci/cd", "terraform",
      "html", "css", "tailwind", "sass", "bootstrap", "graphql", "rest api", "redux", "zustand", "prisma", "sequelize",
      "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
      "data structures", "algorithms", "system design", "agile", "scrum", "jira"
    ];

    const extractedSkills: string[] = [];
    skillsList.forEach(skill => {
      const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      if (regex.test(lowercaseText)) {
        const cleanSkill = skill === "nextjs" ? "Next.js" :
                           skill === "nodejs" ? "Node.js" :
                           skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        if (!extractedSkills.includes(cleanSkill)) {
          extractedSkills.push(cleanSkill);
        }
      }
    });

    const skillScore = Math.min(Math.round((extractedSkills.length / 10) * 30), 30);

    // 4. Formatting and Length Audit (20 pts max)
    let formatScore = 20;
    const formattingFeedback: string[] = [];
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    if (wordCount < 150) {
      formatScore -= 10;
      formattingFeedback.push("Resume is too brief. Standard resumes should be between 300 and 800 words.");
    } else if (wordCount > 1000) {
      formatScore -= 5;
      formattingFeedback.push("Resume exceeds 1000 words. Try to keep it concise and strictly under 2 pages.");
    } else {
      formattingFeedback.push("Excellent word count length (well-balanced detail level).");
    }

    const actionVerbs = ["led", "developed", "built", "managed", "designed", "architected", "increased", "reduced", "optimized", "implemented", "resolved", "achieved"];
    const foundVerbs = actionVerbs.filter(verb => lowercaseText.includes(verb));
    if (foundVerbs.length < 3) {
      formatScore -= 5;
      formattingFeedback.push("Lacks strong action verbs. Use verbs like 'Optimized', 'Architected', or 'Implemented' to describe achievements.");
    } else {
      formattingFeedback.push("Contains effective action verbs describing key tasks.");
    }

    // 5. Total ATS Score (0 - 100)
    const totalATSScore = sectionScore + contactScore + skillScore + formatScore;

    // 6. Role Keyword Matching & Skill Gap
    const roleKeywords: Record<string, string[]> = {
      "web-developer": ["HTML", "CSS", "JavaScript", "React", "Git", "REST APIs"],
      "full-stack": ["React", "Next.js", "TypeScript", "Node.js", "SQL", "Git"],
      "ml-engineer": ["Python", "Statistics", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch"],
      "data-science": ["Python", "SQL", "Statistics", "Pandas/NumPy", "Tableau", "Machine Learning"],
      "cloud-engineer": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Linux"],
      "cybersecurity-analyst": ["Networking", "Linux", "Firewalls", "Cryptography", "IAM", "SIEM"],
      "devops-engineer": ["Git", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux"],
      "mobile-app-developer": ["Swift", "Kotlin", "Flutter", "React Native", "Git", "REST APIs"]
    };

    const selectedRole = targetRole || "full-stack";
    const targetKeywords = roleKeywords[selectedRole] || roleKeywords["full-stack"];
    const lowercaseExtracted = extractedSkills.map(s => s.toLowerCase());
    
    const missingKeywords = targetKeywords.filter(
      kw => !lowercaseExtracted.includes(kw.toLowerCase())
    );

    // 7. Suggestions for Improvement
    const suggestions: string[] = [];
    if (missingSections.length > 0) {
      suggestions.push(`Add missing critical sections: ${missingSections.join(", ")}.`);
    }
    if (missingContact.length > 0) {
      suggestions.push(`Make it easy for recruiters to contact you: Add your ${missingContact.join(", ")}.`);
    }
    if (extractedSkills.length < 6) {
      suggestions.push("Expand your 'Skills' section. List technical frameworks, coding languages, and developer tools you know.");
    }
    if (missingKeywords.length > 0) {
      suggestions.push(`Tailor your resume for ${selectedRole.replace('-', ' ')} roles: Add missing keywords like: ${missingKeywords.slice(0, 4).join(", ")}.`);
    }
    if (lowercaseText.includes("i ") || lowercaseText.includes("my ") || lowercaseText.includes("we ")) {
      suggestions.push("Avoid first-person pronouns ('I', 'my', 'we'). Write experience descriptions in bulleted action-oriented phrases.");
    }
    if (!/\d+%|\d+\s?k|\$\d+/.test(text)) {
      suggestions.push("Quantify your achievements. Add specific metrics (e.g., 'Optimized query loading times by 40%', 'Managed a database of 10k+ records').");
    }

    if (suggestions.length === 0) {
      suggestions.push("Your resume meets all core ATS criteria. Consider reviewing formatting and tailored styling details next.");
    }

    // ==========================================
    // RESUME CONTENT SCRUBBER ENGINE (Regex Extracts)
    // ==========================================
    
    // CGPA Scrubber (look for float formats out of 10 or baseline scores)
    let cgpa = 8.4; // Default fallback
    const cgpaMatch = text.match(/(?:cgpa|gpa|points)\s*:\s*([0-9.]+)/i) || 
                      text.match(/([0-9.]+)\s*(?:cgpa|gpa)/i) ||
                      text.match(/gpa\s*of\s*([0-9.]+)/i);
    if (cgpaMatch) {
      const val = parseFloat(cgpaMatch[1]);
      if (val >= 4.0 && val <= 10.0) {
        cgpa = parseFloat(val.toFixed(2));
      } else if (val > 50 && val <= 100) {
        // Percentage conversion fallback
        cgpa = parseFloat((val / 10).toFixed(2));
      }
    }

    // 10th and 12th percentages scrubber
    let tenthPercentage = 85;
    let twelfthPercentage = 82;

    const tenthMatch = text.match(/10th.*?([0-9.]+)\s*%/i) || 
                       text.match(/secondary.*?([0-9.]+)\s*%/i) || 
                       text.match(/matric.*?([0-9.]+)\s*%/i);
    const twelfthMatch = text.match(/12th.*?([0-9.]+)\s*%/i) || 
                         text.match(/senior secondary.*?([0-9.]+)\s*%/i) || 
                         text.match(/hsc.*?([0-9.]+)\s*%/i) ||
                         text.match(/intermediate.*?([0-9.]+)\s*%/i);
    
    if (tenthMatch) tenthPercentage = Math.round(parseFloat(tenthMatch[1]));
    if (twelfthMatch) twelfthPercentage = Math.round(parseFloat(twelfthMatch[1]));

    // Internships months scrubber
    let internships = 0;
    const internMatch = text.match(/intern(?:ship)?\s*(?:at|for)?\s*.*?\(\s*(\d+)\s*months?\s*\)/i) || 
                        text.match(/(\d+)\s*months?\s*(?:internship|intern|experience)/i) ||
                        text.match(/(?:experience|internship)\s*:\s*(\d+)\s*months?/i);
    if (internMatch) {
      internships = parseInt(internMatch[1]);
    }

    // Projects count scrubber (count list items in the Projects section)
    let projectsCount = 2; // default
    const projectsSection = text.match(/(?:projects|personal projects|academic projects)([\s\S]*?)(?:experience|education|skills|certifications|$)/i);
    if (projectsSection) {
      const bullets = projectsSection[1].match(/^\s*[-*•\d+.]/gm);
      if (bullets) {
        projectsCount = Math.max(1, bullets.length);
      }
    }

    const emailStr = contactInfo.email ? (text.match(/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i)?.[0] || "") : "";
    const phoneStr = contactInfo.phone ? (text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)?.[0] || "") : "";

    return NextResponse.json({
      atsScore: totalATSScore,
      wordCount,
      extractedSkills,
      missingKeywords,
      foundSections,
      missingSections,
      formattingFeedback,
      suggestions,
      targetRole: selectedRole.replace('-', ' ').toUpperCase(),
      parsedFields: {
        cgpa,
        tenthPercentage,
        twelfthPercentage,
        internships,
        projects: projectsCount,
        email: emailStr,
        phone: phoneStr
      }
    });
  } catch (error) {
    console.error("Resume Analyzer Error:", error);
    return NextResponse.json(
      { error: "Failed to parse resume text or process request payload." },
      { status: 550 }
    );
  }
}
