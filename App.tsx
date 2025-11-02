
import React, { useState, useEffect, useCallback } from 'react';
import Tabs from './components/Tabs';
import VideoGenerationTab from './components/VideoGenerationTab';
import VideoMergingTab from './components/VideoMergingTab';
import SettingsTab from './components/SettingsTab';
import ApiKeySelector from './components/ApiKeySelector';
import { AppProvider } from './context/AppContext';

export type Tab = 'generate' | 'merge' | 'settings';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('generate');
    
    return (
        <AppProvider>
            <ApiKeySelector>
                <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans">
                    <header className="bg-brand-surface border-b border-brand-border flex justify-between items-center px-6 py-2">
                        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
                        <span className="text-sm text-brand-text-secondary">v1.5.1</span>
                    </header>
                    <main className="flex-grow p-4 lg:p-6">
                        {activeTab === 'generate' && <VideoGenerationTab />}
                        {activeTab === 'merge' && <VideoMergingTab />}
                        {activeTab === 'settings' && <SettingsTab />}
                    </main>
                </div>
            </ApiKeySelector>
        </AppProvider>
    );
};

export default App;
   