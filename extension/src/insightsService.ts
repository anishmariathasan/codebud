/**
 * InsightsService - Manages conversation sessions and generates coding insights
 * Uses Gemini AI (free tier) to analyze transcripts and provide personalized feedback
 */

import * as vscode from 'vscode';
import { GoogleGenAI } from '@google/genai';

// Types
export interface TranscriptEntry {
    role: 'user' | 'assistant';
    text: string;
    timestamp: string;
}

export interface Session {
    id: string;
    timestamp: string;
    transcript: TranscriptEntry[];
    fileContext: string;
    language: string;
    duration: number; // in seconds
}

export interface ErrorPattern {
    error: string;
    count: number;
    suggestion: string;
}

export interface ImprovementArea {
    topic: string;
    reason: string;
    resources: string[];
}

export interface SuggestedConcept {
    name: string;
    description: string;
    relevance: string;
}

export interface Insights {
    commonErrors: ErrorPattern[];
    areasToImprove: ImprovementArea[];
    suggestedConcepts: SuggestedConcept[];
    stats: {
        totalSessions: number;
        totalMinutes: number;
        topLanguages: string[];
        lastAnalyzed: string | null;
        apiCallsUsed: number;
    };
    generatedAt: string;
}

const STORAGE_KEY = 'codebud.sessions';
const INSIGHTS_CACHE_KEY = 'codebud.insightsCache';
const API_CALLS_KEY = 'codebud.apiCallsUsed';

export class InsightsService {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Create Gemini AI client with provided API key
     */
    private createGeminiClient(apiKey: string): GoogleGenAI | null {
        if (apiKey && apiKey.length > 0) {
            return new GoogleGenAI({ apiKey });
        }
        return null;
    }

    /**
     * Save a new conversation session
     */
    public saveSession(session: Omit<Session, 'id'>): Session {
        const sessions = this.getSessions();
        const newSession: Session = {
            ...session,
            id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        sessions.push(newSession);
        this.context.globalState.update(STORAGE_KEY, sessions);
        console.log(`Saved session ${newSession.id}`);
        return newSession;
    }

    /**
     * Get all stored sessions
     */
    public getSessions(): Session[] {
        return this.context.globalState.get<Session[]>(STORAGE_KEY) || [];
    }

    /**
     * Clear all sessions
     */
    public clearSessions(): void {
        this.context.globalState.update(STORAGE_KEY, []);
        this.context.globalState.update(INSIGHTS_CACHE_KEY, null);
        console.log('Cleared all sessions');
    }

    /**
     * Get cached insights (if available)
     */
    public getCachedInsights(): Insights | null {
        return this.context.globalState.get<Insights>(INSIGHTS_CACHE_KEY) || null;
    }

    /**
     * Get API calls count
     */
    private getApiCallsUsed(): number {
        return this.context.globalState.get<number>(API_CALLS_KEY) || 0;
    }

    /**
     * Increment API calls count
     */
    private incrementApiCalls(): void {
        const current = this.getApiCallsUsed();
        this.context.globalState.update(API_CALLS_KEY, current + 1);
    }

    /**
     * Generate insights from all stored sessions using Gemini AI
     * @param forceRefresh - Force refresh even if cache is valid
     * @param apiKey - Gemini API key (from .env file via request header)
     */
    public async generateInsights(forceRefresh: boolean = false, apiKey?: string): Promise<Insights> {
        const sessions = this.getSessions();

        // Return cached if available and not forcing refresh
        if (!forceRefresh) {
            const cached = this.getCachedInsights();
            if (cached && sessions.length > 0) {
                // Check if we have new sessions since last analysis
                const lastAnalyzed = new Date(cached.generatedAt).getTime();
                const newestSession = Math.max(...sessions.map(s => new Date(s.timestamp).getTime()));
                if (newestSession <= lastAnalyzed) {
                    return cached;
                }
            }
        }

        // Calculate stats
        const stats = this.calculateStats(sessions);

        // Create Gemini client with provided API key
        const genAI = apiKey ? this.createGeminiClient(apiKey) : null;

        // If no API key or no sessions, return stats only
        if (!genAI) {
            return {
                commonErrors: [],
                areasToImprove: [{
                    topic: 'API Key Required',
                    reason: 'Add VITE_GEMINI_API_KEY to your .env file to enable AI-powered insights analysis.',
                    resources: ['https://aistudio.google.com/']
                }],
                suggestedConcepts: [],
                stats,
                generatedAt: new Date().toISOString(),
            };
        }

        if (sessions.length === 0) {
            return {
                commonErrors: [],
                areasToImprove: [],
                suggestedConcepts: [{
                    name: 'Start Coding!',
                    description: 'Have some conversations with CodeBud to generate personalized insights.',
                    relevance: 'Your coding patterns will be analyzed after your first sessions.',
                }],
                stats,
                generatedAt: new Date().toISOString(),
            };
        }

        // Aggregate transcripts
        const aggregatedTranscripts = this.aggregateTranscripts(sessions);

        // Call Gemini API
        try {
            const insights = await this.callGeminiForInsights(genAI, aggregatedTranscripts, sessions);
            insights.stats = stats;
            insights.generatedAt = new Date().toISOString();

            // Cache the insights
            this.context.globalState.update(INSIGHTS_CACHE_KEY, insights);
            this.incrementApiCalls();

            return insights;
        } catch (error) {
            console.error('Failed to generate insights:', error);
            return {
                commonErrors: [],
                areasToImprove: [{
                    topic: 'Analysis Error',
                    reason: `Failed to analyze transcripts: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    resources: [],
                }],
                suggestedConcepts: [],
                stats,
                generatedAt: new Date().toISOString(),
            };
        }
    }

    /**
     * Calculate usage statistics
     */
    private calculateStats(sessions: Session[]): Insights['stats'] {
        const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration / 60), 0);

        // Count language occurrences
        const langCounts: Record<string, number> = {};
        sessions.forEach(s => {
            if (s.language) {
                langCounts[s.language] = (langCounts[s.language] || 0) + 1;
            }
        });

        const topLanguages = Object.entries(langCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([lang]) => lang);

        return {
            totalSessions: sessions.length,
            totalMinutes: Math.round(totalMinutes),
            topLanguages,
            lastAnalyzed: this.getCachedInsights()?.generatedAt || null,
            apiCallsUsed: this.getApiCallsUsed(),
        };
    }

    /**
     * Aggregate transcripts into a single text for analysis
     */
    private aggregateTranscripts(sessions: Session[]): string {
        // Take the most recent 10 sessions to avoid token limits
        const recentSessions = sessions.slice(-10);

        return recentSessions.map((session, idx) => {
            const date = new Date(session.timestamp).toLocaleDateString();
            const lang = session.language || 'unknown';
            const entries = session.transcript
                .map(e => `${e.role.toUpperCase()}: ${e.text}`)
                .join('\n');

            return `--- Session ${idx + 1} (${date}, ${lang}) ---\n${entries}`;
        }).join('\n\n');
    }

    /**
     * Call Gemini API to analyze transcripts
     */
    private async callGeminiForInsights(genAI: GoogleGenAI, transcripts: string, sessions: Session[]): Promise<Insights> {
        const languages = [...new Set(sessions.map(s => s.language).filter(Boolean))].join(', ');

        const prompt = `You are analyzing coding conversation transcripts from a pair programming AI assistant called CodeBud. The user is learning to code. Your goal is to provide helpful, encouraging feedback to help them improve.

Languages used: ${languages || 'Various'}

Analyze these transcripts and extract:

1. COMMON ERRORS: Patterns of mistakes the user makes repeatedly (syntax errors, logic errors, misunderstandings). For each error, provide a helpful suggestion.

2. AREAS TO IMPROVE: Coding concepts or topics the user seems to struggle with. Provide specific learning resources (documentation links, tutorial topics, etc.).

3. SUGGESTED CONCEPTS TO STUDY: Based on their conversations, what data structures, algorithms, design patterns, or programming concepts should they study to level up? Explain why each is relevant to their coding.

TRANSCRIPTS:
${transcripts}

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "commonErrors": [
    {"error": "description of error pattern", "count": 2, "suggestion": "how to fix or avoid this"}
  ],
  "areasToImprove": [
    {"topic": "topic name", "reason": "why they should improve this", "resources": ["resource 1", "resource 2"]}
  ],
  "suggestedConcepts": [
    {"name": "concept name", "description": "what it is", "relevance": "why it's relevant to their coding"}
  ]
}

If you cannot identify patterns in a category, return an empty array for that category. Be encouraging and constructive in your suggestions.`;

        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        });

        const text = response.text?.trim() || '';

        // Parse JSON response
        try {
            // Remove any markdown code block markers if present
            let jsonText = text;
            if (jsonText.startsWith('```')) {
                jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
            }

            const parsed = JSON.parse(jsonText);
            return {
                commonErrors: parsed.commonErrors || [],
                areasToImprove: parsed.areasToImprove || [],
                suggestedConcepts: parsed.suggestedConcepts || [],
                stats: this.calculateStats(sessions),
                generatedAt: new Date().toISOString(),
            };
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', text);
            throw new Error('Failed to parse AI response');
        }
    }
}
