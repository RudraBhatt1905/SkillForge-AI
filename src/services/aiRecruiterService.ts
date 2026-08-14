import { MockInterviewExchange, MockInterviewFeedback, StudentProfile } from '../types';

async function callGeminiApi(prompt: string, systemInstruction?: string): Promise<string> {
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        systemInstruction,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Server responded with status ${res.status}`);
    }

    const data = await res.json();
    return data.text || '';
  } catch (error) {
    throw error;
  }
}

export interface RecruiterQuestionTemplate {
  id: string;
  category: 'Icebreaker / Background' | 'Core Technical' | 'System & Scenarios' | 'Behavioral STAR';
  question: string;
  expectedKeyPoints: string[];
  contextHint: string;
}

export async function getMockInterviewQuestions(
  role: string,
  skills: string[],
  candidateName: string
): Promise<RecruiterQuestionTemplate[]> {
  const topSkills = skills.length ? skills.slice(0, 5) : ['JavaScript', 'React', 'Node.js', 'SQL'];
  const name = candidateName || 'Candidate';

  try {
    const prompt = `Generate 4 realistic mock interview questions for an interview with ${name} for a ${role} position. Skills on resume: ${topSkills.join(', ')}.
Return pure JSON with array of 4 objects matching:
[
  {
    "id": "q1",
    "category": "Icebreaker / Background",
    "question": "string with personalized greeting and background question",
    "expectedKeyPoints": ["point1", "point2"],
    "contextHint": "string hint"
  },
  {
    "id": "q2",
    "category": "Core Technical",
    "question": "in-depth technical question on ${topSkills[0] || 'core technologies'}",
    "expectedKeyPoints": ["point1", "point2"],
    "contextHint": "string hint"
  },
  {
    "id": "q3",
    "category": "System & Scenarios",
    "question": "scenario question on system trade-offs or debugging",
    "expectedKeyPoints": ["point1", "point2"],
    "contextHint": "string hint"
  },
  {
    "id": "q4",
    "category": "Behavioral STAR",
    "question": "behavioral question regarding deadlines, teamwork, or resolving conflict",
    "expectedKeyPoints": ["point1", "point2"],
    "contextHint": "string hint"
  }
]`;

    const raw = await callGeminiApi(prompt, 'You are an expert technical talent recruiter. Return valid JSON only.');
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length >= 3) {
      return parsed as RecruiterQuestionTemplate[];
    }
  } catch (e) {
    // Graceful fallback to dynamic crafted questions
  }

  const primarySkill = topSkills[0] || 'Modern Web Technologies';
  const secondarySkill = topSkills[1] || 'Databases';

  return [
    {
      id: 'q1',
      category: 'Icebreaker / Background',
      question: `Hi ${name}! Thanks for joining our video interview today. To start off, walk me through your background and the most technically challenging project you've built using your stack.`,
      expectedKeyPoints: [
        'Clear narrative of your coding journey',
        'Specific project problem & solution',
        'Tech stack & individual contributions',
        'Measurable impact or user outcome',
      ],
      contextHint: 'Keep your intro under 2 minutes. Focus on high-impact project outcomes and engineering decisions.',
    },
    {
      id: 'q2',
      category: 'Core Technical',
      question: `In your work with ${primarySkill}, how do you approach performance optimization, memory management, and asynchronous handling in high-traffic applications?`,
      expectedKeyPoints: [
        'Asynchronous flow and concurrency',
        'Performance profiling & bottlenecks',
        'Caching, re-renders, or index tuning',
        'Production error handling',
      ],
      contextHint: 'Demonstrate deep conceptual mastery with concrete technical mechanisms rather than generic buzzwords.',
    },
    {
      id: 'q3',
      category: 'System & Scenarios',
      question: `Imagine a scenario where our ${role} microservice is experiencing sudden 504 gateway timeouts under a flash traffic spike. What is your step-by-step diagnostic and remediation process?`,
      expectedKeyPoints: [
        'Observability & log tracing (APM, metrics)',
        'Database connection pool & bottleneck checks',
        'Immediate mitigation (rate limiting, scale out, caching)',
        'Post-mortem & long-term preventative fixes',
      ],
      contextHint: 'Think like a senior engineer. Start with triaging user impact, then investigate logs/metrics, and explain mitigation.',
    },
    {
      id: 'q4',
      category: 'Behavioral STAR',
      question: `Tell me about a time you faced a tough technical disagreement with a team member or a looming deadline with incomplete requirements. How did you handle it using the STAR method?`,
      expectedKeyPoints: [
        'Situation: Context and urgency',
        'Task: Your role and responsibility',
        'Action: Collaborative, data-driven approach',
        'Result: Successful resolution and retrospective learning',
      ],
      contextHint: 'Structure your response clearly with Situation, Task, Action, and Result.',
    },
  ];
}

export interface RecruiterEvaluationResult {
  score: number;
  recruiterSpokenFeedback: string;
  strengths: string[];
  improvementTips: string[];
  starRating: 'Excellent' | 'Good' | 'Needs Improvement';
}

export async function evaluateCandidateResponse(
  question: string,
  category: string,
  candidateAnswer: string,
  role: string
): Promise<RecruiterEvaluationResult> {
  const answer = candidateAnswer.trim();
  if (!answer || answer.length < 15) {
    return {
      score: 40,
      recruiterSpokenFeedback: "I noticed your answer was quite brief. In a real technical interview, it's beneficial to elaborate on specific technologies, trade-offs, and examples to showcase your depth.",
      strengths: ['Addressed the topic directly'],
      improvementTips: ['Elaborate with concrete architectural examples', 'Mention specific metrics and trade-offs'],
      starRating: 'Needs Improvement',
    };
  }

  try {
    const prompt = `You are Sarah, a friendly yet rigorous Senior Technical Recruiter interviewing a candidate for a ${role} position.
Question: "${question}" (Category: ${category})
Candidate Spoken Answer: "${answer}"

Evaluate this answer and return JSON:
{
  "score": number from 50 to 98,
  "recruiterSpokenFeedback": "2-3 conversational sentences spoken by the recruiter acknowledging their point with natural recruiter tone (e.g. 'That is a great explanation of...', 'I really liked how you highlighted...') and offering a tip",
  "strengths": ["string strength 1", "string strength 2"],
  "improvementTips": ["string tip 1", "string tip 2"],
  "starRating": "Excellent" | "Good" | "Needs Improvement"
}`;

    const raw = await callGeminiApi(prompt, 'You are an AI Technical Recruiter. Return JSON only.');
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed.score === 'number' && parsed.recruiterSpokenFeedback) {
      return parsed as RecruiterEvaluationResult;
    }
  } catch (e) {
    // Dynamic heuristic evaluation
  }

  // Dynamic fallback evaluation
  const wordCount = answer.split(/\s+/).length;
  let score = 75;
  if (wordCount > 60) score += 12;
  else if (wordCount > 30) score += 6;
  if (/because|therefore|specifically|for example|architect|optimized|latency|star/i.test(answer)) score += 5;
  score = Math.min(95, Math.max(65, score));

  return {
    score,
    recruiterSpokenFeedback: `Great response! You communicated your points clearly and touched upon the key principles needed for a ${role}. For even greater impact, consider quantifying your results with measurable outcomes.`,
    strengths: ['Clear articulate communication', 'Good grasp of role fundamentals'],
    improvementTips: ['Incorporate more quantitative metrics', 'Reference concrete past project scenarios'],
    starRating: score >= 85 ? 'Excellent' : score >= 75 ? 'Good' : 'Needs Improvement',
  };
}

export async function generateFinalInterviewFeedback(
  role: string,
  exchanges: MockInterviewExchange[],
  candidateName: string
): Promise<MockInterviewFeedback> {
  const avgScore = exchanges.length
    ? Math.round(exchanges.reduce((acc, curr) => acc + curr.score, 0) / exchanges.length)
    : 80;

  try {
    const summaryPrompt = `Based on these mock interview rounds for ${candidateName} applying for ${role}:
${exchanges
  .map(
    (e, idx) =>
      `Q${idx + 1} (${e.category}): ${e.question}\nCandidate: ${e.candidateAnswer}\nScore: ${e.score}`
  )
  .join('\n\n')}

Generate a comprehensive Recruiter Debrief in JSON:
{
  "overallScore": ${avgScore},
  "verdict": "Strong Hire" | "Hire" | "Lean Hire" | "Needs Practice",
  "technicalScore": number (70-98),
  "communicationScore": number (70-98),
  "confidenceScore": number (70-98),
  "starScore": number (70-98),
  "summary": "2-3 sentences summarizing performance and candidate readiness",
  "strengths": ["3 key strengths across answers"],
  "areasToImprove": ["2-3 actionable areas to refine before real placements"],
  "actionItems": ["2 specific next steps"]
}`;

    const raw = await callGeminiApi(summaryPrompt, 'You are the Lead Hiring Committee Chair. Return JSON only.');
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed && parsed.verdict && parsed.summary) {
      return parsed as MockInterviewFeedback;
    }
  } catch (e) {
    // Dynamic fallback scorecard
  }

  let verdict: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'Needs Practice' = 'Hire';
  if (avgScore >= 88) verdict = 'Strong Hire';
  else if (avgScore >= 78) verdict = 'Hire';
  else if (avgScore >= 68) verdict = 'Lean Hire';
  else verdict = 'Needs Practice';

  return {
    overallScore: avgScore,
    verdict,
    technicalScore: Math.min(95, avgScore + 2),
    communicationScore: Math.min(96, avgScore + 4),
    confidenceScore: Math.min(92, avgScore),
    starScore: Math.min(90, avgScore - 2),
    summary: `${candidateName} demonstrated strong foundational readiness for the ${role} position, articulating technical concepts and behavioral scenarios with clarity.`,
    strengths: [
      'Articulate verbal communication with clear problem decomposition',
      'Solid grasp of core architectural concepts and modern tooling',
      'Proactive and structured approach to behavioral and scenario-based questions',
    ],
    areasToImprove: [
      'Add more quantitative metrics (e.g. latency % reduction, queries per second)',
      'Deepen coverage of edge cases and distributed failure handling in system design questions',
    ],
    actionItems: [
      'Practice live STAR stories with timed 90-second responses',
      'Review system design trade-offs for high-concurrency microservices',
    ],
  };
}
