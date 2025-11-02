export type JobStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

export interface VideoJob {
    id: string;
    prompt: string;
    status: JobStatus;
    operation?: any; // To store the operation object from Veo API
    videoUrl?: string;
    timestamp: string;
    error?: string;
    progress?: number;
}

export interface LogEntry {
    id: string;
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
}

export interface Settings {
    autoDownload: boolean;
    fileNamePrefix: string;
    geminiApiKeyStatus: 'valid' | 'invalid' | 'unchecked';
    manualApiKey?: string;
}

// Fix: Moved the AIStudio interface into the `declare global` block to resolve a type conflict
// where multiple declarations of `window.aistudio` were not considered the same type.
declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }

    interface Window {
        aistudio?: AIStudio;
    }
}
