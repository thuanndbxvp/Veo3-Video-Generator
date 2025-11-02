
import { GoogleGenAI } from '@google/genai';

const getGenAIClient = () => {
    // The API key is injected by the environment after user selection.
    if (!process.env.API_KEY) {
        throw new Error("API key not found. Please select a project in the Settings tab.");
    }
    // Create a new client for each request to ensure the latest key is used.
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateVideo = async (
    prompt: string,
    aspectRatio: '16:9' | '9:16',
    model: string,
    updateProgress: (progress: number) => void
) => {
    try {
        const ai = getGenAIClient();
        updateProgress(5);

        let operation = await ai.models.generateVideos({
            model: model,
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio,
            }
        });

        let progress = 10;
        updateProgress(progress);

        // Polling logic to check for video completion
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            const pollingAi = getGenAIClient(); 
            operation = await pollingAi.operations.getVideosOperation({ operation: operation });

            if (operation.error) {
                throw new Error(`Generation failed during operation: ${operation.error.message}`);
            }

            if (progress < 90) {
                progress += 5; // Simple progress simulation
                updateProgress(progress);
            }
        }
        
        updateProgress(100);
        return operation;
    } catch (error: any) {
        console.error("Video generation failed via SDK:", error);
         if (error.message.includes("API key not valid") || error.message.includes("PERMISSION_DENIED")) {
            throw new Error(`Authentication Error: The API key is invalid or lacks permissions. Please check your project settings. Original error: ${error.message}`);
        }
        if (error.message.includes("Requested entity was not found")) {
             throw new Error("Operation not found. This can indicate an issue with your API key or project configuration. Please try re-selecting your key.");
        }
        // General catch-all
        throw new Error(`An unexpected error occurred: ${error.message}`);
    }
};