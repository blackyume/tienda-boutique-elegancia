import React from 'react';
    import { CheckCircle, Info, XCircle } from 'lucide-react';
    import { useStore } from '../../context/StoreContext';

    export const ToastContainer = () => {
      const { toasts } = useStore();
      return (
        <div className="fixed top-24 right-4 z-[100] space-y-2 pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl bg-slate-900 text-white animate-fadeIn">
               {t.type === 'success' ? <CheckCircle className="text-emerald-400 w-5"/> : t.type === 'error' ? <XCircle className="text-red-400 w-5"/> : <Info className="text-blue-400 w-5"/>}
               <span className="text-sm">{t.msg}</span>
            </div>
          ))}
        </div>
      );
    };