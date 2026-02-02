import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';

export const SizeGuideModal = ({ onClose }) => {
    const [tab, setTab] = useState('tops'); // 'tops' or 'bottoms'

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-slideUp border border-slate-200 dark:border-slate-700">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <h3 className="font-serif text-xl text-slate-900 dark:text-white flex items-center gap-2">
                        <Ruler className="w-5 h-5 text-[#C19A6B]" /> Guía de Talles
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 dark:text-white" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 dark:border-slate-800">
                    <button 
                        onClick={() => setTab('tops')} 
                        className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${tab === 'tops' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-b-2 border-[#C19A6B]' : 'bg-slate-50 dark:bg-slate-950 text-slate-400'}`}
                    >
                        Partes de Arriba
                    </button>
                    <button 
                        onClick={() => setTab('bottoms')} 
                        className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${tab === 'bottoms' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-b-2 border-[#C19A6B]' : 'bg-slate-50 dark:bg-slate-950 text-slate-400'}`}
                    >
                        Partes de Abajo
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 mb-6">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs">
                                <tr>
                                    <th className="p-3 pl-4">Talle</th>
                                    <th className="p-3">{tab === 'tops' ? 'Busto (cm)' : 'Cintura (cm)'}</th>
                                    <th className="p-3">{tab === 'tops' ? 'Largo (cm)' : 'Cadera (cm)'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                {tab === 'tops' ? (
                                    <>
                                        <tr><td className="p-3 pl-4 font-bold">S</td><td>85 - 90</td><td>50</td></tr>
                                        <tr><td className="p-3 pl-4 font-bold">M</td><td>90 - 95</td><td>52</td></tr>
                                        <tr><td className="p-3 pl-4 font-bold">L</td><td>95 - 100</td><td>54</td></tr>
                                        <tr><td className="p-3 pl-4 font-bold">XL</td><td>100 - 105</td><td>56</td></tr>
                                    </>
                                ) : (
                                    <>
                                        <tr><td className="p-3 pl-4 font-bold">36 (S)</td><td>60 - 64</td><td>88 - 92</td></tr>
                                        <tr><td className="p-3 pl-4 font-bold">38 (M)</td><td>64 - 68</td><td>92 - 96</td></tr>
                                        <tr><td className="p-3 pl-4 font-bold">40 (L)</td><td>68 - 72</td><td>96 - 100</td></tr>
                                        <tr><td className="p-3 pl-4 font-bold">42 (XL)</td><td>72 - 76</td><td>100 - 104</td></tr>
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                        <strong>Tip de medición:</strong> {tab === 'tops' ? 'Mide el contorno de tu busto por la parte más saliente y el largo desde el hombro hasta la cadera.' : 'Mide tu cintura por la parte más estrecha y tu cadera por la parte más ancha de los glúteos.'}
                        <br/>
                        <span className="opacity-70 mt-1 block">Si estás entre dos talles, te recomendamos elegir el más grande para mayor comodidad.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};