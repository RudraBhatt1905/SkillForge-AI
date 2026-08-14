export type CareerRole = 
  | 'Software Developer'
  | 'Full Stack Developer'
  | 'AI/ML Engineer'
  | 'Data Analyst'
  | 'Data Scientist'
  | 'Cybersecurity Engineer'
  | 'Cloud Engineer'
  | 'DevOps Engineer'
  | 'UI/UX Designer'
  | string;

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface ProjectExperience {
  id: string;
  title: string;
  technologies: string[];
  description: string;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  skillsDemonstrated: string[];
  githubUrl?: string;
  liveUrl?: string;
}

export interface ExtractedResume {
  candidateName?: string;
  summary: string;
  technicalSkills: string[];
  programmingLanguages: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
  softSkills: string[];
  projects: ProjectExperience[];
  education: {
    college: string;
    degree: string;
    branch: string;
    yearOfStudy: string;
    gpa?: string;
  };
  experience: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  inferredLevel: ExperienceLevel;
  fileName?: string;
  uploadDate?: string;
}

export interface StudentProfile {
  uid: string;
  name: string;
  email: string;
  college: string;
  degree: string;
  branch: string;
  yearOfStudy: string;
  location: string;
  careerGoal: CareerRole;
  currentSkills: string[];
  interests: string[];
  experienceLevel: ExperienceLevel;
  resume?: ExtractedResume;
  
  // Gamification & Progress metrics
  xp: number;
  level: number;
  levelTitle: string;
  streakDays: number;
  lastActiveDate: string;
  badges: {
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedDate: string;
  }[];
  
  isOnboarded: boolean;
  updatedAt: string;
}

export interface SkillGapItem {
  skill: string;
  category: 'Technical' | 'Language' | 'Framework' | 'Database' | 'Tool' | 'Soft Skill';
  currentLevel: 'None' | 'Beginner' | 'Intermediate' | 'Advanced';
  requiredLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  gapSeverity: 'None' | 'Low' | 'Medium' | 'High';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Strong' | 'Weak' | 'Missing';
  reason: string;
  recommendedAction: string;
}

export interface SkillGapAnalysis {
  targetRole: CareerRole;
  strongSkills: string[];
  weakSkills: string[];
  missingSkills: string[];
  prioritySkills: SkillGapItem[];
  overallMatchPercentage: number;
  analysisSummary: string;
}

export type TaskStatus = 'not_started' | 'in_progress' | 'completed';

export interface RoadmapTask {
  id: string;
  title: string;
  skill: string;
  phase: number;
  phaseName: string;
  estimatedDuration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  learningObjective: string;
  resources: {
    title: string;
    type: 'Article' | 'Video' | 'Documentation' | 'Course';
    url: string;
  }[];
  projectAssignment: {
    title: string;
    description: string;
  };
  status: TaskStatus;
  completedAt?: string;
}

export interface RoadmapPhase {
  phaseNumber: number;
  title: string;
  description: string;
  durationWeeks: string;
  tasks: RoadmapTask[];
}

export interface CourseRecommendation {
  id: string;
  courseName: string;
  provider: string;
  skillCovered: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration: string;
  whyRecommended: string;
  rating?: number;
  url: string;
  isCompleted?: boolean;
}

export interface ProjectRecommendation {
  id: string;
  projectTitle: string;
  description: string;
  skillsLearned: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  technologies: string[];
  architectureOverview: string;
  readinessBoostPercentage: number;
  isCompleted?: boolean;
}

export interface CertificationRecommendation {
  id: string;
  title: string;
  provider: string;
  level: string;
  relevanceReason: string;
  estimatedCost: string;
  officialUrl: string;
}

export interface InterviewTopic {
  id: string;
  category: 'DSA' | 'Technical' | 'HR' | 'System Design' | 'Mock';
  topic: string;
  question: string;
  aiSuggestedAnswer: string;
  keyPoints: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  mastered?: boolean;
}

export interface InterviewPrepPlan {
  dsaTopics: string[];
  technicalQuestions: InterviewTopic[];
  hrQuestions: InterviewTopic[];
  systemDesignTopics: string[];
  mockTopics: string[];
}

export interface CareerReadinessScore {
  overallScore: number; // 0-100
  breakdown: {
    skillCoverage: number;
    projectQuality: number;
    resumeStrength: number;
    interviewReadiness: number;
    roadmapProgress: number;
  };
  positiveFactors: string[];
  negativeFactors: string[];
  boostActionPlan: {
    action: string;
    scoreBoost: number;
    relatedSkillOrTask: string;
  }[];
  scoreExplanation: string;
}

export interface ResumeInsights {
  healthScore: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  formattingSuggestions: string[];
  projectImprovementSuggestions: string[];
  improvedBulletPoints: {
    original: string;
    improved: string;
    impactReason: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: string;
  quickActions?: string[];
}

export interface MockInterviewExchange {
  questionNumber: number;
  category: 'Icebreaker / Background' | 'Core Technical' | 'System & Scenarios' | 'Behavioral STAR';
  question: string;
  candidateAnswer: string;
  recruiterFeedback: string;
  score: number;
  strengths: string[];
  improvementTips: string[];
  timestamp: string;
}

export interface MockInterviewFeedback {
  overallScore: number;
  verdict: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'Needs Practice';
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  starScore: number;
  summary: string;
  strengths: string[];
  areasToImprove: string[];
  actionItems: string[];
}

export interface MockInterviewSession {
  id: string;
  role: string;
  companyTarget?: string;
  interviewerName: string;
  interviewerTitle: string;
  avatar: string;
  startedAt: string;
  completedAt?: string;
  exchanges: MockInterviewExchange[];
  feedback?: MockInterviewFeedback;
}

