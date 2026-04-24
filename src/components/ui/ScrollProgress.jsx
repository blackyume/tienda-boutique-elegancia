import React, { useEffect, useState } from 'react';

export const ScrollProgress = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const onScroll = () => {
            const h = document.documentElement;
            const max = (h.scrollHeight - h.clientHeight) || 1;
            setProgress(Math.min(100, Math.max(0, (h.scrollTop / max) * 100)));
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 h-[2px] z-[60] pointer-events-none">
            <div
                className="h-full bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#AA771C] transition-[width] duration-75"
                style={{ width: `${progress}%`, boxShadow: '0 0 8px rgba(212,175,55,0.6)' }}
            />
        </div>
    );
};
