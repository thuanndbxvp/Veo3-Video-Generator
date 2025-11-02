
import { GoogleGenAI } from "@google/genai";

// Fix: Remove redundant global declaration for window.aistudio to avoid type conflicts.

export const getGeminiAI = () => {
    if (!process.env.API_KEY) {
        throw new Error("API key not found. Please select an API key in the settings.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateVideo = async (
    prompt: string,
    aspectRatio: '16:9' | '9:16',
    updateProgress: (progress: number) => void
) => {
    const ai = getGeminiAI();
    
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio,
        }
    });

    let progress = 10;
    updateProgress(progress);

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        try {
            operation = await ai.operations.getVideosOperation({ operation: operation });
            if (progress < 90) {
                progress += 5;
                updateProgress(progress);
            }
        } catch (error) {
            console.error("Error polling for video operation:", error);
            const errorMessage = (error as Error).message;
            if (errorMessage.includes("Requested entity was not found")) {
                throw new Error("API key is invalid or missing permissions. Please select a valid key.");
            }
            throw error;
        }
    }
    
    updateProgress(100);
    return operation;
};