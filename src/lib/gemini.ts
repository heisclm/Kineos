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
- Charismatic, accessible, and punchy without dumbing down the plot.`,
};

function parseGeneratedJson(rawText: string): GeneratedNarrativeResult {
  // Direct JSON parse
  try {
    const parsed = JSON.parse(rawText);
    if (parsed.teaser && parsed.storyline) {
      return { teaser: parsed.teaser.trim(), storyline: parsed.storyline.trim() };
    }
  } catch {}

  // Markdown code fence extraction: ```json ... ```
  const match = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.teaser && parsed.storyline) {
        return { teaser: parsed.teaser.trim(), storyline: parsed.storyline.trim() };
      }
    } catch {}
  }

  // Braced substring fallback: { ... }
  const firstBrace = rawText.indexOf("{");
  const lastBrace = rawText.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      const jsonStr = rawText.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(jsonStr);
      if (parsed.teaser && parsed.storyline) {
        return { teaser: parsed.teaser.trim(), storyline: parsed.storyline.trim() };
      }
    } catch {}
  }

  throw new Error("Could not parse valid teaser and storyline from Gemini response.");
}

/**
 * Dynamically queries Google Generative Language ModelService.ListModels
 * to find the exact models authorized for this specific API key.
 */
async function getAvailableGeminiModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const list: Array<{ name: string; supportedGenerationMethods?: string[] }> = data.models || [];
      return list
        .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
        .map((m) => m.name.replace(/^models\//, ""));
    } else {
      const errorData = await res.json().catch(() => null);
      const errMsg = errorData?.error?.message || `HTTP ${res.status}`;
      if (errMsg.toLowerCase().includes("api_key") || errMsg.toLowerCase().includes("invalid")) {
        throw new Error("Invalid Gemini API Key. Please verify your API key at Google AI Studio.");
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("Invalid Gemini API Key")) {
      throw err;
    }
    console.warn("Could not query Gemini ListModels endpoint:", err);
  }
  return [];
}

/**
 * Calls Google Gemini REST API to generate a humanized teaser and storyline.
 * Uses dynamic model discovery and automatic fallbacks to ensure compatibility.
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

Return a valid JSON object with keys:
{
  "teaser": "1-2 sentence hook (100-220 chars)",
  "storyline": "2-3 paragraph captivating synopsis (500-1000 chars)"
}`;

  // 1. Discover models available to this API key dynamically
  const discoveredModels = await getAvailableGeminiModels(apiKey);

  const preferredOrder = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-002",
    "gemini-1.5-flash-001",
    "gemini-1.5-flash",
    "gemini-2.5-flash",
    "gemini-1.5-pro-latest",
    "gemini-1.5-pro-002",
    "gemini-1.5-pro-001",
    "gemini-1.5-pro",
    "gemini-pro",
  ];

  let candidateModels: string[] = [];

  if (discoveredModels.length > 0) {
    // Filter and order discovered models
    const matched = preferredOrder.filter((m) => discoveredModels.includes(m));
    const remaining = discoveredModels.filter((m) => !preferredOrder.includes(m));
    candidateModels = [...matched, ...remaining];
  } else {
    candidateModels = preferredOrder;
  }

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      // First attempt: with structured JSON schema
      const payloadWithSchema = {
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
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
                description: "A punchy 1-2 sentence hook (100-220 characters)",
              },
              storyline: {
                type: "STRING",
                description: "A 2-3 paragraph captivating synopsis (500-1000 characters)",
              },
            },
            required: ["teaser", "storyline"],
          },
        },
      };

      let response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadWithSchema),
          cache: "no-store",
        }
      );

      // If responseSchema is not supported by this model, retry with standard JSON response
      if (!response.ok && response.status === 400) {
        const errJson = await response.json().catch(() => null);
        const errMsg = errJson?.error?.message || "";
        if (errMsg.toLowerCase().includes("schema") || errMsg.toLowerCase().includes("response_schema")) {
          const payloadWithoutSchema = {
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}\n\nRespond ONLY with a valid JSON object.` }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
            },
          };

          response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payloadWithoutSchema),
              cache: "no-store",
            }
          );
        } else {
          lastError = new Error(`Model ${model} error: ${errMsg}`);
          continue;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errMsg = errorData?.error?.message || `HTTP ${response.status}`;
        lastError = new Error(`Model ${model} error: ${errMsg}`);

        if (response.status === 404 || errMsg.toLowerCase().includes("not found")) {
          continue;
        }
        if (errMsg.toLowerCase().includes("api_key") || errMsg.toLowerCase().includes("invalid")) {
          throw new Error("Invalid Gemini API Key. Please verify your API key in Google AI Studio.");
        }
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error("Gemini returned an empty response.");
      }

      return parseGeneratedJson(rawText);
    } catch (err) {
      lastError = err;
      if (err instanceof Error && err.message.includes("Invalid Gemini API Key")) {
        throw err;
      }
    }
  }

  throw lastError || new Error("Failed to generate content with Gemini.");
}
