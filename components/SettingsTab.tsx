import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { TrashIcon } from './icons/TrashIcon';

const SettingsTab: React.FC = () => {
    const { settings, setSettings, addLog, isApiKeySelected, setIsApiKeySelected } = useAppContext();
    const [localApiKey, setLocalApiKey] = useState(settings.manualApiKey || '');
    const [isAistudioEnv, setIsAistudioEnv] = useState(false);

    useEffect(() => {
        setIsAistudioEnv(!!window.aistudio);
    }, []);

    const handleResetApp = () => {
        if (window.confirm("Are you sure you want to reset all data? This will clear all jobs, logs, and settings.")) {
            localStorage.removeItem('veo-jobs');
            localStorage.removeItem('veo-logs');
            localStorage.removeItem('veo-settings');
            window.location.reload();
        }
    };
    
    const handleSelectKey = async () => {
        try {
            if(window.aistudio) {
                await window.aistudio.openSelectKey();
                setIsApiKeySelected(true); // Assume success
                addLog("API Key selection process initiated. The new key will be used for subsequent requests.", "success");
            } else {
                addLog("AISTUDIO environment not detected.", "error");
            }
        } catch (error) {
            addLog("Could not open API key selection dialog.", "error");
        }
    };
    
    const handleSaveManualKey = () => {
        setSettings(s => ({...s, manualApiKey: localApiKey}));
        addLog("Manual API Key has been saved.", "success");
    };

    const hasApiKey = isApiKeySelected || !!settings.manualApiKey;

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* API Config */}
            <div className="bg-brand-surface rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Cấu hình API</h2>
                <div className="space-y-6">
                    <div>
                        {isAistudioEnv ? (
                             <div>
                                <label className="text-sm font-medium">Gemini Key:</label>
                                <p className="text-xs text-brand-text-secondary mb-2">The API Key is managed by the AI Studio environment. Use the button to select your project.</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <input
                                        type="password"
                                        value={isApiKeySelected ? "●●●●●●●●●●●●●●●●" : "No project selected"}
                                        readOnly
                                        className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm"
                                    />
                                    <button onClick={handleSelectKey} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover text-sm whitespace-nowrap">Select Project</button>
                                </div>
                             </div>
                        ) : (
                            <div>
                                <label htmlFor="manual-key" className="text-sm font-medium">Your Gemini API Key:</label>
                                <p className="text-xs text-brand-text-secondary mb-2">
                                    Running outside AI Studio. Please provide your own API key. 
                                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-primary underline ml-1">Get your key here.</a>
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <input
                                        id="manual-key"
                                        type="password"
                                        value={localApiKey}
                                        onChange={(e) => setLocalApiKey(e.target.value)}
                                        placeholder="Enter your Gemini API Key"
                                        className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm"
                                    />
                                    <button onClick={handleSaveManualKey} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover text-sm">Save</button>
                                </div>
                            </div>
                        )}
                         {hasApiKey ? (
                            <p className="text-xs text-green-400 mt-1">✓ API Key is configured and ready to use.</p>
                        ) : (
                            <p className="text-xs text-red-400 mt-1">✗ No API Key configured. Please provide a key to enable video generation.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Download Settings */}
            <div className="bg-brand-surface rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Cài đặt tải xuống</h2>
                 <div className="space-y-4">
                     <div className="flex items-center gap-3">
                         <input
                            id="auto-download"
                            type="checkbox"
                            checked={settings.autoDownload}
                            onChange={(e) => setSettings(s => ({...s, autoDownload: e.target.checked}))}
                            className="w-4 h-4 rounded bg-brand-bg border-brand-border text-brand-primary focus:ring-brand-primary"
                         />
                         <label htmlFor="auto-download" className="text-sm">Tự động tải xuống video khi hoàn thành</label>
                     </div>
                     <div>
                         <label className="text-sm font-medium">Tên file prefix</label>
                         <div className="flex mt-1">
                             <input
                                 type="text"
                                 value={settings.fileNamePrefix}
                                 onChange={(e) => setSettings(s => ({...s, fileNamePrefix: e.target.value}))}
                                 className="w-full bg-brand-bg border border-brand-border rounded-l-md px-3 py-2 text-sm"
                             />
                             <span className="bg-brand-border px-3 py-2 text-sm text-brand-text-secondary rounded-r-md">_1.mp4</span>
                         </div>
                         <p className="text-xs text-brand-text-secondary mt-1">Ví dụ: "acb" → acb_1.mp4, acb_2.mp4... | Current: "{settings.fileNamePrefix}"</p>
                     </div>
                 </div>
            </div>

            {/* Reset App */}
            <div className="bg-brand-surface rounded-lg p-6">
                 <h2 className="text-xl font-bold mb-2">Reset App</h2>
                 <p className="text-sm text-brand-text-secondary mb-4">Xoá toàn bộ dữ liệu và reset app về trạng thái ban đầu</p>
                 <button
                    onClick={handleResetApp}
                    className="w-full bg-brand-danger text-white font-bold py-2.5 rounded-md hover:bg-red-700 transition-colors"
                 >
                     Reset về mặc định
                 </button>
            </div>
            
            {/* App Info */}
            <div className="text-center text-sm text-brand-text-secondary">
                <p>Phiên bản ứng dụng: v1.5.1</p>
                <p>Tên ứng dụng: SuperVeo</p>
            </div>
        </div>
    );
};

export default SettingsTab;
