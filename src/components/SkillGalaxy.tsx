"use client";

import { useEffect, useRef, useState } from "react";

export interface SkillNode {
  name: string;
  importance: number; // 5 to 10
  category: string;
  description: string;
  roadmap: string;
  certifications: string[];
  projects: string[];
  demand: "Medium" | "High" | "Critical";
  // Coordinates computed dynamically
  x?: number;
  y?: number;
  z?: number;
  ownsSkill?: boolean;
}

interface SkillGalaxyProps {
  selectedRole: string;
  userSkills: string[];
  onNodeSelect: (node: SkillNode) => void;
}

// Complete skills registry for the 8 roles
export const ROLE_SKILLS_MAP: Record<string, SkillNode[]> = {
  "web-developer": [
    {
      name: "HTML",
      importance: 10,
      category: "Frontend Core",
      description: "HyperText Markup Language, the backbone structural language for loading documents on the web.",
      roadmap: "Semantic elements, accessible structures (ARIA), form validation standards, SEO headers.",
      certifications: ["W3Schools HTML5 Developer Certification", "freeCodeCamp Responsive Design Badge"],
      projects: ["Semantic portfolio landing page", "Accessible corporate content portal"],
      demand: "High"
    },
    {
      name: "CSS",
      importance: 9,
      category: "Frontend Core",
      description: "Cascading Style Sheets, determining layouts, typographic weights, and animation effects in browsers.",
      roadmap: "Flexbox structures, CSS Grid alignments, custom design tokens (Variables), Tailwind utility layers.",
      certifications: ["W3Schools CSS Developer Certificate", "Meta Front-End Developer Course"],
      projects: ["Pure CSS animated drawing workspace", "Glassmorphism styling utility kit"],
      demand: "High"
    },
    {
      name: "JavaScript",
      importance: 10,
      category: "Programming",
      description: "Core browser scripting engine, handling event triggers, dynamic node renders, and network queries.",
      roadmap: "ES6 modules, async/await queries, event bubbling, DOM parsing, JSON conversions.",
      certifications: ["JS Algorithms & Data Structures (freeCodeCamp)", "CIW JavaScript Specialist"],
      projects: ["Real-time Kanban task management board", "Dynamic code calculation compiler playground"],
      demand: "Critical"
    },
    {
      name: "React",
      importance: 9,
      category: "Libraries",
      description: "Component-driven declarative frontend compiler for building responsive interactive views.",
      roadmap: "Hooks lifecycle (useState, useEffect, useMemo), Context state routers, performance memoizations.",
      certifications: ["Meta Front-End Developer Certificate", "React Legacy Developer Accreditation"],
      projects: ["Real-time metrics charts dashboard", "Collaborative whiteboard canvas editor"],
      demand: "Critical"
    },
    {
      name: "Node.js",
      importance: 8,
      category: "Runtime",
      description: "V8 JavaScript engine running server-side modules for scaling API responses and background calculations.",
      roadmap: "Event loop tasks, package managers (NPM), Express routers, streaming APIs, system thread controls.",
      certifications: ["OpenJS Node.js Application Developer (LFA)", "Node.js Backend Specialist Certification"],
      projects: ["Multi-room chat socket gateway", "Secure database user registration backend"],
      demand: "High"
    },
    {
      name: "SQL",
      importance: 8,
      category: "Databases",
      description: "Relational database querying language for structured tables, indexes, and constraints.",
      roadmap: "Inner/Outer joins, database index configurations, query optimizer analysis, normalization rules.",
      certifications: ["Oracle SQL Database Associate", "PostgreSQL Advanced Developer certification"],
      projects: ["Student catalog indexing database", "Inventory tracker schema optimizer"],
      demand: "High"
    },
    {
      name: "Git",
      importance: 8,
      category: "Tools",
      description: "Distributed version control system tracking code history, branches, and team integration merges.",
      roadmap: "Local commits, remote branch tracking, merge resolution, interactive rebase, cherry-pick commits.",
      certifications: ["GitHub Foundations Exam", "Git Pro Specialist Badge"],
      projects: ["CI/CD automated code compile actions", "Open-source codebase contribution pull requests"],
      demand: "Critical"
    },
    {
      name: "REST APIs",
      importance: 8,
      category: "Architecture",
      description: "Representational State Transfer patterns for scalable stateless server-client data communications.",
      roadmap: "HTTP verb responses, status headers, query constraints, authentication tokens, payload specs.",
      certifications: ["Postman API Fundamentals Student Badge", "API Design Architect Credential"],
      projects: ["Public location weather aggregator API", "Stateless server resource scheduler"],
      demand: "High"
    }
  ],
  "full-stack": [
    {
      name: "React",
      importance: 9,
      category: "Libraries",
      description: "Component composition layouts for interactive frontends.",
      roadmap: "Hooks, state management, render controls.",
      certifications: ["Meta Front-End Developer Certificate"],
      projects: ["Metrics dashboard"],
      demand: "Critical"
    },
    {
      name: "Next.js",
      importance: 10,
      category: "Frameworks",
      description: "Production-ready React framework incorporating server rendering, routing, and api channels.",
      roadmap: "App router structures, Server Components, layout bundles, server actions, route handlers.",
      certifications: ["Vercel Next.js Developer Badge"],
      projects: ["Production-ready e-commerce platform", "AI portfolio platform"],
      demand: "Critical"
    },
    {
      name: "TypeScript",
      importance: 9,
      category: "Programming",
      description: "Strict syntactical superset of JavaScript adding static type validation compilers.",
      roadmap: "Generic interfaces, custom union states, type assertions, decorator patterns.",
      certifications: ["TypeScript Programmer Badge", "Advanced TS Developer Certificate"],
      projects: ["Type-safe database ORM scheduler", "Express API with strict request validation"],
      demand: "Critical"
    },
    {
      name: "Node.js",
      importance: 8,
      category: "Runtime",
      description: "Server-side asynchronous V8 scripting engine.",
      roadmap: "File system APIs, event triggers, socket frameworks, Express servers.",
      certifications: ["OpenJS Node.js Application Developer"],
      projects: ["Real-time workspace socket hub"],
      demand: "High"
    },
    {
      name: "SQL",
      importance: 8,
      category: "Databases",
      description: "Relational data structures queries and schema layouts.",
      roadmap: "Query optimization, indexing, tables normalizations.",
      certifications: ["Postgres Advanced SQL Badge"],
      projects: ["Multi-table user directory schema"],
      demand: "High"
    },
    {
      name: "MongoDB",
      importance: 8,
      category: "Databases",
      description: "NoSQL document store for nested JSON structures and quick object lookups.",
      roadmap: "BSON mapping, aggregation pipelines, replica set cluster configurations.",
      certifications: ["MongoDB Certified Associate Developer"],
      projects: ["Dynamic user blog CMS database", "Metadata catalog repository"],
      demand: "High"
    },
    {
      name: "Docker",
      importance: 8,
      category: "Containers",
      description: "Containerization framework packaging code, libraries, and runtime dependencies.",
      roadmap: "Dockerfile instructions, multi-stage compilation, image sizing, network bridges.",
      certifications: ["Docker Certified Associate (DCA)", "CNCF Kubernetes Administrator"],
      projects: ["Full-stack containerized database portal", "DevOps sandbox image orchestrator"],
      demand: "Critical"
    },
    {
      name: "Git",
      importance: 8,
      category: "Tools",
      description: "Repository version tracking and branch merging tools.",
      roadmap: "Cherry-pick commits, merge conflict resolution, git workflows.",
      certifications: ["GitHub Foundations Exam"],
      projects: ["Git hooks lint validation automation"],
      demand: "Critical"
    }
  ],
  "ml-engineer": [
    {
      name: "Python",
      importance: 10,
      category: "Programming",
      description: "Core language for data analysis and ML models compilation.",
      roadmap: "Lambda expressions, pandas mapping, OOP structures, memory profiling.",
      certifications: ["Python Institute Certified Associate", "Google IT Automation with Python"],
      projects: ["Multithreaded text files compiler"],
      demand: "Critical"
    },
    {
      name: "Statistics",
      importance: 9,
      category: "Mathematics",
      description: "Mathematical modeling, hypothesis testing, probability, and metrics checks.",
      roadmap: "Bayesian probability, regression curves, standard deviations, distributions.",
      certifications: ["Coursera Mathematics for Machine Learning"],
      projects: ["Statistical hypothesis model calculator", "Custom regression analysis curve"],
      demand: "High"
    },
    {
      name: "Machine Learning",
      importance: 10,
      category: "AI Core",
      description: "Predictive modeling and algorithms training using libraries like Scikit-Learn.",
      roadmap: "Decision trees, random forests, SVM, linear regressions, hyperparameter adjustments.",
      certifications: ["Stanford Machine Learning Certificate (Coursera)", "Google Cloud ML Engineer"],
      projects: ["Job application match predictor", "Customer clustering segmentation analytics"],
      demand: "Critical"
    },
    {
      name: "Deep Learning",
      importance: 9,
      category: "AI Core",
      description: "Neural network structures training for parsing complex inputs (images, voice, text).",
      roadmap: "Backpropagation math, weights optimizations, CNN architectures, RNN structures.",
      certifications: ["DeepLearning.AI Developer Specialization"],
      projects: ["CNN classifier for visual assets", "RNN script generator model"],
      demand: "Critical"
    },
    {
      name: "TensorFlow",
      importance: 8,
      category: "Frameworks",
      description: "End-to-end open-source machine learning and deep learning ecosystem library.",
      roadmap: "Keras layers, TensorBoard metrics visualization, graph models compilation.",
      certifications: ["TensorFlow Developer Certificate"],
      projects: ["Custom object detection model API"],
      demand: "High"
    },
    {
      name: "PyTorch",
      importance: 9,
      category: "Frameworks",
      description: "Dynamic tensor computation framework with GPU execution optimizations.",
      roadmap: "Autograd engines, model subclass patterns, custom loaders, TorchScript compiles.",
      certifications: ["PyTorch Deep Learning Badge"],
      projects: ["Image style transfer canvas model", "Transformer-based NLP predictor"],
      demand: "Critical"
    },
    {
      name: "SQL",
      importance: 7,
      category: "Databases",
      description: "SQL query operations to pull database assets for ML features extraction.",
      roadmap: "Subqueries, features tables indexing, data cleaners query structures.",
      certifications: ["Oracle SQL Specialist"],
      projects: ["User feature tables query mapper"],
      demand: "High"
    },
    {
      name: "MLOps",
      importance: 8,
      category: "DevOps",
      description: "System engineering pipelines for model deployment, monitoring, and tracking.",
      roadmap: "Model versioning (DVC), artifact logs (MLflow), automated model registry integrations.",
      certifications: ["Google Cloud Professional MLOps Engineer"],
      projects: ["Automated model retrain actions pipeline", "Model drift detector endpoint"],
      demand: "High"
    },
    {
      name: "Cloud Computing",
      importance: 8,
      category: "Cloud",
      description: "Deploying high-performance training VMs on AWS/GCP.",
      roadmap: "AWS SageMaker nodes, GCP Vertex AI setups, billing alerts.",
      certifications: ["AWS Certified Machine Learning - Specialty"],
      projects: ["SageMaker cloud training container"],
      demand: "High"
    }
  ],
  "data-scientist": [
    {
      name: "Python",
      importance: 10,
      category: "Programming",
      description: "High-level programming language core to data pipelines.",
      roadmap: "Data transformations, file IO, scientific math libraries.",
      certifications: ["Google Python automation badge"],
      projects: ["Large-scale CSV analyzer pipeline"],
      demand: "Critical"
    },
    {
      name: "SQL",
      importance: 9,
      category: "Databases",
      description: "Data extraction pipelines from transactional tables.",
      roadmap: "Aggregation algorithms, joins, staging schemas.",
      certifications: ["PostgreSQL Advanced Query Badge"],
      projects: ["E-commerce behavior extraction query"],
      demand: "Critical"
    },
    {
      name: "R",
      importance: 7,
      category: "Languages",
      description: "Statistical programming environment for custom hypothesis testing.",
      roadmap: "ggplot2 visualizations, tidyverse data mutations, statistical tests.",
      certifications: ["DataCamp Data Analyst with R"],
      projects: ["Clinical trial statistics evaluation script"],
      demand: "Medium"
    },
    {
      name: "Statistics",
      importance: 10,
      category: "Mathematics",
      description: "Probability distributions, variance audits, and testing confidence margins.",
      roadmap: "A/B testing calculators, p-value calculations, distributions validations.",
      certifications: ["Coursera Applied Statistics Badge"],
      projects: ["A/B test evaluation engine for user signups"],
      demand: "Critical"
    },
    {
      name: "Pandas/NumPy",
      importance: 9,
      category: "Libraries",
      description: "Vector mathematics and dataset tabular data-frame manipulation tools.",
      roadmap: "Index mappings, merge arrays, matrix arithmetic, missing values calculations.",
      certifications: ["Kaggle Data Manipulation Certificate"],
      projects: ["Custom financial time-series metrics calculator"],
      demand: "Critical"
    },
    {
      name: "Tableau",
      importance: 8,
      category: "BI Tools",
      description: "Interactive Business Intelligence visualizer for dashboard reporting.",
      roadmap: "Data connections, custom calculated fields, publishing dashboard reports.",
      certifications: ["Tableau Desktop Certified Associate"],
      projects: ["Interactive corporate revenue dashboard", "Hiring metrics report"],
      demand: "High"
    },
    {
      name: "Machine Learning",
      importance: 8,
      category: "AI Core",
      description: "Regression and classification modeling algorithms.",
      roadmap: "Decision trees, hyperparameter grids, random forest runs.",
      certifications: ["IBM Data Science Professional Certificate"],
      projects: ["Customer churn rate forecast analyzer"],
      demand: "High"
    },
    {
      name: "Big Data (Spark)",
      importance: 8,
      category: "Big Data",
      description: "Cluster computing frameworks for processing petabytes of logs.",
      roadmap: "PySpark dataframes, MapReduce pipelines, cluster scaling configurations.",
      certifications: ["Databricks Certified Associate Developer"],
      projects: ["PySpark stream processing pipeline"],
      demand: "High"
    },
    {
      name: "Communication",
      importance: 9,
      category: "Soft Skills",
      description: "Articulating complex data insights into executive-level slides.",
      roadmap: "Data storytelling techniques, slide deck design, presentation sessions.",
      certifications: ["Toastmasters Public Speaker credential"],
      projects: ["Hiring predictive slide presentation deck"],
      demand: "High"
    }
  ],
  "cloud-engineer": [
    {
      name: "AWS",
      importance: 10,
      category: "Cloud",
      description: "Amazon Web Services platform services hosting scalable instances.",
      roadmap: "VPC routing tables, IAM safety policies, EC2 nodes, RDS servers.",
      certifications: ["AWS Certified Solutions Architect - Associate"],
      projects: ["Secure VPC network architecture with server subnets"],
      demand: "Critical"
    },
    {
      name: "Azure",
      importance: 8,
      category: "Cloud",
      description: "Microsoft's enterprise cloud ecosystem hosting Virtual Machines.",
      roadmap: "Azure Active Directory setups, App Services deployment, Virtual Network configurations.",
      certifications: ["Microsoft Certified: Azure Administrator Associate"],
      projects: ["Multi-region Azure network with DNS load balancers"],
      demand: "High"
    },
    {
      name: "GCP",
      importance: 8,
      category: "Cloud",
      description: "Google Cloud Platform cloud infrastructure nodes.",
      roadmap: "Compute Engine setups, IAM access logs, BigQuery pipelines.",
      certifications: ["Google Associate Cloud Engineer"],
      projects: ["GCP auto-scaling instance VM pool setup"],
      demand: "High"
    },
    {
      name: "Docker",
      importance: 9,
      category: "Containers",
      description: "Container virtualization packaging execution binaries.",
      roadmap: "Dockerfile structures, volume bindings, Docker Compose orchestration.",
      certifications: ["Docker Associate Developer Badge"],
      projects: ["Containerized microservices cluster build"],
      demand: "Critical"
    },
    {
      name: "Kubernetes",
      importance: 10,
      category: "Containers",
      description: "Container orchestration runtime deploying container clusters.",
      roadmap: "Pod schedules, Service routing, ingress controllers, Helm package charts.",
      certifications: ["Certified Kubernetes Administrator (CKA)"],
      projects: ["High-availability load-balanced app pod deployment"],
      demand: "Critical"
    },
    {
      name: "Linux",
      importance: 9,
      category: "OS Core",
      description: "Server kernel operating system command line operations.",
      roadmap: "Bash scripting, systemd service processes, permissions audits, user controls.",
      certifications: ["CompTIA Linux+", "Red Hat Certified System Administrator"],
      projects: ["Linux system service log daemon script"],
      demand: "Critical"
    },
    {
      name: "Networking",
      importance: 8,
      category: "OS Core",
      description: "IP routing tables, subnet math, DNS systems, firewalls.",
      roadmap: "CIDR blocks calculations, TCP handshake, DNS lookup layers, SSL/TLS keys.",
      certifications: ["Cisco CCNA", "CompTIA Network+"],
      projects: ["Custom static network topology with DNS configs"],
      demand: "High"
    },
    {
      name: "Terraform",
      importance: 9,
      category: "IaC Tools",
      description: "Declarative Infrastructure as Code utility to map resources.",
      roadmap: "HCL parameters, state file storage configurations, variable modules.",
      certifications: ["HashiCorp Certified: Terraform Associate"],
      projects: ["Automated cloud resource VPC terraform script"],
      demand: "Critical"
    },
    {
      name: "CI/CD",
      importance: 9,
      category: "Pipelines",
      description: "Continuous Integration & Deployment pipelines automation.",
      roadmap: "GitHub Actions steps, runner setups, deployment scripts.",
      certifications: ["DevOps Engineer Professional Accreditation"],
      projects: ["Lint compile and automatic deploy workflow actions"],
      demand: "Critical"
    }
  ],
  "cybersecurity-analyst": [
    {
      name: "Networking",
      importance: 9,
      category: "OS Core",
      description: "Firewalls routing, network protocols (TCP/IP), ports auditing.",
      roadmap: "Subnet masks, packet analysis (Wireshark), firewall rule lists.",
      certifications: ["CompTIA Network+", "Cisco Certified Support Technician"],
      projects: ["Router packet capture & analysis catalog"],
      demand: "Critical"
    },
    {
      name: "Linux",
      importance: 8,
      category: "OS Core",
      description: "Safe multi-user kernel commands, folder permission tables.",
      roadmap: "SSH key files configuration, syslog checks, file execution blocks.",
      certifications: ["RHCSA Red Hat Engineer"],
      projects: ["Intrusion detection bash monitoring script"],
      demand: "High"
    },
    {
      name: "Firewalls",
      importance: 9,
      category: "Infrastructure",
      description: "Traffic inspect networks, configure port blocks, and set DMZ zones.",
      roadmap: "IDS/IPS setups, iptables configs, proxy servers configurations.",
      certifications: ["Palo Alto Networks Certified Network Security Administrator"],
      projects: ["Corporate network subnet firewall rules layout"],
      demand: "Critical"
    },
    {
      name: "Cryptography",
      importance: 8,
      category: "Theory",
      description: "Data encryption formats, public-private key models, hash standards.",
      roadmap: "AES symmetric keys, RSA asymmetric protocols, SHA hashing validation.",
      certifications: ["EC-Council Certified Encryption Specialist"],
      projects: ["Python script for directory file hashing audit"],
      demand: "High"
    },
    {
      name: "Penetration Testing",
      importance: 9,
      category: "Security",
      description: "Ethical hacking processes to auditing network vulnerability points.",
      roadmap: "Nmap port maps, OWASP top 10 scanner runs, Metasploit payloads.",
      certifications: ["CompTIA PenTest+", "Offensive Security Certified Professional (OSCP)"],
      projects: ["Vulnerability auditing scan of mock test web server"],
      demand: "Critical"
    },
    {
      name: "IAM",
      importance: 8,
      category: "Security",
      description: "Identity & Access Management controls limiting account access scopes.",
      roadmap: "Role-based access checks (RBAC), multi-factor logins, Single Sign-On configs.",
      certifications: ["CIAM Certified Identity Professional"],
      projects: ["SSO authorization flow setup with token validation"],
      demand: "High"
    },
    {
      name: "SIEM",
      importance: 9,
      category: "Security",
      description: "Security Information & Event Management log scanners.",
      roadmap: "Splunk search inputs, log alert triggers configuration, log parsers.",
      certifications: ["Splunk Core Certified Power User"],
      projects: ["Mock SIEM dashboard flagging anomalous server logins"],
      demand: "Critical"
    },
    {
      name: "Cloud Security",
      importance: 9,
      category: "Cloud",
      description: "Cloud key encryptions, private cloud networks, IAM policy scopes.",
      roadmap: "AWS KMS systems, Azure Key Vault setups, VPC security lists.",
      certifications: ["Certified Cloud Security Professional (CCSP)"],
      projects: ["Secure cloud app with KMS encrypted databases"],
      demand: "Critical"
    }
  ],
  "devops-engineer": [
    {
      name: "Git",
      importance: 8,
      category: "Tools",
      description: "Version control code synchronization repositories.",
      roadmap: "Branch models, remote merges, rebase tracking.",
      certifications: ["Git Specialist Badge"],
      projects: ["Automated semantic commits hook"],
      demand: "Critical"
    },
    {
      name: "Docker",
      importance: 9,
      category: "Containers",
      description: "Isolating execution binaries inside minimal image configurations.",
      roadmap: "Image layer optimizations, container network links, Docker Compose setups.",
      certifications: ["Docker Associate Certification"],
      projects: ["Containerized full-stack web stack image builder"],
      demand: "Critical"
    },
    {
      name: "Kubernetes",
      importance: 10,
      category: "Containers",
      description: "Orchestration runtime running container groups across nodes.",
      roadmap: "ReplicaSet scaling configs, service cluster networking, secret maps.",
      certifications: ["Certified Kubernetes Administrator (CKA)"],
      projects: ["Automated rolling-update pod cluster layout"],
      demand: "Critical"
    },
    {
      name: "CI/CD",
      importance: 10,
      category: "Pipelines",
      description: "Orchestrating automated code compile tests and packaging runners.",
      roadmap: "GitHub Actions steps, Jenkins scripts, artifact compilation (Docker Hub).",
      certifications: ["AWS Certified DevOps Engineer - Professional"],
      projects: ["Continuous delivery pipeline automatically deploying to production VMs"],
      demand: "Critical"
    },
    {
      name: "Terraform",
      importance: 9,
      category: "IaC Tools",
      description: "Infrastructure mapping resources via HashiCorp Configuration Language.",
      roadmap: "State locks, modular modules, custom provider configurations.",
      certifications: ["HashiCorp Terraform Associate"],
      projects: ["Modular multi-tier cloud networking setup"],
      demand: "Critical"
    },
    {
      name: "Linux",
      importance: 8,
      category: "OS Core",
      description: "Server kernel shell command executions and daemon managers.",
      roadmap: "System stats monitoring, shell cron job triggers, network port binds.",
      certifications: ["Linux Foundation Certified System Administrator (LFCS)"],
      projects: ["System processes RAM tracker shell script"],
      demand: "High"
    },
    {
      name: "AWS",
      importance: 8,
      category: "Cloud",
      description: "AWS cloud instances hosting containers and pipelines.",
      roadmap: "EKS clusters management, VPC peering links, RDS cluster setups.",
      certifications: ["AWS Solutions Architect Certification"],
      projects: ["Highly available AWS compute cloud pool"],
      demand: "High"
    },
    {
      name: "Monitoring (Prometheus)",
      importance: 8,
      category: "BI Tools",
      description: "Time-series logging query engines and status panels.",
      roadmap: "Metrics scrape schedules, PromQL queries, Grafana visualization dashboards.",
      certifications: ["Prometheus Certified Associate (PCA)"],
      projects: ["Real-time memory monitor alert triggers dashboard"],
      demand: "High"
    },
    {
      name: "Shell Scripting",
      importance: 8,
      category: "Programming",
      description: "Automated scripting tasks inside Linux environments.",
      roadmap: "Bash conditional arguments, text search filters (awk/sed), cron layouts.",
      certifications: ["Linux Scripting Expert credential"],
      projects: ["Server backup daemon script backing up database folders to cloud"],
      demand: "High"
    }
  ],
  "mobile-app-developer": [
    {
      name: "Swift",
      importance: 9,
      category: "Programming",
      description: "iOS object compilation language from Apple.",
      roadmap: "UIKit layouts, SwiftUI state trackers, async loops, local storage.",
      certifications: ["Apple App Development with Swift Certification"],
      projects: ["Interactive Apple Watch fitness log app"],
      demand: "High"
    },
    {
      name: "Kotlin",
      importance: 9,
      category: "Programming",
      description: "Android compiler language replacing Java for mobile apps.",
      roadmap: "Jetpack Compose view declarations, coroutines concurrency, local Room DB.",
      certifications: ["Google Associate Android Developer Certification"],
      projects: ["Modern Jetpack compose task tracker app"],
      demand: "High"
    },
    {
      name: "Flutter",
      importance: 8,
      category: "Frameworks",
      description: "Dart compiler rendering cross-platform binary layouts.",
      roadmap: "Widget tree layout models, BLoC state controls, platform channel calls.",
      certifications: ["Google Flutter Developer Badge"],
      projects: ["Location-tracking travel companion app"],
      demand: "High"
    },
    {
      name: "React Native",
      importance: 8,
      category: "Frameworks",
      description: "React framework generating native iOS/Android bridge controls.",
      roadmap: "Expo tools development, native integrations, stylesheet modules.",
      certifications: ["Meta React Native Developer Certificate"],
      projects: ["Dynamic calendar booking app"],
      demand: "High"
    },
    {
      name: "Git",
      importance: 7,
      category: "Tools",
      description: "Collaborative code branches tracking and commits history.",
      roadmap: "Cherry-pick commits, branches setup, conflicts checks.",
      certifications: ["Git Pro Badge"],
      projects: ["Mobile app code team branch config"],
      demand: "High"
    },
    {
      name: "App Store Deploy",
      importance: 8,
      category: "Tools",
      description: "Publishing releases, testing beta models (TestFlight), signing profiles.",
      roadmap: "Provisioning profile settings, App Store Connect metadata forms, Google Play releases.",
      certifications: ["App Publishing Specialist Badge"],
      projects: ["Deploying beta app release to 50 active testers"],
      demand: "High"
    },
    {
      name: "Firebase",
      importance: 8,
      category: "Databases",
      description: "Serverless database storing JSON variables, managing accounts, and push logs.",
      roadmap: "Firestore document collections, Firebase Auth setup, push notify setups.",
      certifications: ["Google Cloud Certified Firebase Developer"],
      projects: ["Instant messaging app with Firestore database and accounts auth"],
      demand: "High"
    },
    {
      name: "REST APIs",
      importance: 8,
      category: "Architecture",
      description: "Fetching remote server data payloads inside phone clients.",
      roadmap: "Mobile async HTTP requests, token caching (Secure Storage), JSON parsing.",
      certifications: ["Postman Mobile API Badge"],
      projects: ["News reader mobile app fetching endpoints payloads"],
      demand: "High"
    },
    {
      name: "UI/UX Design",
      importance: 8,
      category: "Soft Skills",
      description: "Figma vector designs, mobile navigation patterns, touches sizes.",
      roadmap: "Human Interface Guidelines (Apple), Material Design (Google), screen transition curves.",
      certifications: ["Google UX Design Certificate"],
      projects: ["Interactive Figma layout designs for digital wallet app"],
      demand: "High"
    }
  ]
};

export default function SkillGalaxy({ selectedRole, userSkills, onNodeSelect }: SkillGalaxyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<SkillNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = containerRef.current?.clientWidth || 500;
    let height = canvas.height = containerRef.current?.clientHeight || 450;

    // Load active role nodes from dictionary
    const rawNodes = ROLE_SKILLS_MAP[selectedRole] || ROLE_SKILLS_MAP["web-developer"];
    const N = rawNodes.length;

    // Project coordinates uniformly in 3D sphere shell using spherical distribution
    let nodes = rawNodes.map((node, i) => {
      const radius = 120;
      // Spherical coordinate distribution mapping
      const theta = i * ((2 * Math.PI) / N);
      const phi = Math.acos(-1 + (2 * (i + 0.5)) / N);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      return {
        ...node,
        x,
        y,
        z
      };
    });

    // Dynamic Connections linking successive elements for visual connections
    const connections: [number, number][] = [];
    for (let i = 0; i < N; i++) {
      connections.push([i, (i + 1) % N]);
      if (N > 4) {
        connections.push([i, (i + 3) % N]);
      }
    }

    // Rotation angles
    let angleX = 0.002;
    let angleY = 0.002;

    // Mouse details
    let mouseX = 0;
    let mouseY = 0;
    let isMouseOver = false;

    const focalLength = 300;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      const centerX = width / 2;
      const centerY = height / 2;
      angleY = (mouseX - centerX) * 0.00003;
      angleX = (mouseY - centerY) * 0.00003;
      isMouseOver = true;
    };

    const handleMouseLeave = () => {
      angleX = 0.002;
      angleY = 0.002;
      isMouseOver = false;
      setHoveredNode(null);
    };

    // Click handler to select node and push it to dashboard
    const handleMouseClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const centerX = width / 2;
      const centerY = height / 2;

      let clickedNode: SkillNode | null = null;
      let minDistance = 20; // Tap hit radius

      nodes.forEach(node => {
        // Find 2D projected position during current loop
        const scale = focalLength / (focalLength + (node.z || 0));
        const screenX = centerX + (node.x || 0) * scale;
        const screenY = centerY + (node.y || 0) * scale;

        const dx = clickX - screenX;
        const dy = clickY - screenY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
          minDistance = distance;
          clickedNode = node;
        }
      });

      if (clickedNode) {
        onNodeSelect(clickedNode);
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("click", handleMouseClick);

    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      width = canvas.width = containerRef.current.clientWidth;
      height = canvas.height = containerRef.current.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    const rotateX = (node: any, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const y1 = node.y * cos - node.z * sin;
      const z1 = node.z * cos + node.y * sin;
      node.y = y1;
      node.z = z1;
    };

    const rotateY = (node: any, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x1 = node.x * cos - node.z * sin;
      const z1 = node.z * cos + node.x * sin;
      node.x = x1;
      node.z = z1;
    };

    let animationId = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      nodes.forEach(node => {
        rotateX(node, angleX);
        rotateY(node, angleY);
      });

      // Project nodes to 2D
      const projectedNodes = nodes.map(node => {
        const scale = focalLength / (focalLength + (node.z || 0));
        const screenX = centerX + (node.x || 0) * scale;
        const screenY = centerY + (node.y || 0) * scale;
        const opacity = (focalLength - (node.z || 0)) / (focalLength * 1.5) + 0.15;
        
        // Node size = base size (scaled by depth) * importance modifier (5 to 10 scale)
        const baseSize = 8 + (focalLength - (node.z || 0)) * 0.04;
        const size = Math.max(6, (baseSize * (node.importance / 8)) * scale);

        // Verify if candidate already owns this skill (case-insensitive check)
        const ownsSkill = userSkills.some(
          s => s.toLowerCase().trim() === node.name.toLowerCase().trim()
        );

        return {
          ...node,
          screenX,
          screenY,
          opacity: Math.min(1, Math.max(0.1, opacity)),
          size,
          scale,
          ownsSkill
        };
      });

      // 1. Draw connections (curves or pulsing lines)
      connections.forEach(([startIndex, endIndex]) => {
        const start = projectedNodes[startIndex];
        const end = projectedNodes[endIndex];

        if (!start || !end) return;

        const avgOpacity = (start.opacity + end.opacity) / 2;

        ctx.beginPath();
        ctx.moveTo(start.screenX, start.screenY);
        ctx.lineTo(end.screenX, end.screenY);

        // Connections are colored dynamically (green/cyan if connected nodes are owned, otherwise dark indigo)
        let strokeGrad = ctx.createLinearGradient(start.screenX, start.screenY, end.screenX, end.screenY);
        if (start.ownsSkill && end.ownsSkill) {
          strokeGrad.addColorStop(0, `rgba(16, 185, 129, ${avgOpacity * 0.45})`); // Emerald
          strokeGrad.addColorStop(1, `rgba(34, 211, 238, ${avgOpacity * 0.45})`); // Cyan
        } else {
          strokeGrad.addColorStop(0, `rgba(99, 102, 241, ${avgOpacity * 0.18})`); // Indigo
          strokeGrad.addColorStop(1, `rgba(168, 85, 247, ${avgOpacity * 0.18})`); // Purple
        }

        ctx.strokeStyle = strokeGrad;
        ctx.lineWidth = 1.2 * ((start.scale + end.scale) / 2);
        ctx.stroke();

        // Pulsing line flow point
        const pulseRatio = (Date.now() * 0.001 + startIndex) % 1;
        const ptX = start.screenX + (end.screenX - start.screenX) * pulseRatio;
        const ptY = start.screenY + (end.screenY - start.screenY) * pulseRatio;

        ctx.beginPath();
        ctx.arc(ptX, ptY, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = start.ownsSkill && end.ownsSkill ? "#10b981" : "#6366f1";
        ctx.fill();
      });

      // 2. Draw nodes
      let currentHovered: typeof projectedNodes[0] | null = null;
      let minHoverDist = 20;

      projectedNodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.screenX, node.screenY, node.size, 0, Math.PI * 2);

        // Radial glow colors based on whether candidate owns this skill
        let nodeColor = "99, 102, 241"; // Indigo default (missing)
        if (node.ownsSkill) {
          nodeColor = "16, 185, 129"; // Green (owned!)
        } else if (node.importance >= 9) {
          nodeColor = "168, 85, 247"; // Purple (important missing)
        }

        const glowRad = node.size * 2.5;
        const radialGrad = ctx.createRadialGradient(
          node.screenX, node.screenY, node.size * 0.2,
          node.screenX, node.screenY, glowRad
        );

        radialGrad.addColorStop(0, `rgba(255, 255, 255, ${node.opacity})`);
        radialGrad.addColorStop(0.3, `rgba(${nodeColor}, ${node.opacity})`);
        radialGrad.addColorStop(1, `rgba(${nodeColor}, 0)`);

        ctx.fillStyle = radialGrad;
        ctx.fill();

        // Outer neon ring borders for owned skills
        if (node.ownsSkill) {
          ctx.beginPath();
          ctx.arc(node.screenX, node.screenY, node.size + 2.5, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(16, 185, 129, ${node.opacity * 0.8})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Skill Labels text
        ctx.font = `700 ${Math.max(9, 11 * node.scale)}px var(--font-orbitron)`;
        ctx.fillStyle = node.ownsSkill 
          ? `rgba(167, 243, 208, ${node.opacity * 0.95})` 
          : `rgba(241, 245, 249, ${node.opacity * 0.85})`;
        ctx.textAlign = "center";
        ctx.fillText(node.name, node.screenX, node.screenY + node.size + 13);

        // Hover distance tracking
        if (isMouseOver) {
          const dx = mouseX - node.screenX;
          const dy = mouseY - node.screenY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < minHoverDist) {
            minHoverDist = distance;
            currentHovered = node;
          }
        }
      });

      // Update tooltip details state
      if (currentHovered) {
        const hNode = currentHovered as typeof projectedNodes[0];
        setHoveredNode(hNode);
        const canvasRect = canvas.getBoundingClientRect();
        setTooltipPos({
          x: hNode.screenX + 15,
          y: hNode.screenY - 60
        });
      } else {
        if (minHoverDist === 20) {
          setHoveredNode(null);
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("click", handleMouseClick);
      window.removeEventListener("resize", handleResize);
    };
  }, [selectedRole, userSkills]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[380px] bg-slate-950/40 rounded-2xl overflow-hidden border border-slate-900 shadow-2xl">
      <canvas ref={canvasRef} className="w-full h-full block cursor-pointer" />
      
      {/* Node Hover Tooltip info box */}
      {hoveredNode && (
        <div 
          className="absolute z-10 p-3 rounded-xl border glass-panel text-[10px] pointer-events-none shadow-xl text-slate-100 flex flex-col gap-1.5 max-w-[200px] animate-fade-in border-slate-800"
          style={{ 
            left: `${tooltipPos.x}px`, 
            top: `${tooltipPos.y}px`
          }}
        >
          <div className="flex justify-between items-center gap-2">
            <span className="font-extrabold text-slate-100 font-orbitron">{hoveredNode.name}</span>
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
              hoveredNode.ownsSkill 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-slate-800 text-slate-400"
            }`}>
              {hoveredNode.ownsSkill ? "OWNED" : "MISSING"}
            </span>
          </div>
          
          <div className="text-slate-400 font-medium leading-normal">
            {hoveredNode.description.length > 80 
              ? `${hoveredNode.description.substring(0, 80)}...` 
              : hoveredNode.description
            }
          </div>
          
          <div className="text-[8px] text-slate-500 border-t border-slate-900 pt-1">
            Click node to view full roadmap details.
          </div>
        </div>
      )}
    </div>
  );
}
