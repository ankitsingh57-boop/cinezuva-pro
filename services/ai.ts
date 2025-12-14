import { GoogleGenAI, Type } from "@google/genai";

// Safe access to API Key in case process is not defined (browser env)
const apiKey = typeof process !== 'undefined' && process.env && process.env.API_KEY 
  ? process.env.API_KEY 
  : '';

const ai = new GoogleGenAI({ apiKey });

export interface GeneratedMovieData {
  year: string;
  category: string;
  genres: string[];
  language: string;
  description: string;
  qualityTag: string;
  seoTags: string;
}

export const generateMovieDetails = async (title: string): Promise<GeneratedMovieData | null> => {
  if (!apiKey) {
    console.warn("Google GenAI API Key is missing.");
    return null;
  }
  
  try {
    const prompt = `
      Generate detailed metadata for the movie titled "${title}".
      
      Return a JSON object with:
      - year: Release year (e.g., "2024")
      - category: One of ["Bollywood", "Hollywood", "South", "Web Series", "Dual Audio", "18+"] (Pick the best fit)
      - genres: An array of strings representing genres (e.g., ["Action", "Thriller", "Romance"])
      - language: Main language (e.g., "Hindi")
      - description: A catchy, short plot summary (max 3 sentences).
      - qualityTag: "1080p" or "4K"
      - seoTags: A comma-separated string of 50 highly searchable SEO tags.
        Example format: "${title} full movie, ${title} download, watch ${title} online, ${title} 2024, ${title} hdrip..."
        Include variations like "download link", "hindi dubbed", "720p", "1080p", "fast download", "cinezuva", "cinezuva movies".
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            year: { type: Type.STRING },
            category: { type: Type.STRING },
            genres: { type: Type.ARRAY, items: { type: Type.STRING } },
            language: { type: Type.STRING },
            description: { type: Type.STRING },
            qualityTag: { type: Type.STRING },
            seoTags: { type: Type.STRING },
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedMovieData;
    }
    return null;
  } catch (error) {
    console.error("Error generating movie details:", error);
    return null;
  }
};