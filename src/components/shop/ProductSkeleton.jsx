import React from 'react';

export const ProductSkeleton = () => (
    <div className="flex flex-col">
        <div className="aspect-[3/4] w-full rounded-md animate-pulse bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
        <div className="mt-4 h-3.5 w-3/4 mx-auto rounded-full animate-pulse bg-slate-200 dark:bg-slate-800" />
        <div className="mt-2 h-3 w-1/3 mx-auto rounded-full animate-pulse bg-slate-200 dark:bg-slate-800" />
    </div>
);

export const ProductGridSkeleton = ({ count = 6 }) => (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-10">
        {Array.from({ length: count }).map((_, i) => (
            <ProductSkeleton key={i} />
        ))}
    </div>
);
