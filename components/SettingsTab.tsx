
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { TrashIcon } from './icons/TrashIcon';

// Fix: Remove redundant global declaration for window.aistudio to avoid type conflicts.

const SettingsTab: React.FC = () => {
    const { settings, setSettings, addLog, setIsApiKeySelected } = useAppContext();
    const [showKey, setShowKey] = useState(false);

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

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* API Config */}
            <div className="bg-brand-surface rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Cấu hình API</h2>
                <div className="space-y-6">
                    {/* Gemini Key section */}
                    <div>
                        <label className="text-sm font-medium">Gemini Key:</label>
                        <p className="text-xs text-brand-text-secondary mb-2">The API Key is managed by the environment. Use the button to select your project.</p>
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