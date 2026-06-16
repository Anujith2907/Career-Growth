"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Cpu, Code, Award, Search, FileText, CheckCircle, TrendingUp, Terminal,
  ArrowRight, Upload, AlertCircle, X, ChevronRight,
  Download, BookOpen, RefreshCw, BarChart2, User, Briefcase,
  GraduationCap, Star, Zap, Target, Brain, Layers, Clock,
  ChevronUp, ChevronDown, DollarSign
} from "lucide-react";
import ScoreGauge from "@/components/ScoreGauge";
import SkillGalaxy, { ROLE_SKILLS_MAP, SkillNode } from "@/components/SkillGalaxy";
import Roadmap3D from "@/components/Roadmap3D";
import Logo from "@/components/Logo";

// ─── Role salary data ───────────────────────────────────────────────────────
const ROLE_SALARY_MAP: Record<string, { min: string; max: string }> = {
  "ml-engineer":        { min: "₹8 LPA",  max: "₹22 LPA" },
  "data-science":       { min: "₹6 LPA",  max: "₹18 LPA" },
  "ai-engineer":        { min: "₹10 LPA", max: "₹28 LPA" },
  "web-developer":      { min: "₹4 LPA",  max: "₹14 LPA" },
  "full-stack":         { min: "₹6 LPA",  max: "₹20 LPA" },
  "cloud-engineer":     { min: "₹8 LPA",  max: "₹24 LPA" },
  "devops-engineer":    { min: "₹7 LPA",  max: "₹22 LPA" },
  "cybersecurity-analyst": { min: "₹6 LPA", max: "₹20 LPA" },
  "mobile-app-developer":  { min: "₹5 LPA", max: "₹16 LPA" },
  "backend-developer":  { min: "₹5 LPA",  max: "₹18 LPA" },
  "frontend-developer": { min: "₹4 LPA",  max: "₹14 LPA" },
};

// ─── Job role display names ──────────────────────────────────────────────────
const ROLE_DISPLAY_NAMES: Record<string, string> = {
  "ml-engineer":        "Machine Learning Engineer",
  "data-science":       "Data Scientist",
  "ai-engineer":        "AI Engineer",
  "web-developer":      "Web Developer",
  "full-stack":         "Full Stack Developer",
  "cloud-engineer":     "Cloud Engineer",
  "devops-engineer":    "DevOps Engineer",
  "cybersecurity-analyst": "Cybersecurity Analyst",
  "mobile-app-developer":  "Mobile App Developer",
  "backend-developer":  "Backend Developer",
  "frontend-developer": "Frontend Developer",
};

// ─── Skill categorization helper ─────────────────────────────────────────────
function categorizeSkills(skills: SkillNode[]): {
  beginner: SkillNode[];
  intermediate: SkillNode[];
  advanced: SkillNode[];
} {
  const sorted = [...skills].sort((a, b) => a.importance - b.importance);
  const third = Math.ceil(sorted.length / 3);
  return {
    beginner:     sorted.slice(0, third),
    intermediate: sorted.slice(third, third * 2),
    advanced:     sorted.slice(third * 2),
  };
}

// ─── Priority helper ─────────────────────────────────────────────────────────
function getPriority(importance: number): { label: string; color: string } {
  if (importance >= 9) return { label: "High Priority",   color: "text-red-400 bg-red-500/10 border-red-500/20" };
  if (importance >= 7) return { label: "Medium Priority", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
  return              { label: "Low Priority",    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
}

// ─── Radar Chart Component ────────────────────────────────────────────────────
function RadarChart({
  roleSkills,
  userSkills,
}: {
  roleSkills: SkillNode[];
  userSkills: string[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(W, H) * 0.38;
    const skills = roleSkills.slice(0, 8);
    const N = skills.length;

    if (N < 3) return;

    ctx.clearRect(0, 0, W, H);

    const lowerUser = userSkills.map(s => s.toLowerCase().trim());

    const angle = (i: number) => (Math.PI * 2 * i) / N - Math.PI / 2;

    // Grid rings
    for (let ring = 1; ring <= 5; ring++) {
      const r = (R * ring) / 5;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const a = angle(i);
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = "rgba(99,102,241,0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Spokes
    for (let i = 0; i < N; i++) {
      const a = angle(i);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a));
      ctx.strokeStyle = "rgba(99,102,241,0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Role required polygon
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const a = angle(i);
      const r = (skills[i].importance / 10) * R;
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(99,102,241,0.15)";
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();

    // User skills polygon
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const a = angle(i);
      const owned = lowerUser.includes(skills[i].name.toLowerCase().trim());
      const r = owned ? (skills[i].importance / 10) * R : R * 0.08;
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(34,211,238,0.18)";
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // Labels & dots
    for (let i = 0; i < N; i++) {
      const a = angle(i);
      const owned = lowerUser.includes(skills[i].name.toLowerCase().trim());
      const dotR = (skills[i].importance / 10) * R;
      const dotX = cx + dotR * Math.cos(a);
      const dotY = cy + dotR * Math.sin(a);

      // dot
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
      ctx.fillStyle = owned ? "#22d3ee" : "#ef4444";
      ctx.shadowColor = owned ? "#22d3ee" : "#ef4444";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // label
      const labelR = R + 24;
      const lx = cx + labelR * Math.cos(a);
      const ly = cy + labelR * Math.sin(a);
      ctx.font = "bold 9px sans-serif";
      ctx.fillStyle = owned ? "#94a3b8" : "#f87171";
      ctx.textAlign = lx > cx + 5 ? "left" : lx < cx - 5 ? "right" : "center";
      ctx.textBaseline = ly > cy + 5 ? "top" : ly < cy - 5 ? "bottom" : "middle";
      ctx.fillText(skills[i].name, lx, ly);
    }
  }, [roleSkills, userSkills]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 280 }} />;
}

// ─── Bar Chart Component ──────────────────────────────────────────────────────
function SkillBarChart({
  roleSkills,
  userSkills,
}: {
  roleSkills: SkillNode[];
  userSkills: string[];
}) {
  const lowerUser = userSkills.map(s => s.toLowerCase().trim());
  const skills = roleSkills.slice(0, 10);

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {skills.map(skill => {
        const owned = lowerUser.includes(skill.name.toLowerCase().trim());
        const pct = (skill.importance / 10) * 100;
        return (
          <div key={skill.name} className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs">
              <span className={`font-bold ${owned ? "text-slate-300" : "text-red-400"}`}>
                {skill.name}
                {!owned && <span className="ml-1.5 text-[10px] uppercase tracking-wider text-red-400 border border-red-500/30 bg-red-500/10 px-1 py-0.5 rounded">Missing</span>}
              </span>
              <span className="text-slate-500 font-semibold">{skill.importance}/10</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/40">
              <div
                className={`h-full rounded-full transition-all duration-700 ${owned ? "bg-cyan-500" : "bg-red-500/60"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<"predictor" | "resume" | "jobs" | "galaxy" | "report">("predictor");

  useEffect(() => {
    const token = localStorage.getItem("nexus_auth_token");
    if (!token) {
      router.push("/login");
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  // ── Predictor states ────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    tenthPercentage: 85,
    twelfthPercentage: 82,
    cgpa: 8.4,
    leetcodeSolved: 180,
    codechefRating: 1450,
    hackerrankScore: 320,
    githubActivity: 65,
    technicalSkills: ["React", "Node.js", "TypeScript", "SQL", "Git", "Tailwind"],
    certifications: ["AWS Certified Cloud Practitioner"],
    internships: 3,
    projects: 2,
    communicationScore: 7,
    aptitudeScore: 7,
    extracurriculars: ["Volunteered in tech festival"],
  });

  const [predictorResult, setPredictorResult] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [certInput, setCertInput] = useState("");

  // ── Resume states ───────────────────────────────────────────────────────────
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("full-stack");
  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [resumeResult, setResumeResult] = useState<any>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [parsedResume, setParsedResume] = useState<{
    name: string;
    email: string;
    phone: string;
    education: string[];
    skills: string[];
    experience: string[];
    projects: string[];
    certifications: string[];
  } | null>(null);

  // ── Job states ──────────────────────────────────────────────────────────────
  const [jobSearchRole, setJobSearchRole] = useState("");
  const [jobSearchInput, setJobSearchInput] = useState("");
  const [jobResults, setJobResults] = useState<{ role: string; salary: { min: string; max: string } }[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // ── Skill Graph states ──────────────────────────────────────────────────────
  const [selectedSkillNode, setSelectedSkillNode] = useState<SkillNode | null>(null);
  const [chartView, setChartView] = useState<"radar" | "bar">("radar");

  useEffect(() => {
    const skills = ROLE_SKILLS_MAP[targetRole] || ROLE_SKILLS_MAP["web-developer"];
    if (skills?.length > 0) setSelectedSkillNode(skills[0]);
  }, [targetRole]);

  // ── Role readiness calculator ───────────────────────────────────────────────
  const getRoleReadiness = useCallback(() => {
    const reqSkills = ROLE_SKILLS_MAP[targetRole] || ROLE_SKILLS_MAP["web-developer"];
    if (!reqSkills?.length) return { score: 0, owned: [], missing: [] };

    const owned: string[] = [];
    const missing: string[] = [];
    const lowerUserSkills = formData.technicalSkills.map(s => s.toLowerCase().trim());

    reqSkills.forEach(req => {
      const isOwned = lowerUserSkills.includes(req.name.toLowerCase().trim());
      if (isOwned) owned.push(req.name);
      else missing.push(req.name);
    });

    const baseScore = Math.round((owned.length / reqSkills.length) * 100);
    let bonus = 0;
    if (formData.cgpa >= 8.2) bonus += 5;
    if (formData.leetcodeSolved >= 150) bonus += 5;
    if (formData.internships > 0) bonus += 5;

    return { score: Math.min(100, baseScore + bonus), owned, missing };
  }, [targetRole, formData.technicalSkills, formData.cgpa, formData.leetcodeSolved, formData.internships]);

  // ── Initial prediction ──────────────────────────────────────────────────────
  useEffect(() => {
    handlePredictSubmit();
  }, []);

  // ── Sync extracted skills from resume ─────────────────────────────────────
  useEffect(() => {
    if (resumeResult?.extractedSkills) {
      setFormData(prev => ({
        ...prev,
        technicalSkills: [...new Set([...prev.technicalSkills, ...resumeResult.extractedSkills])],
      }));
    }
  }, [resumeResult]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handlePredictSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsPredicting(true);
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        console.error("Predict API error:", response.status);
        return;
      }
      const result = await response.json();
      setPredictorResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPredicting(false);
    }
  };

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!formData.technicalSkills.includes(skillInput.trim())) {
        setFormData({ ...formData, technicalSkills: [...formData.technicalSkills, skillInput.trim()] });
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) =>
    setFormData({ ...formData, technicalSkills: formData.technicalSkills.filter(s => s !== skill) });

  const addCert = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && certInput.trim()) {
      e.preventDefault();
      if (!formData.certifications.includes(certInput.trim())) {
        setFormData({ ...formData, certifications: [...formData.certifications, certInput.trim()] });
      }
      setCertInput("");
    }
  };

  const removeCert = (cert: string) =>
    setFormData({ ...formData, certifications: formData.certifications.filter(c => c !== cert) });

  // ── Parse resume text client-side ──────────────────────────────────────────
  const parseResumeLocally = (text: string) => {
    const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);

    // Section header detection patterns (more flexible)
    const sectionPatterns: Record<string, RegExp> = {
      education: /^(EDUCATION|ACADEMIC|QUALIFICATION)/i,
      skills: /^(SKILLS|TECHNICAL\s+SKILLS|CORE\s+COMPETENCIES|TECHNOLOGIES|TECH\s+STACK)/i,
      experience: /^(EXPERIENCE|WORK\s+EXPERIENCE|PROFESSIONAL\s+EXPERIENCE|EMPLOYMENT|WORK\s+HISTORY)/i,
      projects: /^(PROJECTS|PERSONAL\s+PROJECTS|ACADEMIC\s+PROJECTS|KEY\s+PROJECTS)/i,
      certifications: /^(CERTIFICATIONS?|LICENSES|COURSES|ACHIEVEMENTS|AWARDS)/i,
      summary: /^(SUMMARY|OBJECTIVE|PROFILE|ABOUT)/i,
    };

    const isSectionHeader = (line: string) => Object.values(sectionPatterns).some(p => p.test(line));

    // Name – robust extraction that handles various resume formats including PDF-extracted text
    const isLikelyName = (candidate: string): boolean => {
      const trimmed = candidate.trim();
      if (trimmed.length < 2 || trimmed.length > 60) return false;
      if (isSectionHeader(trimmed)) return false;
      if (/^(email|phone|linkedin|github|http|www\.|address|objective|summary|profile|resume|curriculum|contact)/i.test(trimmed)) return false;
      if (/[@]/.test(trimmed)) return false; // reject if it contains an email
      if (/^\+?\d[\d\s\-().]{7,}/.test(trimmed)) return false; // reject phone numbers
      if (/\.(com|org|net|io|in|co|pdf)\b/i.test(trimmed)) return false; // reject URLs/files
      if (/^\d{5,}/.test(trimmed)) return false; // reject lines starting with long numbers (zip codes, IDs)
      // A name should be 1-6 words, mostly alphabetic
      const words = trimmed.replace(/^(mr|ms|mrs|dr|prof)\.?\s*/i, "").split(/\s+/).filter(Boolean);
      if (words.length < 1 || words.length > 6) return false;
      if (words.some(w => /^\d+$/.test(w))) return false; // reject words that are only digits
      // At least the first word should start with a letter
      if (!/^[A-Za-z]/.test(words[0])) return false;
      // All words should be primarily alphabetic (allow single chars like middle initials)
      if (words.some(w => !/^[A-Za-z'.]+$/.test(w))) return false;
      return true;
    };

    // Log first 5 lines for debugging name detection
    console.log("[Resume Parser] First 5 lines:", lines.slice(0, 5));

    // Strategy 1: Find a standalone name line (no pipes, no @, no phone numbers)
    let name = "";
    for (const l of lines.slice(0, 10)) {
      if (!/[|@]/.test(l) && !/\d{7,}/.test(l) && isLikelyName(l)) {
        name = l.trim();
        break;
      }
    }

    // Strategy 2: If a line has pipe separators (e.g. "John Doe | john@email.com"), extract first segment
    if (!name) {
      for (const l of lines.slice(0, 10)) {
        if (l.includes("|")) {
          const firstSegment = l.split("|")[0].trim();
          if (isLikelyName(firstSegment)) {
            name = firstSegment;
            break;
          }
        }
      }
    }

    // Strategy 3: Line with name + contact info separated by spaces/special chars
    if (!name) {
      for (const l of lines.slice(0, 8)) {
        // Try extracting text before an email pattern
        const beforeEmail = l.split(/\s+\S+@\S+/)[0]?.trim();
        if (beforeEmail && isLikelyName(beforeEmail)) {
          name = beforeEmail;
          break;
        }
        // Try extracting text before a phone pattern
        const beforePhone = l.split(/\s+\+?\d[\d\s\-().]{7,}/)[0]?.trim();
        if (beforePhone && isLikelyName(beforePhone)) {
          name = beforePhone;
          break;
        }
        // Strip common separators and suffixes
        const cleaned = l.replace(/^[-•*]\s*/, "").replace(/\s*[-–|:,].+$/, "").trim();
        if (cleaned !== l.trim() && isLikelyName(cleaned)) {
          name = cleaned;
          break;
        }
      }
    }

    // Strategy 4: Look for capitalized words at the start of lines (common in resumes)
    if (!name) {
      for (const l of lines.slice(0, 5)) {
        // Extract only the uppercase/title-case words from the beginning
        const match = l.match(/^([A-Z][A-Za-z'.]*(?:\s+[A-Z][A-Za-z'.]*){0,5})/);
        if (match && isLikelyName(match[1])) {
          name = match[1].trim();
          break;
        }
      }
    }

    console.log("[Resume Parser] Detected name:", name || "(none)");

    // Email
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const email = emailMatch ? emailMatch[0] : "";

    // Phone
    const phoneMatch = text.match(/(\+?\d[\d\s\-().]{7,}\d)/);
    const phone = phoneMatch ? phoneMatch[1].trim() : "";

    // Generic section extractor
    const extractSection = (sectionKey: string, maxLines = 15): string[] => {
      const pattern = sectionPatterns[sectionKey];
      if (!pattern) return [];
      const idx = lines.findIndex(l => pattern.test(l));
      if (idx === -1) return [];
      const items: string[] = [];
      for (let i = idx + 1; i < Math.min(idx + maxLines, lines.length); i++) {
        if (isSectionHeader(lines[i])) break;
        const line = lines[i];
        if (line.length > 2) {
          items.push(line.startsWith("-") || line.startsWith("•") || line.startsWith("*")
            ? line.slice(1).trim()
            : line
          );
        }
      }
      return items;
    };

    const education = extractSection("education", 10);

    // Skills - split by delimiters
    const skillsIdx = lines.findIndex(l => sectionPatterns.skills.test(l));
    const skills: string[] = [];
    if (skillsIdx !== -1) {
      for (let i = skillsIdx + 1; i < Math.min(skillsIdx + 8, lines.length); i++) {
        if (isSectionHeader(lines[i])) break;
        skills.push(...lines[i].split(/[,;|•·]/).map(s => s.replace(/^[-*]\s*/, "").trim()).filter(s => s.length > 1));
      }
    }

    const experience = extractSection("experience", 20);
    const projects = extractSection("projects", 20);
    const certifications = extractSection("certifications", 10);

    return { name, email, phone, education, skills, experience, projects, certifications };
  };

  const handleResumeScan = async (textOverride?: string) => {
    const textToScan = textOverride || resumeText;
    if (!textToScan.trim()) return;
    setIsScanning(true);
    setScanLogs([]);
    setResumeResult(null);
    setParsedResume(null);

    const logs = [
      "Initializing AI ATS Parser engine...",
      "Reading document structure & formatting coordinates...",
      "Extracting Name, Education, Skills, Projects...",
      "Parsing contact identifiers (email, phone, networks)...",
      "Conducting TF-IDF semantic keyword analysis...",
      "Computing ATS compatibility score...",
      "Generating report... [COMPLETED]",
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(r => setTimeout(r, 350));
      setScanLogs(prev => [...prev, `[LOG] ${logs[i]}`]);
    }

    // Parse locally
    const parsed = parseResumeLocally(textToScan);
    setParsedResume(parsed);

    try {
      const response = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToScan, targetRole }),
      });
      if (response.ok) {
        const result = await response.json();
        setResumeResult(result);
      } else {
        // API failed — generate a basic fallback result from local parse
        console.error("Resume API error:", response.status);
        setResumeResult({
          atsScore: 0,
          wordCount: textToScan.split(/\s+/).filter(Boolean).length,
          extractedSkills: parsed.skills,
          missingKeywords: [],
          foundSections: Object.entries({ education: parsed.education, experience: parsed.experience, skills: parsed.skills, projects: parsed.projects, certifications: parsed.certifications })
            .filter(([, v]) => v.length > 0).map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)),
          missingSections: [],
          formattingFeedback: ["Could not reach the ATS scoring server. Showing locally extracted data only."],
          suggestions: ["Try scanning again when the server is available."],
          targetRole: targetRole.replace("-", " ").toUpperCase(),
          parsedFields: { cgpa: 0, tenthPercentage: 0, twelfthPercentage: 0, internships: 0, projects: parsed.projects.length, email: parsed.email, phone: parsed.phone }
        });
      }
    } catch (error) {
      console.error(error);
      // Still show local parse on network error
      setResumeResult({
        atsScore: 0,
        wordCount: textToScan.split(/\s+/).filter(Boolean).length,
        extractedSkills: parsed.skills,
        missingKeywords: [],
        foundSections: [],
        missingSections: [],
        formattingFeedback: ["Network error — could not reach the server."],
        suggestions: ["Check your connection and try again."],
        targetRole: targetRole.replace("-", " ").toUpperCase(),
        parsedFields: { cgpa: 0, tenthPercentage: 0, twelfthPercentage: 0, internships: 0, projects: parsed.projects.length, email: parsed.email, phone: parsed.phone }
      });
    } finally {
      setIsScanning(false);
    }
  };

  const processFile = async (file: File) => {
    setUploadedFileName(file.name);
    setIsExtracting(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "";

    if (ext === "pdf") {
      // Upload to server-side parser for reliable extraction
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/parse-pdf", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error("PDF parse error:", errData.error);
          setIsExtracting(false);
          alert(errData.error || "Failed to parse PDF.");
          return;
        }

        const data = await res.json();
        setIsExtracting(false);
        if (data.text && data.text.trim()) {
          const extractedText = data.text.trim();
          setResumeText(extractedText);
          // Directly call scan with extracted text (don't wait for state)
          handleResumeScan(extractedText);
        } else {
          alert("Could not extract text from this PDF. It may be image-based.");
        }
      } catch (err) {
        console.error("PDF upload error:", err);
        setIsExtracting(false);
        alert("Failed to read PDF file.");
      }
    } else {
      // .txt, .docx (text fallback), and other formats
      const reader = new FileReader();
      reader.onload = ev => {
        const text = ev.target?.result as string;
        setIsExtracting(false);
        if (text) {
          setResumeText(text);
          handleResumeScan(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      processFile(files[0]);
    }
  };

  // ── Job search ─────────────────────────────────────────────────────────────
  const handleJobSearch = () => {
    const query = jobSearchInput.trim().toLowerCase();
    if (!query) return;

    const results: { role: string; salary: { min: string; max: string } }[] = [];

    Object.entries(ROLE_SALARY_MAP).forEach(([key, salary]) => {
      const displayName = ROLE_DISPLAY_NAMES[key] || key;
      if (
        displayName.toLowerCase().includes(query) ||
        key.toLowerCase().includes(query) ||
        query.split(" ").some(w => key.toLowerCase().includes(w) || displayName.toLowerCase().includes(w))
      ) {
        results.push({ role: displayName, salary });
      }
    });

    // If no exact match, show all roles as suggestions
    if (results.length === 0) {
      Object.entries(ROLE_SALARY_MAP).forEach(([key, salary]) => {
        results.push({ role: ROLE_DISPLAY_NAMES[key] || key, salary });
      });
    }

    setJobResults(results);
    setHasSearched(true);
  };

  const handleDownloadReport = () => window.print();

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const { score: readinessScore, owned: ownedSkills, missing: missingSkills } = getRoleReadiness();
  const reqSkills = ROLE_SKILLS_MAP[targetRole] || ROLE_SKILLS_MAP["web-developer"];
  const missingSkillNodes = reqSkills.filter(s =>
    !formData.technicalSkills.map(u => u.toLowerCase().trim()).includes(s.name.toLowerCase().trim())
  );
  const { beginner, intermediate, advanced } = categorizeSkills(missingSkillNodes);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative">
      <div className="cyberspace-grid" />

      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-4 flex justify-between items-center border-b border-slate-900 z-10 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2.5">
          <Logo size={28} />
          <span className="font-orbitron font-extrabold text-base tracking-wider text-slate-100">
            CAREER GROWTH PORTAL
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1 bg-slate-950/50 p-1 rounded-xl border border-slate-900">
          {[
            { id: "predictor", label: "Assessment",   icon: TrendingUp },
            { id: "resume",    label: "Resume",        icon: FileText   },
            { id: "jobs",      label: "Job Search",    icon: Search     },
            { id: "galaxy",    label: "Skill Graph",   icon: Cpu        },
            { id: "report",    label: "Career Report", icon: BarChart2  },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider font-orbitron transition-all ${
                  active
                    ? "bg-indigo-600/90 text-slate-50 border border-indigo-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <Link
          href="/"
          onClick={() => localStorage.removeItem("nexus_auth_token")}
          className="text-sm font-bold font-orbitron text-slate-400 hover:text-slate-100 border border-slate-900 px-4 py-2.5 rounded-lg hover:bg-slate-900/30 transition-all"
        >
          LOG OUT
        </Link>
      </nav>

      {/* Mobile tabs */}
      <div className="md:hidden flex flex-wrap gap-1 bg-slate-950/90 p-2 border-b border-slate-900 justify-center z-10">
        {[
          { id: "predictor", label: "Assessment" },
          { id: "resume",    label: "Resume"     },
          { id: "jobs",      label: "Jobs"       },
          { id: "galaxy",    label: "Skill Graph"},
          { id: "report",    label: "Report"     },
        ].map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-orbitron transition-all ${
                active ? "bg-indigo-600 text-slate-50" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <main className="w-full max-w-7xl mx-auto px-6 py-8 flex-1 flex flex-col z-10">

        {/* ══════════════════════════════════════════════════════════════
            PANEL 1: PLACEMENT PREDICTOR
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "predictor" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form onSubmit={handlePredictSubmit} className="lg:col-span-5 glass-card p-6 rounded-2xl border border-slate-800 flex flex-col gap-5">
              <h2 className="text-lg font-extrabold font-orbitron text-slate-100 flex items-center gap-2 border-b border-slate-900 pb-3">
                <TrendingUp className="w-5 h-5 text-indigo-400" /> Profiling Assessment
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm uppercase font-bold text-slate-400 block mb-1">10th Score (%)</label>
                  <input type="number" value={formData.tenthPercentage}
                    onChange={e => setFormData({ ...formData, tenthPercentage: Number(e.target.value) })}
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-lg px-3 py-2 text-base font-semibold focus:outline-none focus:border-indigo-500 text-slate-200"
                    min="40" max="100" required />
                </div>
                <div>
                  <label className="text-sm uppercase font-bold text-slate-400 block mb-1">12th Score (%)</label>
                  <input type="number" value={formData.twelfthPercentage}
                    onChange={e => setFormData({ ...formData, twelfthPercentage: Number(e.target.value) })}
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-lg px-3 py-2 text-base font-semibold focus:outline-none focus:border-indigo-500 text-slate-200"
                    min="40" max="100" required />
                </div>
              </div>

              <div>
                <label className="text-sm uppercase font-bold text-slate-400 block mb-1">College CGPA (10 Scale)</label>
                <input type="number" step="0.01" value={formData.cgpa}
                  onChange={e => setFormData({ ...formData, cgpa: Number(e.target.value) })}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-lg px-3 py-2 text-base font-semibold focus:outline-none focus:border-indigo-500 text-slate-200"
                  min="4" max="10" required />
              </div>

              <div className="border-t border-slate-900 pt-3">
                <h3 className="text-base font-bold font-orbitron tracking-wider text-slate-300 mb-3 uppercase flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-cyan-400" /> Coding Platforms
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "LeetCode Solved", key: "leetcodeSolved" },
                    { label: "CodeChef Rating", key: "codechefRating" },
                    { label: "HackerRank Score", key: "hackerrankScore" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-sm uppercase font-bold text-slate-400 block mb-1">{f.label}</label>
                      <input type="number" value={(formData as any)[f.key]}
                        onChange={e => setFormData({ ...formData, [f.key]: Number(e.target.value) })}
                        className="w-full bg-slate-950/40 border border-slate-800 rounded-lg px-3 py-2 text-base font-semibold focus:outline-none focus:border-indigo-500 text-slate-200"
                        min="0" required />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm uppercase font-bold text-slate-400 block mb-1">Internships (Months)</label>
                  <input type="number" value={formData.internships}
                    onChange={e => setFormData({ ...formData, internships: Number(e.target.value) })}
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-lg px-3 py-2 text-base font-semibold focus:outline-none focus:border-indigo-500 text-slate-200"
                    min="0" required />
                </div>
                <div>
                  <label className="text-sm uppercase font-bold text-slate-400 block mb-1">Projects Built</label>
                  <input type="number" value={formData.projects}
                    onChange={e => setFormData({ ...formData, projects: Number(e.target.value) })}
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-lg px-3 py-2 text-base font-semibold focus:outline-none focus:border-indigo-500 text-slate-200"
                    min="0" required />
                </div>
              </div>

              <div>
                <label className="text-sm uppercase font-bold text-slate-400 block mb-1">Technical Skills (Press Enter)</label>
                <input type="text" value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                  placeholder="e.g. React, Python, SQL"
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-lg px-3 py-2 text-base font-semibold focus:outline-none focus:border-indigo-500 text-slate-200" />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formData.technicalSkills.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-bold bg-slate-900 border border-slate-800 text-slate-300">
                      {s} <X className="w-3.5 h-3.5 hover:text-red-400 cursor-pointer" onClick={() => removeSkill(s)} />
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm uppercase font-bold text-slate-400 block mb-1">Certifications (Press Enter)</label>
                <input type="text" value={certInput}
                  onChange={e => setCertInput(e.target.value)}
                  onKeyDown={addCert}
                  placeholder="e.g. AWS practitioner"
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-lg px-3 py-2 text-base font-semibold focus:outline-none focus:border-indigo-500 text-slate-200" />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formData.certifications.map(c => (
                    <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-bold bg-slate-900 border border-slate-800 text-slate-300">
                      {c} <X className="w-3.5 h-3.5 hover:text-red-400 cursor-pointer" onClick={() => removeCert(c)} />
                    </span>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={isPredicting}
                className="w-full py-3.5 rounded-xl font-bold uppercase tracking-wider font-orbitron bg-indigo-600 hover:bg-indigo-500 text-slate-50 shadow-lg border border-indigo-400/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2">
                {isPredicting ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Forecasting...</>
                ) : (
                  <>Calculate Placement Index <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="lg:col-span-7 flex flex-col gap-6">
              {predictorResult ? (
                <>
                  <div className="glass-card p-6 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                    <div className="sm:col-span-5 flex justify-center">
                      <ScoreGauge score={predictorResult.placementScore} />
                    </div>
                    <div className="sm:col-span-7 flex flex-col gap-3">
                      <div className="flex justify-between items-center bg-slate-950/30 p-3 rounded-xl border border-slate-900">
                        <span className="text-sm font-bold text-slate-400">PLACEMENT PROBABILITY</span>
                        <span className="text-base font-extrabold font-orbitron text-cyan-400">{predictorResult.placementProbability}%</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-950/30 p-3 rounded-xl border border-slate-900">
                        <span className="text-sm font-bold text-slate-400">READINESS LEVEL</span>
                        <span className="text-base font-extrabold font-orbitron text-purple-400">{predictorResult.readinessLevel}</span>
                      </div>
                      <div className="flex flex-col gap-1.5 mt-2">
                        <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Diagnostic sub-index</span>
                        {[
                          { label: "Technical Competency", score: predictorResult.technicalScore, color: "bg-cyan-500" },
                          { label: "Communication Skill",  score: predictorResult.communicationScore, color: "bg-purple-500" },
                          { label: "Aptitude Capacity",   score: predictorResult.aptitudeScore, color: "bg-indigo-500" },
                        ].map(sub => (
                          <div key={sub.label} className="flex flex-col gap-0.5">
                            <div className="flex justify-between text-xs font-semibold text-slate-300">
                              <span>{sub.label}</span>
                              <span>{sub.score}/100</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                              <div className={`h-full ${sub.color} rounded-full transition-all duration-1000`} style={{ width: `${sub.score}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-7 glass-card p-6 rounded-2xl border border-slate-800 flex flex-col gap-4">
                      <h3 className="text-sm font-bold font-orbitron tracking-wider text-slate-300 uppercase border-b border-slate-900 pb-2">
                        Strengths & Concerns
                      </h3>
                      <div>
                        <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest block mb-1.5">Core Strengths</span>
                        <ul className="flex flex-col gap-1.5">
                          {predictorResult.strengths.map((s: string, idx: number) => (
                            <li key={idx} className="flex gap-2 items-start text-slate-300 text-sm font-medium">
                              <span className="text-emerald-400 font-bold mt-0.5">✓</span><span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest block mb-1.5">Improvement Gaps</span>
                        <ul className="flex flex-col gap-1.5">
                          {predictorResult.weaknesses.map((w: string, idx: number) => (
                            <li key={idx} className="flex gap-2 items-start text-slate-400 text-sm font-medium">
                              <span className="text-amber-500 font-bold mt-0.5">!</span><span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {predictorResult.skillGap?.length > 0 && (
                        <div className="border-t border-slate-900 pt-3 mt-1">
                          <span className="text-xs font-extrabold text-rose-400 uppercase tracking-widest block mb-2">Detected Skill Gaps</span>
                          <div className="flex flex-wrap gap-1">
                            {predictorResult.skillGap.map((s: string) => (
                              <span key={s} className="px-2 py-0.5 rounded bg-rose-500/5 border border-rose-500/10 text-rose-400 font-bold text-xs">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-5 glass-card p-6 rounded-2xl border border-slate-800 flex flex-col gap-4">
                      <h3 className="text-sm font-bold font-orbitron tracking-wider text-slate-300 uppercase border-b border-slate-900 pb-2">
                        Peer Benchmarking
                      </h3>
                      <div className="flex flex-col gap-3.5">
                        {[
                          { label: "College CGPA",    user: predictorResult.benchmark.user.cgpa,    avg: predictorResult.benchmark.average.cgpa,    max: 10  },
                          { label: "LeetCode Solved", user: predictorResult.benchmark.user.leetcode, avg: predictorResult.benchmark.average.leetcode, max: 500 },
                          { label: "Aptitude Skill",  user: predictorResult.benchmark.user.aptitude, avg: predictorResult.benchmark.average.aptitude, max: 10  },
                        ].map(bench => {
                          const uPct = Math.min((bench.user / bench.max) * 100, 100);
                          const aPct = Math.min((bench.avg  / bench.max) * 100, 100);
                          return (
                            <div key={bench.label} className="flex flex-col gap-1">
                              <span className="text-xs font-semibold text-slate-300">{bench.label}</span>
                              <div className="relative w-full h-4 bg-slate-950 rounded-md overflow-hidden border border-slate-900">
                                <div className="absolute top-0 bottom-0 bg-slate-700/60 border-r-2 border-indigo-400" style={{ width: `${aPct}%` }} />
                                <div className="absolute top-0 bottom-0 bg-cyan-500/20 border-r-2 border-cyan-400" style={{ width: `${uPct}%` }} />
                                <div className="absolute inset-0 flex justify-between items-center px-2 text-xs font-extrabold font-orbitron text-slate-200">
                                  <span>You: {bench.user}</span>
                                  <span>Avg: {bench.avg}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-6 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-4">
                      <h3 className="text-sm font-bold font-orbitron tracking-wider text-slate-300 uppercase border-b border-slate-900 pb-2">Target Achievements</h3>
                      <div>
                        <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest block mb-2">Recommended Certifications</span>
                        <ul className="flex flex-col gap-2">
                          {predictorResult.recommendedCertifications.map((cert: string, idx: number) => (
                            <li key={idx} className="flex gap-2 items-center bg-slate-950/20 p-2.5 rounded-lg border border-slate-900 text-sm font-medium text-slate-300">
                              <Award className="w-4 h-4 text-cyan-400 shrink-0" /><span>{cert}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <h3 className="text-sm font-bold font-orbitron tracking-wider text-slate-300 uppercase border-b border-slate-900 pb-2">Interview Prep Schedule</h3>
                      <div className="flex flex-col gap-4 relative pl-4 border-l border-slate-900">
                        {predictorResult.preparationRoadmap.map((phase: any, idx: number) => (
                          <div key={idx} className="relative flex flex-col gap-1.5">
                            <div className="absolute -left-[22px] top-1.5 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-indigo-400 flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-orbitron font-bold text-sm text-slate-200">{phase.phase}</span>
                              <span className="text-xs font-bold text-slate-500 uppercase">{phase.timeline}</span>
                            </div>
                            <ul className="flex flex-col gap-1 text-xs text-slate-400">
                              {phase.goals.map((g: string, gi: number) => (
                                <li key={gi} className="flex gap-1.5 items-start">
                                  <span className="text-indigo-400 font-bold shrink-0">•</span><span>{g}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      <button onClick={handleDownloadReport}
                        className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-800 bg-slate-950/40 text-sm font-semibold text-slate-300 hover:text-slate-100 hover:border-slate-700 transition-colors uppercase tracking-wider font-orbitron">
                        <Download className="w-4 h-4 text-cyan-400" /> Export PDF
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="glass-card p-12 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center gap-4 h-full min-h-[400px]">
                  <BarChart2 className="w-12 h-12 text-slate-600 animate-pulse" />
                  <h3 className="font-orbitron font-bold text-slate-300">Awaiting Profile Input</h3>
                  <p className="text-slate-500 text-xs max-w-sm leading-relaxed">
                    Complete the profile form to compute placement readiness benchmarks.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PANEL 2: RESUME ANALYZER — real extraction, no sample data
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "resume" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Upload / Input (LHS) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Drop zone */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleFileDrop}
                className="glass-card p-8 rounded-2xl border border-dashed border-slate-700 hover:border-indigo-500/60 transition-colors flex flex-col items-center text-center gap-3 relative cursor-pointer"
              >
                <input type="file" id="resume-file-input" onChange={handleFileSelect}
                  className="hidden" accept=".pdf,.docx,.txt" />
                <label htmlFor="resume-file-input" className="absolute inset-0 cursor-pointer" />
                <Upload className="w-10 h-10 text-slate-500" />
                <div>
                  <h3 className="font-orbitron text-sm font-bold text-slate-200">
                    {isExtracting ? "Extracting Text..." : "Upload Resume PDF"}
                  </h3>
                  <span className="text-xs text-slate-500 mt-1 block">
                    {isExtracting
                      ? "Parsing your PDF and running analysis automatically..."
                      : "Drop a PDF here — text will be extracted & analyzed automatically"}
                  </span>
                </div>
                {isExtracting ? (
                  <div className="mt-2 flex items-center gap-2 text-sm text-cyan-400 font-bold bg-cyan-500/10 px-3 py-1.5 rounded border border-cyan-500/20">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing {uploadedFileName}...
                  </div>
                ) : uploadedFileName ? (
                  <div className="mt-2 text-sm text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">
                    ✓ {uploadedFileName}
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-slate-500 border border-slate-800 rounded px-2.5 py-0.5 bg-slate-950/20 font-semibold">
                    Browse File
                  </div>
                )}
              </div>

              {/* Text paste area */}
              <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold font-orbitron tracking-wider text-slate-300 uppercase">
                      Resume Text
                    </h3>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      {resumeText ? "✓ Text loaded" : "Auto-fills from PDF upload, or paste manually"}
                    </span>
                  </div>
                  <select value={targetRole} onChange={e => setTargetRole(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs font-bold text-cyan-400 rounded px-2 py-1 outline-none">
                    <option value="web-developer">Web Developer</option>
                    <option value="full-stack">Full-Stack Developer</option>
                    <option value="ml-engineer">ML Engineer</option>
                    <option value="data-science">Data Scientist</option>
                    <option value="cloud-engineer">Cloud Engineer</option>
                    <option value="cybersecurity-analyst">Cybersecurity Analyst</option>
                    <option value="devops-engineer">DevOps Engineer</option>
                    <option value="mobile-app-developer">Mobile App Developer</option>
                  </select>
                </div>

                <textarea
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                  className="w-full min-h-[220px] max-h-[350px] bg-slate-950/40 border border-slate-800 rounded-xl p-4 text-xs font-mono leading-relaxed focus:outline-none focus:border-indigo-500 text-slate-300"
                  placeholder={"Paste your resume text here...\n\nExample format:\nJOHN DOE\njohn@email.com | +91 9876543210\n\nEDUCATION\n- B.Tech Computer Science (CGPA: 8.5)\n\nSKILLS\nPython, React, SQL, Git\n\nEXPERIENCE\nSoftware Intern at XYZ Corp\n- Built REST APIs using Node.js\n\nPROJECTS\nE-Commerce Platform\n- Full-stack web app with payment integration"}
                />

                <button id="resume-scan-btn" onClick={() => handleResumeScan()} disabled={isScanning || !resumeText.trim()}
                  className="w-full py-3.5 rounded-xl font-bold uppercase tracking-wider font-orbitron bg-indigo-600 hover:bg-indigo-500 text-slate-50 shadow-lg border border-indigo-400/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isScanning ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Scanning...</>
                  ) : (
                    <>Run AI ATS Scan <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>

            {/* Results (RHS) */}
            <div className="lg:col-span-7 flex flex-col gap-6 min-h-[350px]">
              {isScanning ? (
                <div className="glass-card p-8 rounded-2xl border border-cyan-500/20 flex flex-col gap-6 items-center justify-center flex-1 min-h-[400px] relative overflow-hidden scanline">
                  <div className="absolute inset-0 bg-cyan-950/5 pointer-events-none" />
                  <FileText className="w-16 h-16 text-cyan-400 animate-pulse relative z-10" />
                  <span className="font-orbitron font-bold text-sm tracking-widest text-cyan-400 relative z-10 uppercase animate-pulse">
                    Analyzing Resume
                  </span>
                  <div className="w-full max-w-md bg-slate-950/90 border border-slate-900 rounded-lg p-4 font-mono text-xs text-slate-400 flex flex-col gap-1.5 relative z-10 shadow-inner">
                    <div className="flex items-center gap-1.5 text-slate-500 border-b border-slate-900 pb-1.5 mb-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>ATS PARSER TERMINAL</span>
                    </div>
                    {scanLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-cyan-500 shrink-0">&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : parsedResume && resumeResult ? (
                <div className="flex flex-col gap-6 animate-fade-in">

                  {/* ATS Score + summary row */}
                  <div className="glass-card p-6 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                    <div className="sm:col-span-4 flex justify-center">
                      <ScoreGauge score={resumeResult.atsScore} label="ATS Score" />
                    </div>
                    <div className="sm:col-span-8 flex flex-col gap-2.5">
                      <div className="flex gap-3 items-center p-3 rounded-xl border border-slate-900 bg-slate-950/30">
                        <User className="w-5 h-5 text-indigo-400 shrink-0" />
                        <div>
                          <span className="text-xs text-slate-500 uppercase font-bold">Name</span>
                          <p className="text-sm font-bold text-slate-100">{parsedResume.name || "Not detected"}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        {parsedResume.email && (
                          <div className="p-2.5 rounded-xl border border-slate-900 bg-slate-950/30">
                            <span className="text-xs text-slate-500 uppercase font-bold block">Email</span>
                            <p className="text-xs font-semibold text-slate-300 truncate">{parsedResume.email}</p>
                          </div>
                        )}
                        {parsedResume.phone && (
                          <div className="p-2.5 rounded-xl border border-slate-900 bg-slate-950/30">
                            <span className="text-xs text-slate-500 uppercase font-bold block">Phone</span>
                            <p className="text-xs font-semibold text-slate-300">{parsedResume.phone}</p>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { name: "Education",      exists: parsedResume.education.length > 0 },
                          { name: "Experience",     exists: parsedResume.experience.length > 0 },
                          { name: "Projects",       exists: parsedResume.projects.length > 0   },
                          { name: "Skills",         exists: parsedResume.skills.length > 0     },
                          { name: "Certifications", exists: parsedResume.certifications.length > 0 },
                        ].map(sect => (
                          <div key={sect.name} className="flex items-center gap-2 p-1.5 rounded bg-slate-950/30 border border-slate-900">
                            <span className={`w-1.5 h-1.5 rounded-full ${sect.exists ? "bg-emerald-400" : "bg-red-400"}`} />
                            <span className={sect.exists ? "text-slate-200 font-semibold" : "text-slate-500 line-through"}>{sect.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Extracted Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Education */}
                    {parsedResume.education.length > 0 && (
                      <div className="glass-card p-5 rounded-2xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-3">
                          <GraduationCap className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest">Education</span>
                        </div>
                        <ul className="flex flex-col gap-2">
                          {parsedResume.education.map((e, i) => (
                            <li key={i} className="text-sm text-slate-300 font-medium leading-snug border-l-2 border-indigo-500/40 pl-2">
                              {e}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Skills */}
                    {parsedResume.skills.length > 0 && (
                      <div className="glass-card p-5 rounded-2xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-3">
                          <Zap className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-extrabold text-purple-400 uppercase tracking-widest">Skills Extracted</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {parsedResume.skills.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {parsedResume.experience.length > 0 && (
                      <div className="glass-card p-5 rounded-2xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-3">
                          <Briefcase className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest">Experience</span>
                        </div>
                        <ul className="flex flex-col gap-2">
                          {parsedResume.experience.map((e, i) => (
                            <li key={i} className="text-xs text-slate-400 font-medium leading-relaxed flex gap-1.5">
                              <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                              <span>{e}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Projects */}
                    {parsedResume.projects.length > 0 && (
                      <div className="glass-card p-5 rounded-2xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-3">
                          <Code className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest">Projects</span>
                        </div>
                        <ul className="flex flex-col gap-2">
                          {parsedResume.projects.map((p, i) => (
                            <li key={i} className="text-xs text-slate-400 font-medium leading-relaxed flex gap-1.5">
                              <span className="text-emerald-400 shrink-0 mt-0.5">▸</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Certifications */}
                    {parsedResume.certifications.length > 0 && (
                      <div className="glass-card p-5 rounded-2xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-3">
                          <Award className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest">Certifications</span>
                        </div>
                        <ul className="flex flex-col gap-2">
                          {parsedResume.certifications.map((c, i) => (
                            <li key={i} className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />{c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* ATS gaps */}
                  <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest block mb-2">Matched Keywords</span>
                        <div className="flex flex-wrap gap-1.5">
                          {resumeResult.extractedSkills.map((s: string) => (
                            <span key={s} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-rose-400 uppercase tracking-widest block mb-2">Missing Keywords</span>
                        <div className="flex flex-wrap gap-1.5">
                          {resumeResult.missingKeywords.map((kw: string) => (
                            <span key={kw} className="px-2 py-0.5 rounded bg-rose-500/5 border border-rose-500/15 text-rose-400 text-xs font-extrabold">{kw}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold font-orbitron tracking-wider text-slate-300 uppercase border-b border-slate-900 pb-2 mb-3">
                        ATS Improvement Recommendations
                      </h3>
                      <ul className="flex flex-col gap-2.5">
                        {resumeResult.suggestions.map((s: string, idx: number) => (
                          <li key={idx} className="flex gap-2.5 items-start text-slate-300 text-sm font-medium bg-slate-950/20 p-2.5 rounded-lg border border-slate-900">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" /><span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-3 pt-3 border-t border-slate-900">
                      <button onClick={handleDownloadReport}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-bold font-orbitron text-slate-50 transition-colors uppercase tracking-wider">
                        <Download className="w-4 h-4 text-cyan-400" /> Save Report
                      </button>
                      <button
                        onClick={() => {
                          if (parsedResume.skills.length > 0) {
                            setFormData(prev => ({
                              ...prev,
                              technicalSkills: [...new Set([...prev.technicalSkills, ...parsedResume.skills])]
                            }));
                          }
                          setActiveTab("predictor");
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-800 bg-slate-950/40 text-sm font-bold font-orbitron text-slate-300 hover:text-slate-100 hover:border-slate-700 transition-colors uppercase tracking-wider">
                        Sync to Predictor <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-12 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center gap-4 h-full min-h-[400px]">
                  <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Upload className="w-10 h-10 text-indigo-400" />
                  </div>
                  <h3 className="font-orbitron font-bold text-slate-200 text-lg">Upload Your Resume</h3>
                  <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
                    Drop your resume file or paste the text on the left. We'll automatically extract your name, education, skills, projects, certifications and experience — then generate your ATS score.
                  </p>
                  <div className="flex gap-3 flex-wrap justify-center mt-2">
                    {["Name & Contact", "Education", "Skills", "Experience", "Projects", "Certifications"].map(item => (
                      <span key={item} className="text-xs font-bold text-slate-400 border border-slate-800 px-2.5 py-1 rounded-lg bg-slate-900/40">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PANEL 3: SMART JOB SEARCH — clean role + salary only
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "jobs" && (
          <div className="flex flex-col gap-8 max-w-3xl mx-auto w-full">
            <div className="text-center flex flex-col gap-2">
              <h2 className="font-orbitron font-extrabold text-2xl text-slate-100 flex items-center justify-center gap-3">
                <DollarSign className="w-7 h-7 text-indigo-400" />
                Smart Job Search
              </h2>
              <p className="text-slate-400 text-sm">Enter your desired role to see salary ranges instantly.</p>
            </div>

            {/* Search bar */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={jobSearchInput}
                  onChange={e => setJobSearchInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleJobSearch()}
                  placeholder="e.g. ML Engineer, Data Scientist, Full Stack..."
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-600"
                />
              </div>
              <button
                onClick={handleJobSearch}
                className="px-8 py-3.5 rounded-xl font-bold uppercase tracking-wider font-orbitron bg-indigo-600 hover:bg-indigo-500 text-slate-50 border border-indigo-400/30 hover:scale-[1.01] active:scale-[0.99] transition-all whitespace-nowrap flex items-center gap-2"
              >
                <Search className="w-4 h-4" /> Search
              </button>
            </div>

            {/* Results — clean cards with role + salary only */}
            {hasSearched && (
              <div className="flex flex-col gap-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {jobResults.length} role{jobResults.length !== 1 ? "s" : ""} found
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {jobResults.map((job, idx) => (
                    <div
                      key={idx}
                      className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 hover:scale-[1.02] transition-all flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                          <Briefcase className="w-5 h-5 text-indigo-400" />
                        </div>
                        <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          Hiring
                        </span>
                      </div>
                      <h3 className="font-orbitron font-bold text-slate-100 text-base leading-snug">
                        {job.role}
                      </h3>
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                        <DollarSign className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div>
                          <span className="text-xs text-slate-500 uppercase font-bold block">Expected Salary Range</span>
                          <span className="text-base font-extrabold font-orbitron text-cyan-400">
                            {job.salary.min} – {job.salary.max}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!hasSearched && (
              <div className="flex flex-col gap-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Popular roles</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(ROLE_SALARY_MAP).slice(0, 6).map(([key, salary]) => (
                    <div
                      key={key}
                      onClick={() => { setJobSearchInput(ROLE_DISPLAY_NAMES[key] || key); }}
                      className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 hover:scale-[1.02] transition-all cursor-pointer flex flex-col gap-2"
                    >
                      <h3 className="font-orbitron font-bold text-slate-200 text-sm">
                        {ROLE_DISPLAY_NAMES[key] || key}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-sm font-extrabold text-cyan-400">
                          {salary.min} – {salary.max}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PANEL 4: SKILL GRAPH — radar/bar chart, role comparison
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "galaxy" && (
          <div className="flex flex-col gap-8 animate-fade-in">

            {/* Role selector + readiness */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <label className="text-xs uppercase font-bold text-slate-400 tracking-wider">Target Career Role</label>
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                  <select value={targetRole} onChange={e => setTargetRole(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-sm font-bold font-orbitron text-cyan-400 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 transition-all min-w-[240px]">
                    <option value="web-developer">Web Developer</option>
                    <option value="full-stack">Full-Stack Developer</option>
                    <option value="ml-engineer">ML Engineer</option>
                    <option value="data-science">Data Scientist</option>
                    <option value="cloud-engineer">Cloud Engineer</option>
                    <option value="cybersecurity-analyst">Cybersecurity Analyst</option>
                    <option value="devops-engineer">DevOps Engineer</option>
                    <option value="mobile-app-developer">Mobile App Developer</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 items-center bg-slate-950/40 p-4 rounded-xl border border-slate-900/60 max-w-sm w-full md:w-auto">
                <ScoreGauge score={readinessScore} size={110} label="Role Readiness" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Skill Match</span>
                  <span className="text-sm font-extrabold text-slate-200">
                    {ownedSkills.length} / {reqSkills.length} Skills
                  </span>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-700"
                      style={{ width: `${readinessScore}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{readinessScore}% match rate</p>
                </div>
              </div>
            </div>

            {/* Skills required section */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800">
              <h2 className="text-base font-extrabold font-orbitron text-slate-100 flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-indigo-400" />
                Skills Required to Become {ROLE_DISPLAY_NAMES[targetRole] || targetRole}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-900 text-center">
                  <span className="text-2xl font-extrabold font-orbitron text-slate-100">{reqSkills.length}</span>
                  <p className="text-xs text-slate-500 mt-1">Total Required</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <span className="text-2xl font-extrabold font-orbitron text-emerald-400">{ownedSkills.length}</span>
                  <p className="text-xs text-emerald-600 mt-1">You Have</p>
                </div>
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                  <span className="text-2xl font-extrabold font-orbitron text-red-400">{missingSkills.length}</span>
                  <p className="text-xs text-red-600 mt-1">Missing</p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                  <span className="text-2xl font-extrabold font-orbitron text-indigo-400">{readinessScore}%</span>
                  <p className="text-xs text-indigo-500 mt-1">Match Rate</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {reqSkills.map(skill => {
                  const owned = formData.technicalSkills.map(s => s.toLowerCase().trim()).includes(skill.name.toLowerCase().trim());
                  return (
                    <span key={skill.name}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        owned
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-red-500/10 border-red-500/30 text-red-400"
                      }`}>
                      {owned ? "✓ " : "✗ "}{skill.name}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Chart view toggle + charts */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-extrabold font-orbitron text-slate-100 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-indigo-400" />
                  Skill Comparison Chart
                </h2>
                <div className="flex gap-2">
                  {(["radar", "bar"] as const).map(view => (
                    <button key={view} onClick={() => setChartView(view)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-orbitron border transition-all ${
                        chartView === view
                          ? "bg-indigo-600 text-slate-50 border-indigo-500/30"
                          : "text-slate-400 border-slate-800 hover:text-slate-200"
                      }`}>
                      {view === "radar" ? "Radar" : "Bar"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Chart */}
                <div className="w-full" style={{ minHeight: 300 }}>
                  {chartView === "radar" ? (
                    <RadarChart roleSkills={reqSkills} userSkills={formData.technicalSkills} />
                  ) : (
                    <SkillBarChart roleSkills={reqSkills} userSkills={formData.technicalSkills} />
                  )}
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4 text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-cyan-500 shrink-0" />
                      <span className="text-slate-300">Your Skills</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-indigo-500 shrink-0" />
                      <span className="text-slate-300">Required Level</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
                      <span className="text-slate-300">Missing</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Your Skills ✓</span>
                    <div className="flex flex-wrap gap-1.5">
                      {ownedSkills.length > 0 ? ownedSkills.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">{s}</span>
                      )) : <span className="text-slate-500 text-xs italic">None yet — add skills in Assessment tab.</span>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-extrabold text-rose-400 uppercase tracking-widest">Missing Skills ✗</span>
                    <div className="flex flex-wrap gap-1.5">
                      {missingSkills.length > 0 ? missingSkills.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">{s}</span>
                      )) : <span className="text-emerald-400 text-xs font-bold">✓ All skills matched!</span>}
                    </div>
                  </div>

                  <div className="text-sm font-bold text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-900 mt-2">
                    Skill Match: <span className="text-cyan-400 font-extrabold font-orbitron">{readinessScore}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3D Galaxy + Node details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7 flex flex-col gap-3">
                <h2 className="text-base font-extrabold font-orbitron text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400 animate-spin-slow" /> 3D Skill Galaxy
                </h2>
                <div className="flex-1 w-full aspect-video min-h-[380px]">
                  <SkillGalaxy selectedRole={targetRole} userSkills={formData.technicalSkills} onNodeSelect={node => setSelectedSkillNode(node)} />
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between">
                <div className="flex-1 glass-card p-6 rounded-2xl border border-slate-800 flex flex-col h-full min-h-[380px]">
                  {selectedSkillNode ? (
                    <div className="flex flex-col h-full gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs uppercase font-extrabold tracking-widest bg-cyan-900/20 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded">
                          {selectedSkillNode.category}
                        </span>
                        {formData.technicalSkills.some(s => s.toLowerCase().trim() === selectedSkillNode.name.toLowerCase().trim()) ? (
                          <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Owned
                          </span>
                        ) : (
                          <span className="text-xs uppercase font-extrabold tracking-wider text-red-400">Missing</span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold font-orbitron text-slate-100">{selectedSkillNode.name}</h3>
                      <p className="text-slate-300 text-sm leading-relaxed border-b border-slate-800/60 pb-4">
                        {selectedSkillNode.description}
                      </p>
                      <h4 className="font-orbitron text-slate-200 text-sm font-semibold flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-indigo-400" /> Learning Roadmap
                      </h4>
                      <p className="text-slate-400 text-xs leading-relaxed bg-slate-950/20 p-3 rounded-lg border border-slate-900">
                        {selectedSkillNode.roadmap}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                      <Cpu className="w-10 h-10 text-slate-700 animate-pulse" />
                      <p className="text-slate-500 text-xs">Click a node in the 3D galaxy to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stage roadmap */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col gap-6">
              <h2 className="text-base font-extrabold font-orbitron text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" /> Learning Stages for {ROLE_DISPLAY_NAMES[targetRole] || targetRole}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { stage: "Stage 1: Beginner Foundations",    desc: "Core syntax, commands and repository basics.",         range: [0, 3] },
                  { stage: "Stage 2: Intermediate Frameworks", desc: "Libraries, database layouts, REST and modular logic.", range: [3, 6] },
                  { stage: "Stage 3: Advanced Architectures",  desc: "Containers, cloud deployment and monitoring.",          range: [6, 12] },
                ].map((level, idx) => {
                  const stageSkills = reqSkills.slice(level.range[0], level.range[1]);
                  return (
                    <div key={idx} className="flex flex-col gap-4 bg-slate-950/20 p-5 rounded-xl border border-slate-900">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold flex items-center justify-center font-orbitron">
                          {idx + 1}
                        </span>
                        <h4 className="font-orbitron font-bold text-sm text-slate-200">{level.stage}</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{level.desc}</p>
                      <div className="flex flex-col gap-2 pt-3 border-t border-slate-900">
                        {stageSkills.map(skill => {
                          const isOwned = formData.technicalSkills.some(s => s.toLowerCase().trim() === skill.name.toLowerCase().trim());
                          return (
                            <div key={skill.name} onClick={() => setSelectedSkillNode(skill)}
                              className="flex justify-between items-center bg-slate-950/45 p-2 rounded border border-slate-900 hover:border-slate-700 transition-all cursor-pointer text-sm">
                              <span className="font-semibold text-slate-300">{skill.name}</span>
                              <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                                isOwned ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                              }`}>
                                {isOwned ? "✓ HAVE" : "MISSING"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-900 pt-8">
              <h2 className="text-base font-extrabold font-orbitron text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" /> Career Preparation Timeline
              </h2>
              <Roadmap3D />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PANEL 5: FINAL CAREER REPORT — Missing Skills Analysis
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "report" && (
          <div className="flex flex-col gap-8 animate-fade-in">

            {/* Header */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="flex flex-col gap-2">
                <h2 className="font-orbitron font-extrabold text-xl text-slate-100 flex items-center gap-2">
                  <Brain className="w-6 h-6 text-indigo-400" /> Final Career Report
                </h2>
                <p className="text-slate-400 text-sm">
                  Personalized analysis for <span className="text-cyan-400 font-bold">{ROLE_DISPLAY_NAMES[targetRole] || targetRole}</span>
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase font-bold text-slate-400 tracking-wider">Target Role</label>
                <select value={targetRole} onChange={e => setTargetRole(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-sm font-bold font-orbitron text-cyan-400 rounded-xl px-4 py-2.5 outline-none">
                  <option value="web-developer">Web Developer</option>
                  <option value="full-stack">Full-Stack Developer</option>
                  <option value="ml-engineer">ML Engineer</option>
                  <option value="data-science">Data Scientist</option>
                  <option value="cloud-engineer">Cloud Engineer</option>
                  <option value="cybersecurity-analyst">Cybersecurity Analyst</option>
                  <option value="devops-engineer">DevOps Engineer</option>
                  <option value="mobile-app-developer">Mobile App Developer</option>
                </select>
              </div>
            </div>

            {/* Skill Completion Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Skills",     value: reqSkills.length,     color: "text-slate-100",   bg: "bg-slate-900/60 border-slate-800"       },
                { label: "Skills Owned",     value: ownedSkills.length,   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                { label: "Skills Missing",   value: missingSkillNodes.length, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20"         },
                { label: "Completion",       value: `${readinessScore}%`, color: "text-cyan-400",   bg: "bg-cyan-500/10 border-cyan-500/20"       },
              ].map(card => (
                <div key={card.label} className={`glass-card p-5 rounded-2xl border ${card.bg} flex flex-col gap-1 items-center text-center`}>
                  <span className={`text-3xl font-extrabold font-orbitron ${card.color}`}>{card.value}</span>
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">{card.label}</span>
                </div>
              ))}
            </div>

            {/* Skill completion progress bar */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold font-orbitron text-slate-300 uppercase tracking-wider">Skill Completion Progress</span>
                <span className="text-base font-extrabold font-orbitron text-cyan-400">{readinessScore}%</span>
              </div>
              <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-indigo-600 via-cyan-500 to-emerald-500"
                  style={{ width: `${readinessScore}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-semibold mt-2">
                <span>0%</span>
                <span className="text-emerald-400">Target: 100%</span>
              </div>
            </div>

            {/* ── Missing Skills Analysis ────────────────────────────── */}
            <div className="glass-card p-6 rounded-2xl border border-red-500/20 bg-red-950/5 flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <h2 className="font-orbitron font-extrabold text-lg text-slate-100">Missing Skills Analysis</h2>
                <span className="ml-auto text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg">
                  {missingSkillNodes.length} skills to acquire
                </span>
              </div>

              {missingSkillNodes.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <CheckCircle className="w-12 h-12 text-emerald-400" />
                  <p className="text-emerald-400 font-bold font-orbitron">All Required Skills Acquired!</p>
                  <p className="text-slate-500 text-sm">You have all the skills needed for {ROLE_DISPLAY_NAMES[targetRole]}.</p>
                </div>
              ) : (
                <>
                  {/* Beginner */}
                  {beginner.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <h3 className="font-orbitron font-bold text-sm text-emerald-400 uppercase tracking-wider">Beginner Skills</h3>
                        <span className="text-xs text-slate-500">({beginner.length})</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {beginner.map(skill => {
                          const { label, color } = getPriority(skill.importance);
                          return (
                            <div key={skill.name} className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 flex flex-col gap-2">
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-slate-200 text-sm">{skill.name}</span>
                                <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${color}`}>{label}</span>
                              </div>
                              <span className="text-xs text-slate-500 leading-relaxed line-clamp-2">{skill.description}</span>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-slate-600">Importance</span>
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className={`w-2 h-2 rounded-sm ${i < skill.importance ? "bg-emerald-500" : "bg-slate-800"}`} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Intermediate */}
                  {intermediate.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <h3 className="font-orbitron font-bold text-sm text-amber-400 uppercase tracking-wider">Intermediate Skills</h3>
                        <span className="text-xs text-slate-500">({intermediate.length})</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {intermediate.map(skill => {
                          const { label, color } = getPriority(skill.importance);
                          return (
                            <div key={skill.name} className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 flex flex-col gap-2">
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-slate-200 text-sm">{skill.name}</span>
                                <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${color}`}>{label}</span>
                              </div>
                              <span className="text-xs text-slate-500 leading-relaxed line-clamp-2">{skill.description}</span>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-slate-600">Importance</span>
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className={`w-2 h-2 rounded-sm ${i < skill.importance ? "bg-amber-500" : "bg-slate-800"}`} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Advanced */}
                  {advanced.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <h3 className="font-orbitron font-bold text-sm text-red-400 uppercase tracking-wider">Advanced Skills</h3>
                        <span className="text-xs text-slate-500">({advanced.length})</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {advanced.map(skill => {
                          const { label, color } = getPriority(skill.importance);
                          return (
                            <div key={skill.name} className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 flex flex-col gap-2">
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-slate-200 text-sm">{skill.name}</span>
                                <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${color}`}>{label}</span>
                              </div>
                              <span className="text-xs text-slate-500 leading-relaxed line-clamp-2">{skill.description}</span>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-slate-600">Importance</span>
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className={`w-2 h-2 rounded-sm ${i < skill.importance ? "bg-red-500" : "bg-slate-800"}`} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Personalized Roadmap */}
            <div className="glass-card p-6 rounded-2xl border border-indigo-500/20 bg-indigo-950/5 flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Layers className="w-6 h-6 text-indigo-400" />
                <h2 className="font-orbitron font-extrabold text-lg text-slate-100">
                  Personalized Learning Roadmap
                </h2>
              </div>

              {missingSkillNodes.length === 0 ? (
                <p className="text-emerald-400 font-bold text-center py-6">🎉 No missing skills — you're ready!</p>
              ) : (
                <div className="flex flex-col gap-4 relative pl-4 border-l-2 border-indigo-500/20">
                  {[
                    { phase: "Phase 1 — Foundation", skills: beginner, color: "border-emerald-400", dot: "bg-emerald-400", timeline: "Weeks 1–4" },
                    { phase: "Phase 2 — Core Mastery", skills: intermediate, color: "border-amber-400", dot: "bg-amber-400", timeline: "Weeks 5–10" },
                    { phase: "Phase 3 — Advanced Expertise", skills: advanced, color: "border-red-400", dot: "bg-red-400", timeline: "Weeks 11–16+" },
                  ].filter(p => p.skills.length > 0).map((phase, idx) => (
                    <div key={idx} className="relative flex flex-col gap-3">
                      <div className={`absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 ${phase.color} flex items-center justify-center`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${phase.dot}`} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-orbitron font-bold text-sm text-slate-200">{phase.phase}</span>
                        <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {phase.timeline}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {phase.skills.map(skill => (
                          <div key={skill.name} className="bg-slate-950/40 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-300">{skill.name}</span>
                            <span className={`text-[10px] font-extrabold uppercase px-1 py-0.5 rounded border ${getPriority(skill.importance).color}`}>
                              {getPriority(skill.importance).label.split(" ")[0]}
                            </span>
                          </div>
                        ))}
                      </div>
                      {phase.skills[0]?.roadmap && (
                        <p className="text-xs text-slate-500 leading-relaxed bg-slate-950/30 p-3 rounded-lg border border-slate-900">
                          <strong className="text-slate-400">Start with: </strong>
                          {phase.skills.map(s => s.name).join(", ")}. Focus on {phase.skills[0].roadmap}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommended Certifications for missing skills */}
            {missingSkillNodes.length > 0 && (
              <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col gap-4">
                <h2 className="font-orbitron font-extrabold text-base text-slate-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-cyan-400" /> Certifications for Missing Skills
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {missingSkillNodes.slice(0, 6).flatMap(skill =>
                    skill.certifications.slice(0, 1).map(cert => (
                      <div key={cert} className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                        <Award className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-300">{cert}</p>
                          <p className="text-[10px] text-slate-500">For: {skill.name}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button onClick={handleDownloadReport}
                className="flex items-center gap-2 py-3 px-6 rounded-xl border border-slate-800 bg-indigo-600 hover:bg-indigo-500 text-sm font-bold font-orbitron text-slate-50 transition-colors uppercase tracking-wider">
                <Download className="w-4 h-4" /> Download Career Report
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 font-medium z-10">
        <span>© 2026 CAREER GROWTH PLATFORM. ALL RIGHTS RESERVED.</span>
        <div className="flex gap-4 mt-2 sm:mt-0 font-orbitron font-extrabold tracking-wider">
          <Link href="/" className="hover:text-slate-300">HOME</Link>
          <span>•</span>
          <span className="text-indigo-400">DESIGN SYSTEM v5</span>
        </div>
      </footer>
    </div>
  );
}
