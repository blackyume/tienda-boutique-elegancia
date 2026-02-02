import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs = ({ items }) => {
    // items example: [{ label: 'Shop', path: '/shop' }, { label: 'Camisas', path: '/shop/camisas' }, { label: 'Camisa Oxford', active: true }]

    return (
        <nav className="flex items-center text-xs text-slate-500 mb-6 animate-fadeIn">
            <Link to="/" className="hover:text-cielo-gold transition-colors flex items-center gap-1">
                <Home className="w-3 h-3" />
                <span className="uppercase tracking-wider font-bold">Inicio</span>
            </Link>

            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    <ChevronRight className="w-3 h-3 mx-2 text-slate-300" />
                    {item.path ? (
                        <Link
                            to={item.path}
                            className="hover:text-cielo-gold transition-colors uppercase tracking-wider font-bold"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-slate-900 dark:text-white uppercase tracking-wider font-bold truncate max-w-[150px] sm:max-w-none">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
};
