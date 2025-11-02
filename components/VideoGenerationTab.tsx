import React, { useState, useRef, useCallback } from 'react';
import GenerationJobCard from './GenerationJobCard';
import LogPanel from './LogPanel';
import { useAppContext } from '../context/AppContext';
import { generateVideo } from '../services/geminiService';
import { VideoJob } from '../types';
import { FileIcon } from './icons/FileIcon';
import { PlayIcon } from './icons/PlayIcon';
import { StopIcon } from './icons/StopIcon';
import { TrashIcon } from './icons/TrashIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { RetryIcon } from './icons/RetryIcon';

const models = [
    { id: 'veo-3.1-fast-generate-preview', name: 'Veo 3.1 - Fast', audio: 'Beta Audio' },
    { id: 'veo-3.1-generate-preview', name: 'Veo 3.1 - Quality', audio: 'Beta Audio' },
    { id: 'veo-2-fast-generate-preview', name: 'Veo 2 - Fast', audio: 'No Audio' },
    { id: 'veo-2-generate-preview', name: 'Veo 2 - Quality', audio: 'No Audio' },
];

const VideoGenerationTab: React.FC = () => {
    const { jobs, setJobs, addLog, settings, isApiKeySelected, setIsApiKeySelected } = useAppContext();
    const [prompts, setPrompts] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [selectedModel, setSelectedModel] = useState(models[0].id);
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const hasApiKey = isApiKeySelected || !!settings.manualApiKey;

    const handleFilePromptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPrompts(e.target?.result as string);
                addLog(`Loaded prompts from ${file.name}`, 'success');
            };
            reader.readAsText(file);
        }
    };
    
    const startGenerationProcess = useCallback(async () => {
        const apiKey = settings.manualApiKey || process.env.API_KEY;
        if (!apiKey) {
            addLog("API Key is missing. Please configure it in the Settings tab.", "error");
            return;
        }

        const promptList = prompts.split('\n').map(p => p.trim()).filter(p => p.length > 0);
        if (promptList.length === 0) {
            addLog('Please enter at least one prompt.', 'warning');
            return;
        }

        setIsGenerating(true);
        addLog(`Starting batch generation for ${promptList.length} videos...`, 'info');

        const newJobs: VideoJob[] = promptList.map(prompt => ({
            id: `${Date.now()}-${Math.random()}`,
            prompt,
            status: 'pending',
            timestamp: new Date().toISOString(),
            progress: 0,
        }));
        
        setJobs(prev => [...newJobs, ...prev]);

        let completedCount = 0;

        for (const job of newJobs) {
            setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'in-progress' } : j));
            addLog(`Video #${newJobs.indexOf(job) + 1} -> IN_PROGRESS, starting process`, 'info');
            try {
                const updateProgress = (progress: number) => {
                     setJobs(prev => prev.map(j => j.id === job.id ? { ...j, progress } : j));
                };

                const operation = await generateVideo(job.prompt, aspectRatio, selectedModel, updateProgress, apiKey);
                const videoUrl = operation.response?.generatedVideos?.[0]?.video?.uri;

                if(videoUrl) {
                    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'completed', operation, videoUrl, progress: 100 } : j));
                    addLog(`Video #${newJobs.indexOf(job) + 1} -> COMPLETED successfully.`, 'success');
                    completedCount++;
                } else {
                    throw new Error("Video URI not found in API response.");
                }
            } catch (error) {
                console.error(error);
                const errorMessage = (error as Error).message;
                setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'failed', error: errorMessage, progress: 0 } : j));
                addLog(`Video #${newJobs.indexOf(job) + 1} -> FAILED: ${errorMessage}`, 'error');
                
                if (errorMessage.includes("Authentication Error") || errorMessage.includes("Operation not found")) {
                    setIsApiKeySelected(false);
                    addLog("Authentication error detected. Please go to Settings to re-select your project API key.", "error");
                    break; 
                }
                
                if (errorMessage.includes("API key not found")) {
                    addLog("Stopping batch: No API key is configured. Please select a project in the Settings tab.", "error");
                    const remainingJobIds = newJobs.slice(newJobs.indexOf(job) + 1).map(j => j.id);
                     setJobs(prev => prev.map(j => {
                        if (remainingJobIds.includes(j.id)) {
                            return { ...j, status: 'failed', error: "Batch stopped due to missing API key." };
                        }
                        return j;
                    }));
                    break;
                }
            }
        }
        addLog(`Resilient batch result: ${completedCount}/${promptList.length} videos successful`, 'success');
        setIsGenerating(false);
    }, [prompts, setJobs, addLog, aspectRatio, selectedModel, setIsApiKeySelected, settings.manualApiKey]);

    const deleteAllJobs = () => {
        setJobs([]);
        addLog("All jobs cleared.", 'info');
    };
    
    const pendingPrompts = prompts.split('\n').filter(p => p.trim().length > 0).length;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Panel */}
            <div className="lg:col-span-1 flex flex-col gap-4 bg-brand-surface rounded-lg p-4 h-full">
                <div className="flex justify-between items-center">
                    <select className="bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary">
                        <option>Text To Video</option>
                    </select>
                    <span className="text-sm bg-brand-border text-brand-text-secondary px-3 py-1 rounded-full">{pendingPrompts} prompts</span>
                </div>
                <textarea
                    className="flex-grow bg-brand-bg border border-brand-border rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder={`Ví dụ:
• Mỗi dòng một prompt:
A cat playing in the garden
A dog running on the beach

• Hoặc JSON object (sẽ được coi là 1 prompt):
{
  "shot": {
    "composition": "Medium shot, 50mm lens"
  },
  "subject": {
    "description": "A young woman walking"
  }
}`}
                    value={prompts}
                    onChange={(e) => setPrompts(e.target.value)}
                    disabled={isGenerating}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-brand-border text-brand-text hover:bg-opacity-80 transition-colors py-2 rounded-md flex items-center justify-center gap-2 text-sm"
                    disabled={isGenerating}
                >
                    <FileIcon className="w-4 h-4" /> Tải prompt từ File
                </button>
                <input type="file" accept=".txt" ref={fileInputRef} onChange={handleFilePromptUpload} className="hidden" />

                <div>
                    <label className="block mb-2 text-sm text-brand-text-secondary">Model:</label>
                    <div className="space-y-2">
                        {models.map((model) => (
                            <div
                                key={model.id}
                                onClick={() => !isGenerating && setSelectedModel(model.id)}
                                className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-all ${
                                    selectedModel === model.id ? 'bg-brand-primary bg-opacity-20 border-brand-primary' : 'bg-brand-bg hover:bg-brand-border'
                                } ${isGenerating ? 'cursor-not-allowed opacity-60' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                     <input
                                        type="radio"
                                        name="model"
                                        value={model.id}
                                        checked={selectedModel === model.id}
                                        onChange={() => setSelectedModel(model.id)}
                                        className="w-4 h-4 text-brand-primary bg-brand-bg border-brand-border focus:ring-brand-primary"
                                        disabled={isGenerating}
                                    />
                                    <span className="text-sm">{model.name}</span>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${model.audio.includes('Beta') ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-200'}`}>
                                    {model.audio}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block mb-1 text-sm text-brand-text-secondary">Tỉ lệ khung hình:</label>
                    <select 
                        value={aspectRatio}
                        onChange={e => setAspectRatio(e.target.value as '16:9' | '9:16')}
                        className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                        disabled={isGenerating}
                    >
                        <option value="16:9">16:9</option>
                        <option value="9:16">9:16</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <input id="auto-upscale" type="checkbox" className="w-4 h-4 rounded bg-brand-bg border-brand-border text-brand-primary focus:ring-brand-primary" defaultChecked />
                    <label htmlFor="auto-upscale">Auto Upscale</label>
                </div>

                <div className="flex flex-col">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={startGenerationProcess}
                            disabled={isGenerating || pendingPrompts === 0 || !hasApiKey}
                            className="flex-1 bg-brand-primary text-white font-bold py-2.5 rounded-md flex items-center justify-center gap-2 hover:bg-brand-primary-hover transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            <PlayIcon className="w-5 h-5" /> Bắt đầu tạo video
                        </button>
                        <button
                            disabled={!isGenerating}
                            className="flex-1 bg-brand-border text-brand-text py-2.5 rounded-md flex items-center justify-center gap-2 hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <StopIcon className="w-5 h-5" /> Dừng lại
                        </button>
                    </div>
                     {!hasApiKey && (
                        <p className="text-center text-sm text-red-400 mt-2">
                            Please provide an API Key in the <strong>Cài đặt</strong> tab to begin.
                        </p>
                    )}
                </div>
            </div>

            {/* Right Panel */}
            <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="flex justify-end items-center gap-4 text-sm">
                    <button className="flex items-center gap-1.5 text-brand-text-secondary hover:text-brand-text"><DownloadIcon className="w-4 h-4" /> Download All</button>
                    <button className="flex items-center gap-1.5 text-brand-text-secondary hover:text-brand-text"><RetryIcon className="w-4 h-4" /> Tạo lại ({jobs.filter(j => j.status === 'failed').length})</button>
                    <button onClick={deleteAllJobs} className="flex items-center gap-1.5 text-brand-primary hover:text-red-400"><TrashIcon className="w-4 h-4" /> Xoá tất cả</button>
                </div>
                <div className="flex-grow bg-brand-surface rounded-lg p-4 overflow-y-auto max-h-[60vh] lg:max-h-full">
                    {jobs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {jobs.map((job, index) => (
                                <GenerationJobCard key={job.id} job={job} index={index + 1} />
                            ))}
                        </div>
                    ) : (
                         <div className="flex items-center justify-center h-full text-brand-text-secondary">
                            Your generated videos will appear here.
                        </div>
                    )}
                </div>
                 <LogPanel />
            </div>
        </div>
    );
};

export default VideoGenerationTab;
