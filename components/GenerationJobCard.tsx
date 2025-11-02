import React from 'react';
import { VideoJob } from '../types';
import { useAppContext } from '../context/AppContext';
import { TrashIcon } from './icons/TrashIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface GenerationJobCardProps {
    job: VideoJob;
    index: number;
}

const GenerationJobCard: React.FC<GenerationJobCardProps> = ({ job, index }) => {
    const { settings, setJobs } = useAppContext();
    const apiKey = settings.manualApiKey || process.env.API_KEY;

    const deleteJob = () => {
        setJobs(prev => prev.filter(j => j.id !== job.id));
    };
    
    const downloadVideo = async () => {
        if (!job.videoUrl || !apiKey) return;
        
        try {
            const response = await fetch(`${job.videoUrl}&key=${apiKey}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            const safePrompt = job.prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
            a.download = `${settings.fileNamePrefix}_${index}_${safePrompt}.mp4`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download failed:", error);
        }
    };
    
    React.useEffect(() => {
        if (job.status === 'completed' && settings.autoDownload) {
            downloadVideo();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [job.status, settings.autoDownload]);

    const renderContent = () => {
        switch (job.status) {
            case 'in-progress':
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-16 h-16 border-4 border-t-brand-primary border-brand-border rounded-full animate-spin"></div>
                        <p className="mt-4 text-sm text-brand-text-secondary">Đang xử lý... ({job.progress}%)</p>
                    </div>
                );
            case 'completed':
                return (
                     <div className="relative group w-full h-full">
                        <video src={`${job.videoUrl}&key=${apiKey}`} className="w-full h-full object-cover rounded-md" controls />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button
                                onClick={downloadVideo}
                                className="p-1.5 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
                                title="Download video"
                            >
                                <DownloadIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                );
            case 'failed':
                 return (
                    <div className="flex flex-col items-center justify-center h-full p-2 text-center">
                        <p className="text-red-500 font-semibold">Generation Failed</p>
                        <p className="mt-2 text-xs text-red-400 overflow-hidden line-clamp-3" title={job.error}>{job.error}</p>
                    </div>
                );
            case 'pending':
                return (
                     <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-brand-text-secondary">Pending...</p>
                    </div>
                );
        }
    };

    return (
        <div className="bg-brand-bg rounded-lg border border-brand-border p-3 flex flex-col gap-2 text-sm relative aspect-video">
            <div className="absolute top-2 left-2 bg-brand-primary text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold z-10">{index}</div>
            <div className="absolute top-2 right-2 z-10">
                <button onClick={deleteJob} className="text-brand-text-secondary hover:text-brand-danger transition-colors">
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
            
            <div className="flex-grow flex items-center justify-center min-h-[100px]">
                {renderContent()}
            </div>
            
            <div>
                 <p className={`font-semibold ${job.status === 'completed' ? 'text-green-400' : job.status === 'failed' ? 'text-red-500' : 'text-yellow-400'}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </p>
                <p className="text-brand-text line-clamp-2 text-xs" title={job.prompt}>{job.prompt}</p>
                <p className="text-brand-text-secondary text-xs mt-1">{new Date(job.timestamp).toLocaleString()}</p>
            </div>
        </div>
    );
};

export default GenerationJobCard;
