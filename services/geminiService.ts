import { GoogleGenAI, Type } from "@google/genai";
import { CareerOption, College, StudentProfile, SubjectStream10, SubjectStream12, AssessmentQuestion, AssessmentResult, JobMarketAnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const careerOptionSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        careerName: { type: Type.STRING },
        description: { type: Type.STRING },
        estimatedSalaryPotential: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
      },
      required: ['careerName', 'description', 'estimatedSalaryPotential'],
    },
};

const collegeSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            collegeName: { type: Type.STRING },
            location: { type: Type.STRING },
            tier: { type: Type.STRING, enum: ['Dream', 'Reach', 'Safety'] },
            reason: { type: Type.STRING },
        },
        required: ['collegeName', 'location', 'tier', 'reason'],
    }
};

const assessmentQuestionsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.NUMBER },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['id', 'question', 'options'],
    }
};

const assessmentResultSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING },
        suggestedStreams: { type: Type.ARRAY, items: { type: Type.STRING, enum: Object.values(SubjectStream10) } },
        suggestedCareers: careerOptionSchema,
    },
    required: ['summary', 'suggestedStreams', 'suggestedCareers'],
};

const jobMarketAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING },
        demand: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
        salaryTrends: { type: Type.STRING },
        requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['summary', 'demand', 'salaryTrends', 'requiredSkills'],
};


export const getCareerOptions10 = async (subject: SubjectStream10): Promise<CareerOption[]> => {
    const prompt = `For a student who has chosen the ${subject} stream after 10th grade in India, list a diverse range of career options available globally. Rank them with high-paying careers at the top. For each career, provide a concise one-sentence description. The salary potential should be categorized as 'High', 'Medium', or 'Low'.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: careerOptionSchema
        }
    });

    return JSON.parse(response.text);
};

export const getCareerPathway10 = async (subject: SubjectStream10, career: string): Promise<string> => {
    const prompt = `Provide a detailed, step-by-step roadmap for a student from India to become a ${career}, starting after choosing the ${subject} stream in 11th grade. The roadmap should be easy to understand and actionable. Include key subjects, recommended entrance exams, undergraduate courses, top colleges (examples), and essential skills to develop. Format the response as clear, sequential text with headings and bullet points.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
};

export const getCourseOptions12 = async (subject: SubjectStream12): Promise<string[]> => {
    const prompt = `List a comprehensive and diverse list of popular undergraduate courses a student in India can pursue after completing 12th grade with the ${subject} stream. Include a mix of traditional, modern, and interdisciplinary courses available worldwide. Focus on providing a wide variety of options beyond the obvious choices. Return a JSON array of strings with course names. Just provide the array, no other text.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
             responseMimeType: "application/json",
             responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
    });
    
    return JSON.parse(response.text);
};

export const getCollegeSuggestions = async (course: string, profile: StudentProfile): Promise<College[]> => {
    const prompt = `Based on the following student profile, suggest a list of suitable colleges (in India and abroad) for pursuing a '${course}'. Profile: 10th marks: ${profile.marks10}, 12th marks: ${profile.marks12}, Achievements: ${profile.achievements}. Categorize colleges into 'Dream', 'Reach', and 'Safety' tiers. Provide a brief reason for each suggestion.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: collegeSchema
        }
    });

    return JSON.parse(response.text);
};


export const getAdmissionPathway = async (college: string, course: string): Promise<string> => {
    const prompt = `Provide a detailed step-by-step guide on how a student from India can get admission into '${college}' for the '${course}' program. Include details about entrance exams, eligibility criteria (like board percentages), application process, and important tips. Format the response as clear, sequential text.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text;
};

export const getCareerOptions12 = async (course: string): Promise<CareerOption[]> => {
    const prompt = `List the best career options available after completing a '${course}'. Rank them with high-paying careers at the top. For each career, provide a concise one-sentence description. The salary potential should be categorized as 'High', 'Medium', or 'Low'.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: careerOptionSchema,
        }
    });

    return JSON.parse(response.text);
};

export const getCareerPathway12 = async (course: string, career: string): Promise<string> => {
    const prompt = `Provide a detailed pathway on how to become a ${career} after completing a ${course} degree. Include information on further studies (if required), certifications, entry-level job roles, and career progression. Format the response as clear, sequential text.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
};

export const getAssessmentQuestions = async (interests: string[]): Promise<AssessmentQuestion[]> => {
    const prompt = `Create a skills assessment quiz for a high school student whose interests include: ${interests.join(', ')}.
    Generate 8 scenario-based, multiple-choice questions designed to evaluate their aptitude in logical reasoning, creativity, communication, and problem-solving.
    The scenarios MUST be tailored to their interests. For example, if they like 'Physics', a question could involve a hypothetical experiment. If they like 'Literature', a question could be about interpreting a character's motive.
    Each question must have a unique ID from 1 to 8 and 4 distinct, plausible options.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: assessmentQuestionsSchema,
        }
    });

    return JSON.parse(response.text);
};

export const analyzeAssessmentResults = async (answers: { [key: number]: string }): Promise<AssessmentResult> => {
    const prompt = `A student has completed a skills assessment. Here are their answers: ${JSON.stringify(answers)}. 
    Analyze these answers to identify their core strengths across logical reasoning, creativity, communication, and problem-solving. 
    Based on this analysis:
    1. Write a brief, encouraging summary (2-3 sentences) of their strengths.
    2. Suggest 2-3 suitable subject streams for them after 10th grade from this list: ${Object.values(SubjectStream10).join(', ')}.
    3. Suggest 4 diverse career options that align with their strengths. For each career, provide a name, a one-sentence description, and an estimated salary potential ('High', 'Medium', or 'Low').
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: assessmentResultSchema,
        }
    });

    return JSON.parse(response.text);
};

export const getHotsAssessmentQuestions = async (): Promise<AssessmentQuestion[]> => {
    const prompt = `Create a skills assessment quiz for a high school student who is completely unsure about their interests. 
    Generate 5 Higher-Order Thinking Skills (HOTS) questions. These questions should be engaging, open-ended scenarios that test critical thinking, creativity, and problem-solving abilities without relying on specific subject knowledge. 
    For example, 'You find a mysterious old map where the landmarks change every hour. What's your first step to decipher it?'
    Each question must have a unique ID from 1 to 5 and 4 distinct, creative options that reflect different approaches to the problem.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: assessmentQuestionsSchema,
        }
    });

    return JSON.parse(response.text);
};

export const analyzeHotsAssessmentResults = async (answers: { [key: number]: string }): Promise<AssessmentResult> => {
    const prompt = `A student, who is confused about their career path, has answered a Higher-Order Thinking Skills quiz. Here are their answers: ${JSON.stringify(answers)}.
    Analyze these responses to uncover their underlying aptitudes and potential fields of interest (e.g., Analytical Problem-Solving, Creative Innovation, Strategic Planning, Empathetic Communication).
    Based on this deep analysis:
    1. Write an insightful summary (3-4 sentences) explaining their core cognitive strengths and potential passion areas. Connect their answer choices to these strengths.
    2. Suggest 2-3 suitable subject streams for them after 10th grade from this list: ${Object.values(SubjectStream10).join(', ')}.
    3. Suggest 4 diverse career options that align with their identified aptitudes. For each career, provide a name, a one-sentence description, and an estimated salary potential ('High', 'Medium', or 'Low').`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: assessmentResultSchema,
        }
    });

    return JSON.parse(response.text);
};


export const getJobMarketAnalysis = async (query: string): Promise<JobMarketAnalysisResult> => {
    const prompt = `Analyze the current job market for a "${query}". Provide a brief summary, the current demand ('High', 'Medium', or 'Low'), a short description of salary trends (e.g., "Competitive and rising"), and a list of 5-7 essential skills required for this role.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: jobMarketAnalysisSchema,
        }
    });

    return JSON.parse(response.text);
};