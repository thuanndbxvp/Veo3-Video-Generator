import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { PlayIcon } from './icons/PlayIcon';

const VideoMergingTab: React.FC = () => {
    const { jobs } = useAppContext();
    const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
    const [outputName, setOutputName] = useState('merged_video');

    const completedVideos = jobs.filter(job => job.status === 'completed' && job.videoUrl);

    const toggleSelection = (jobId: string) => {
        setSelectedVideos(prev =>
            prev.includes(jobId)
                ? prev.filter(id => id !== jobId)
                : [...prev, jobId]
        );
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedVideos(completedVideos.map(v => v.id));
        } else {
            setSelectedVideos([]);
        }
    };
    
    const handleMerge = () => {
        alert("Video merging is a complex client-side operation and is not implemented in this demo.");
    };

    return (
        <div className="bg-brand-surface rounded-lg p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
                 <h2 className="text-xl font-bold">Ghép Video</h2>
            </div>

            <div className="bg-brand-bg border border-brand-border rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded bg-brand-bg border-brand-border text-brand-primary focus:ring-brand-primary"
                            onChange={handleSelectAll}
                            checked={selectedVideos.length > 0 && selectedVideos.length === completedVideos.length}
                        />
                        <label className="text-sm">
                            Chọn tất cả <span className="text-brand-text-secondary">Đã chọn: {selectedVideos.length}/{completedVideos.length}</span>
                        </label>
                    </div>
                    {/* Placeholder buttons */}
                    <div className="flex items-center gap-2">
                         <button className="text-sm px-3 py-1.5 bg-brand-border rounded-md hover:bg-opacity-80">Cài đặt</button>
                         <button className="text-sm px-3 py-1.5 bg-brand-border rounded-md hover:bg-opacity-80">Tải lại</button>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-64 overflow-y-auto">
                    {completedVideos.map((video, index) => (
                         <div key={video.id} className={`relative border-2 rounded-lg p-2 cursor-pointer ${selectedVideos.includes(video.id) ? 'border-brand-primary' : 'border-brand-border'}`} onClick={() => toggleSelection(video.id)}>
                            <input 
                                type="checkbox"
                                className="absolute top-2 left-2 w-4 h-4 rounded bg-brand-bg border-brand-border text-brand-primary focus:ring-brand-primary"
                                checked={selectedVideos.includes(video.id)}
                                readOnly
                            />
                            <video src={`${video.videoUrl}&key=${process.env.API_KEY}`} className="w-full h-24 object-cover rounded-md mb-2" />
                            <p className="text-xs line-clamp-1">video_{index + 1}_upscale.mp4</p>
                            <p className="text-xs text-brand-text-secondary">~8.24 MB</p>
                        </div>
                    ))}
                    {completedVideos.length === 0 && <p className="col-span-full text-center text-brand-text-secondary">No completed videos available to merge.</p>}
                </div>
            </div>

            <div className="bg-brand-bg border border-brand-border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-sm block mb-1">Tên file đầu ra:</label>
                        <div className="flex">
                            <input type="text" value={outputName} onChange={e => setOutputName(e.target.value)} className="w-full bg-brand-surface border border-brand-border rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                            <span className="bg-brand-border px-3 py-2 text-sm rounded-r-md">.mp4</span>
                        </div>
                    </div>
                     <div>
                        <label className="text-sm block mb-1">Hiệu ứng chuyển cảnh:</label>
                         <select className="w-full bg-brand-surface border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary">
                             <option>Không có</option>
                             <option>Fade</option>
                             <option>Wipe</option>
                         </select>
                    </div>
                </div>
                <div className="flex items-center gap-3 mb-6">
                    <input type="checkbox" id="re-encode" className="w-4 h-4 rounded bg-brand-bg border-brand-border text-brand-primary focus:ring-brand-primary" />
                    <label htmlFor="re-encode" className="text-sm">Re-encode video (tương thích tốt hơn)</label>
                </div>
                
                 <button 
                    onClick={handleMerge}
                    disabled={selectedVideos.length < 2}
                    className="w-full bg-brand-primary text-white font-bold py-2.5 rounded-md flex items-center justify-center gap-2 hover:bg-brand-primary-hover transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                    <PlayIcon className="w-5 h-5"/> Ghép {selectedVideos.length} video đã chọn
                </button>
            </div>

        </div>
    );
};

export default VideoMergingTab;