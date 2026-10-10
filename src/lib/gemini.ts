/**
 * Google Gemini AI Narrative & Storyline Generation Utilities
 */

export type NarrativeTone = "cinematic" | "hook" | "casual";

export interface GenerateNarrativeParams {
  title: string;
  type?: "movie" | "series";
  genres?: string;
  cast?: string;
  releaseYear?: string | number | null;
  currentTeaser?: string;
  currentDescription?: string;
  tone?: NarrativeTone;
  customApiKey?: string;
}

export interface GeneratedNarrativeResult {
  teaser: string;
  storyline: string;
}

const TONE_PROMPTS: Record<NarrativeTone, string> = {
  cinematic: `TONE: CINEMATIC & ATMOSPHERIC.
- Evocative, high-stakes, grand dramatic scale, and emotional gravitas.
- Focus on the moral conflict, personal dilemma, and the world our characters inhabit.
- Elegant, immersive prose that feels like an award-winning feature profile.`,
  
  hook: `TONE: HOOK-HEAVY & SUSPENSEFUL.
- Urgent stakes, cliffhanger energy, sharp twists, and burning questions.
- Creates intense curiosity and irresistible FOMO.
- Fast, tension-building rhythm that pulls the reader into the conflict immediately.`,
  
  casual: `TONE: CASUAL, WITTY & ENGAGING.
- Natural, conversational, and energetic — like a passionate cinema enthusiast enthusiastically pitching a must-watch title to a close friend.
- Charismatic, accessible, and punchy without dumbing down the plot.`
};

/**
 * Calls Google Gemini REST API to generate a humanized teaser and storyline.
 * Employs model fallbacks: gemini-2.5-flash -> gemini-2.0-flash -> gemini-1.5-flash.
 */
export async function generateNarrativeWithGemini(
  params: GenerateNarrativeParams
): Promise<GeneratedNarrativeResult> {
  const apiKey = (params.customApiKey?.trim() || process.env.GEMINI_API_KEY)?.trim();

  if (!apiKey) {
    throw new Error(
      "Gemini API Key is missing. Please set GEMINI_API_KEY in .env.local or enter your free API key in the admin settings."
    );
  }

  const cleanTitle = params.title?.trim();
  if (!cleanTitle) {
    throw new Error("A title is required to generate a teaser and storyline.");
  }

  const tone = params.tone || "cinematic";
  const toneInstruction = TONE_PROMPTS[tone] || TONE_PROMPTS.cinematic;

  const systemPrompt = `You are a world-class cinema narrative copywriter for Kineos, an elite streaming catalog.
Your mission is to craft two pieces of copy:
1. "teaser": A high-voltage, punchy 1 to 2 sentence hook (strictly between 100 and 220 characters) designed for hero banners and browse cards. It must immediately create curiosity and desire to watch.
2. "storyline": A 2 to 3 paragraph cinematic synopsis (between 500 and 1000 characters) that introduces the characters, central dilemma, and stakes.

CRITICAL RULES:
- NEVER use AI clichés or robotic buzzwords (BANNED: "delve into", "tapestry", "in a world where", "testament to", "journey of self-discovery", "unbeknownst to them", "whirlwind", "rollercoaster", "beacon of hope", "multifaceted").
- ZERO THIRD-ACT SPOILERS. Only reveal up to the inciting incident and central dilemma. Keep resolutions completely secret.
- HUMAN CADENCE: Use varied sentence lengths. Balance sharp, punchy phrases with vivid, grounded descriptions.
- Format the storyline into 2-3 readable paragraphs separated by double line breaks (\\n\\n).

${toneInstruction}`;

  const userPrompt = `Generate a teaser and storyline for:
Title: "${cleanTitle}"
Format: ${params.type === "series" ? "Television Series" : "Feature Film"}
Release Year: ${params.releaseYear || "N/A"}
Genres: ${params.genres || "N/A"}
Cast: ${params.cast || "N/A"}

Existing Synopsis / Context:
${params.currentDescription?.trim() || params.currentTeaser?.trim() || "None provided. Ground the premise in the title, genres, and cast."}

Return a valid JSON object matching the requested schema.`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: `${systemPrompt}\n\n${userPrompt}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          teaser: {
            type: "STRING",
            description: "A punchy 1-2 sentence hook (100-220 characters)"
          },
          storyline: {
            type: "STRING",
            description: "A 2-3 paragraph captivating synopsis (500-1000 characters)"
          }
        },
        required: ["teaser", "storyline"]
      }
    }
  };

  // Try candidate models in order of best performance / availability
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errMsg = errorData?.error?.message || `HTTP ${response.status}`;
        lastError = new Error(`Model ${model} error: ${errMsg}`);
        // If it's a 404 or model not found, continue loop to next fallback model
        if (response.status === 404 || errMsg.toLowerCase().includes("not found")) {
          continue;
        }
        // If it's an API key error, throw immediately
        if (response.status === 400 && errMsg.toLowerCase().includes("api_key")) {
          throw new Error("Invalid Gemini API Key. Please verify your API key in settings.");
        }
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error("Gemini returned an empty response.");
      }

      const parsed = JSON.parse(rawText) as GeneratedNarrativeResult;
      if (!parsed.teaser || !parsed.storyline) {
        throw new Error("Gemini output was missing expected teaser or storyline fields.");
      }

      return {
        teaser: parsed.teaser.trim(),
        storyline: parsed.storyline.trim(),
      };
    } catch (err) {
      lastError = err;
      if (err instanceof Error && err.message.includes("Invalid Gemini API Key")) {
        throw err;
      }
    }
  }

  throw lastError || new Error("Failed to generate content with Gemini.");
}
