import { GoogleGenAI } from "@google/genai";

const API_KEY = "AIzaSyCJSfOOuXWIPl1UdPitpBc4TwkQamrhhU8";

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface Source {
    title: string;
    url: string;
}

export interface ChefResponse {
    text: string;
    sources: Source[];
}

export const generateChefResponse = async (query: string): Promise<ChefResponse> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: query,
            config: {
                tools: [{ googleSearch: {} }],
                systemInstruction: `You are a world-class chef and culinary expert. 
        Answer the user's cooking question helpfully, accurately, and concisely.
        Format your answer with clear Markdown headers, lists, and bold text where appropriate.
        If the user asks for a recipe, provide ingredients and step-by-step instructions.
        Always maintain a warm, encouraging tone.
        `,
            },
        });

        const text = response.text || "I couldn't find an answer to that right now.";

        // Extract sources from grounding chunks
        const sources: Source[] = [];
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        chunks.forEach((chunk: any) => {
            if (chunk.web) {
                sources.push({
                    title: chunk.web.title || "Web Source",
                    url: chunk.web.uri,
                });
            }
        });

        // Remove duplicates based on URL
        const uniqueSources = sources.filter((source, index, self) =>
            index === self.findIndex((s) => s.url === source.url)
        );

        return {
            text,
            sources: uniqueSources,
        };
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};
