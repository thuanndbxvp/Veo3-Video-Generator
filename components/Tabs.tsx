
import React from 'react';
import { Tab } from '../App';

interface TabsProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
    const tabs: { id: Tab; label: string }[] = [
        { id: 'generate', label: 'Tạo Video' },
        { id: 'merge', label: 'Ghép Video' },
        { id: 'settings', label: 'Cài đặt' },
    ];

    return (
        <nav className="flex space-x-1">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        activeTab === tab.id
                            ? 'bg-brand-primary text-white'
                            : 'text-brand-text-secondary hover:bg-brand-border hover:text-brand-text'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </nav>
    );
};

export default Tabs;
   