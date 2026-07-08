export type ProjectStatus = "Ready" | "In Review" | "Submitted";

export type Project = {
  id: string;
  title: string;
  department: string;
  supervisor: string;
  phase: string;
  status: ProjectStatus;
  progress: number;
  members: string[];
  lastUpdated: string;
};

export const projects: Project[] = [
  {
    id: "blockchain-voting-system",
    title: "Blockchain Based Voting System",
    department: "Computer Science",
    supervisor: "Dr. Ahmed El-Sayed",
    phase: "Synopsis",
    status: "In Review",
    progress: 29,
    members: ["Omar Siddiqui", "Areeba Khan", "Saad Latif", "Hina Aslam"],
    lastUpdated: "Today",
  },
  {
    id: "ai-attendance-system",
    title: "AI Attendance System",
    department: "Software Engineering",
    supervisor: "Prof. Sarah Malik",
    phase: "Progress",
    status: "Ready",
    progress: 54,
    members: ["Maham Raza", "Bilal Ahmed", "Taha Noor"],
    lastUpdated: "Yesterday",
  },
  {
    id: "smart-campus-navigation",
    title: "Smart Campus Navigation",
    department: "Information Technology",
    supervisor: "Dr. Hamza Farooq",
    phase: "Demo",
    status: "Submitted",
    progress: 72,
    members: ["Zain Ali", "Noor Fatima", "Usman Tariq"],
    lastUpdated: "2 days ago",
  },
  {
    id: "fyp-resource-planner",
    title: "FYP Resource Planner",
    department: "Software Engineering",
    supervisor: "Prof. Ayesha Iqbal",
    phase: "Final",
    status: "Ready",
    progress: 88,
    members: ["Dua Sheikh", "Hassan Rauf", "Muneeb Khan"],
    lastUpdated: "3 days ago",
  },
];

export const evaluationPhases = ["Synopsis", "Progress", "Demo", "Final"];

export const evaluationCriteria = [
  "Problem statement clarity",
  "Objective relevance",
  "Literature review depth",
  "Methodology appropriateness",
  "Feasibility and scope",
  "Presentation quality",
];
