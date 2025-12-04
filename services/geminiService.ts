import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
// Note: process.env.API_KEY is expected to be available in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const searchContentWithAI = async (query: string, mockDatabase: string[]): Promise<string[]> => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key missing, returning empty AI results.");
    return [];
  }

  try {
    const model = 'gemini-2.5-flash';
    const dbString = mockDatabase.join(', ');
    const prompt = `
      You are a search engine for a media app called UTG Medeia.
      The user is searching for: "${query}".
      
      Here is a list of available content titles in our database:
      [${dbString}]

      Return a JSON array of strings containing ONLY the titles from the list that differnetially match or are semantically related to the user's search query.
      If nothing matches, return an empty array.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const results = JSON.parse(text);
    return Array.isArray(results) ? results : [];
  } catch (error) {
    console.error("Error searching with Gemini:", error);
    return [];
  }
};

export const checkCopyrightContent = async (description: string): Promise<boolean> => {
  if (!process.env.API_KEY) return false;
  
  // Simulation of a copyright check using AI to analyze text patterns
  // In a real app, this would check video hashes against a backend DB
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this content description for potential severe copyright violations of major blockbuster movies. Description: "${description}". Return JSON { "violation": boolean }`,
       config: {
        responseMimeType: "application/json"
      }
    });
    const result = JSON.parse(response.text || '{}');
    return result.violation === true;
  } catch (e) {
    return false;
  }
}
