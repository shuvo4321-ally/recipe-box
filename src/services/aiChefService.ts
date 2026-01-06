const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
    console.error("NEXT_PUBLIC_OPENROUTER_API_KEY is not set in environment variables");
}

export interface Source {
    title: string;
    url: string;
}

export interface ChefResponse {
    text: string;
    sources: Source[];
}

export const generateChefResponse = async (query: string): Promise<ChefResponse> => {
    if (!OPENROUTER_API_KEY) {
        throw new Error("OpenRouter API key is not configured. Please set NEXT_PUBLIC_OPENROUTER_API_KEY in your environment.");
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://recipe-box.app",
                "X-Title": "RecipeBox AI Chef",
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-001",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful culinary assistant. Provide detailed, well-formatted responses about cooking, recipes, and food-related questions."
                    },
                    {
                        role: "user",
                        content: `Provide a detailed recipe for "${query}". 
            
Format the response in a "summary style" with these sections:
1. Brief Overview
2. Key Ingredients
3. Step-by-Step Instructions (numbered)
4. Pro Tips

Ensure the steps are concise summaries. Use Markdown for formatting.`
                    }
                ],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("OpenRouter API Error:", errorData);
            throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || "I couldn't find an answer to that right now.";

        // OpenRouter doesn't provide grounding sources like Google's native API
        // Return empty sources array
        const sources: Source[] = [];

        return {
            text,
            sources,
        };
    } catch (error: any) {
        console.error("OpenRouter API Error:", error);
        throw new Error(error.message || "Failed to fetch culinary information. Please try again.");
    }
};
