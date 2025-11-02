
import React, { useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

// Fix: Remove redundant global declaration for window.aistudio to avoid type conflicts.

const ApiKeySelector: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isApiKeySelected, setIsApiKeySelected, addLog } = useAppContext();

    const checkApiKey = useCallback(async () => {
        try {
            if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
                setIsApiKeySelected(true);
            } else {
                setIsApiKeySelected(false);
            }
        } catch (error) {
            console.error("Error checking for API key:", error);
            setIsApiKeySelected(false);
        }
    }, [setIsApiKeySelected]);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);

    const handleSelectKey = async () => {
        try {
            if(window.aistudio) {
                await window.aistudio.openSelectKey();
                // Assume success to avoid race condition, check again on next API call error.
                setIsApiKeySelected(true);
                addLog("API Key selected. You can now generate videos.", "success");
            } else {
                addLog("AISTUDIO environment not detected.", "error");
            }
        } catch (error) {
            console.error("Error opening select key dialog:", error);
            addLog("Could not open API key selection dialog.", "error");
        }
    };

    if (!isApiKeySelected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-brand-bg p-8">
                <div className="text-center max-w-lg">
                    <h1 className="text-3xl font-bold text-white mb-4">Welcome to Veo Video Generator</h1>
                    <p className="text-brand-text-secondary mb-6">
                        To generate videos with the Veo API, you need to select a Google Cloud project with an active API key. Billing will be associated with the selected project.
                    </p>
                    <button
                        onClick={handleSelectKey}
                        className="bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-primary-hover transition-colors duration-200"
                    >
                        Select Project & API Key
                    </button>
                    <p className="mt-4 text-sm text-brand-text-secondary">
                        For more information on pricing, please visit the{' '}
                        <a
                            href="https://ai.google.dev/gemini-api/docs/billing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-primary hover:underline"
                        >
                            official billing documentation
                        </a>.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ApiKeySelector;