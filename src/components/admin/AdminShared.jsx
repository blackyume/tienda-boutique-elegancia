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
    const themeStyles = {
        emerald: "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800",
        blue: "bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800",
        purple: "bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800",
        orange: "bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800",
    };

    return (
        <div className={`p-6 rounded-2xl border ${themeStyles[theme] || themeStyles.emerald} relative overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-lg`}>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur-sm`}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-xs font-bold uppercase opacity-70 mb-1 tracking-wider">{label}</p>
                <p className="text-2xl lg:text-3xl font-black">{value}</p>
                {sub && <p className="text-[10px] mt-2 font-medium opacity-80">{sub}</p>}
            </div>
            {/* Decoracion de fondo */}
            <Icon className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-500" />
        </div>
    );
};

export const ActionButton = ({ icon: Icon, label, onClick, color }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all gap-3 group shadow-sm ${color}`}
    >
        <div className="p-3 rounded-full bg-inherit brightness-95 dark:brightness-110 group-hover:scale-110 transition-transform">
            <Icon className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </button>
);
