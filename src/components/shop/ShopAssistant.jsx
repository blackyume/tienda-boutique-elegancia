import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useStore } from '../../context/StoreContext';
import { formatMoney } from '../../utils/helpers';

export const ShopAssistant = () => {
    const { inventory, siteConfig } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: '¡Hola! 👋 Bienvenido a La Boutique. Soy tu asistente personal. ¿Buscas algún vestido o estilo en particular?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const listRef = useRef(null);

    // Hardcoded Key for Demo (Use Env Var in Prod)
    // We reuse the key authorized by user, safe to expose to client if domain restricted (or proxy in future)
    const API_KEY = "AIzaSyC_2YjBlbTdkn-Bvni-FgaNVxd9VACRci8";

    // Auto-scroll
    useEffect(() => {
        if (isOpen) {
            listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // --- CONTEXT PREPARATION (SAFE DATA ONLY) ---
            // Only send Name, Category, Price. NO Cost, NO Stock Count (just bool).
            const safeInventory = inventory.map(p =>
                `- ${p.name} (${p.category}): ${formatMoney(p.price)} [${p.stock > 0 ? 'En Stock' : 'Agotado'}] (ID: ${p.id})`
            ).slice(0, 40).join('\n'); // Limit context size

            const prompt = `
                Eres "Assistant", el vendedor virtual de la tienda de lujo "La Boutique de la Elegancia".
                
                ** Tu Personalidad: **
                - Amable, sofisticado y servicial.
                - Usas emojis con moderación ✨.
                - Tu objetivo es ayudar a encontrar el producto ideal y cerrar la venta.

                ** Tus Herramientas: **
                - Si te preguntan por un producto, búscalo en la lista y devuelve su LINK: https://la-boutique-de-la-elegancia.web.app/product/{ID}
                - Si te preguntan por envíos: "Hacemos envíos a todo el país."
                - Si te preguntan quiénes somos: "Somos una marca de diseño exclusivo."

                ** Catálogo Disponible (Resumen Privado): **
                ${safeInventory}

                ** Cliente dice: **
                ${userMsg.text}
            `;

            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            setMessages(prev => [...prev, { role: 'ai', text: responseText }]);

        } catch (error) {
            console.error(error);
            // Fallback Local Response
            const lower = userMsg.text.toLowerCase();
            let fallback = "Disculpa, estoy teniendo un momento de desconexión. ¿Podrías intentar de nuevo?";

            if (lower.includes('vestido') || lower.includes('precio')) {
                fallback = "Tenemos una hermosa colección. Te sugiero explorar la sección 'Shop' para ver precios y modelos.";
            } else if (lower.includes('envio') || lower.includes('envío')) {
                fallback = "Realizamos envíos a todo el país. El costo se calcula en el checkout.";
            }

            setMessages(prev => [...prev, { role: 'ai', text: fallback }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

            {/* CHAT WINDOW */}
            {isOpen && (
                <div className="mb-4 w-[350px] max-w-[calc(100vw-32px)] h-[500px] bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-slideUp pointer-events-auto">
                    {/* Header */}
                    <div className="bg-[#1e1e1e] p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C19A6B] to-[#e5c29f] flex items-center justify-center text-white shadow-lg">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-wide">La Boutique AI</h3>
                                <p className="text-[10px] text-white/60 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    En línea
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="opacity-70 hover:opacity-100 transition-opacity">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#151c2c]">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] ${msg.role === 'ai' ? 'bg-gradient-to-tr from-[#C19A6B] to-[#b08d55] text-white' : 'bg-slate-300 text-slate-600'}`}>
                                    {msg.role === 'ai' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                </div>
                                <div className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${msg.role === 'ai' ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm rounded-tl-none' : 'bg-[#1e1e1e] text-white rounded-tr-none'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-2">
                                <div className="ml-9 bg-white dark:bg-slate-700 p-2 rounded-xl rounded-tl-none shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white dark:bg-[#1e293b] border-t border-slate-100 dark:border-slate-800">
                        <div className="relative flex items-center">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Escribe tu consulta..."
                                className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-full py-2.5 pl-4 pr-10 text-xs focus:ring-1 focus:ring-[#C19A6B] outline-none text-slate-800 dark:text-white"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="absolute right-1 w-8 h-8 bg-[#C19A6B] rounded-full flex items-center justify-center text-white hover:bg-[#a38056] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-3.5 h-3.5 ml-0.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TOGGLE BUTTON */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 pointer-events-auto hover:scale-105 active:scale-95 ${isOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-gradient-to-r from-[#C19A6B] to-[#b08d55] text-white animate-bounce-slow'}`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
            </button>
        </div>
    );
};
