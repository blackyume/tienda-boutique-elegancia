import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFound = () => {
    const navigate = useNavigate();
    return (
        <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-black">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0 opacity-40">
                <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=2000"
                    className="w-full h-full object-cover"
                    alt="Fashion background"
                />
            </div>

            <div className="relative z-10 text-center px-6 max-w-2xl">
                <span className="text-[#D4AF37] font-bold tracking-[0.4em] uppercase text-xs mb-4 block animate-fadeIn">Error 404</span>
                <h1 className="text-6xl md:text-8xl font-cinzel font-bold text-white mb-6 text-shadow-lg animate-slideUp">
                    Extraviado en <br /><span className="italic font-serif font-light">el Lujo</span>
                </h1>
                <p className="text-slate-300 text-lg font-light mb-10 leading-relaxed animate-slideUp delay-100">
                    La página que buscas no existe o ha sido movida a una colección privada.
                </p>
                <div className="animate-slideUp delay-200">
                    <Button onClick={() => navigate('/')} className="bg-white text-black hover:bg-[#D4AF37] hover:text-white px-10 py-4 rounded-none font-bold tracking-[0.2em] transform transition-all duration-500 hover:scale-105">
                        VOLVER A LA BOUTIQUE
                    </Button>
                </div>
            </div>
        </div>
    );
};