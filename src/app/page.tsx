export const unstable_instant = { prefetch: "static", unstable_disableValidation: true };

import Link from "next/link";
import { ArrowRight, Cpu, Code, Cloud, Shield, Database, Compass } from "lucide-react";
import ThreeCanvas from "@/components/ThreeCanvas";
import CareerGlobe from "@/components/CareerGlobe";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between overflow-hidden">
      {/* 3D Starry Background Universe */}
      <ThreeCanvas />

      {/* Cyber Grid Overlay */}
      <div className="cyberspace-grid" />

      {/* Header Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center border border-indigo-400/30 animate-pulse-glow">
            <Compass className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="font-orbitron font-extrabold text-lg tracking-widest bg-gradient-to-r from-slate-100 to-indigo-400 bg-clip-text text-transparent">
            CAREER GROWTH
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Light/Dark Toggle */}
          <ThemeToggle />

          <Link 
            href="/dashboard" 
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-orbitron bg-indigo-600 hover:bg-indigo-500 text-slate-50 shadow-lg border border-indigo-400/40 hover:border-indigo-400/60 shadow-indigo-600/10 hover:shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Enter Platform <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 z-10">
        {/* Left Column (Brand Presentation & Badges) */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-6 max-w-2xl">
          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full text-xs font-bold text-indigo-400 uppercase tracking-widest animate-pulse">
            <Cpu className="w-4 h-4 text-cyan-400" /> Next-Gen AI Career Guide
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-orbitron tracking-tight text-slate-100 leading-[1.15]">
            Map Your Path in the{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent glow-text-cyan">
              Career Universe
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-lg font-normal">
            Predict placement probabilities, optimize your resume against corporate ATS standards, bridge skill gaps via 3D visualization, and find matched developer jobs.
          </p>

          {/* Floating Career Path Icons Row */}
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start my-2">
            {[
              { icon: Code, name: "Software Eng", color: "cyan" },
              { icon: Cpu, name: "AI & ML", color: "purple" },
              { icon: Cloud, name: "Cloud Ops", color: "red" },
              { icon: Shield, name: "Cyber Sec", color: "amber" },
              { icon: Database, name: "Data Science", color: "indigo" }
            ].map((path, idx) => {
              const Icon = path.icon;
              return (
                <div 
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/20 backdrop-blur-md text-slate-300 text-xs font-semibold hover:border-slate-700 hover:scale-105 transition-all cursor-default"
                >
                  <Icon className={`w-3.5 h-3.5 text-cyan-400`} />
                  <span>{path.name}</span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto mt-4">
            <Link 
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-bold uppercase tracking-wider font-orbitron bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-slate-50 shadow-xl border border-indigo-400/30 hover:border-indigo-400/60 shadow-indigo-600/10 hover:shadow-indigo-600/30 hover:scale-[1.03] active:scale-[0.98] transition-all"
            >
              Get Started <ArrowRight className="w-4.5 h-4.5" />
            </Link>
          </div>
        </div>

        {/* Right Column (3D Interactive Globe) */}
        <div className="flex-1 flex items-center justify-center w-full max-w-[600px] h-full animate-float">
          <div className="relative w-full h-full flex flex-col items-center">
            {/* Globe Visual Container */}
            <div className="w-full aspect-square relative" style={{ maxWidth: 550 }}>
              <CareerGlobe />
            </div>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-4 block">
              Drag Globe to Spin • Hover Nodes for Jobs
            </span>
          </div>
        </div>
      </main>

      {/* Feature Summary Cards Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 pb-12 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 z-10">
        {[
          {
            title: "PLACEMENT ASSESSMENT",
            desc: "Submit academic, coding profiles, & soft scores. Receive placement forecasting, readiness metrics, and benchmark analytics.",
            link: "/dashboard"
          },
          {
            title: "ATS RESUME SCANNER",
            desc: "Perform real-time ATS scoring & keyword checks. Scan for missing keywords, formatting errors, and download compliance reports.",
            link: "/dashboard"
          },
          {
            title: "SMART JOB MATCHING",
            desc: "Align your parsed qualifications with active developer roles. Highlight skill match margins and submit job applications instantly.",
            link: "/dashboard"
          }
        ].map((card, idx) => (
          <Link 
            key={idx}
            href={card.link}
            className="group block p-6 rounded-2xl border border-slate-900 bg-slate-950/10 hover:bg-slate-950/20 backdrop-blur-md hover:border-slate-800 transition-all duration-300 hover:scale-[1.01]"
          >
            <h3 className="font-orbitron font-extrabold text-xs tracking-wider text-cyan-400 group-hover:text-cyan-300 mb-2">
              {card.title}
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed font-normal">
              {card.desc}
            </p>
          </Link>
        ))}
      </footer>
    </div>
  );
}
