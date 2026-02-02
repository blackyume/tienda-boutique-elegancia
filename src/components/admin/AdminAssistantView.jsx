import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, ToggleLeft, ToggleRight, Key, ExternalLink, Copy, Check, Paperclip, X, Image as ImageIcon, HelpCircle, BookOpen, Calculator, PenTool, Search } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useStore } from '../../context/StoreContext';
import { formatMoney } from '../../utils/helpers';

export const AdminAssistantView = ({ orders, inventory }) => {
    const { siteConfig, addProduct, updateProduct, addCategory, toggleMaintenance, isMaintenance, uploadImage } = useStore();
    const [messages, setMessages] = useState([
        { role: 'ai', text: '¡Hola Laura! Soy tu copiloto. ¿En qué puedo ayudarte hoy?\nPuedo analizar ventas, buscar productos o redactar contenido de marketing.' }
    ]);
    const [input, setInput] = useState('');
    const [isAiMode, setIsAiMode] = useState(true); // Default to AI Mode
    const [showHelp, setShowHelp] = useState(false); // Help Tab State
    const [apiKey, setApiKey] = useState('AIzaSyC_2YjBlbTdkn-Bvni-FgaNVxd9VACRci8'); // Default Key
    const [showKey, setShowKey] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const listRef = useRef(null);
    const fileInputRef = useRef(null);

    // File Handlers
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const fileToGenerativePart = async (file) => {
        const base64EncodedDataPromise = new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(file);
        });
        return {
            inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
        };
    };

    // Auto-scroll
    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            let responseText = '';

            if (isAiMode && apiKey) {
                // --- GEMINI AI MODE ---
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                // Prepare Context
                const salesToday = orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString());
                const totalSalesToday = salesToday.reduce((acc, o) => acc + o.total, 0);
                const lowStock = inventory.filter(p => p.stock < 5).map(p => `${p.name} (${p.stock})`).join(', ');
                const lastOrders = orders.slice(0, 5).map(o =>
                    `Pedido #${o.id.toString().slice(-4)}: ${o.customer?.name || 'Cliente'} (${o.customer?.email}) - $${o.total} - Dir: ${o.shipping?.address || 'Retiro'} ${o.shipping?.city || ''} CP:${o.shipping?.zip || ''}`
                ).join('\n');

                // --- ADVANCED METRICS ---
                // 1. Mejores Clientes (VIP)
                const customers = {};
                orders.forEach(o => {
                    const email = o.customer?.email || 'Anonimo';
                    if (!customers[email]) customers[email] = { name: o.customer?.name, spent: 0, count: 0 };
                    customers[email].spent += o.total;
                    customers[email].count += 1;
                });
                const topCustomers = Object.values(customers)
                    .sort((a, b) => b.spent - a.spent)
                    .slice(0, 3)
                    .map(c => `- ${c.name || c.email}: $${c.spent} (${c.count} pedidos)`)
                    .join('\n');

                // 2. Tendencias (Colores y Categorias)
                const trends = { colors: {}, cats: {} };
                orders.forEach(o => o.items.forEach(item => {
                    const product = inventory.find(p => p.id === item.id) || item;
                    // Count Colors (if available in item or product)
                    if (item.selectedColor) {
                        trends.colors[item.selectedColor] = (trends.colors[item.selectedColor] || 0) + item.quantity;
                    }
                    // Count Categories
                    if (product.category) {
                        trends.cats[product.category] = (trends.cats[product.category] || 0) + item.quantity;
                    }
                }));
                const topColor = Object.entries(trends.colors).sort((a, b) => b[1] - a[1])[0];
                const topCat = Object.entries(trends.cats).sort((a, b) => b[1] - a[1])[0];
                const trendText = `Color Top: ${topColor ? topColor[0] : 'N/A'}, Categoria Top: ${topCat ? topCat[0] : 'N/A'}`;

                // 3. Rentabilidad (Margen)
                // Find product with highest margin %
                const profitableProduct = inventory.reduce((prev, current) => {
                    const prevCost = Number(prev.cost || 0) + Number(prev.shippingCost || 0) + Number(prev.packagingCost || 0) + Number(prev.fixedFee || 0);
                    const currCost = Number(current.cost || 0) + Number(current.shippingCost || 0) + Number(current.packagingCost || 0) + Number(current.fixedFee || 0);

                    const prevMargin = prev.price > 0 ? (prev.price - prevCost) / prev.price : 0;
                    const currMargin = current.price > 0 ? (current.price - currCost) / current.price : 0;

                    return (currMargin > prevMargin) ? current : prev;
                }, inventory[0] || {});

                const highMarginText = profitableProduct ? `${profitableProduct.name} (Margen: ${((1 - ((Number(profitableProduct.cost || 0) + Number(profitableProduct.shippingCost || 0)) / Number(profitableProduct.price))) * 100).toFixed(0)}%)` : 'N/A';

                // 4. Performance & Psychology (Vistas vs Ventas)
                // Need to aggregate sales quantity per product from orders
                const salesByProduct = {};
                orders.forEach(o => o.items.forEach(i => {
                    const pid = i.id;
                    salesByProduct[pid] = (salesByProduct[pid] || 0) + i.quantity;
                }));

                const performanceAnalysis = inventory.map(p => {
                    const sales = salesByProduct[p.id] || 0;
                    const views = p.views || 0;
                    const conversion = views > 0 ? ((sales / views) * 100).toFixed(1) : 0;
                    return { ...p, sales, views, conversion };
                }).filter(p => p.views > 0 || p.sales > 0);

                const lowConversion = performanceAnalysis
                    .filter(p => p.views > 10 && p.sales === 0)
                    .map(p => `- ${p.name}: ${p.views} vistas, 0 ventas (Posible precio alto o mala foto)`)
                    .join('\n');

                const highConversion = performanceAnalysis
                    .sort((a, b) => b.conversion - a.conversion)
                    .slice(0, 3)
                    .map(p => `- ${p.name}: ${p.conversion}% conv. (${p.sales} vtas / ${p.views} vis)`)
                    .join('\n');

                // --- COMMAND PARSER ---
                const handleCommands = async (text) => {
                    const lines = text.split('\n');
                    for (const line of lines) {
                        if (line.includes('[ACTION:')) {
                            const actionContent = line.substring(line.indexOf('[ACTION:') + 8, line.lastIndexOf(']'));
                            const parts = actionContent.split(':');
                            const type = parts[0];

                            try {
                                if (type === 'MAINTENANCE') {
                                    const mode = parts[1]; // ON or OFF
                                    if ((mode === 'ON' && !isMaintenance) || (mode === 'OFF' && isMaintenance)) {
                                        await toggleMaintenance();
                                    }
                                } else if (type === 'CREATE_CATEGORY') {
                                    await addCategory(parts[1]);
                                } else if (type === 'UPDATE_PRICE') {
                                    const id = Number(parts[1]);
                                    const price = Number(parts[2]);
                                    await updateProduct(id, { price });
                                } else if (type === 'UPDATE_STOCK') {
                                    const id = Number(parts[1]);
                                    const stock = Number(parts[2]);
                                    await updateProduct(id, { stock });
                                } else if (type === 'UPDATE_PRODUCT') {
                                    const id = Number(parts[1]);
                                    // The rest is JSON
                                    const jsonStr = actionContent.substring(actionContent.indexOf('{'));
                                    const data = JSON.parse(jsonStr);
                                    await updateProduct(id, data);
                                } else if (type === 'CREATE_PRODUCT') {
                                    const jsonStr = actionContent.substring(actionContent.indexOf('{'));
                                    const data = JSON.parse(jsonStr);
                                    await addProduct({
                                        id: Date.now() + Math.floor(Math.random() * 1000),
                                        name: data.name,
                                        price: Number(data.price),
                                        stock: Number(data.stock || 0),
                                        category: data.category || 'General',
                                        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop', // Placeholder Default
                                        active: true,
                                        description: 'Creado por IA'
                                    });
                                }
                            } catch (err) {
                                console.error("Error executing AI command:", err);
                            }
                        }
                    }
                };

                // System Prompt
                const prompt = `
                    Eres el asistente IA y OPERADOR de la tienda "La Boutique de la Elegancia". 
                    Hablas con Laura (Dueña).
                    
                    ** TUS SUPERPODERES (Comandos Reales): **
                    Puedes ejecutar acciones reales en la base de datos escribiendo comandos precisos entre corchetes.
                    
                    1. **Crear Categoría:** [ACTION:CREATE_CATEGORY:Nombre]
                    2. **Modo Mantenimiento:** [ACTION:MAINTENANCE:ON] o [ACTION:MAINTENANCE:OFF]
                    3. **Actualizar Precio:** [ACTION:UPDATE_PRICE:ID_Producto:NuevoPrecio]
                    4. **Actualizar Stock:** [ACTION:UPDATE_STOCK:ID_Producto:NuevoStock]
                    5. **Modificar Producto/SEO:** [ACTION:UPDATE_PRODUCT:ID_Producto:{"description":"..."}]
                    6. **Crear Producto:** [ACTION:CREATE_PRODUCT:{"name":"Nombre",...}]
                       (Solo usa este si el producto NO existe en el inventario).

                    ** Contexto del Negocio: **
                    - Estado Mantenimiento: ${isMaintenance ? 'ON' : 'OFF'}
                    - Ventas Hoy: ${formatMoney(totalSalesToday)} (${salesToday.length} pedidos)
                    - Clientes VIP: 
                    ${topCustomers}
                    - Tendencia Moda: ${trendText}
                    - Producto Estrella (Rentabilidad): ${highMarginText}
                    - Stock Bajo: ${lowStock || 'Ninguno'}
                    - Últimos Pedidos: 
                    ${lastOrders}
                    
                    ** Performance & CRM (Psicología de Venta): **
                    - Productos con ALTA visibilidad pero 0 ventas (HACER ALGO):
                    ${lowConversion || "Ninguno crítico"}
                    - Mejores Conversiones:
                    ${highConversion}

                    ** Tus Instrucciones: **
                    1. Si Laura te pide "crear" o "cargar" productos y NO existen, genera el comando [ACTION:CREATE_PRODUCT:...].
                    2. Si pide cerrar/abrir tienda, usa [ACTION:MAINTENANCE:...].
                    3. ** MARKETING **: Si pide un "Post de Instagram/Facebook":
                       - Genera un texto atractivo con emojis y hashtags.
                       - Usa la información real de los productos.
                       - Formato sugerido: [IMAGEN_URL_SI_TIENES] + \n + COPY + \n + HASHTAGS.
                    4. ** SEO **: Si pide "Optimizar SEO" de un producto:
                       - Analiza su nombre y descripción actual.
                       - Genera un comando [ACTION:UPDATE_PRODUCT:ID_PRODUCTO:{"description": "NUEVA DESCRIPCION OPTIMIZADA..."}]
                       - La descripción debe incluir keywords de moda, ser persuasiva y tener estructura.
                    5. ** CRM **: Si pregunta "Por qué no se vende X":
                       - Mira la sección de Performance. Si tiene muchas vistas y 0 ventas, sugiere bajar precio o mejorar fotos.
                    6. ** VISION **: Si te envían una IMAGEN:
                       - Descríbela detalladamente.
                       - Si parece un producto para vender, sugiere el comando [ACTION:CREATE_PRODUCT:...] completando los datos que ves (nombre, color, categoria).
                       - Usa esta URL para la imagen del producto: [URL_IMAGEN_SUBIDA]
                    
                    ** Inventario Real (Busca aquí IDs para actualizar): **
                    ${inventory.map(p => `- ${p.name} (ID: ${p.id}, $${p.price}, Stock: ${p.stock}, Image: ${p.image})`).join('\n')}

                    ** Laura dice: **
                    ${userMsg.text}
                `;

                // Handle Image + Text or Text Only
                let result;
                if (selectedFile) {
                    const imagePart = await fileToGenerativePart(selectedFile);
                    const uploadedUrl = await uploadImage(selectedFile); // Upload to Cloudinary to get URL
                    const finalPrompt = prompt.replace('[URL_IMAGEN_SUBIDA]', uploadedUrl);
                    result = await model.generateContent([finalPrompt, imagePart]);
                    clearFile(); // Clear after sending
                } else {
                    result = await model.generateContent(prompt);
                }

                responseText = result.response.text();

                // Execute Generated Commands
                await handleCommands(responseText);

                // Add Feedback to Message if actions were taken
                if (responseText.includes('[ACTION:')) {
                    // Clean numeric IDs for display or just hide the raw action tag if desired
                    // For now we keep it or replace it with a checkmark
                    responseText = responseText.replace(/\[ACTION:.*?\]/g, '✅ [Acción Ejecutada]');
                }

                setMessages(prev => [...prev, { role: 'ai', text: responseText }]);

            } else {
                // --- LOCAL MODE (Regex) ---
                const lower = userMsg.text.toLowerCase();

                if (lower.includes('venta') || lower.includes('vendido')) {
                    const total = orders.reduce((acc, o) => acc + o.total, 0);
                    responseText = `El total histórico de ventas es ${formatMoney(total)}.`;
                } else if (lower.includes('stock') || lower.includes('inventario')) {
                    const low = inventory.filter(p => p.stock < 5);
                    responseText = low.length > 0
                        ? `Alerta: Tienes ${low.length} productos con poco stock: ${low.map(p => p.name).join(', ')}.`
                        : 'El inventario se ve saludable.';
                } else if (lower.includes('hola') || lower.includes('ayuda')) {
                    responseText = '¡Hola! En modo local puedo decirte totales de ventas y alertas de stock. Activa la IA para más magia.';
                } else {
                    responseText = 'Comando no reconocido en Modo Local. Intenta preguntar por "ventas" o "stock".';
                }
            }

            setMessages(prev => [...prev, { role: 'ai', text: responseText }]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'ai', text: 'Error: No pude conectar con el cerebro de la IA. Verifica tu API Key o conexión.' }]);
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
        <div className="relative max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col rounded-3xl overflow-hidden animate-fadeIn border border-white/10 shadow-2xl shadow-black/50">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-slate-950">
                <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-amber-500/10 blur-[120px] rounded-full mix-blend-screen animate-pulse [animation-delay:2s]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]"></div>
            </div>

            {/* Header / Toolbar */}
            <div className="relative z-10 p-5 backdrop-blur-md bg-white/5 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl shadow-lg border border-white/20 ${isAiMode ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-indigo-500/20' : 'bg-slate-700'} text-white relative overflow-hidden group`}>
                        <div className="absolute inset-0 bg-white/20 skew-x-12 -translate-x-10 group-hover:translate-x-20 transition-transform duration-700 ease-in-out"></div>
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
                            Admin Copilot <span className="font-normal text-indigo-400">| Laura</span>
                        </h2>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${isAiMode ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`}></span>
                            {isAiMode ? 'Cerebro Gemini: Conectado' : 'Modo Seguro Local'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Help Toggle */}
                    <button
                        onClick={() => setShowHelp(!showHelp)}
                        className={`p-2 transition-colors rounded-lg ${showHelp ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-white'}`}
                        title="Ver Capacidades"
                    >
                        <BookOpen className="w-5 h-5" />
                    </button>

                    {/* Mode Toggle */}
                    <button
                        onClick={() => setIsAiMode(!isAiMode)}
                        className={`group relative px-4 py-2 rounded-full text-xs font-bold transition-all border ${isAiMode
                            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200 hover:bg-indigo-500/30'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                            }`}
                    >
                        <div className="flex items-center gap-2 relative z-10">
                            {isAiMode ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            {isAiMode ? 'IA Activada' : 'Solo Local'}
                        </div>
                    </button>

                    {/* API Key Toggle */}
                    <button onClick={() => setShowKey(!showKey)} className="p-2 text-slate-500 hover:text-white transition-colors">
                        <Key className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Key Input (Collapsible) */}
            {showKey && (
                <div className="p-4 bg-slate-100 dark:bg-black/20 border-b border-slate-200 dark:border-slate-800 animate-slideDown">
                    <label className="text-xs font-bold text-slate-500 block mb-1">Google Gemini API Key</label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500"
                        placeholder="AIza..."
                    />
                </div>
            )}

            {/* Content Area (Chat or Help) */}
            {showHelp ? (
                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-indigo-500/20 scrollbar-track-transparent animate-fadeIn">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-white mb-2">Capacidades del Sistema</h3>
                        <p className="text-slate-400">Guía rápida de todo lo que Laura puede hacer por ti.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Card 1: Marketing */}
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2">Marketing Guru</h4>
                            <p className="text-sm text-slate-400 mb-4">Crea contenido para redes sociales al instante.</p>
                            <div className="bg-black/30 p-3 rounded-lg text-xs text-slate-300 font-mono">
                                "Crea un post para Instagram del Vestido Rojo"
                            </div>
                        </div>

                        {/* Card 2: CRM & Ventas */}
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Calculator className="w-6 h-6" />
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2">Analista CRM</h4>
                            <p className="text-sm text-slate-400 mb-4">Detecta problemas de conversión y oportunidades.</p>
                            <div className="bg-black/30 p-3 rounded-lg text-xs text-slate-300 font-mono">
                                "¿Por qué no se vende el Pantalón Azul?"
                            </div>
                        </div>

                        {/* Card 3: Operaciones */}
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Key className="w-6 h-6" />
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2">Operaciones</h4>
                            <p className="text-sm text-slate-400 mb-4">Control total de la tienda con comandos.</p>
                            <ul className="space-y-2 text-xs text-slate-400">
                                <li className="flex gap-2 items-center"><Check className="w-3 h-3 text-green-400" /> "Cierra la tienda (Mantenimiento)"</li>
                                <li className="flex gap-2 items-center"><Check className="w-3 h-3 text-green-400" /> "Sube el stock del ID 123 a 50"</li>
                                <li className="flex gap-2 items-center"><Check className="w-3 h-3 text-green-400" /> "Cambia el precio del Vestido a $15000"</li>
                            </ul>
                        </div>

                        {/* Card 4: SEO & Vision */}
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Search className="w-6 h-6" />
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2">SEO & Visión</h4>
                            <p className="text-sm text-slate-400 mb-4">Optimización automática y análisis de fotos.</p>
                            <div className="bg-black/30 p-3 rounded-lg text-xs text-slate-300 font-mono mb-2">
                                "Mejora el SEO del producto ID 45"
                            </div>
                            <div className="bg-black/30 p-3 rounded-lg text-xs text-slate-300 font-mono">
                                [Sube una foto] "¿Qué producto es este?"
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Chat Area */
                <div ref={listRef} className="relative z-10 flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-indigo-500/20 scrollbar-track-transparent">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''} group animate-slideUp fade-in-0 duration-500`}>
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/10 ${msg.role === 'ai'
                                ? 'bg-slate-900/80 text-indigo-400'
                                : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-orange-500/20'
                                }`}>
                                {msg.role === 'ai' ? <Sparkles className="w-5 h-5" /> : <User className="w-5 h-5" />}
                            </div>

                            {/* Bubble */}
                            <div className={`max-w-[75%] backdrop-blur-md rounded-3xl p-6 text-[15px] leading-7 shadow-xl ${msg.role === 'ai'
                                ? 'bg-slate-900/60 border border-white/5 text-slate-200 rounded-tl-none'
                                : 'bg-white/10 border border-white/10 text-white rounded-tr-none bg-gradient-to-br from-white/10 to-transparent'
                                }`}>
                                {msg.image && (
                                    <div className="mb-4 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                                        <img src={msg.image} alt="Uploaded content" className="w-full h-auto" />
                                    </div>
                                )}
                                <div className="whitespace-pre-wrap font-light tracking-wide">{msg.text}</div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-5 items-center pl-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center animate-spin-slow border border-indigo-500/30">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div className="flex gap-1.5">
                                <span className="w-1.5 h-1.5 bg-indigo-400/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-indigo-400/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-indigo-400/50 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Input Area */}
            <div className="relative z-10 p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
                <div className={`relative transition-all duration-300 ${isAiMode ? 'shadow-[0_0_40px_-5px_rgba(99,102,241,0.3)]' : ''}`}>

                    {/* Floating Preview */}
                    {previewUrl && (
                        <div className="absolute bottom-full left-4 mb-4 p-2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl animate-slideUp">
                            <img src={previewUrl} alt="Preview" className="h-24 rounded-lg object-cover" />
                            <button onClick={clearFile} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    {/* Main Input Capsule */}
                    <div className={`flex items-end gap-2 p-2 rounded-[2rem] border transition-all duration-300 ${isAiMode
                        ? 'bg-slate-900/80 border-indigo-500/30 ring-1 ring-indigo-500/20'
                        : 'bg-slate-800 border-slate-700'
                        }`}>

                        {/* File Button */}
                        <div className="relative">
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className={`p-3 rounded-full transition-colors ${selectedFile
                                    ? 'bg-indigo-500 text-white rotate-12'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                title="Adjuntar Imagen"
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Textarea */}
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isAiMode ? "Escribe un comando o sube una foto..." : "Comandos locales activados..."}
                            className="w-full bg-transparent border-none text-slate-200 placeholder:text-slate-500 py-3 text-[15px] max-h-[120px] resize-none focus:ring-0 leading-relaxed font-light"
                            rows="1"
                        />

                        {/* Send Button */}
                        <button
                            onClick={handleSend}
                            disabled={(!input.trim() && !selectedFile) || loading}
                            className={`p-3 rounded-full transition-all duration-300 ${(input.trim() || selectedFile) && !loading
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/40 hover:scale-105 active:scale-95'
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                }`}
                        >
                            <Send className="w-5 h-5 translate-x-0.5" />
                        </button>
                    </div>

                    <p className="text-[10px] text-center text-slate-600 mt-4 font-medium tracking-wider uppercase opacity-60">
                        {isAiMode ? '✨ System AI Online • Ready for commands' : '🔒 Local Secure Mode'}
                    </p>
                </div>
            </div>
        </div>
    );
};
