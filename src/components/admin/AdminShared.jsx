import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const RealTimeClock = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    return (
        <div className="text-right hidden md:block mb-2">
            <p className="text-xl font-mono font-bold text-slate-800 dark:text-white tracking-widest flex items-center justify-end gap-2">
                <Clock className="w-5 h-5 text-[#C19A6B] animate-pulse" />
                {time.toLocaleTimeString()}
            </p>
            <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-[0.2em]">
                {time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
        </div>
    );
};

export const StatCard = ({ label, value, sub, icon: Icon, theme }) => {
    // Premium Fashion Palette
    const themeStyles = {
        emerald: "text-emerald-600 dark:text-emerald-400 after:bg-emerald-500",
        blue: "text-blue-600 dark:text-blue-400 after:bg-blue-500",
        purple: "text-purple-600 dark:text-purple-400 after:bg-purple-500",
        orange: "text-[#C19A6B] after:bg-[#C19A6B]", // Generic Gold/Orange
    };

    // Default to Gold if theme not found
    const activeTheme = themeStyles[theme] || themeStyles.orange;

    return (
        <div className="relative overflow-hidden bg-white dark:bg-[#1e293b] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Elegant Accent Line */}
            <div className={`absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${activeTheme.split(" ")[2]}`} />

            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
                    <h3 className="text-3xl font-serif font-medium text-slate-900 dark:text-white tracking-tight">{value}</h3>
                </div>
                <div className={`p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-[#C19A6B] transition-colors duration-300`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>

            {sub && (
                <div className="pt-4 border-t border-slate-50 dark:border-slate-800/50">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        {sub}
                    </p>
                </div>
            )}
        </div>
    );
};

export const ActionButton = ({ icon: Icon, label, onClick, color }) => {
    const isSpecial = color && color.includes('gradient');

    // Normal elegant button
    if (!isSpecial) {
        return (
            <button
                onClick={onClick}
                className="group relative flex flex-col items-center justify-center p-6 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50 dark:to-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-3 mb-3 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-[#C19A6B] group-hover:text-white transition-all duration-300 transform group-hover:scale-110 shadow-sm">
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <span className="relative text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {label}
                </span>
            </button>
        );
    }

    // Special AI Button (Gold/Black Luxury)
    return (
        <button
            onClick={onClick}
            className="w-full h-full relative group overflow-hidden rounded-2xl p-6 flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-4 bg-[#0a0a0a] border border-[#C19A6B]/30 shadow-lg shadow-[#C19A6B]/10 hover:shadow-[#C19A6B]/20 transition-all duration-500 hover:-translate-y-1"
        >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#C19A6B]/20 via-transparent to-transparent opacity-50" />

            <div className="relative p-3 rounded-xl bg-[#C19A6B]/10 text-[#C19A6B] border border-[#C19A6B]/20 group-hover:bg-[#C19A6B] group-hover:text-black transition-all duration-500">
                <Icon className="w-6 h-6 animate-pulse-slow" />
            </div>

            <div className="relative text-left sm:text-center">
                <span className="block text-[10px] text-[#C19A6B] font-mono mb-1 opacity-80">NEURAL CORE</span>
                <span className="block text-xs font-bold uppercase tracking-[0.2em] text-white group-hover:tracking-[0.25em] transition-all duration-500">
                    Centro de Comando
                </span>
            </div>
        </button>
    );
};
