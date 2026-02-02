import React from 'react';
    import { Loader2 } from 'lucide-react';
    export const Button = ({ children, variant = 'primary', className = '', isLoading, ...props }) => {
      const base = "px-6 py-2 rounded-lg font-medium text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2";
      const styles = {
        primary: "bg-slate-900 text-white hover:bg-slate-800",
        secondary: "bg-white text-slate-900 border border-slate-900 hover:bg-slate-50",
        accent: "bg-[#C19A6B] text-white hover:bg-[#A08055]",
        outline: "border border-slate-300 hover:border-slate-900"
      };
      return (
        <button className={`${base} ${styles[variant]} ${className}`} disabled={isLoading} {...props}>
          {isLoading ? <Loader2 className="animate-spin w-4 h-4"/> : children}
        </button>
      );
    };