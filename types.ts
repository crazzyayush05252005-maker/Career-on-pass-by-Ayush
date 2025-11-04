export interface CareerOption {
  careerName: string;
  description: string;
  estimatedSalaryPotential: 'High' | 'Medium' | 'Low';
}

export interface College {
  collegeName: string;
  location: string;
  tier: 'Dream' | 'Reach' | 'Safety';
  reason: string;
}

export interface StudentProfile {
  marks10: string;
  marks12: string;
  achievements: string;
}

export interface AssessmentQuestion {
    id: number;
    question: string;
    options: string[];
}

export interface AssessmentResult {
    summary: string;
    suggestedStreams: SubjectStream10[];
    suggestedCareers: CareerOption[];
}

export interface JobMarketAnalysisResult {
    summary: string;
    demand: 'High' | 'Medium' | 'Low';
    salaryTrends: string;
    requiredSkills: string[];
}

export enum Flow {
  Landing,
  AfterTen,
  AfterTwelve,
  SkillsAssessment,
  TalkToExpert,
  JobMarketAnalysis,
}

export enum SubjectStream10 {
    Maths = "Maths (PCM/PCMB)",
    Biology = "Biology (PCB/PCMB)",
    Commerce = "Commerce",
    Arts = "Arts/Humanities",
}

export enum SubjectStream12 {
    PCM = "PCM (Physics, Chemistry, Maths)",
    PCB = "PCB (Physics, Chemistry, Biology)",
    Commerce = "Commerce",
    Arts = "Arts/Humanities",
}