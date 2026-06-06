import React from 'react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Award, Heart, Truck, ShieldCheck, Instagram, MapPin } from 'lucide-react';

export const About = () => {
    const navigate = useNavigate();

    return (
        <div className="pt-24 pb-0 animate-fadeIn bg-white dark:bg-slate-950 font-sans overflow-x-hidden">

            {/* HERO PARALLAX */}
            <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-fixed transform scale-105"
                ></div>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                <div className="relative z-10 text-center text-white px-4 max-w-4xl">
                    <span className="block text-[#D4AF37] font-bold tracking-[0.3em] uppercase mb-4 animate-slideDown">Nuestra Historia</span>
                    <h1 className="text-5xl md:text-7xl font-cinzel font-bold mb-6 text-shadow-lg leading-tight">
                        Más que Moda, <br /> <span className="italic font-serif">Un Legado.</span>
                    </h1>
                    <p className="text-lg md:text-xl font-light text-white/90 max-w-2xl mx-auto leading-relaxed">
                        Desde 2018, redefiniendo la elegancia contemporánea con raíces argentinas y visión global.
                    </p>
                </div>
            </div>

            {/* THE VISION STORY */}
            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="flex flex-col md:flex-row items-center gap-16">
                    <div className="w-full md:w-1/2 space-y-8">
                        <div>
                            <span className="text-[#D4AF37] font-bold tracking-widest uppercase text-xs">La Visión</span>
                            <h2 className="text-4xl font-serif text-slate-900 dark:text-white mt-2 mb-6">Diseño con Propósito</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed font-light">
                            La Boutique nació de una idea simple pero poderosa: la moda no debe sacrificar comodidad por elegancia. Creemos instintivamente que lo que usas afecta cómo te sientes.
                        </p>
                        <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed font-light">
                            Cada pieza de nuestra colección es seleccionada minuciosamente, no por tendencia, sino por <strong>atemporalidad</strong>. Buscamos prendas que vivan en tu guardarropa por años, contando historias en cada uso.
                        </p>
                        <div className="pt-4 flex gap-4">
                            <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl w-32 border border-slate-100 dark:border-slate-800">
                                <span className="text-3xl font-bold text-[#D4AF37] font-cinzel">5+</span>
                                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mt-1">Años de Exp.</span>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl w-32 border border-slate-100 dark:border-slate-800">
                                <span className="text-3xl font-bold text-[#D4AF37] font-cinzel">10k+</span>
                                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mt-1">Clientas Felices</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2 relative">
                        <div className="absolute top-10 -right-10 w-full h-full border-2 border-[#D4AF37] rounded-none z-0 hidden md:block"></div>
                        <img
                            src="https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=80&w=1372"
                            className="relative z-10 w-full h-[600px] object-cover shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
                            alt="Fashion Editorial"
                        />
                    </div>
                </div>
            </div>

            {/* VALUES GRID */}
            <div className="bg-slate-50 dark:bg-[#0A0A0A] py-24 border-y border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-[#D4AF37] font-bold tracking-[0.2em] uppercase text-xs mb-2 block">Nuestros Pilares</span>
                        <h3 className="text-3xl font-serif text-slate-900 dark:text-white">Compromiso de Calidad</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ValueCard
                            icon={Award}
                            title="Excelencia Textil"
                            desc="Trabajamos únicamente con materiales premium que resisten el paso del tiempo y el uso diario."
                        />
                        <ValueCard
                            icon={Heart}
                            title="Atención Personal"
                            desc="No somos un algoritmo. Detrás de cada pedido hay un equipo dedicado a asesorarte."
                        />
                        <ValueCard
                            icon={ShieldCheck}
                            title="Garantía de Confianza"
                            desc="Revisamos manualmente cada prenda antes del envío para asegurar perfección absoluta."
                        />
                    </div>
                </div>
            </div>

            {/* UNBOXING EXPERIENCE */}
            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="flex flex-col-reverse md:flex-row items-center gap-16">
                    <div className="w-full md:w-1/2 relative">
                        <img
                            src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1992&auto=format&fit=crop"
                            className="w-full h-[500px] object-cover rounded-sm shadow-2xl grayscale-[20%]"
                            alt="Luxury Packaging"
                        />
                        <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#0A0A0A] p-6 hidden md:flex items-center justify-center text-center border border-white/10 shadow-xl">
                            <span className="text-[#D4AF37] font-serif italic text-xl">"Cada entrega es un regalo."</span>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2 space-y-8">
                        <div>
                            <span className="text-[#D4AF37] font-bold tracking-widest uppercase text-xs">La Experiencia</span>
                            <h2 className="text-4xl font-serif text-slate-900 dark:text-white mt-2 mb-6">El Arte de Recibir</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed font-light">
                            Sabemos que comprar online requiere confianza. Por eso, hemos diseñado una experiencia de unboxing que supera las expectativas.
                        </p>
                        <ul className="space-y-4 pt-4">
                            {[
                                "Packaging rígido de protección premium.",
                                "Papel de seda y perfumado característico.",
                                "Tarjeta de autenticidad y cuidados.",
                                "Envío asegurado a todo el país."
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-light">
                                    <span className="w-2 h-2 bg-[#D4AF37] rounded-full"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* VISIT US / CONTACT */}
            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="bg-[#1a1a1a] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[400px]">
                    <div className="w-full md:w-1/2 bg-[url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070')] bg-cover bg-center relative">
                        <div className="absolute inset-0 bg-[#D4AF37]/20 mix-blend-multiply"></div>
                    </div>
                    <div className="w-full md:w-1/2 p-12 lg:p-16 flex flex-col justify-center text-white">
                        <h3 className="text-3xl font-cinzel font-bold mb-6">Experiencia Digital</h3>
                        <p className="text-slate-300 font-light text-lg mb-8 leading-relaxed">
                            Nuestra boutique opera exclusivamente online, llevando la moda de alta costura directamente a tu puerta. Cada envío es preparado con la dedicación de un regalo personal.
                        </p>

                        <div className="space-y-4 mb-10">
                            <div className="flex items-center gap-4 text-slate-300">
                                <div className="p-2 bg-white/10 rounded-full"><MapPin className="w-5 h-5 text-[#D4AF37]" /></div>
                                <span className="font-light">Envíos desde Rafaela, Argentina</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-300">
                                <div className="p-2 bg-white/10 rounded-full"><Instagram className="w-5 h-5 text-[#D4AF37]" /></div>
                                <span className="font-light">@laboutique.elegancia</span>
                            </div>
                        </div>

                        <Button onClick={() => navigate('/')} className="bg-[#D4AF37] hover:bg-white hover:text-black text-white px-8 py-4 rounded-none font-bold tracking-[0.2em] w-fit transition-all duration-300">
                            EXPLORAR COLECCIÓN
                        </Button>
                    </div>
                </div>
            </div>

        </div>
    );
};

const ValueCard = ({ icon: Icon, title, desc }) => (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
        <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#D4AF37] transition-colors duration-300">
            <Icon className="w-7 h-7 text-[#D4AF37] group-hover:text-white transition-colors" />
        </div>
        <h4 className="text-xl font-serif text-slate-900 dark:text-white mb-3">{title}</h4>
        <p className="text-slate-500 dark:text-slate-400 font-light leading-relaxed text-sm">
            {desc}
        </p>
    </div>
);