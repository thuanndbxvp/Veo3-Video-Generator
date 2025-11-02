
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

    let initialResponse;
    try {
        initialResponse = await fetch(generateUrl, { method: 'POST', headers, body });
    } catch (networkError) {
        console.error("Initial request failed:", networkError);
        throw new Error("Network Error: Could not connect to Google API. Check your internet connection, ad blockers, and browser console for CORS errors.");
    }

    if (!initialResponse.ok) {
        const errorBody = await initialResponse.json().catch(() => ({ error: { message: 'Failed to parse error response from server.' } }));
        console.error("Error starting video generation:", errorBody);
        const errorMessage = errorBody.error?.message || 'Failed to start video generation.';
        if (initialResponse.status === 401 || initialResponse.status === 403) {
            throw new Error(`Authentication failed. The provided token or key may be invalid, expired, or lack permissions. Details: ${errorMessage}`);
        }
        if (initialResponse.status === 400 && errorMessage.includes("API key not valid")) {
             throw new Error(`Authentication failed: ${errorMessage}. If using an access token, it might be expired. If using an API key, ensure it's correct.`);
        }
        throw new Error(`API Error (${initialResponse.status}): ${errorMessage}`);
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
                const errorBody = await pollResponse.json().catch(() => ({ error: { message: 'Failed to parse error response from polling.' } }));
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
        } catch (pollingError) {
            console.error("Error during polling:", pollingError);
            const errorMessage = (pollingError as Error).message;
             if (errorMessage.includes("Requested entity was not found")) {
                throw new Error("Polling failed: Operation not found. This can happen with an invalid API key or permissions issue.");
            }
            throw new Error(`Polling request failed: ${errorMessage}`);
        }
    }
    
    updateProgress(100);
    return operation;
};
