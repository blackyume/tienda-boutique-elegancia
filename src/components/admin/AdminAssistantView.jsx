import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Bot, User, Sparkles, ToggleLeft, ToggleRight, Key, ExternalLink, Copy, Check, Paperclip, X, Image as ImageIcon, HelpCircle, BookOpen, Calculator, PenTool, Search, Bell, History, Calendar, TrendingUp, AlertTriangle, Activity, Settings } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useStore } from '../../context/StoreContext';
import { formatMoney } from '../../utils/helpers';

export const AdminAssistantView = ({ orders, inventory, onClose }) => {
    const {
        siteConfig, addProduct, updateProduct, addCategory, toggleMaintenance, isMaintenance, uploadImage,
        coupons, addCoupon, updateCoupon, deleteCoupon,
        suppliers, addSupplier, updateSupplier, deleteSupplier,
        categories, aiHistory, logAiAction, scheduledPromotions, addScheduledPromotion, executeScheduledPromotion
    } = useStore();

    // Load chat history from localStorage
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('laura_chat_history');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.warn('Error loading chat history', e);
            }
        }
        return [{ role: 'ai', text: '¡Hola Laura! Soy tu copiloto SUPERPODEROSO. 🚀\n\nPuedo manejar: Productos, Cupones, Proveedores, SEO, Marketing, Reportes, y más.\n\n💡 Tip: Preguntame "¿Qué debería reponer?" o "Crea cupón INVIERNO con 15%"' }];
    });
    const [input, setInput] = useState('');
    const [isAiMode, setIsAiMode] = useState(true); // Default to AI Mode
    const [showHelp, setShowHelp] = useState(false); // Help Tab State
    const [showKey, setShowKey] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'history', 'alerts'
    const listRef = useRef(null);
    const fileInputRef = useRef(null);
    const [activeModel, setActiveModel] = useState(null);

    // --- DAILY MESSAGE COUNTER ---
    const DAILY_LIMIT = 1500;
    const [dailyUsage, setDailyUsage] = useState(() => {
        const saved = localStorage.getItem('laura_daily_usage');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                const today = new Date().toDateString();
                // Reset if it's a new day
                if (data.date !== today) {
                    return { count: 0, date: today };
                }
                return data;
            } catch (e) {
                console.warn('Error loading daily usage', e);
            }
        }
        return { count: 0, date: new Date().toDateString() };
    });

    // Persist daily usage
    useEffect(() => {
        localStorage.setItem('laura_daily_usage', JSON.stringify(dailyUsage));
    }, [dailyUsage]);

    // Increment usage counter
    const incrementUsage = () => {
        setDailyUsage(prev => {
            const today = new Date().toDateString();
            if (prev.date !== today) {
                return { count: 1, date: today };
            }
            return { count: prev.count + 1, date: today };
        });
    };

    // --- AI CONNECTION STATE ---
    // V3: Force fresh start - clear old cached keys on first load
    const [apiKey, setApiKey] = useState(() => {
        // Clear ALL old versions on first load to force fresh key
        localStorage.removeItem('gemini_api_key');
        localStorage.removeItem('gemini_api_key_v2');
        const savedKey = localStorage.getItem('gemini_api_key_v3');
        return savedKey || '';
    });
    const [connectionStatus, setConnectionStatus] = useState(apiKey ? 'idle' : 'error');
    const [lastError, setLastError] = useState(apiKey ? null : 'Necesitás una API Key. Creá una en aistudio.google.com/app/apikey');

    // Persist API Key - V3
    useEffect(() => {
        if (apiKey && apiKey.startsWith('AIza')) {
            localStorage.setItem('gemini_api_key_v3', apiKey);
        }
    }, [apiKey]);

    // Persist chat history
    useEffect(() => {
        // Only save non-system messages to avoid clutter, limit to last 50 messages
        const toSave = messages.filter(m => !m.isSystem).slice(-50);
        localStorage.setItem('laura_chat_history', JSON.stringify(toSave));
    }, [messages]);

    // Clear chat history function
    const clearChatHistory = () => {
        const welcome = [{ role: 'ai', text: '¡Hola Laura! Soy tu copiloto SUPERPODEROSO. 🚀\n\nPuedo manejar: Productos, Cupones, Proveedores, SEO, Marketing, Reportes, y más.\n\n💡 Tip: Preguntame "¿Qué debería reponer?" o "Crea cupón INVIERNO con 15%"' }];
        setMessages(welcome);
        localStorage.setItem('laura_chat_history', JSON.stringify(welcome));
    };

    // --- CONNECTION CHECKER ---
    useEffect(() => {
        const checkConnection = async () => {
            if (!apiKey) return;
            setConnectionStatus('checking');

            try {
                // First, list available models to find one that works
                const listResponse = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
                );

                if (!listResponse.ok) {
                    const err = await listResponse.json();
                    throw new Error(err.error?.message || `HTTP ${listResponse.status}`);
                }

                const modelsData = await listResponse.json();
                const availableModels = modelsData.models || [];

                // Find a model that supports generateContent
                const genModel = availableModels.find(m =>
                    m.supportedGenerationMethods?.includes('generateContent') &&
                    m.name?.includes('gemini')
                );

                if (!genModel) {
                    throw new Error(`No hay modelos Gemini disponibles para esta API Key. Modelos encontrados: ${availableModels.map(m => m.name).slice(0, 3).join(', ')}`);
                }

                // Extract model name (remove "models/" prefix if present)
                const modelName = genModel.name.replace('models/', '');

                // Try to generate content with found model
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: "Di hola" }] }]
                        })
                    }
                );

                if (response.ok) {
                    setActiveModel(modelName);
                    setConnectionStatus('connected');
                    setLastError(null);
                    setMessages(prev => {
                        if (prev.some(m => m.text.includes('Conectado'))) return prev;
                        return [...prev, { role: 'ai', text: `🟢 ¡Conectado con ${modelName}!`, isSystem: true }];
                    });
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
                }
            } catch (e) {
                console.error('Connection failed:', e);
                setConnectionStatus('error');
                setActiveModel(null);
                setShowKey(true);
                setLastError(`ERROR: ${e.message}`);
                setMessages(prev => [...prev, {
                    role: 'ai',
                    text: `🔴 Error: ${e.message}\n\n💡 Creá una nueva API Key en aistudio.google.com/app/apikey`,
                    isSystem: true
                }]);
            }
        };

        const timeoutId = setTimeout(() => {
            if (isAiMode) checkConnection();
        }, 1500);

        return () => clearTimeout(timeoutId);
    }, [apiKey, isAiMode]);

    // --- AUTOMATIC ALERTS ---
    const lowStockProducts = useMemo(() =>
        inventory.filter(p => p.stock < 5 && p.active !== false),
        [inventory]);

    const pendingPromotions = useMemo(() =>
        (scheduledPromotions || []).filter(p => !p.executed && p.activateAt <= Date.now()),
        [scheduledPromotions]);

    // Auto-show stock alert on mount
    useEffect(() => {
        if (lowStockProducts.length > 0) {
            const alertMsg = `⚠️ **ALERTA AUTOMÁTICA**\n\n${lowStockProducts.length} productos con stock bajo:\n${lowStockProducts.slice(0, 5).map(p => `• ${p.name}: ${p.stock} unidades`).join('\n')}${lowStockProducts.length > 5 ? `\n... y ${lowStockProducts.length - 5} más` : ''}\n\n💡 Decime "¿Qué debería reponer?" para análisis detallado.`;

            // Only add alert if not already shown
            setMessages(prev => {
                if (prev.some(m => m.text.includes('ALERTA AUTOMÁTICA'))) return prev;
                return [...prev, { role: 'ai', text: alertMsg, isAlert: true }];
            });
        }
    }, [lowStockProducts]);

    // Check and execute pending promotions
    useEffect(() => {
        pendingPromotions.forEach(promo => {
            executeScheduledPromotion?.(promo);
        });
    }, [pendingPromotions]);

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
        if (!input.trim() && !selectedFile) return;

        // Create user message with optional image
        const userMsg = {
            role: 'user',
            text: input || '📷 Imagen adjunta',
            image: previewUrl || null // Include image preview in message
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            let responseText = '';

            if (isAiMode && apiKey) {
                // --- GEMINI AI MODE (Enhanced Intelligence) ---
                const genAI = new GoogleGenerativeAI(apiKey);

                // Use Pro model for better reasoning, fallback to Flash
                const preferredModel = activeModel?.includes('pro') ? activeModel : (activeModel || 'gemini-1.5-flash');

                const model = genAI.getGenerativeModel({
                    model: preferredModel,
                    generationConfig: {
                        temperature: 0.8, // More creative but still coherent
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048, // Longer responses when needed
                    }
                });

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
                                        cost: Number(data.cost || 0),
                                        stock: Number(data.stock || 10),
                                        category: data.category || 'General',
                                        image: data.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop',
                                        colors: data.colors || [], // Array of color names
                                        sizes: data.sizes || [], // Array of sizes like ["S", "M", "L", "XL"]
                                        active: true,
                                        description: data.description || 'Producto creado por IA',
                                        tags: data.tags || [],
                                        brand: data.brand || '',
                                        material: data.material || '',
                                        createdAt: Date.now()
                                    });
                                } else if (type === 'CREATE_COUPON') {
                                    // [ACTION:CREATE_COUPON:{"code":"VERANO20","discount":20,"type":"percentage"}]
                                    const jsonStr = actionContent.substring(actionContent.indexOf('{'));
                                    const data = JSON.parse(jsonStr);
                                    await addCoupon({
                                        id: Date.now(),
                                        code: data.code.toUpperCase(),
                                        discount: Number(data.discount),
                                        type: data.type || 'percentage', // 'percentage' or 'fixed'
                                        minPurchase: Number(data.minPurchase || 0),
                                        maxUses: Number(data.maxUses || 100),
                                        usedCount: 0,
                                        active: true,
                                        expiresAt: data.expiresAt || null,
                                        createdAt: Date.now()
                                    });
                                } else if (type === 'DELETE_COUPON') {
                                    await deleteCoupon(parts[1]);
                                } else if (type === 'CREATE_SUPPLIER') {
                                    // [ACTION:CREATE_SUPPLIER:{"name":"Textiles Sur","phone":"11-4444"}]
                                    const jsonStr = actionContent.substring(actionContent.indexOf('{'));
                                    const data = JSON.parse(jsonStr);
                                    await addSupplier({
                                        id: Date.now(),
                                        name: data.name,
                                        category: data.category || '',
                                        contactName: data.contactName || '',
                                        phone: data.phone || '',
                                        email: data.email || '',
                                        whatsapp: data.whatsapp || data.phone || '',
                                        address: data.address || '',
                                        city: data.city || '',
                                        province: data.province || '',
                                        notes: data.notes || '',
                                        active: true,
                                        createdAt: Date.now()
                                    });
                                } else if (type === 'DELETE_SUPPLIER') {
                                    await deleteSupplier(parts[1]);
                                } else if (type === 'TOGGLE_PRODUCT') {
                                    const id = Number(parts[1]);
                                    const product = inventory.find(p => p.id === id);
                                    if (product) {
                                        await updateProduct(id, { active: !product.active });
                                    }
                                } else if (type === 'BULK_PRICE') {
                                    // [ACTION:BULK_PRICE:category:percentage]
                                    const category = parts[1];
                                    const percentage = Number(parts[2]);
                                    const products = inventory.filter(p => p.category === category);
                                    for (const p of products) {
                                        const newPrice = Math.round(p.price * (1 + percentage / 100));
                                        await updateProduct(p.id, { price: newPrice });
                                    }
                                } else if (type === 'SCHEDULE_PROMO') {
                                    // [ACTION:SCHEDULE_PROMO:{"name":"Promo Viernes","type":"activate_coupon","couponCode":"VIERNES","activateAt":timestamp}]
                                    const jsonStr = actionContent.substring(actionContent.indexOf('{'));
                                    const data = JSON.parse(jsonStr);
                                    await addScheduledPromotion({
                                        name: data.name || 'Promoción Programada',
                                        type: data.type || 'activate_coupon',
                                        couponCode: data.couponCode,
                                        category: data.category,
                                        discount: data.discount,
                                        activateAt: data.activateAt || Date.now() + 86400000 // Default: tomorrow
                                    });
                                }

                                // Log AI action
                                await logAiAction?.(type, actionContent, 'Executed');
                            } catch (err) {
                                console.error("Error executing AI command:", err);
                            }
                        }
                    }
                };

                // System Prompt
                const prompt = `
                    Eres LAURA AI, el CENTRO DE CONTROL TOTAL de "La Boutique de la Elegancia". 
                    Hablas con Laura (Dueña). Eres su superpoder para manejar TODO desde el chat.
                    
                    ═══════════════════════════════════════
                    🔥 TUS SUPERPODERES (Comandos Ejecutables):
                    ═══════════════════════════════════════
                    
                    ** PRODUCTOS **
                    1. [ACTION:CREATE_PRODUCT:{...campos...}]
                       Campos disponibles:
                       - name: "Nombre del producto" (OBLIGATORIO)
                       - price: 15000 (OBLIGATORIO)
                       - cost: 8000 (costo para calcular margen)
                       - stock: 10
                       - category: "Vestidos"
                       - image: "URL de la imagen real" (USA la URL que subió el usuario si hay)
                       - colors: ["Negro", "Blanco", "Rojo"] (array de colores)
                       - sizes: ["S", "M", "L", "XL"] (array de talles)
                       - description: "Descripción SEO del producto"
                       - brand: "Marca"
                       - material: "100% Algodón"
                       - tags: ["verano", "casual", "oferta"]
                    2. [ACTION:UPDATE_PRICE:ID:NuevoPrecio]
                    3. [ACTION:UPDATE_STOCK:ID:NuevoStock]
                    4. [ACTION:UPDATE_PRODUCT:ID:{"description":"...","name":"..."}]
                    5. [ACTION:TOGGLE_PRODUCT:ID] → Activa/Desactiva producto
                    6. [ACTION:BULK_PRICE:Categoria:Porcentaje] → Ej: "Sube 10% vestidos" = [ACTION:BULK_PRICE:Vestidos:10]
                    
                    ** CUPONES **
                    7. [ACTION:CREATE_COUPON:{"code":"VERANO20","discount":20,"type":"percentage"}]
                       - type: "percentage" (%) o "fixed" (monto fijo)
                       - Opcionales: "minPurchase":5000, "maxUses":50
                    8. [ACTION:DELETE_COUPON:ID]
                    
                    ** PROVEEDORES **
                    9. [ACTION:CREATE_SUPPLIER:{"name":"Textiles Sur","phone":"11-4444-5555","category":"Vestidos"}]
                    10. [ACTION:DELETE_SUPPLIER:ID]
                    
                    ** TIENDA **
                    11. [ACTION:CREATE_CATEGORY:NombreCategoria]
                    12. [ACTION:MAINTENANCE:ON] / [ACTION:MAINTENANCE:OFF]
                    
                    ═══════════════════════════════════════
                    📊 ESTADO ACTUAL DEL NEGOCIO:
                    ═══════════════════════════════════════
                    - Modo Tienda: ${isMaintenance ? '🔴 MANTENIMIENTO' : '🟢 ABIERTA'}
                    - Ventas Hoy: ${formatMoney(totalSalesToday)} (${salesToday.length} pedidos)
                    - Total Productos: ${inventory.length} | Activos: ${inventory.filter(p => p.active !== false).length}
                    - Total Categorías: ${(categories || []).length}
                    - Total Cupones Activos: ${(coupons || []).filter(c => c.active).length}
                    - Total Proveedores: ${(suppliers || []).length}
                    - Stock Bajo (< 5): ${lowStock || 'Ninguno ✅'}
                    
                    ** CLIENTES VIP (Top Gastadores): **
                    ${topCustomers}
                    
                    ** TENDENCIAS DE MODA: **
                    ${trendText}
                    
                    ** PRODUCTO MÁS RENTABLE: **
                    ${highMarginText}
                    
                    ** ÚLTIMOS 5 PEDIDOS: **
                    ${lastOrders}
                    
                    ═══════════════════════════════════════
                    🎯 ANÁLISIS DE PERFORMANCE (CRM):
                    ═══════════════════════════════════════
                    ** ALTO TRÁFICO SIN VENTAS (Problema de Conversión): **
                    ${lowConversion || "Ninguno crítico ✅"}
                    
                    ** MEJORES CONVERSIONES (Productos Estrella): **
                    ${highConversion}
                    
                    ** ANÁLISIS DE PRECIOS (Competencia): **
                    Cuando Laura pregunte por competencia, analiza los precios del inventario y sugiere:
                    - Productos que parecen muy baratos (margen bajo)
                    - Productos que parecen muy caros (sin ventas)
                    - Rango de precios ideal por categoría
                    
                    ** PLANIFICACIÓN DE STOCK: **
                    Cuando Laura pregunte qué reponer, analiza:
                    - Productos con stock < 5 que se venden bien
                    - Productos más vendidos este mes
                    - Categorías con mayor demanda
                    
                    ═══════════════════════════════════════
                    📋 CUPONES EXISTENTES:
                    ═══════════════════════════════════════
                    ${(coupons || []).map(c => `- ${c.code}: ${c.type === 'percentage' ? c.discount + '%' : '$' + c.discount} | Usos: ${c.usedCount || 0}/${c.maxUses || '∞'} | ${c.active ? '✅ Activo' : '❌ Inactivo'}`).join('\n') || 'Sin cupones'}
                    
                    ═══════════════════════════════════════
                    🏭 PROVEEDORES REGISTRADOS:
                    ═══════════════════════════════════════
                    ${(suppliers || []).map(s => `- ${s.name} | Tel: ${s.phone || 'N/A'} | Cat: ${s.category || 'General'}`).join('\n') || 'Sin proveedores'}
                    
                    ═══════════════════════════════════════
                    🛒 INVENTARIO COMPLETO (con imágenes):
                    ═══════════════════════════════════════
                    ${inventory.slice(0, 30).map(p => `- ${p.name} (ID: ${p.id}) | $${p.price} | Stock: ${p.stock} | IMAGEN: ${p.image || 'Sin imagen'} | ${p.active !== false ? '✅' : '❌'}`).join('\n')}
                    ${inventory.length > 30 ? `\n... y ${inventory.length - 30} productos más` : ''}
                    
                    ═══════════════════════════════════════
                    📖 INSTRUCCIONES ESPECIALES:
                    ═══════════════════════════════════════
                    
                    1. **MARKETING**: Si pide post de Instagram/Facebook:
                       - SIEMPRE usa la URL real del producto del inventario (campo IMAGEN)
                       - NUNCA inventes imágenes, usa las URLs exactas del inventario
                       - Genera copy atractivo con emojis y hashtags
                       - Incluye precio real del producto
                       - Añade call-to-action urgente
                       - Si el producto tiene imagen, incluye la URL en el post
                    
                    2. **SEO AUTOMÁTICO**: Si pide mejorar descripción:
                       - Genera [ACTION:UPDATE_PRODUCT:ID:{"description":"..."}]
                       - Incluye keywords: moda femenina, elegancia, tendencia, calidad premium
                       - Estructura: gancho + beneficios + llamada a acción
                    
                    3. **REPORTES**: Si pide resumen de ventas:
                       - Calcula totales por período
                       - Identifica productos estrella
                       - Detecta tendencias (colores, categorías)
                       - Sugiere acciones concretas
                    
                    4. **COMPETENCIA**: Si pregunta por precios de mercado:
                       - Compara rangos de precios por categoría
                       - Identifica productos fuera de rango
                       - Sugiere ajustes con comandos BULK_PRICE
                    
                    5. **STOCK INTELIGENTE**: Si pregunta qué reponer:
                       - Lista productos con stock crítico < 3
                       - Prioriza por frecuencia de venta
                       - Sugiere cantidades a pedir al proveedor
                    
                    6. **VISIÓN (FOTOS)**: Si sube imagen:
                       - Describe el producto en detalle
                       - Sugiere nombre, categoría y precio
                       - Genera automáticamente descripción SEO
                       - Crea comando CREATE_PRODUCT con URL: [URL_IMAGEN_SUBIDA]
                    
                    7. **CUPONES**: 
                       - "Crea cupón VERANO20 con 20%" → [ACTION:CREATE_COUPON:{"code":"VERANO20","discount":20,"type":"percentage"}]
                       - "Cupón de $500 para compras mayores a $5000" → [ACTION:CREATE_COUPON:{"code":"PROMO500","discount":500,"type":"fixed","minPurchase":5000}]
                    
                    8. **PROVEEDORES**:
                       - "Agrega proveedor Textiles con tel 11-4444" → [ACTION:CREATE_SUPPLIER:{"name":"Textiles","phone":"11-4444"}]
                    
                    9. **PRECIOS MASIVOS**:
                       - "Sube 10% todos los vestidos" → [ACTION:BULK_PRICE:Vestidos:10]
                       - "Baja 5% accesorios" → [ACTION:BULK_PRICE:Accesorios:-5]
                    
                    10. **PROGRAMAR PROMOCIONES**:
                       - "Activa cupón VIERNES el viernes" → Calcula el timestamp del próximo viernes
                       - [ACTION:SCHEDULE_PROMO:{"name":"Promo Viernes","type":"activate_coupon","couponCode":"VIERNES","activateAt":TIMESTAMP}]
                       - Tipos disponibles: activate_coupon, deactivate_coupon, bulk_discount
                    
                    11. **PREDICCIÓN DE DEMANDA**:
                       Cuando pregunten "¿Qué voy a vender?" o "Predice ventas":
                       - Analiza el historial de ventas (orders)
                       - Identifica patrones: qué días se vende más, qué categorías crecen
                       - Sugiere productos a destacar basado en tendencias
                       - Predice categorías con mayor potencial
                       - Recomienda cantidades de stock a mantener
                    
                    12. **AYUDA / MENÚ DE FUNCIONES**:
                       Si preguntan "qué puedes hacer", "ayuda", "comandos" o "menú", responde con esta lista exacta:
                       
                       🚀 **CAPACIDADES DEL SISTEMA L.A.U.R.A.**
                       
                       📦 **GESTIÓN DE PRODUCTOS**
                       - "Crear producto [Nombre]" (o sube una foto)
                       - "Modificar precio/stock de [Nombre]"
                       - "Sube 10% el precio de [Categoría]"
                       
                       🎫 **CUPONES Y OFERTAS**
                       - "Crear cupón VERANO con 20% descuento"
                       - "Programar oferta para el viernes"
                       
                       📊 **ANÁLISIS DE NEGOCIO**
                       - "¿Qué debería reponer hoy?" (Stock inteligente)
                       - "Reporte de ventas de hoy"
                       - "Analizar rentabilidad"
                       
                       📢 **MARKETING & SEO**
                       - "Escribe post para Instagram de [Producto]"
                       - "Mejora la descripción de [Producto] para SEO"
                       
                       🏭 **LOGÍSTICA**
                       - "Agregar proveedor [Nombre]"
                       
                       💡 *Tip: Puedes hablarme como a una persona. ¡Prueba subir una foto para que cree el producto por ti!*

                    ═══════════════════════════════════════
                    🧠 TU PERSONALIDAD (Sé HUMANA E INTELIGENTE):
                    ═══════════════════════════════════════
                    - Sos Laura AI, pero hablás como una amiga cercana y MUY inteligente
                    - Usá español argentino (vos, tenés, podés, etc)
                    - Sé cálida, empática y con sentido del humor
                    - Recordá TODO lo que hablamos antes y hacé referencias específicas
                    - Si Laura te pidió algo antes, continuá esa conversación naturalmente
                    - No seas robótica, sé natural, fluida y PROACTIVA
                    - Usá emojis pero sin exagerar
                    - Anticipá lo que Laura podría necesitar después
                    - Hacé sugerencias inteligentes basadas en el contexto
                    
                    🎯 PENSAMIENTO AVANZADO:
                    - Antes de responder, pensá: ¿qué quiere realmente Laura?
                    - Conectá la pregunta actual con conversaciones previas
                    - Si detectás un patrón (ej: siempre pregunta stocks), anticipate
                    - Ofrecé insights sin que te los pidan (ej: "Che, noté que...")
                    - Cuando crees productos, sé creativa con descripciones SEO
                    - Si hay oportunidad de negocio, mencionala
                    - Si algo no tiene sentido, preguntá para aclarar
                    
                    ═══════════════════════════════════════
                    💬 HISTORIAL COMPLETO DE CONVERSACIÓN:
                    ═══════════════════════════════════════
                    ${messages.slice(-20).map(m => `${m.role === 'user' ? '👩 Laura' : '🤖 Vos'}: ${m.text}`).join('\n\n')}
                    
                    ═══════════════════════════════════════
                    
                    ** RESPONDE SIEMPRE EN ESPAÑOL ARGENTINO CON PERSONALIDAD **
                    ** SEGUÍ EL HILO NATURALMENTE COMO UNA CONVERSACIÓN REAL **
                    ** ACORDATE DE TODO Y CONECTÁ LOS PUNTOS **
                    ** SÉ PROACTIVA: SUGERÍ, ANTICIPÁ, AYUDÁ **
                    
                    Laura dice ahora: ${userMsg.text}
                `;

                // Handle Image + Text or Text Only
                let result;
                if (selectedFile) {
                    const imagePart = await fileToGenerativePart(selectedFile);
                    const uploadedUrl = await uploadImage(selectedFile); // Upload to Cloudinary to get URL

                    // Extract filename without extension and format as title
                    const fileNameRaw = selectedFile.name.replace(/\.[^/.]+$/, ''); // Remove extension
                    const suggestedTitle = fileNameRaw
                        .replace(/[-_]/g, ' ') // Replace - and _ with spaces
                        .replace(/([a-z])([A-Z])/g, '$1 $2') // Split camelCase
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ');

                    const fileContext = `\n\n📸 IMAGEN SUBIDA:\n- Nombre del archivo: "${selectedFile.name}"\n- Titulo sugerido basado en nombre: "${suggestedTitle}"\n- URL de la imagen: ${uploadedUrl}\n\nUSA ESTE TÍTULO Y ESTA IMAGEN REAL para crear el producto.`;

                    const finalPrompt = prompt.replace('[URL_IMAGEN_SUBIDA]', uploadedUrl) + fileContext;
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
                incrementUsage(); // Track daily usage

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
            // AI response is already added inside the if/else branches above for AI mode
            // For local mode, we add it here
            if (!isAiMode || !apiKey) {
                setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
            }

        } catch (error) {
            console.error(error);
            const errorMsg = error.message || error.toString();
            let friendlyError = 'Error: No pude conectar con el cerebro de la IA. Verificá tu conexión.';

            // Translate common Google API errors to Spanish
            if (errorMsg.includes('quota') || errorMsg.includes('exceeded')) {
                friendlyError = '⚠️ **Límite alcanzado**\n\nSuperaste el límite de mensajes por minuto (20/min). Esperá unos segundos y volvé a intentar.\n\n💡 Tu límite diario de 1500 mensajes sigue disponible.';
            } else if (errorMsg.includes('API_KEY') || errorMsg.includes('API key')) {
                friendlyError = '🔑 **Error de API Key**\n\nLa clave API no es válida o expiró. Creá una nueva en aistudio.google.com/app/apikey';
            } else if (errorMsg.includes('blocked') || errorMsg.includes('safety')) {
                friendlyError = '🛡️ **Contenido bloqueado**\n\nEl mensaje fue bloqueado por filtros de seguridad. Intentá reformular tu pregunta.';
            } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
                friendlyError = '🌐 **Error de conexión**\n\nNo hay conexión a internet o el servidor no responde. Verificá tu conexión.';
            }

            setMessages(prev => [...prev, { role: 'ai', text: friendlyError }]);
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

    // --- UI STATES & EFFECTS FOR COMMAND CENTER ---
    const [systemStatus, setSystemStatus] = useState({
        core: 'ONLINE',
        database: 'CONNECTED',
        apiLatency: '24ms',
        activeUsers: Math.floor(Math.random() * 20) + 5
    });

    // Simulate live system updates
    useEffect(() => {
        const interval = setInterval(() => {
            setSystemStatus(prev => ({
                ...prev,
                apiLatency: Math.floor(Math.random() * 40) + 10 + 'ms',
                activeUsers: Math.floor(Math.random() * 5) + prev.activeUsers + (Math.random() > 0.5 ? 1 : -1)
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const QuickActionBtn = ({ icon: Icon, label, command, color = "indigo" }) => (
        <button
            onClick={() => { setInput(command); handleSend(); }}
            className={`flex items-center gap-3 p-3 rounded-xl border border-${color}-500/20 bg-${color}-500/5 hover:bg-${color}-500/10 hover:border-${color}-500/50 transition-all group w-full text-left`}
        >
            <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}>
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <span className={`text-xs font-bold text-${color}-300 block uppercase tracking-wider`}>{label}</span>
                <span className="text-[10px] text-slate-500 font-mono hidden sm:block">EJECUTANDO...</span>
            </div>
        </button>
    );

    return (
        <div className="fixed inset-0 z-[100] bg-[#030712] text-slate-200 overflow-hidden font-sans">
            {/* AMBIENT BACKGROUND */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50"></div>
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[120px] rounded-full mix-blend-screen"></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-cyan-900/20 blur-[120px] rounded-full mix-blend-screen"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
            </div>

            {/* MAIN GRID LAYOUT */}
            <div className="relative z-10 w-full h-full flex flex-col md:flex-row p-2 gap-2">

                {/* --- LEFT PANEL: NAVIGATION & STATUS (Hidden on mobile mostly) --- */}
                <div className="hidden md:flex w-64 flex-col gap-2">
                    {/* CORE STATUS */}
                    <div className="bg-[#0B1120]/80 backdrop-blur-md border border-slate-800 p-4 rounded-xl flex flex-col gap-4 shadow-lg shadow-black/50">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center relative">
                                <Bot className="w-6 h-6 text-indigo-400" />
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                                </span>
                            </div>
                            <div>
                                <h1 className="font-bold text-white tracking-widest text-sm">NÚCLEO NEURAL</h1>
                                <p className={`text-[10px] font-mono uppercase ${connectionStatus === 'connected' ? 'text-emerald-400' : connectionStatus === 'checking' ? 'text-amber-400' : 'text-red-400'}`}>
                                    {activeModel ? activeModel : connectionStatus === 'checking' ? 'ESTABLECIENDO ENLACE...' : 'DESCONECTADO'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 font-mono text-[10px]">
                            <div className="flex justify-between items-center text-slate-400">
                                <span>ESTADO</span>
                                <span className={connectionStatus === 'connected' ? 'text-emerald-400' : 'text-slate-500'}>{connectionStatus === 'connected' ? 'CONECTADO' : connectionStatus === 'checking' ? 'VERIFICANDO' : 'REVISAR API KEY'}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400">
                                <span>LATENCIA</span>
                                <span className="text-emerald-400">{systemStatus.apiLatency}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400">
                                <span>BASE DE DATOS</span>
                                <span className="text-emerald-400">CONECTADO</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400">
                                <span>USUARIOS ACTIVOS</span>
                                <span className="text-amber-400">{systemStatus.activeUsers}</span>
                            </div>
                        </div>
                    </div>

                    {/* QUICK COMMANDS MODULE */}
                    <div className="flex-1 bg-[#0B1120]/80 backdrop-blur-md border border-slate-800 p-4 rounded-xl overflow-y-auto space-y-3 shadow-lg shadow-black/50">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Key className="w-3 h-3" /> Protocolos Rápidos
                        </h3>

                        <QuickActionBtn icon={TrendingUp} label="Reporte Ventas" command="Genera un reporte detallado de ventas de hoy y tendencias." color="cyan" />
                        <QuickActionBtn icon={AlertTriangle} label="Alerta Stock" command="¿Qué productos tienen stock bajo hoy?" color="amber" />
                        <QuickActionBtn icon={Sparkles} label="Post Marketing" command="Crea un post de Instagram para el producto más vendido." color="pink" />
                        <QuickActionBtn icon={Calculator} label="Rentabilidad" command="Analiza la rentabilidad del inventario." color="emerald" />
                        <QuickActionBtn icon={Search} label="SEO Scan" command="Revisa descripciones de productos sin venta." color="indigo" />
                    </div>

                    {/* API KEY & SETTINGS */}
                    <div className="bg-[#0B1120]/80 backdrop-blur-md border border-slate-800 p-3 rounded-xl">
                        <button
                            onClick={() => setShowKey(!showKey)}
                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-xs text-slate-400 hover:text-white"
                        >
                            <span className="flex items-center gap-2"><Settings className="w-3 h-3" /> AJUSTES</span>
                            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">{showKey ? 'OCULTAR' : 'MOSTRAR'}</span>
                        </button>
                        {showKey && (
                            <div className="flex flex-col gap-2 mt-2">
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="w-full bg-black/50 border border-slate-700 rounded px-2 py-1.5 text-[10px] text-slate-300 outline-none focus:border-indigo-500 font-mono"
                                    placeholder="Pegá tu API Key aquí..."
                                />
                                {/* Debug: Show key prefix */}
                                {apiKey && (
                                    <div className="text-[9px] text-slate-500 font-mono">
                                        Llave actual: {apiKey.substring(0, 15)}...
                                    </div>
                                )}
                                {lastError && (
                                    <div className="p-2 bg-red-900/20 border border-red-500/30 rounded text-[10px] text-red-300 font-mono break-all leading-tight">
                                        <div className="font-bold mb-1">ERROR DE CONEXIÓN:</div>
                                        {lastError}
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem('gemini_api_key_v3');
                                            setApiKey('');
                                            setConnectionStatus('error');
                                            setLastError('Llave borrada. Pegá una nueva.');
                                        }}
                                        className="flex-1 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 text-[10px] py-1 rounded transition-colors font-bold uppercase tracking-wider"
                                    >
                                        Borrar Llave
                                    </button>
                                    <button
                                        onClick={() => { setConnectionStatus('checking'); setTimeout(() => setApiKey(prev => prev + ' '), 10); setTimeout(() => setApiKey(prev => prev.trim()), 20); }}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] py-1 rounded transition-colors font-bold uppercase tracking-wider"
                                    >
                                        Reintentar
                                    </button>
                                </div>
                                <button
                                    onClick={clearChatHistory}
                                    className="w-full bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/30 text-slate-300 text-[10px] py-1 rounded transition-colors font-bold uppercase tracking-wider mt-1"
                                >
                                    🗑️ Limpiar Historial de Chat
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- CENTER PANEL: CHAT TERMINAL --- */}
                <div className="flex-1 flex flex-col bg-[#0B1120]/90 backdrop-blur-xl border border-slate-800 rounded-xl relative overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50">
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isAiMode ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-500'}`}></span>
                            <h2 className="text-sm font-bold tracking-widest text-slate-200">
                                {isAiMode ? 'ENLACE NEURAL GEMINI' : 'TERMINAL LOCAL'}
                            </h2>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Daily Usage Counter */}
                            {isAiMode && (
                                <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                                    <div className={`w-1.5 h-1.5 rounded-full ${dailyUsage.count < 1200 ? 'bg-emerald-500' : dailyUsage.count < 1400 ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></div>
                                    <span className="text-[10px] font-mono font-bold tracking-wider">
                                        <span className={dailyUsage.count < 1200 ? 'text-emerald-400' : dailyUsage.count < 1400 ? 'text-yellow-400' : 'text-red-400'}>
                                            {DAILY_LIMIT - dailyUsage.count}
                                        </span>
                                        <span className="text-slate-500">/{DAILY_LIMIT}</span>
                                    </span>
                                    <span className="text-[8px] text-slate-500 uppercase tracking-widest">hoy</span>
                                </div>
                            )}
                            <button
                                onClick={() => setIsAiMode(!isAiMode)}
                                className={`text-[10px] font-bold px-3 py-1 rounded border transition-all ${isAiMode
                                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                                    : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                            >
                                {isAiMode ? 'IA CONECTADA' : 'MODO OFFLINE'}
                            </button>
                            <button onClick={onClose} className="hover:text-red-400 transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-slideUp`}>
                                <div className={`flex items-end gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center border ${msg.role === 'ai'
                                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                                        {msg.role === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                    </div>

                                    {/* Bubble */}
                                    <div className={`p-4 rounded-xl border backdrop-blur-sm relative group ${msg.role === 'ai'
                                        ? 'bg-slate-900/80 border-slate-700 text-slate-300 rounded-bl-sm'
                                        : 'bg-indigo-900/20 border-indigo-500/20 text-indigo-100 rounded-br-sm'}`}>

                                        {/* Meta Header */}
                                        <div className="flex items-center justify-between gap-4 mb-2 opacity-50 text-[10px] font-mono tracking-wider border-b border-white/5 pb-1">
                                            <span>{msg.role === 'ai' ? 'SISTEMA L.A.U.R.A.' : 'COMANDO USUARIO'}</span>
                                            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>

                                        {msg.image && (
                                            <div className="mb-3 rounded overflow-hidden border border-white/10">
                                                <img src={msg.image} alt="Uploaded" className="max-w-xs" />
                                            </div>
                                        )}

                                        <div className={`whitespace-pre-wrap font-sans text-sm md:text-base leading-relaxed ${msg.role === 'ai' ? 'text-slate-200' : 'text-indigo-100'}`}>
                                            {msg.text}
                                        </div>

                                        {/* Status Line for AI */}
                                        {msg.role === 'ai' && (
                                            <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <span className="text-[10px] text-emerald-500/70 font-mono tracking-widest">PROCESO COMPLETADO</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex items-start gap-4 animate-pulse">
                                <div className="w-8 h-8 rounded bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                                    <Activity className="w-4 h-4 text-indigo-400 animate-spin" />
                                </div>
                                <div className="p-4 rounded-xl bg-slate-900/50 border border-indigo-500/20 text-indigo-300 text-xs font-mono flex items-center gap-2">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                                    CALCULANDO VECTORES...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-slate-950 border-t border-slate-800">
                        {previewUrl && (
                            <div className="relative inline-block mb-3 ml-2 group">
                                <img src={previewUrl} alt="Preview" className="h-16 rounded border border-indigo-500/50" />
                                <button onClick={clearFile} className="absolute -top-2 -right-2 bg-red-900/90 text-red-200 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                        <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-700 rounded-lg p-1.5 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className={`p-2 rounded hover:bg-white/5 transition-colors ${selectedFile ? 'text-cyan-400' : 'text-slate-500'}`}
                            >
                                <Paperclip className="w-5 h-5" />
                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                            </button>

                            <div className="flex-1 flex items-center gap-2">
                                <span className="text-cyan-500/50 font-mono select-none">{'>'}</span>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ingrese comando o consulta..."
                                    className="w-full bg-transparent border-none text-slate-200 placeholder:text-slate-600 focus:ring-0 resize-none h-10 py-2 font-sans text-sm leading-relaxed"
                                />
                            </div>

                            <button
                                onClick={handleSend}
                                disabled={(!input.trim() && !selectedFile) || loading}
                                className={`px-4 py-2 rounded text-xs font-bold tracking-widest transition-all ${(!input.trim() && !selectedFile) || loading
                                    ? 'bg-slate-800 text-slate-600'
                                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow shadow-cyan-500/20'}`}
                            >
                                EJECUTAR
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT PANEL: DATA VISUALS (Hidden on small screens) --- */}
                <div className="hidden lg:flex w-72 flex-col gap-2">
                    <div className="bg-[#0B1120]/80 backdrop-blur-md border border-slate-800 p-4 rounded-xl shadow-lg flex-1 flex flex-col">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Activity className="w-3 h-3" /> Telemetría en Vivo
                        </h3>

                        <div className="space-y-6 flex-1">
                            {/* Dummy Graphs */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>CARGA CPU</span>
                                    <span>34%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[34%] animate-pulse"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>MEMORIA</span>
                                    <span>62%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500 w-[62%]"></div>
                                </div>
                            </div>

                            {/* Recent Activity Log in Right Panel */}
                            <div className="mt-6">
                                <h4 className="text-[10px] font-bold text-slate-600 mb-3 border-b border-slate-800 pb-1">SYSTEM LOGS</h4>
                                <div className="space-y-2 font-mono text-[9px] text-slate-500">
                                    <p><span className="text-emerald-500">[SUCCESS]</span> Database sync complete</p>
                                    <p><span className="text-emerald-500">[SUCCESS]</span> Auth Token refreshed</p>
                                    <p><span className="text-amber-500">[WARN]</span> High latency detailed in region us-east</p>
                                    <p><span className="text-indigo-500">[INFO]</span> New order #2938 processed</p>
                                    <p><span className="text-indigo-500">[INFO]</span> User session initiated</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-800">
                            <div className="p-3 bg-indigo-900/10 border border-indigo-500/20 rounded-lg">
                                <h5 className="text-[10px] font-bold text-indigo-400 mb-1">PRO TIP</h5>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    Usa comandos JSON para acciones masivas. Escribe "Ayuda" para ver la lista completa de protocolos.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div >
    );
};
