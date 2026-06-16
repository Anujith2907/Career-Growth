"use client";

import { useState } from "react";
import { CheckCircle, Circle, Play, Award, Briefcase, Code, GraduationCap, MapPin } from "lucide-react";

interface Milestone {
  id: number;
  title: string;
  subtitle: string;
  icon: any;
  status: "completed" | "current" | "upcoming";
  description: string;
  milestones: string[];
  color: string;
}

const ROADMAP_STEPS: Milestone[] = [
  {
    id: 1,
    title: "1. Core Foundations",
    subtitle: "Academics & Coding Basics",
    icon: GraduationCap,
    status: "completed",
    description: "Build a strong mathematical foundation, secure high academic GPAs (10th/12th/College), and master fundamental Data Structures and Algorithms (DSA) logic.",
    milestones: [
      "Maintain CGPA > 8.0",
      "Solve 100+ basic coding problems on HackerRank/LeetCode",
      "Master OOPs, Database Management Systems, and OS foundations"
    ],
    color: "emerald"
  },
  {
    id: 2,
    title: "2. Specialized Skill Up",
    subtitle: "Frameworks & Modern Stack",
    icon: Code,
    status: "current",
    description: "Deep-dive into industry-standard stacks. Build comprehensive applications to understand architecture, routing, API integrations, and backend databases.",
    milestones: [
      "Select a path: Full-Stack (React/Node) or Data Science (Python/ML)",
      "Develop 2 comprehensive side projects with fully published repositories",
      "Contribute weekly commits to GitHub to establish developer history"
    ],
    color: "cyan"
  },
  {
    id: 3,
    title: "3. Industry Exposure",
    subtitle: "Internships & Open Source",
    icon: Briefcase,
    status: "upcoming",
    description: "Apply skills to real-world environments. Gain hands-on exposure working in product teams, meeting shipping deadlines, and resolving version control merges.",
    milestones: [
      "Secure a 2-6 month developer internship or participate in open-source programs (GSOC, Hacktoberfest)",
      "Learn professional teamwork standards (Agile, Jira, git flow)",
      "Build production-grade microservices or clean component libraries"
    ],
    color: "indigo"
  },
  {
    id: 4,
    title: "4. Readiness Validation",
    subtitle: "Resume ATS & Mock Simulations",
    icon: Award,
    status: "upcoming",
    description: "Optimize recruitment assets. Pass formatting and keyword standards in ATS systems, practice coding simulations under timed pressure, and refine behavioral presentation.",
    milestones: [
      "Draft a quantitative, metric-driven resume scoring > 80% on ATS screeners",
      "Solve 300+ LeetCode problems, focusing on Medium & Hard algorithms",
      "Conduct 5+ mock coding and technical communication interviews"
    ],
    color: "purple"
  },
  {
    id: 5,
    title: "5. Career Goal",
    subtitle: "Placement Offer Secured",
    icon: MapPin,
    status: "upcoming",
    description: "Excel in final interview stages, compare developer compensation packages, and land a high-tier product engineer role at companies like Stripe, Google, or OpenAI.",
    milestones: [
      "Succeed in technical system design and coding tests",
      "Complete HR and culture-fit assessments with confidence",
      "Accept placement offer and begin your professional tech career!"
    ],
    color: "rose"
  }
];

export default function Roadmap3D() {
  const [activeStep, setActiveStep] = useState<number>(2);

  const activeData = ROADMAP_STEPS.find(s => s.id === activeStep) || ROADMAP_STEPS[1];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "emerald": return { border: "border-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10", glow: "shadow-emerald-500/20" };
      case "cyan": return { border: "border-cyan-500", text: "text-cyan-400", bg: "bg-cyan-500/10", glow: "shadow-cyan-500/20" };
      case "indigo": return { border: "border-indigo-500", text: "text-indigo-400", bg: "bg-indigo-500/10", glow: "shadow-indigo-500/20" };
      case "purple": return { border: "border-purple-500", text: "text-purple-400", bg: "bg-purple-500/10", glow: "shadow-purple-500/20" };
      case "rose": return { border: "border-rose-500", text: "text-rose-400", bg: "bg-rose-500/10", glow: "shadow-rose-500/20" };
      default: return { border: "border-indigo-500", text: "text-indigo-400", bg: "bg-indigo-500/10", glow: "shadow-indigo-500/20" };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
      {/* Visual Pathway Map (LHS) */}
      <div className="lg:col-span-5 flex flex-col items-center glass-card p-6 rounded-2xl border border-slate-800">
        <h4 className="font-orbitron font-semibold text-sm tracking-wider text-slate-400 uppercase mb-8">
          Interactive Journey Track
        </h4>
        
        <div className="relative flex flex-col gap-12 w-full max-w-[280px]">
          {/* Vertical Connecting Track Line */}
          <div className="absolute left-6 top-8 bottom-8 w-[2px] bg-slate-800" />
          
          {ROADMAP_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const colors = getColorClasses(step.color);
            const isActive = activeStep === step.id;
            
            // Generate glowing track segments for completed steps
            const isCompleted = step.status === "completed";
            const isCurrent = step.status === "current";
            
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`relative flex items-center gap-6 text-left group focus:outline-none transition-all duration-300 ${
                  isActive ? "scale-105" : "hover:translate-x-1"
                }`}
              >
                {/* Node Orb */}
                <div 
                  className={`z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                    isActive 
                      ? `${colors.border} ${colors.bg} shadow-lg ${colors.glow} scale-110` 
                      : isCompleted
                        ? "border-emerald-500 bg-emerald-500/5 text-emerald-400"
                        : isCurrent
                          ? "border-cyan-500 bg-cyan-500/5 text-cyan-400"
                          : "border-slate-700 bg-slate-900 text-slate-500"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Text Labels */}
                <div className="flex flex-col">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    isActive 
                      ? colors.text 
                      : isCompleted 
                        ? "text-emerald-500/70"
                        : isCurrent
                          ? "text-cyan-500/70"
                          : "text-slate-500"
                  }`}>
                    {step.title.split(".")[1].trim()}
                  </span>
                  <span className={`text-[10px] font-medium transition-colors ${
                    isActive ? "text-slate-200" : "text-slate-500 group-hover:text-slate-400"
                  }`}>
                    {step.subtitle}
                  </span>
                </div>

                {/* Status Dot */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : isActive ? (
                    <Play className="w-4 h-4 text-cyan-400 animate-pulse" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Step Breakdown (RHS) */}
      <div className="lg:col-span-7 flex flex-col h-full justify-between glass-card p-8 rounded-2xl border border-slate-800 relative overflow-hidden">
        {/* Futuristic background vector accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />

        <div>
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded">
              Stage {activeData.id} Info
            </span>
            <span className={`text-[10px] uppercase font-extrabold tracking-wider ${
              activeData.status === "completed" 
                ? "text-emerald-400" 
                : activeData.status === "current" 
                  ? "text-cyan-400 animate-pulse" 
                  : "text-slate-500"
            }`}>
              {activeData.status.toUpperCase()}
            </span>
          </div>

          <h3 className="text-xl font-bold font-orbitron text-slate-100 mb-2">
            {activeData.title.split(".")[1]}
          </h3>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
            {activeData.subtitle}
          </p>

          <p className="text-slate-300 text-xs leading-relaxed mb-6 font-normal border-b border-slate-800 pb-4">
            {activeData.description}
          </p>

          {/* Action Checklists */}
          <h4 className="font-orbitron text-slate-200 text-xs font-semibold tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-cyan-400" /> Key Focus Objectives:
          </h4>
          
          <ul className="flex flex-col gap-3">
            {activeData.milestones.map((milestone, idx) => (
              <li key={idx} className="flex items-start gap-3 bg-slate-950/25 p-3 rounded-lg border border-slate-900 text-xs text-slate-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <span>{milestone}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Suggestion Prompt */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
          <span>Click on nodes in the timeline to track specific tasks.</span>
          <span className="font-orbitron font-bold text-cyan-400 uppercase">Career Growth GPS</span>
        </div>
      </div>
    </div>
  );
}
