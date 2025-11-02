
import React, { useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

const ApiKeySelector: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setIsApiKeySelected } = useAppContext();

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

    // This component now only performs the initial API key check on mount
    // and does not render any UI itself, allowing direct access to the app.
    return <>{children}</>;
};

export default ApiKeySelector;