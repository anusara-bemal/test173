// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
import { MovieMetadata } from "@shared/schema";

async function analyzeVideoMetadata(title: string, description: string): Promise<{
  genre: string[];
  tags: string[];
  aiTags: string[];
  sentiment: number;
  copyrightStatus: {
    isSafe: boolean;
    confidence: number;
    potentialMatches?: string[];
    reason?: string;
  };
}> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://replit.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: "Analyze the video title and description to extract metadata including copyright analysis. Return JSON with genres, tags, AI-generated tags, sentiment score (1-5), and copyright status assessment."
          },
          {
            role: "user",
            content: `Title: ${title}\nDescription: ${description}\n\nAnalyze for potential copyright issues, genre classification, and content tags. Include an assessment of whether the content appears to be original or potentially infringing.`
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return {
      genre: result.genres || [],
      tags: result.tags || [],
      aiTags: result.aiTags || [],
      sentiment: Math.max(1, Math.min(5, result.sentiment || 3)),
      copyrightStatus: {
        isSafe: result.copyrightStatus?.isSafe ?? true,
        confidence: result.copyrightStatus?.confidence ?? 0.5,
        potentialMatches: result.copyrightStatus?.potentialMatches,
        reason: result.copyrightStatus?.reason
      }
    };
  } catch (error) {
    console.error("OpenRouter API error:", error);
    return {
      genre: [],
      tags: [],
      aiTags: [],
      sentiment: 3,
      copyrightStatus: {
        isSafe: true,
        confidence: 0.5
      }
    };
  }
}

// New function to analyze video frames for copyright detection
async function analyzeVideoFrames(frameUrls: string[]): Promise<{
  isSafe: boolean;
  confidence: number;
  detectedContent: string[];
  matchedFrames: number[];
}> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://replit.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: "Analyze video frames for potential copyright infringement. Look for known media content, logos, or watermarks. Return JSON with analysis results."
          },
          {
            role: "user",
            content: `Analyze the following frame URLs for copyright detection:\n${frameUrls.join('\n')}`
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return {
      isSafe: result.isSafe ?? true,
      confidence: result.confidence ?? 0.5,
      detectedContent: result.detectedContent ?? [],
      matchedFrames: result.matchedFrames ?? []
    };
  } catch (error) {
    console.error("OpenRouter API error:", error);
    return {
      isSafe: true,
      confidence: 0.5,
      detectedContent: [],
      matchedFrames: []
    };
  }
}

export { analyzeVideoMetadata, analyzeVideoFrames };