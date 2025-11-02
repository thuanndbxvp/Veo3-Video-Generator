
const VEO_API_BASE_URL = 'https://generativelanguage.googleapis.com';

// A simple heuristic to check if the provided key is an OAuth token (like those from Google Labs Flow)
const isOAuthToken = (key: string): boolean => key.startsWith('ya29.');

export const generateVideo = async (
    apiKeyOrToken: string | undefined,
    prompt: string,
    aspectRatio: '16:9' | '9:16',
    model: string,
    updateProgress: (progress: number) => void
) => {
    if (!apiKeyOrToken) {
        throw new Error("API key or token not found. Please add a token in the settings.");
    }

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    let generateUrl = `${VEO_API_BASE_URL}/v1beta/models/${model}:generateVideos`;

    // Use the correct authentication method based on the credential type
    if (isOAuthToken(apiKeyOrToken)) {
        headers['Authorization'] = `Bearer ${apiKeyOrToken}`;
    } else {
        generateUrl += `?key=${apiKeyOrToken}`;
    }

    const body = JSON.stringify({
        prompt,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio,
        }
    });

    const initialResponse = await fetch(generateUrl, { method: 'POST', headers, body });

    if (!initialResponse.ok) {
        const errorBody = await initialResponse.json();
        console.error("Error starting video generation:", errorBody);
        const errorMessage = errorBody.error?.message || 'Failed to start video generation.';
        if (initialResponse.status === 401 || initialResponse.status === 403) {
            throw new Error(`Authentication failed. The provided token or key may be invalid or expired. Details: ${errorMessage}`);
        }
        if (initialResponse.status === 400 && errorMessage.includes("API key not valid")) {
             throw new Error(`Authentication failed: ${errorMessage}. If using an access token from Flow, it might be expired. If using an API key, ensure it's correct.`);
        }
        throw new Error(JSON.stringify(errorBody));
    }
    
    let operation = await initialResponse.json();
    let progress = 10;
    updateProgress(progress);

    // Polling logic to check for video completion
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        let pollUrl = `${VEO_API_BASE_URL}/v1/${operation.name}`;
        const pollHeaders: HeadersInit = {};

        if (isOAuthToken(apiKeyOrToken)) {
            pollHeaders['Authorization'] = `Bearer ${apiKeyOrToken}`;
        } else {
            pollUrl += `?key=${apiKeyOrToken}`;
        }

        try {
            const pollResponse = await fetch(pollUrl, { headers: pollHeaders });
            if (!pollResponse.ok) {
                const errorBody = await pollResponse.json();
                console.error("Error polling for video operation:", errorBody);
                throw new Error(errorBody.error?.message || 'Polling failed.');
            }
            operation = await pollResponse.json();

            if (operation.error) {
                throw new Error(`Generation failed during operation: ${operation.error.message}`);
            }

            if (progress < 90) {
                progress += 5;
                updateProgress(progress);
            }
        } catch (error) {
            console.error("Error polling for video operation:", error);
            const errorMessage = (error as Error).message;
             if (errorMessage.includes("Requested entity was not found")) {
                throw new Error("Polling failed: Operation not found. This can happen with an invalid API key or permissions issue.");
            }
            throw error;
        }
    }
    
    updateProgress(100);
    return operation;
};
