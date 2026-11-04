import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs = ({ items }) => {
    // items example: [{ label: 'Shop', path: '/shop' }, { label: 'Camisas', path: '/shop/camisas' }, { label: 'Camisa Oxford', active: true }]

    return (
        <nav className="flex items-center whitespace-nowrap overflow-hidden text-xs text-slate-500 mb-6 animate-fadeIn">
            <Link to="/" className="hover:text-cielo-gold transition-colors flex items-center gap-1 shrink-0">
                <Home className="w-3 h-3" />
                <span className="uppercase tracking-wider font-bold">Inicio</span>
            </Link>

            {items.map((item, index) => (
                // En celular no entra todo: el nombre de la prenda ya es el título de la ficha.
                <div key={index} className={`${!item.path && items.length > 2 ? 'hidden sm:flex' : 'flex'} items-center min-w-0 ${item.path ? 'sm:shrink-0' : ''}`}>
                    <ChevronRight className="w-3 h-3 mx-2 text-slate-300 shrink-0" />
                    {item.path ? (
                        <Link
                            to={item.path}
                            className="hover:text-cielo-gold transition-colors uppercase tracking-wider font-bold flex items-center min-w-0"
                        >
                            <span className="truncate">{item.label}</span>
                        </Link>
                    ) : (
                        <span className="text-slate-900 dark:text-white uppercase tracking-wider font-bold truncate">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
};
