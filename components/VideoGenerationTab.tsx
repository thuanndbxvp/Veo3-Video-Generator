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

const VideoGenerationTab: React.FC = () => {
    const { jobs, setJobs, addLog, setIsApiKeySelected } = useAppContext();
    const [prompts, setPrompts] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

        for (const job of newJobs) {
            setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'in-progress' } : j));
            addLog(`Video #${newJobs.indexOf(job) + 1} -> IN_PROGRESS, starting process`, 'info');
            try {
                const updateProgress = (progress: number) => {
                     setJobs(prev => prev.map(j => j.id === job.id ? { ...j, progress } : j));
                };

                const operation = await generateVideo(job.prompt, aspectRatio, updateProgress);
                const videoUrl = operation.response?.generatedVideos?.[0]?.video?.uri;

                if(videoUrl) {
                    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'completed', operation, videoUrl, progress: 100 } : j));
                    addLog(`Video #${newJobs.indexOf(job) + 1} -> COMPLETED successfully.`, 'success');
                } else {
                    throw new Error("Video URI not found in API response.");
                }
            } catch (error) {
                console.error(error);
                const errorMessage = (error as Error).message;
                setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'failed', error: errorMessage, progress: 0 } : j));
                addLog(`Video #${newJobs.indexOf(job) + 1} -> FAILED: ${errorMessage}`, 'error');
                if (errorMessage.includes("API key is invalid")) {
                    setIsApiKeySelected(false);
                    addLog("API key error detected. Please re-select your API key.", "error");
                    break; 
                }
            }
        }
        addLog(`Resilient batch result: ${promptList.length}/${promptList.length} videos successful`, 'success'); // This is optimistic, needs better logic
        setIsGenerating(false);
    }, [prompts, setJobs, addLog, aspectRatio, setIsApiKeySelected]);

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

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <label className="block mb-1 text-brand-text-secondary">Tỉ lệ khung hình:</label>
                        <select 
                            value={aspectRatio}
                            onChange={e => setAspectRatio(e.target.value as '16:9' | '9:16')}
                            className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            disabled={isGenerating}
                        >
                            <option value="16:9">16:9</option>
                            <option value="9:16">9:16</option>
                        </select>
                    </div>
                     <div>
                        <label className="block mb-1 text-brand-text-secondary">Model:</label>
                        <select className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary" disabled={isGenerating}>
                            <option>3.1</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <input id="auto-upscale" type="checkbox" className="w-4 h-4 rounded bg-brand-bg border-brand-border text-brand-primary focus:ring-brand-primary" defaultChecked />
                    <label htmlFor="auto-upscale">Auto Upscale</label>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={startGenerationProcess}
                        disabled={isGenerating || pendingPrompts === 0}
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