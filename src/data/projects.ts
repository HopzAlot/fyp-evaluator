export type ProjectStatus = "Ready" | "In Review" | "Submitted";

export type Student = {
  id: string;
  name: string;
  rollNo: string;
  progress: number;
};

export type Project = {
  id: string;
  title: string;
  department: string;
  supervisor: string;
  phase: string;
  status: ProjectStatus;
  progress: number;
  members: Student[];
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
    members: [
      {
        id: "omar-siddiqui",
        name: "Omar Siddiqui",
        rollNo: "CS-041",
        progress: 29,
      },
      { id: "areeba-khan", name: "Areeba Khan", rollNo: "CS-042", progress: 0 },
      { id: "saad-latif", name: "Saad Latif", rollNo: "CS-043", progress: 0 },
      { id: "hina-aslam", name: "Hina Aslam", rollNo: "CS-044", progress: 0 },
    ],
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
    members: [
      { id: "maham-raza", name: "Maham Raza", rollNo: "SE-021", progress: 54 },
      { id: "bilal-ahmed", name: "Bilal Ahmed", rollNo: "SE-022", progress: 48 },
      { id: "taha-noor", name: "Taha Noor", rollNo: "SE-023", progress: 51 },
    ],
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
    members: [
      { id: "zain-ali", name: "Zain Ali", rollNo: "IT-013", progress: 72 },
      {
        id: "noor-fatima",
        name: "Noor Fatima",
        rollNo: "IT-014",
        progress: 68,
      },
      { id: "usman-tariq", name: "Usman Tariq", rollNo: "IT-015", progress: 74 },
    ],
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
    members: [
      { id: "dua-sheikh", name: "Dua Sheikh", rollNo: "SE-071", progress: 88 },
      { id: "hassan-rauf", name: "Hassan Rauf", rollNo: "SE-072", progress: 84 },
      { id: "muneeb-khan", name: "Muneeb Khan", rollNo: "SE-073", progress: 82 },
    ],
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
