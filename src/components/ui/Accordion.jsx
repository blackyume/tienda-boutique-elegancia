import React, { useState } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';

export const Accordion = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-slate-200 dark:border-slate-800">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-4 flex items-center justify-between text-left group"
            >
                <span className="font-bold text-sm tracking-widest uppercase text-slate-800 dark:text-slate-200 group-hover:text-cielo-gold transition-colors">
                    {title}
                </span>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-cielo-gold" />
                </div>
            </button>
            <div
                className={`grid transition-[grid-template-rows] duration-500 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-4' : 'grid-rows-[0fr] opacity-0'
                    }`}
            >
                <div className="overflow-hidden">
                    <div className="text-sm font-light leading-relaxed text-slate-600 dark:text-slate-400">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
