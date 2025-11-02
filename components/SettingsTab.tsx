
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { TrashIcon } from './icons/TrashIcon';

// Fix: Remove redundant global declaration for window.aistudio to avoid type conflicts.

const SettingsTab: React.FC = () => {
    const { settings, setSettings, addLog, setIsApiKeySelected } = useAppContext();
    const [showKey, setShowKey] = useState(false);
    const [newToken, setNewToken] = useState('');
    const [visibleTokens, setVisibleTokens] = useState<Record<number, boolean>>({});

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
                addLog("API Key selection re-initiated.", "success");
            } else {
                addLog("AISTUDIO environment not detected.", "error");
            }
        } catch (error) {
            addLog("Could not open API key selection dialog.", "error");
        }
    };

    const handleAddToken = () => {
        if (newToken.trim()) {
            setSettings(s => ({ ...s, apiTokens: [...(s.apiTokens || []), newToken.trim()] }));
            setNewToken('');
            addLog("API Token added.", "success");
        }
    };

    const handleDeleteToken = (index: number) => {
        setSettings(s => ({ ...s, apiTokens: s.apiTokens.filter((_, i) => i !== index) }));
        addLog("API Token removed.", "info");
    };

    const handleToggleTokenVisibility = (index: number) => {
        setVisibleTokens(prev => ({ ...prev, [index]: !prev[index] }));
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* API Config */}
            <div className="bg-brand-surface rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Cấu hình API</h2>
                <div className="space-y-6">
                     {/* API Tokens section */}
                    <div>
                        <label className="text-sm font-medium">API Tokens:</label>
                        <div className="space-y-2 mt-1">
                            {(settings.apiTokens || []).map((token, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span className="text-green-400 font-bold">✓</span>
                                    <span className="text-sm text-brand-text-secondary">#{index + 1}</span>
                                    <input
                                        type={visibleTokens[index] ? "text" : "password"}
                                        value={token}
                                        readOnly
                                        className="flex-grow bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm"
                                    />
                                    <button onClick={() => handleToggleTokenVisibility(index)} className="p-2 bg-brand-border rounded-md hover:bg-opacity-80">👁️</button>
                                    <button onClick={() => handleDeleteToken(index)} className="p-2 bg-brand-danger text-white rounded-md hover:bg-red-700">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                            <input
                                type="text"
                                placeholder="Nhập access token...."
                                value={newToken}
                                onChange={(e) => setNewToken(e.target.value)}
                                className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            />
                            <button onClick={handleAddToken} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-semibold">Add</button>
                        </div>
                        <p className="text-xs text-green-400 mt-1">✓ {(settings.apiTokens || []).length} tokens</p>
                    </div>

                    {/* Gemini Key section */}
                    <div>
                        <label className="text-sm font-medium">Gemini Key:</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input
                                type={showKey ? "text" : "password"}
                                value={process.env.API_KEY || "key_not_found_select_project"}
                                readOnly
                                className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm"
                            />
                            <button onClick={() => setShowKey(!showKey)} className="p-2 bg-brand-border rounded-md hover:bg-opacity-80">👁️</button>
                            <button onClick={handleSelectKey} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover text-sm">Lưu</button>
                        </div>
                         <p className="text-xs text-green-400 mt-1">✓ Đã có</p>
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