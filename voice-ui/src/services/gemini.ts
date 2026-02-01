import { GoogleGenerativeAI } from '@google/generative-ai';
import { TranscriptEntry } from '../components/Transcript';

// Initialize Gemini
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export interface InsightData {
    commonErrors: string[];
    codingAreasToImprove: string[];
    suggestions: Array<{
        title: string;
        description: string;
        codeSnippet?: string;
    }>;
    userStats: {
        creditsUsed: number;
        sessionsCompleted: number;
    };
}

export const generateInsights = async (transcript: TranscriptEntry[]): Promise<InsightData> => {
    try {
        if (!API_KEY) {
            throw new Error('Gemini API Key is missing. Check your .env file.');
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Filter and format transcript for the model
        const conversationText = transcript
            .map(t => `${t.role.toUpperCase()}: ${t.text}`)
            .join('\n');

        const prompt = `
        You are an expert coding mentor. Analyze the following coding session transcript and provide structured feedback.
        
        Transcript:
        ${conversationText}

        Please provide the output in the following JSON format ONLY (no markdown code blocks):
        {
            "commonErrors": ["error 1", "error 2"],
            "codingAreasToImprove": ["area 1", "area 2"],
            "suggestions": [
                {
                    "title": "Suggestion Title",
                    "description": "Detailed description in markdown format",
                    "codeSnippet": "Optional code example"
                }
            ],
            "userStats": {
                "creditsUsed": 25,
                "sessionsCompleted": 1
            }
        }
        
        For userStats, provide realistic estimates based on the interaction complexity (1-100 range for credits).
        If the transcript is empty or too short, provide general best practices.
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text();

        // Cleanup if Gemini returns markdown code blocks
        if (text.startsWith('```json')) {
            text = text.replace(/```json\n?/, '').replace(/```$/, '');
        } else if (text.startsWith('```')) {
            text = text.replace(/```\n?/, '').replace(/```$/, '');
        }

        return JSON.parse(text) as InsightData;

    } catch (error) {
        console.error("Error generating insights:", error);
        // Return fallback data in case of error
        return {
            commonErrors: ["Could not analyze session."],
            codingAreasToImprove: ["Try again later."],
            suggestions: [],
            userStats: { creditsUsed: 0, sessionsCompleted: 0 }
        };
    }
};
