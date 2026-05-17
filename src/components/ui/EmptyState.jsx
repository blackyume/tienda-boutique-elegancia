import React from 'react';

export const EmptyState = ({ icon: Icon, title, subtitle, action }) => (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
        {Icon && (
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-5">
                <Icon className="w-7 h-7" strokeWidth={1.5} />
            </div>
        )}
        <h3 className="font-serif text-lg font-bold text-slate-700 dark:text-slate-200">{title}</h3>
        {subtitle && (
            <p className="mt-1.5 text-sm text-slate-400 dark:text-slate-500 max-w-sm">{subtitle}</p>
        )}
        {action && <div className="mt-6">{action}</div>}
    </div>
);
