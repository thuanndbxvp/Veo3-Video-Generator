
import React, { createContext, useContext, useState, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { VideoJob, LogEntry, Settings } from '../types';

interface AppContextType {
    jobs: VideoJob[];
    setJobs: React.Dispatch<React.SetStateAction<VideoJob[]>>;
    logs: LogEntry[];
    addLog: (message: string, type?: LogEntry['type']) => void;
    clearLogs: () => void;
    settings: Settings;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
    isApiKeySelected: boolean;
    setIsApiKeySelected: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [jobs, setJobs] = useLocalStorage<VideoJob[]>('veo-jobs', []);
    const [logs, setLogs] = useLocalStorage<LogEntry[]>('veo-logs', []);
    const [settings, setSettings] = useLocalStorage<Settings>('veo-settings', {
        autoDownload: true,
        fileNamePrefix: 'video',
        geminiApiKeyStatus: 'unchecked',
        apiTokens: [],
    });
    const [isApiKeySelected, setIsApiKeySelected] = useState(false);

    const addLog = (message: string, type: LogEntry['type'] = 'info') => {
        const newLog: LogEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
            message,
            type,
        };
        setLogs(prevLogs => [newLog, ...prevLogs].slice(0, 100)); // Keep last 100 logs
    };
    
    const clearLogs = () => setLogs([]);

    return (
        <AppContext.Provider value={{ jobs, setJobs, logs, addLog, clearLogs, settings, setSettings, isApiKeySelected, setIsApiKeySelected }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};