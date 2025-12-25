import type { Language, ErrorItem, UserGuess } from "@/lib/types"

export interface AIFeedbackRequest {
  text: string
  language: Language
  type: "grammar" | "naturalness" | "pronunciation" | "translation"
  targetText?: string // For translation comparison
}

export interface AIFeedbackResponse {
  isCorrect: boolean
  score: number // 0-100
  feedback: string
  corrections: {
    original: string
    corrected: string
    explanation: string
  }[]
  suggestions: string[]
}

export interface PatternAnalysisRequest {
  errors: ErrorItem[]
  guesses: UserGuess[]
  language: Language
}

export interface PatternAnalysisResponse {
  patterns: {
    category: string
    frequency: number
    description: string
    recommendation: string
  }[]
  strengths: string[]
  focusAreas: string[]
  overallInsight: string
}

/**
 * AI Service for language learning feedback
 * Uses Anthropic Claude API
 */
class AIService {
  private apiKey: string | undefined
  private baseUrl = "https://api.anthropic.com/v1"

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY
  }

  private async callClaude(
    systemPrompt: string,
    userMessage: string,
    model = "claude-sonnet-4-20250514"
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Anthropic API key not configured")
    }

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          { role: "user", content: userMessage }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Anthropic API error: ${error}`)
    }

    const data = await response.json()
    return data.content[0].text
  }

  async getGrammarFeedback(request: AIFeedbackRequest): Promise<AIFeedbackResponse> {
    const languageName = request.language === "ro" ? "Romanian" : "Korean"
    
    const systemPrompt = `You are a ${languageName} language tutor. Analyze the student's text for grammar correctness.
Respond in JSON format with:
{
  "isCorrect": boolean,
  "score": number (0-100),
  "feedback": "brief overall feedback",
  "corrections": [{"original": "...", "corrected": "...", "explanation": "..."}],
  "suggestions": ["suggestion1", "suggestion2"]
}
Be encouraging but accurate. Focus on the most important issues. Return only valid JSON.`

    const userPrompt = `Analyze this ${languageName} text: "${request.text}"
${request.targetText ? `It's meant to express: "${request.targetText}"` : ""}`

    try {
      const response = await this.callClaude(systemPrompt, userPrompt)

      // Parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("Invalid AI response format")
      }
      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error("AI Grammar feedback error:", error)
      // Return fallback response
      return {
        isCorrect: true,
        score: 75,
        feedback: "Unable to analyze at this time. Keep practicing!",
        corrections: [],
        suggestions: ["Continue practicing regularly"]
      }
    }
  }

  async getNaturalnessFeedback(request: AIFeedbackRequest): Promise<AIFeedbackResponse> {
    const languageName = request.language === "ro" ? "Romanian" : "Korean"
    
    const systemPrompt = `You are a native ${languageName} speaker reviewing a language learner's text for naturalness.
Respond in JSON format with:
{
  "isCorrect": boolean,
  "score": number (0-100),
  "feedback": "how natural does it sound?",
  "corrections": [{"original": "...", "corrected": "...", "explanation": "why this sounds more natural"}],
  "suggestions": ["ways to sound more natural"]
}
Focus on phrasing, word choice, and cultural appropriateness. Return only valid JSON.`

    const userPrompt = `How natural is this ${languageName} text? "${request.text}"`

    try {
      const response = await this.callClaude(systemPrompt, userPrompt)

      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("Invalid AI response format")
      }
      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error("AI Naturalness feedback error:", error)
      return {
        isCorrect: true,
        score: 70,
        feedback: "Keep practicing with native content!",
        corrections: [],
        suggestions: ["Listen to more native speakers"]
      }
    }
  }

  async getTranslationFeedback(
    sourceText: string,
    userTranslation: string,
    language: Language
  ): Promise<AIFeedbackResponse> {
    const languageName = language === "ro" ? "Romanian" : "Korean"
    
    const systemPrompt = `You are a translation tutor for ${languageName}. Compare the student's translation to the source.
Respond in JSON format with:
{
  "isCorrect": boolean,
  "score": number (0-100),
  "feedback": "how accurate is the translation?",
  "corrections": [{"original": "...", "corrected": "...", "explanation": "..."}],
  "suggestions": ["alternative translations", "tips"]
}
Be helpful and explain cultural/linguistic nuances. Return only valid JSON.`

    const userPrompt = `Source (English): "${sourceText}"
Student's ${languageName} translation: "${userTranslation}"
Evaluate the translation quality.`

    try {
      const response = await this.callClaude(systemPrompt, userPrompt)

      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("Invalid AI response format")
      }
      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error("AI Translation feedback error:", error)
      return {
        isCorrect: true,
        score: 70,
        feedback: "Good effort! Keep practicing translations.",
        corrections: [],
        suggestions: ["Try varying your vocabulary"]
      }
    }
  }

  async analyzePatterns(request: PatternAnalysisRequest): Promise<PatternAnalysisResponse> {
    const languageName = request.language === "ro" ? "Romanian" : "Korean"
    
    // Prepare error summary
    const errorSummary = request.errors.slice(0, 20).map(e => ({
      type: e.type,
      original: e.original,
      guess: e.userGuess,
      correct: e.correct,
      occurrences: e.occurrences
    }))

    const guessSummary = request.guesses.slice(0, 20).map(g => ({
      type: g.guessType,
      original: g.original,
      guess: g.userGuess,
      correct: g.isCorrect
    }))

    const systemPrompt = `You are a ${languageName} learning analytics expert. Analyze the student's error patterns and guessing patterns.
Respond in JSON format with:
{
  "patterns": [{"category": "verb conjugation", "frequency": 5, "description": "...", "recommendation": "..."}],
  "strengths": ["what they're doing well"],
  "focusAreas": ["what to prioritize"],
  "overallInsight": "personalized learning advice"
}
Be specific and actionable. Return only valid JSON.`

    const userPrompt = `Analyze these ${languageName} learning patterns:
Errors: ${JSON.stringify(errorSummary)}
Guesses: ${JSON.stringify(guessSummary)}`

    try {
      const response = await this.callClaude(systemPrompt, userPrompt)

      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("Invalid AI response format")
      }
      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error("AI Pattern analysis error:", error)
      return {
        patterns: [],
        strengths: ["Consistent practice"],
        focusAreas: ["Continue with current study plan"],
        overallInsight: "Keep practicing! Your dedication will pay off."
      }
    }
  }

  async generateConversationResponse(
    context: string,
    userMessage: string,
    language: Language
  ): Promise<string> {
    const languageName = language === "ro" ? "Romanian" : "Korean"
    
    const systemPrompt = `You are a helpful conversation partner for ${languageName} practice.
Respond naturally in ${languageName} at an A2-B2 level.
Keep responses concise (1-3 sentences).
If the student makes errors, gently continue the conversation without correcting directly.`

    try {
      const response = await this.callClaude(
        systemPrompt,
        `Context: ${context}\n\nStudent says: ${userMessage}`
      )

      return response
    } catch (error) {
      console.error("AI Conversation error:", error)
      return language === "ro" 
        ? "Interesant! Poți să-mi spui mai multe?" 
        : "흥미롭네요! 더 말해 주세요?"
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey
  }
}

export const aiService = new AIService()
