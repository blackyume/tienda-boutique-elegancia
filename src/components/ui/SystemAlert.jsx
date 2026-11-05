import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { RefreshCw } from 'lucide-react';
import { Rombo } from './Ornamento';

export const SystemAlert = () => {
    const { systemConfig } = useStore();
    const [initialVersion, setInitialVersion] = useState(null);
    const [showUpdate, setShowUpdate] = useState(false);

    useEffect(() => {
        // On mount, store the current version if we don't have one
        if (!initialVersion && systemConfig?.appVersion) {
            setInitialVersion(systemConfig.appVersion);
        }

        // If we have an initial version, and the new version is different (and newer), show alert
        if (initialVersion && systemConfig?.appVersion && systemConfig.appVersion > initialVersion) {
            setShowUpdate(true);
        }
    }, [systemConfig, initialVersion]);

    if (!showUpdate) return null;

    const handleReload = () => {
        window.location.reload();
    };

    return (
        <div className="fixed bottom-24 sm:bottom-6 inset-x-0 z-50 flex justify-center px-4 animate-fadeIn">
            <div className="flex items-center gap-3 pl-4 pr-2 py-2 rounded-full bg-noche-900/95 backdrop-blur-xl border border-cielo-gold/30 shadow-[0_16px_48px_rgba(0,0,0,0.55)]">
                <Rombo />
                <span className="text-xs text-noche-100 font-medium">Actualizamos la tienda</span>
                <button
                    onClick={handleReload}
                    className="btn-oro inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
                >
                    <RefreshCw className="w-3 h-3" /> Ver
                </button>
            </div>
        </div>
    );
};
