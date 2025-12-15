import { GoogleGenAI } from "@google/genai";

// Initialize API Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEnhancedTitle = async (originalTitle: string, url: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are a marketing expert for a futuristic tech brand. 
      Rewrite the following link title to be more catchy, concise, and "cyberpunk" or professional style.
      Keep it under 5 words. Do not use quotes.
      
      Original Title: ${originalTitle}
      URL Context: ${url}
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text?.trim() || originalTitle;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return originalTitle;
  }
};

export const suggestCategory = async (title: string): Promise<string> => {
   try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Categorize this link into one single word category (e.g., Social, Work, Portfolio, Contact, Other).
      Output ONLY the word.
      Link Title: ${title}
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text?.trim() || 'Other';
  } catch (error) {
    return 'Other';
  }
}
