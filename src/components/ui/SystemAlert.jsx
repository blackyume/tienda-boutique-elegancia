import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { DownloadCloud, RefreshCw } from 'lucide-react';

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
        <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 animate-bounce-subtle">
            <div className="bg-slate-900/95 dark:bg-white/95 backdrop-blur-md text-white dark:text-slate-900 px-6 py-4 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-200 flex items-center gap-6 max-w-lg w-full">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                    <DownloadCloud className="w-6 h-6 text-blue-400 dark:text-blue-600" />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-sm">Nueva versión disponible</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Actualiza para ver los cambios recientes.</p>
                </div>
                <button
                    onClick={handleReload}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30"
                >
                    <RefreshCw className="w-4 h-4" /> Actualizar
                </button>
            </div>
        </div>
    );
};
