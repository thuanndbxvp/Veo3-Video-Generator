
import React, { useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const LogPanel: React.FC = () => {
    const { logs, clearLogs } = useAppContext();
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = 0;
        }
    }, [logs]);
    
    const getStatusColor = (type: string) => {
        switch (type) {
            case 'success': return 'text-green-400';
            case 'error': return 'text-red-400';
            case 'warning': return 'text-yellow-400';
            default: return 'text-blue-400';
        }
    };

    return (
        <div className="bg-brand-surface rounded-lg p-4 flex flex-col h-48">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-sm">Nhật ký hoạt động:</h3>
                <button onClick={clearLogs} className="text-xs text-brand-text-secondary hover:text-brand-text">Xoá</button>
            </div>
            <div ref={logContainerRef} className="flex-grow overflow-y-auto text-xs space-y-1 pr-2">
                {logs.map(log => (
                    <div key={log.id} className="flex gap-2">
                        <span className="text-brand-text-secondary">{log.timestamp}</span>
                        <span className={`${getStatusColor(log.type)}`}>{log.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LogPanel;
   