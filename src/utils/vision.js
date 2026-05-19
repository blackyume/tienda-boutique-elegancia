// Visión unificada para el copiloto. Cerebras es texto-puro, así que la
// foto de prenda la mira otro proveedor. Orden de preferencia:
//   1) Gemini (configurado por defecto en la mayoría de instalaciones)
//   2) NVIDIA NIM (fallback)
// Si ninguno funciona se tira un error claro al usuario.
import { analyzeProductImage as analyzeWithGemini } from './geminiVision';
import { analyzeProductImageWithNvidia } from './nvidiaVision';

const hasGemini = (aiConfig) => Boolean((aiConfig?.adminKeys || '').trim());
const hasNvidia = (aiConfig) => Boolean((aiConfig?.nvidiaKey || '').trim());

export const hasAnyVision = (aiConfig) => hasGemini(aiConfig) || hasNvidia(aiConfig);

export const analyzeProductImage = async (file, aiConfig, categories = []) => {
    const errs = [];
    if (hasGemini(aiConfig)) {
        try { return await analyzeWithGemini(file, aiConfig, categories); }
        catch (err) { errs.push(`Gemini: ${err?.message || err}`); }
    }
    if (hasNvidia(aiConfig)) {
        try { return await analyzeProductImageWithNvidia(file, aiConfig, categories); }
        catch (err) { errs.push(`NVIDIA: ${err?.message || err}`); }
    }
    if (errs.length === 0) {
        throw new Error('Sin proveedor de visión configurado. Pegá una key de Gemini o NVIDIA en Admin → Configuración → IA.');
    }
    throw new Error(`Ningún proveedor de visión pudo analizar la imagen. ${errs.join(' · ')}`);
};
