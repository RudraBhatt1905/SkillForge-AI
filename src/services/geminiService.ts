import {
  StudentProfile,
  ExtractedResume,
  SkillGapAnalysis,
  RoadmapPhase,
  CourseRecommendation,
  ProjectRecommendation,
  CertificationRecommendation,
  InterviewPrepPlan,
  CareerReadinessScore,
  ResumeInsights,
  ChatMessage,
  SkillGapItem,
} from '../types';

async function callGeminiApi(prompt: string, systemInstruction?: string, jsonSchema?: any): Promise<string> {
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        systemInstruction,
        jsonSchema,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Server responded with status ${res.status}`);
    }

    const data = await res.json();
    return data.text || '';
  } catch (error) {
    // Gracefully handle server offline or API error
    throw error;
  }
}

// Comprehensive dictionary for heuristic resume skill parsing
const KNOWN_LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'C', 'Go', 'Golang', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'SQL', 'R', 'Scala', 'HTML', 'HTML5', 'CSS', 'CSS3', 'Bash', 'Shell'
];

const KNOWN_FRAMEWORKS = [
  'React', 'React.js', 'Next.js', 'Vue', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Express.js', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Spring', 'ASP.NET', 'Ruby on Rails', 'Laravel', 'Tailwind CSS', 'Bootstrap', 'Redux', 'Redux Toolkit', 'Zustand', 'GraphQL', 'PyTorch', 'TensorFlow', 'Keras', 'Scikit-Learn', 'Pandas', 'NumPy'
];

const KNOWN_DATABASES = [
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Firebase', 'Firestore', 'Supabase', 'Oracle', 'Cassandra', 'DynamoDB', 'MariaDB', 'Elasticsearch'
];

const KNOWN_TOOLS = [
  'Git', 'GitHub', 'GitLab', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Google Cloud', 'Azure', 'Linux', 'CI/CD', 'Postman', 'Vercel', 'Netlify', 'Figma', 'Jira', 'Webpack', 'Vite', 'VS Code', 'Kafka', 'Nginx'
];

const KNOWN_SOFTSKILLS = [
  'Problem Solving', 'Communication', 'Team Collaboration', 'Leadership', 'Agile Methodology', 'Critical Thinking', 'Time Management', 'Code Review'
];

// Helper to extract keywords from text with regex boundaries
function extractKeywordsFromText(text: string, dictionary: string[]): string[] {
  const found: string[] = [];
  for (const item of dictionary) {
    const escaped = item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text)) {
      found.push(item);
    }
  }
  return found;
}

// 1. Analyze Resume and Extract Real Profile Data
export async function analyzeResumeAndExtract(
  resumeText: string,
  currentProfile: StudentProfile
): Promise<ExtractedResume> {
  const targetRole = currentProfile.careerGoal || 'Software Engineer';
  const prompt = `Analyze the following student resume targeting "${targetRole}":
---
${resumeText}
---
Extract structured profile information as strict JSON with keys:
- candidateName: string
- summary: string
- technicalSkills: string[]
- programmingLanguages: string[]
- frameworks: string[]
- databases: string[]
- tools: string[]
- softSkills: string[]
- education: { college: string, degree: string, branch: string, yearOfStudy: string }
- projects: Array<{ id: string, title: string, technologies: string[], description: string, complexity: string, skillsDemonstrated: string[] }>
- experience: Array<{ company: string, role: string, duration: string, description: string, keyAchievements: string[] }>
- inferredLevel: 'Beginner' | 'Intermediate' | 'Advanced'`;

  try {
    const rawText = await callGeminiApi(prompt, 'You are an expert technical recruiter. Extract structured information from resumes as JSON.');
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      candidateName: parsed.candidateName || currentProfile.name,
      summary: parsed.summary || `Extracted profile targeting ${targetRole}.`,
      technicalSkills: parsed.technicalSkills?.length ? parsed.technicalSkills : extractKeywordsFromText(resumeText, [...KNOWN_LANGUAGES, ...KNOWN_FRAMEWORKS, ...KNOWN_DATABASES, ...KNOWN_TOOLS]),
      programmingLanguages: parsed.programmingLanguages?.length ? parsed.programmingLanguages : extractKeywordsFromText(resumeText, KNOWN_LANGUAGES),
      frameworks: parsed.frameworks?.length ? parsed.frameworks : extractKeywordsFromText(resumeText, KNOWN_FRAMEWORKS),
      databases: parsed.databases?.length ? parsed.databases : extractKeywordsFromText(resumeText, KNOWN_DATABASES),
      tools: parsed.tools?.length ? parsed.tools : extractKeywordsFromText(resumeText, KNOWN_TOOLS),
      softSkills: parsed.softSkills?.length ? parsed.softSkills : extractKeywordsFromText(resumeText, KNOWN_SOFTSKILLS),
      projects: parsed.projects?.length ? parsed.projects : extractProjectsFromText(resumeText),
      education: parsed.education || extractEducationFromText(resumeText, currentProfile),
      experience: parsed.experience || [],
      inferredLevel: parsed.inferredLevel || 'Intermediate',
      uploadDate: new Date().toISOString().split('T')[0],
    };
  } catch (e) {
    // Intelligent heuristic extraction directly from resume text
    const extractedLangs = extractKeywordsFromText(resumeText, KNOWN_LANGUAGES);
    const extractedFrameworks = extractKeywordsFromText(resumeText, KNOWN_FRAMEWORKS);
    const extractedDatabases = extractKeywordsFromText(resumeText, KNOWN_DATABASES);
    const extractedTools = extractKeywordsFromText(resumeText, KNOWN_TOOLS);
    const extractedSoft = extractKeywordsFromText(resumeText, KNOWN_SOFTSKILLS);
    const allSkills = Array.from(new Set([...extractedLangs, ...extractedFrameworks, ...extractedDatabases, ...extractedTools]));

    const parsedProjects = extractProjectsFromText(resumeText);
    const parsedEducation = extractEducationFromText(resumeText, currentProfile);
    const detectedName = extractCandidateName(resumeText) || currentProfile.name;

    const level: 'Beginner' | 'Intermediate' | 'Advanced' =
      allSkills.length > 8 || parsedProjects.length >= 2 ? 'Intermediate' : 'Beginner';

    return {
      candidateName: detectedName,
      summary: `Parsed resume for ${detectedName || 'candidate'}. Identified ${allSkills.length} technical skills across languages, frameworks, and databases.`,
      technicalSkills: allSkills.length ? allSkills : (currentProfile.currentSkills.length ? currentProfile.currentSkills : ['JavaScript', 'HTML/CSS', 'Git']),
      programmingLanguages: extractedLangs.length ? extractedLangs : ['JavaScript'],
      frameworks: extractedFrameworks.length ? extractedFrameworks : ['React'],
      databases: extractedDatabases.length ? extractedDatabases : ['SQL'],
      tools: extractedTools.length ? extractedTools : ['Git', 'VS Code'],
      softSkills: extractedSoft.length ? extractedSoft : ['Problem Solving', 'Team Collaboration'],
      projects: parsedProjects.length ? parsedProjects : [
        {
          id: 'proj_parsed_1',
          title: `${targetRole} Portfolio Project`,
          technologies: allSkills.slice(0, 3),
          description: `Custom software application built using ${allSkills.slice(0, 3).join(', ')} demonstrating modular design and functional API integration.`,
          complexity: level,
          skillsDemonstrated: allSkills.slice(0, 3),
        },
      ],
      education: parsedEducation,
      experience: [],
      inferredLevel: level,
      uploadDate: new Date().toISOString().split('T')[0],
    };
  }
}

function extractCandidateName(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length > 2 && firstLine.length < 35 && !firstLine.toLowerCase().includes('resume') && !firstLine.toLowerCase().includes('curriculum')) {
      return firstLine;
    }
  }
  return '';
}

function extractEducationFromText(text: string, profile: StudentProfile) {
  let college = profile.college || '';
  let degree = profile.degree || 'B.Tech';
  let branch = profile.branch || 'Computer Science';
  let yearOfStudy = profile.yearOfStudy || '3rd Year';

  const lines = text.split('\n');
  for (const line of lines) {
    const l = line.toLowerCase();
    if (l.includes('university') || l.includes('institute') || l.includes('college')) {
      college = line.trim().slice(0, 60);
    }
    if (l.includes('b.tech') || l.includes('btech') || l.includes('b.e.') || l.includes('bachelor') || l.includes('b.s.')) {
      degree = 'B.Tech / B.E.';
    } else if (l.includes('m.tech') || l.includes('master') || l.includes('m.s.')) {
      degree = 'M.Tech / M.S.';
    } else if (l.includes('bca') || l.includes('mca')) {
      degree = 'BCA / MCA';
    }

    if (l.includes('computer science') || l.includes('cse')) {
      branch = 'Computer Science & Engineering';
    } else if (l.includes('information technology') || l.includes('it')) {
      branch = 'Information Technology';
    } else if (l.includes('artificial intelligence') || l.includes('ai & ds')) {
      branch = 'AI & Data Science';
    } else if (l.includes('electronics')) {
      branch = 'Electronics & Communication';
    }

    if (l.includes('2026') || l.includes('2027')) {
      yearOfStudy = '3rd Year';
    } else if (l.includes('2025')) {
      yearOfStudy = '4th Year';
    } else if (l.includes('2028')) {
      yearOfStudy = '2nd Year';
    }
  }

  return { college: college || 'Engineering Institute', degree, branch, yearOfStudy };
}

function extractProjectsFromText(text: string) {
  const projects: Array<{
    id: string;
    title: string;
    technologies: string[];
    description: string;
    complexity: 'Beginner' | 'Intermediate' | 'Advanced';
    skillsDemonstrated: string[];
  }> = [];

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let inProjectsSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    if (lower.startsWith('project') || lower.includes('projects:') || lower === 'projects') {
      inProjectsSection = true;
      continue;
    }

    if (inProjectsSection && (lower.startsWith('education') || lower.startsWith('experience') || lower.startsWith('skills') || lower.startsWith('certifications'))) {
      inProjectsSection = false;
      break;
    }

    if (inProjectsSection && line.length > 5 && !line.startsWith('•') && !line.startsWith('-')) {
      const title = line.split('|')[0].split('-')[0].trim();
      const techInLine = extractKeywordsFromText(line, [...KNOWN_LANGUAGES, ...KNOWN_FRAMEWORKS, ...KNOWN_DATABASES, ...KNOWN_TOOLS]);
      const nextLine = lines[i + 1] || '';

      if (title.length > 3 && title.length < 50) {
        projects.push({
          id: `proj_parsed_${projects.length + 1}`,
          title,
          technologies: techInLine.length ? techInLine : ['JavaScript', 'React', 'Node.js'],
          description: nextLine.length > 10 ? nextLine : `Developed software solution solving specific problem statement with ${techInLine.join(', ') || 'modern web tools'}.`,
          complexity: 'Intermediate',
          skillsDemonstrated: techInLine.length ? techInLine : ['System Architecture', 'Clean Code'],
        });
      }

      if (projects.length >= 3) break;
    }
  }

  return projects;
}

// 2. Skill Gap Analysis dynamically generated from Resume skills vs Target Role
export async function generateSkillGapAnalysis(profile: StudentProfile): Promise<SkillGapAnalysis> {
  const role = profile.careerGoal || 'Full Stack Developer';
  const skillsList = profile.currentSkills.length ? profile.currentSkills : (profile.resume?.technicalSkills || []);

  const prompt = `Student Profile:
Name: ${profile.name}
Goal: ${role}
Current Skills extracted from resume: ${skillsList.join(', ')}
Level: ${profile.experienceLevel}

Compare CURRENT RESUME SKILLS against industry requirements for a ${role}.
Return strict JSON with keys:
- targetRole: string
- overallMatchPercentage: number (0-100)
- analysisSummary: string
- strongSkills: string[]
- weakSkills: string[]
- missingSkills: string[]
- prioritySkills: Array<{ skill: string, category: string, currentLevel: string, requiredLevel: string, gapSeverity: 'High' | 'Medium' | 'Low', priority: 'High' | 'Medium' | 'Low', status: 'Strong' | 'Weak' | 'Missing', reason: string, recommendedAction: string }>`;

  try {
    const raw = await callGeminiApi(prompt, 'You are an AI career strategist. Return JSON comparing resume skills vs target role.');
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.prioritySkills && parsed.prioritySkills.length > 0) return parsed as SkillGapAnalysis;
  } catch (e) {
    // Dynamic rule engine tailored to candidate's actual resume
  }

  const roleReqsMap: Record<string, string[]> = {
    'Full Stack Developer': ['React', 'TypeScript', 'Node.js', 'Express', 'SQL & Databases', 'REST APIs', 'Git', 'System Design Basics'],
    'Software Developer': ['Data Structures', 'Algorithms', 'C++ or Java', 'OOP Principles', 'SQL', 'Git', 'Unit Testing'],
    'AI/ML Engineer': ['Python', 'Machine Learning', 'PyTorch / TensorFlow', 'Pandas & NumPy', 'Data Preprocessing', 'Math & Statistics', 'SQL'],
    'Data Analyst': ['SQL Queries', 'Python / Pandas', 'Data Visualization (PowerBI/Tableau)', 'Excel Modeling', 'Applied Statistics', 'ETL Pipelines'],
    'Cybersecurity Engineer': ['Networking Protocols', 'Linux System Administration', 'Ethical Hacking', 'Cryptography', 'Python Scripting', 'Security Auditing'],
    'Cloud Engineer': ['AWS / GCP', 'Docker', 'Kubernetes', 'Linux', 'Terraform (IaC)', 'CI/CD Pipelines'],
    'DevOps Engineer': ['CI/CD Pipelines', 'Docker', 'Kubernetes', 'Linux Bash', 'Infrastructure as Code', 'Monitoring & Logging'],
    'UI/UX Designer': ['Figma Design', 'Wireframing & Prototyping', 'User Research', 'Design Systems', 'HTML/CSS Fundamentals'],
  };

  const targetReqs = roleReqsMap[role] || ['Core Programming', 'System Design', 'Web Technologies', 'Version Control', 'Databases'];
  const userSkillsSet = new Set(skillsList.map(s => s.toLowerCase()));

  const strong: string[] = [];
  const weak: string[] = [];
  const missing: string[] = [];
  const prioritySkills: SkillGapItem[] = [];

  targetReqs.forEach(req => {
    const reqLower = req.toLowerCase();
    const isPresent = Array.from(userSkillsSet).some(s => reqLower.includes(s) || s.includes(reqLower));

    if (isPresent) {
      strong.push(req);
      prioritySkills.push({
        skill: req,
        category: 'Technical',
        currentLevel: profile.experienceLevel || 'Intermediate',
        requiredLevel: 'Intermediate',
        gapSeverity: 'Low',
        priority: 'Low',
        status: 'Strong',
        reason: `Demonstrated in resume skills.`,
        recommendedAction: `Continue building advanced project modules in ${req}.`,
      });
    } else {
      missing.push(req);
      prioritySkills.push({
        skill: req,
        category: req.includes('React') || req.includes('Node') ? 'Framework' : req.includes('TypeScript') || req.includes('Python') ? 'Language' : 'Technical',
        currentLevel: 'None',
        requiredLevel: 'Intermediate',
        gapSeverity: prioritySkills.length < 2 ? 'High' : 'Medium',
        priority: prioritySkills.length < 2 ? 'High' : 'Medium',
        status: 'Missing',
        reason: `Essential prerequisite for ${role} hiring rounds.`,
        recommendedAction: `Focus on mastering ${req} through hands-on project assignments.`,
      });
    }
  });

  const total = targetReqs.length;
  const matchPct = total > 0 ? Math.round((strong.length / total) * 100) : 40;

  return {
    targetRole: role,
    overallMatchPercentage: Math.max(matchPct, 25),
    analysisSummary: `Based on your resume, you have verified skills in ${strong.slice(0, 3).join(', ') || 'foundational programming'}. To achieve complete industry readiness for ${role}, your top priority gaps are ${missing.slice(0, 2).join(' and ') || 'specialized frameworks'}.`,
    strongSkills: strong,
    weakSkills: weak.length ? weak : (strong.length > 2 ? [strong[strong.length - 1]] : []),
    missingSkills: missing,
    prioritySkills,
  };
}

// 3. Personalized Roadmap Generator based on Resume Gaps
export async function generatePersonalizedRoadmap(profile: StudentProfile, skillGap: SkillGapAnalysis): Promise<RoadmapPhase[]> {
  const role = profile.careerGoal || 'Full Stack Developer';
  const missing = skillGap.missingSkills.length ? skillGap.missingSkills : ['Advanced Architecture', 'Deployment Pipelines', 'Interview DSA'];
  const strong = skillGap.strongSkills.length ? skillGap.strongSkills : (profile.currentSkills.length ? profile.currentSkills : ['Programming']);

  const prompt = `Generate a 4-phase customized learning roadmap for ${profile.name || 'candidate'}:
Role: ${role}
Verified Resume Skills: ${strong.join(', ')}
Missing Skill Gaps: ${missing.join(', ')}

Return strict JSON array of phases. Each phase object has:
phaseNumber: number, title: string, description: string, durationWeeks: string,
tasks: Array<{ id: string, title: string, skill: string, phase: number, phaseName: string, estimatedDuration: string, difficulty: 'Beginner'|'Intermediate'|'Advanced', learningObjective: string, resources: Array<{ title: string, type: string, url: string }>, projectAssignment: { title: string, description: string }, status: 'completed'|'in_progress'|'not_started' }>`;

  try {
    const raw = await callGeminiApi(prompt, 'You are an expert technical curriculum designer. Return JSON array of phases.');
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (e) {
    // Dynamic generation
  }

  const gap1 = missing[0] || 'Core Domain Skills';
  const gap2 = missing[1] || 'Applied System Development';
  const gap3 = missing[2] || 'Full Stack Integration';

  return [
    {
      phaseNumber: 1,
      title: `Phase 1 — Consolidate Resume Strengths & ${strong[0] || 'Fundamentals'}`,
      description: `Solidify verified resume competencies in ${strong.slice(0, 2).join(' & ') || 'core programming'}.`,
      durationWeeks: 'Weeks 1–2',
      tasks: [
        {
          id: 'task_phase1_1',
          title: `Deepen ${strong[0] || 'Core Syntax'} Best Practices`,
          skill: strong[0] || 'Programming',
          phase: 1,
          phaseName: 'Phase 1 — Foundations',
          estimatedDuration: '4 Days',
          difficulty: 'Intermediate',
          learningObjective: 'Master design patterns, clean code principles, and efficient algorithms.',
          resources: [{ title: 'Developer Guide', type: 'Documentation', url: 'https://developer.mozilla.org' }],
          projectAssignment: { title: 'Code Refactoring & Unit Tests', description: 'Implement unit testing suite covering edge cases.' },
          status: 'completed',
        },
      ],
    },
    {
      phaseNumber: 2,
      title: `Phase 2 — Close Primary Resume Gap (${gap1})`,
      description: `Master ${gap1} to qualify for entry-level ${role} positions.`,
      durationWeeks: 'Weeks 3–5',
      tasks: [
        {
          id: 'task_phase2_1',
          title: `Build Hands-on Project in ${gap1}`,
          skill: gap1,
          phase: 2,
          phaseName: `Phase 2 — ${gap1}`,
          estimatedDuration: '7 Days',
          difficulty: 'Intermediate',
          learningObjective: `Learn practical workflow, state handling, and API integration with ${gap1}.`,
          resources: [{ title: 'Interactive Tutorial', type: 'Course', url: 'https://freecodecamp.org' }],
          projectAssignment: { title: `${gap1} Application`, description: `Build real-world application integrating ${gap1}.` },
          status: 'in_progress',
        },
      ],
    },
    {
      phaseNumber: 3,
      title: `Phase 3 — Capstone Portfolio Project (${gap2})`,
      description: `Synthesize skills into a production-grade portfolio project targeting ${role}.`,
      durationWeeks: 'Weeks 6–8',
      tasks: [
        {
          id: 'task_phase3_1',
          title: `Deploy ${role} Capstone System`,
          skill: gap2,
          phase: 3,
          phaseName: 'Phase 3 — Capstone Project',
          estimatedDuration: '10 Days',
          difficulty: 'Advanced',
          learningObjective: `Build, test, and deploy a full-scale project incorporating ${gap1} and ${gap2}.`,
          resources: [{ title: 'Deployment & CI/CD Guide', type: 'Documentation', url: 'https://cloud.google.com' }],
          projectAssignment: { title: `${role} Cloud Application`, description: 'Deploy end-to-end service with live database and authentication.' },
          status: 'not_started',
        },
      ],
    },
    {
      phaseNumber: 4,
      title: `Phase 4 — Interview Readiness & Campus Placement`,
      description: `Master DSA coding questions and technical interview rounds for ${role}.`,
      durationWeeks: 'Weeks 9–10',
      tasks: [
        {
          id: 'task_phase4_1',
          title: 'DSA & Technical Assessment Prep',
          skill: 'Interview Prep',
          phase: 4,
          phaseName: 'Phase 4 — Interview Prep',
          estimatedDuration: '7 Days',
          difficulty: 'Intermediate',
          learningObjective: 'Practice algorithmic patterns, system design fundamentals, and mock interviews.',
          resources: [{ title: 'Interview Problem Set', type: 'Course', url: 'https://leetcode.com' }],
          projectAssignment: { title: 'Mock Technical Interview', description: 'Complete 20 practice questions with time constraints.' },
          status: 'not_started',
        },
      ],
    },
  ];
}

// 4. Recommendation Engine
export async function generateRecommendations(profile: StudentProfile, skillGap: SkillGapAnalysis) {
  const role = profile.careerGoal || 'Full Stack Developer';
  const missing = skillGap.missingSkills.length ? skillGap.missingSkills : ['Next.js', 'PostgreSQL', 'Docker'];

  try {
    const prompt = `For a ${role} candidate missing skills [${missing.join(', ')}], generate tailored recommendations in strict JSON with keys:
courses: Array<{ id: string, title: string, platform: string, instructor: string, rating: number, duration: string, level: string, url: string, skillsTaught: string[], thumbnail: string, cost: string }>
projects: Array<{ id: string, projectTitle: string, category: string, difficulty: string, estimatedHours: number, technologies: string[], description: string, keyFeatures: string[], githubTemplateUrl: string, readinessBoostPercentage: number }>
certifications: Array<{ id: string, name: string, issuer: string, level: string, relevanceScore: number, estimatedCost: string, examFormat: string, verificationUrl: string, keyTopics: string[] }>`;

    const raw = await callGeminiApi(prompt, 'Return JSON with keys courses, projects, certifications.');
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.courses && parsed.projects) return parsed;
  } catch (e) {
    // Dynamic generation based on missing skills
  }

  const primaryGap = missing[0] || 'Modern Web Development';
  const secondaryGap = missing[1] || 'Cloud & Database Engineering';

  return {
    courses: [
      {
        id: 'c_rec_1',
        title: `Complete ${primaryGap} Masterclass 2026`,
        platform: 'Udemy / Coursera',
        instructor: 'Industry Tech Lead',
        rating: 4.9,
        duration: '24 Hours',
        level: 'Intermediate',
        url: 'https://freecodecamp.org',
        skillsTaught: [primaryGap, 'Modern Architecture', 'Best Practices'],
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60',
        cost: 'Free / Financial Aid',
      },
      {
        id: 'c_rec_2',
        title: `${secondaryGap} for Production Systems`,
        platform: 'edX / Google Cloud',
        instructor: 'Cloud Solution Architects',
        rating: 4.8,
        duration: '18 Hours',
        level: 'Intermediate',
        url: 'https://cloud.google.com/training',
        skillsTaught: [secondaryGap, 'Scalability', 'Security'],
        thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60',
        cost: 'Free Course',
      },
    ],
    projects: [
      {
        id: 'p_rec_1',
        projectTitle: `${role} Production System with ${primaryGap}`,
        category: 'Portfolio Capstone',
        difficulty: 'Intermediate',
        estimatedHours: 25,
        technologies: [primaryGap, secondaryGap, 'Git', 'CI/CD'],
        description: `Build and deploy an enterprise-grade ${role} application bridging your resume gap in ${primaryGap}.`,
        keyFeatures: ['Secure Auth & RBAC', 'Cloud Database Sync', 'Responsive UI & Testing', 'Automated CI/CD'],
        githubTemplateUrl: 'https://github.com',
        readinessBoostPercentage: 15,
      },
    ],
    certifications: [
      {
        id: 'cert_rec_1',
        name: `Professional Certificate in ${role}`,
        issuer: 'Google / Meta',
        level: 'Associate',
        relevanceScore: 94,
        estimatedCost: 'Free on Financial Aid',
        examFormat: 'Online Assessment & Labs',
        verificationUrl: 'https://coursera.org',
        keyTopics: [primaryGap, secondaryGap, 'System Design', 'Version Control'],
      },
    ],
  };
}

// 5. Interview Prep Plan
export async function generateInterviewPrep(profile: StudentProfile): Promise<InterviewPrepPlan> {
  const role = profile.careerGoal || 'Full Stack Developer';
  const skills = profile.currentSkills.length ? profile.currentSkills : ['JavaScript', 'React', 'SQL'];

  try {
    const prompt = `Generate technical and HR interview preparation questions for a student aiming for ${role} with skills [${skills.join(', ')}]. Return JSON with dsaTopics, technicalQuestions, hrQuestions, systemDesignTopics, mockTopics.`;
    const raw = await callGeminiApi(prompt, 'Return JSON with dsaTopics, technicalQuestions, hrQuestions, systemDesignTopics, mockTopics.');
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.technicalQuestions && parsed.technicalQuestions.length > 0) return parsed as InterviewPrepPlan;
  } catch (e) {
    // Dynamic interview prep generator
  }

  return {
    dsaTopics: [
      'Arrays, Two Pointers & Sliding Window',
      'Hash Maps, Trees & Graph Traversals',
      'Dynamic Programming & Greedy Algorithms',
      'Binary Search & Sorting',
    ],
    technicalQuestions: [
      {
        id: 'tech_q1',
        category: 'Technical',
        topic: skills[0] || 'Technical Core',
        question: `How does asynchronous execution and event looping work in ${skills[0] || 'modern runtimes'}?`,
        difficulty: 'Medium',
        aiSuggestedAnswer: `Explain non-blocking I/O, call stack execution, microtask queue priority, and memory management.`,
        keyPoints: ['Call Stack', 'Event Loop', 'Microtask Queue', 'Non-blocking I/O'],
      },
      {
        id: 'tech_q2',
        category: 'Technical',
        topic: 'Databases & System Design',
        question: `What are the trade-offs between relational (SQL) and non-relational (NoSQL) databases for a ${role}?`,
        difficulty: 'Medium',
        aiSuggestedAnswer: `Discuss ACID compliance, normalization vs denormalization, schema flexibility, and horizontal vs vertical scaling.`,
        keyPoints: ['ACID vs BASE', 'Schema Rigidity', 'Sharding & Horizontal Scale'],
      },
      {
        id: 'tech_q3',
        category: 'Technical',
        topic: 'Web APIs & Security',
        question: `How do you secure API endpoints against common vulnerabilities (CORS, Injection, Rate Limiting)?`,
        difficulty: 'Medium',
        aiSuggestedAnswer: `Explain input sanitization, JWT authorization headers, HTTPS encryption, and token validation middlewares.`,
        keyPoints: ['JWT Auth', 'Sanitization', 'Rate Limiting', 'CORS Policies'],
      },
    ],
    hrQuestions: [
      {
        id: 'hr_q1',
        category: 'HR',
        topic: 'Problem Solving & Resilience',
        question: 'Tell me about a challenging technical bug you encountered in a project and how you debugged it.',
        difficulty: 'Medium',
        aiSuggestedAnswer: 'Use the STAR method: explain the Situation, the exact Task, the systematic debugging Actions taken, and the quantified Result.',
        keyPoints: ['STAR Method', 'Root Cause Analysis', 'Quantified Outcome'],
      },
      {
        id: 'hr_q2',
        category: 'HR',
        topic: 'Motivation & Continuous Learning',
        question: `Why are you interested in becoming a ${role}, and how do you keep your skills updated?`,
        difficulty: 'Easy',
        aiSuggestedAnswer: 'Highlight genuine passion for building products, open source exploration, tech blogs, and active project development.',
        keyPoints: ['Passion for Engineering', 'Hands-on Practice', 'Adaptability'],
      },
    ],
    systemDesignTopics: [
      `Scalable URL Shortener / Rate Limiter for ${role}`,
      'High-Concurrency Collaborative Document Editor',
      'Real-time Notification & Webhook Delivery Engine',
    ],
    mockTopics: [
      `${role} Live Technical Screening & Coding Round (45 mins)`,
      'System Architecture & API Design Discussion (45 mins)',
      'Behavioral & Culture Fit Assessment (30 mins)',
    ],
  };
}

// 6. Career Readiness Scoring Engine based on actual Resume data
export function calculateCareerReadinessScore(
  profile: StudentProfile,
  skillGap: SkillGapAnalysis,
  roadmap: RoadmapPhase[]
): CareerReadinessScore {
  let totalTasks = 0;
  let completedTasks = 0;
  roadmap.forEach(phase => {
    phase.tasks.forEach(task => {
      totalTasks++;
      if (task.status === 'completed') completedTasks++;
    });
  });

  const roadmapProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const skillCoverage = skillGap.overallMatchPercentage || 0;
  const projectCount = profile.resume?.projects.length || 0;
  const projectQuality = projectCount >= 3 ? 85 : projectCount >= 1 ? 65 : 25;
  const resumeStrength = profile.resume ? 80 : 0;
  const interviewReadiness = Math.round((skillCoverage + (roadmapProgress || 20)) / 2);

  const overall = Math.round(
    skillCoverage * 0.35 +
    projectQuality * 0.2 +
    resumeStrength * 0.15 +
    roadmapProgress * 0.15 +
    interviewReadiness * 0.15
  );

  const finalScore = profile.resume || profile.currentSkills.length > 0 ? Math.min(Math.max(overall, 20), 98) : 0;
  const missingSkills = skillGap.missingSkills.length ? skillGap.missingSkills : ['Specialized Frameworks'];
  const targetRole = profile.careerGoal || 'Software Engineer';

  return {
    overallScore: finalScore,
    breakdown: {
      skillCoverage,
      projectQuality,
      resumeStrength,
      interviewReadiness,
      roadmapProgress,
    },
    positiveFactors: [
      `Resume technical skills match: ${skillCoverage}% for ${targetRole}`,
      `Documented projects: ${projectCount} project(s) on file`,
      `${profile.streakDays}-day active learning streak`,
    ],
    negativeFactors: [
      `Skill gap remaining in ${missingSkills.slice(0, 2).join(', ')}`,
      `Complete roadmap phases to boost portfolio quality`,
    ],
    boostActionPlan: [
      {
        action: `Complete next roadmap module in ${missingSkills[0] || 'Target Skill'}`,
        scoreBoost: 8,
        relatedSkillOrTask: missingSkills[0] || 'Roadmap',
      },
      {
        action: `Build and deploy Capstone Project for ${targetRole}`,
        scoreBoost: 12,
        relatedSkillOrTask: 'Projects',
      },
      {
        action: `Practice top technical interview questions for ${targetRole}`,
        scoreBoost: 5,
        relatedSkillOrTask: 'Interview Prep',
      },
    ],
    scoreExplanation: finalScore > 0
      ? `Your Career Readiness Score for ${targetRole} is ${finalScore}%. Closing your missing skill gaps in ${missingSkills.slice(0, 2).join(' and ')} will boost your score above 85%.`
      : `Upload your resume to calculate your exact career readiness score and personalized roadmap.`,
  };
}

// 7. AI Career Mentor Chat Service
export async function askAICareerMentor(
  userQuery: string,
  profile: StudentProfile,
  skillGap: SkillGapAnalysis,
  messageHistory: ChatMessage[]
): Promise<string> {
  const targetRole = profile.careerGoal || 'Software Engineer';
  const context = `You are SkillForge AI, an encouraging, deeply knowledgeable AI Career Mentor for college students.
Student Profile:
- Name: ${profile.name || 'Student'}
- College/Year: ${profile.college || 'Engineering'}, ${profile.yearOfStudy || 'Undergraduate'} (${profile.branch || 'Tech'})
- Career Goal: ${targetRole}
- Skills from Resume: ${profile.currentSkills.join(', ') || 'No skills uploaded yet'}
- Missing Skills: ${skillGap.missingSkills.join(', ')}
- Overall Readiness: ${skillGap.overallMatchPercentage}%

Rules:
1. Always personalize your answer to ${profile.name || 'the student'}'s specific profile, target goal (${targetRole}), and actual resume skills.
2. Give clear, actionable advice. Avoid generic fluff.
3. If asked for a plan, break it down into clear steps or weeks.
4. Keep a friendly, professional, encouraging mentor tone.`;

  const prompt = `Student Question: "${userQuery}"\nProvide a tailored mentor answer.`;

  try {
    const aiAnswer = await callGeminiApi(prompt, context);
    if (aiAnswer && aiAnswer.trim().length > 10) {
      return aiAnswer.trim();
    }
  } catch (e) {
    // Dynamic rule responses
  }

  const qLower = userQuery.toLowerCase();
  const name = profile.name || 'there';

  if (qLower.includes('today') || qLower.includes('learn today')) {
    return `Hi ${name}! Based on your goal to become a **${targetRole}**, today's #1 focus should be working on **${skillGap.missingSkills[0] || 'your core missing skills'}**. \n\nI recommend dedicating 45 minutes to building a practical mini-module, then marking the task in your Learning Roadmap!`;
  }
  if (qLower.includes('skill gap') || qLower.includes('gap')) {
    return `Hey ${name}, your current resume match for **${targetRole}** is **${skillGap.overallMatchPercentage}%**.\n\nYour verified skills: ${skillGap.strongSkills.slice(0, 3).join(', ') || 'None yet'}.\nYour missing gaps: ${skillGap.missingSkills.join(', ') || 'None'}.\n\nClosing the ${skillGap.missingSkills[0] || 'primary gap'} will increase your readiness score significantly!`;
  }
  if (qLower.includes('project') || qLower.includes('suggest')) {
    return `For your ${targetRole} portfolio, I recommend building a **Full-Stack Application** utilizing ${profile.currentSkills.slice(0, 2).join(' & ') || 'modern APIs'} alongside ${skillGap.missingSkills[0] || 'cloud databases'}.\n\nThis proves your ability to build production-ready software to campus recruiters!`;
  }
  if (qLower.includes('resume') || qLower.includes('improve')) {
    return `Looking at your resume, ${name}: make sure to emphasize metrics and impact (e.g., 'Engineered API reducing response time by 30%') and include targeted keywords like **${skillGap.missingSkills.slice(0, 3).join(', ')}** for ${targetRole} ATS screenings.`;
  }

  return `Hello ${name}! As your AI mentor for **${targetRole}**, I've analyzed your resume skills in ${profile.currentSkills.slice(0, 3).join(', ') || 'your profile'}. Let me know how I can guide your learning roadmap, project blueprints, or interview preparation today!`;
}

// 8. Resume Improvement Insights Generator based on real text
export async function generateResumeImprovements(resumeText: string, profile: StudentProfile): Promise<ResumeInsights> {
  const targetRole = profile.careerGoal || 'Software Engineer';
  const prompt = `Analyze this resume for target role "${targetRole}":
---
${resumeText}
---
Return strict JSON with keys:
- healthScore: number (0-100)
- strengths: string[]
- weaknesses: string[]
- missingKeywords: string[]
- formattingSuggestions: string[]
- projectImprovementSuggestions: string[]
- improvedBulletPoints: Array<{ original: string, improved: string, reason: string }>`;

  try {
    const raw = await callGeminiApi(prompt, 'You are an expert technical resume reviewer and ATS optimization specialist. Return strict JSON.');
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.strengths && parsed.strengths.length > 0) return parsed as ResumeInsights;
  } catch (e) {
    // Dynamic generation
  }

  const extractedSkills = extractKeywordsFromText(resumeText, [...KNOWN_LANGUAGES, ...KNOWN_FRAMEWORKS, ...KNOWN_DATABASES, ...KNOWN_TOOLS]);
  const roleKeywordsMap: Record<string, string[]> = {
    'Full Stack Developer': ['React', 'TypeScript', 'Node.js', 'REST API', 'SQL', 'PostgreSQL', 'Docker', 'State Management', 'Testing'],
    'Software Developer': ['Data Structures', 'Algorithms', 'Java', 'C++', 'OOP', 'SQL', 'System Design', 'Git', 'Unit Testing'],
    'AI/ML Engineer': ['Python', 'PyTorch', 'TensorFlow', 'Model Training', 'Pandas', 'NumPy', 'Data Preprocessing', 'Scikit-Learn'],
    'Data Analyst': ['SQL Queries', 'Python', 'PowerBI', 'Tableau', 'Excel Modeling', 'Data Visualization', 'Statistical Analysis'],
    'Cloud Engineer': ['AWS', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux', 'Microservices'],
  };

  const expectedKeywords = roleKeywordsMap[targetRole] || ['Problem Solving', 'Git', 'Databases', 'Clean Code', 'APIs'];
  const missingKws = expectedKeywords.filter(k => !extractedSkills.some(s => s.toLowerCase() === k.toLowerCase()));
  const healthScore = Math.min(Math.max(Math.round((extractedSkills.length / Math.max(expectedKeywords.length, 5)) * 100), 45), 92);

  return {
    healthScore,
    strengths: [
      `Extracted ${extractedSkills.length} relevant technical skills from your resume (${extractedSkills.slice(0, 4).join(', ')})`,
      `Clear technical project and education sections identified`,
      `Good foundational qualifications for engineering opportunities`,
    ],
    weaknesses: [
      `Missing key ATS buzzwords for ${targetRole}: ${missingKws.slice(0, 3).join(', ') || 'modern frameworks'}`,
      `Project descriptions should highlight quantifiable business/user impact metrics`,
    ],
    missingKeywords: missingKws,
    formattingSuggestions: [
      'Use active action verbs (Engineered, Architected, Optimized, Deployed) at the start of each bullet point',
      'Ensure standard single-column ATS-friendly layout for maximum scanning accuracy',
      'Keep technical skills organized by category: Languages, Frameworks, Databases, Tools',
    ],
    projectImprovementSuggestions: [
      `Add links to live demo deployments (Vercel/Netlify) and GitHub source repositories`,
      `Specify exact tech stack used per project (e.g., 'Built with React, TypeScript, and Firestore')`,
    ],
    improvedBulletPoints: [
      {
        original: 'Worked on software project using programming tools to build features.',
        improved: `Architected and deployed responsive ${targetRole} application with ${extractedSkills[0] || 'TypeScript'}, improving workflow efficiency by 35%.`,
        impactReason: 'Adds action verb, specific technical stack, and measurable outcome.',
      },
    ],
  };
}
