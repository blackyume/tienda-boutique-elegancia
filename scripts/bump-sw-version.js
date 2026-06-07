// Pone una versión única al service worker en cada build, así el cartel
// "Nueva versión disponible — Actualizar" le aparece a los usuarios después
// de cada deploy (sin tener que acordarse de bumpear a mano).
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const swPath = join(__dirname, '..', 'public', 'sw.js');

try {
    const sw = await readFile(swPath, 'utf8');
    // versión basada en fecha/hora: única por build
    const version = 'v' + new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 12);
    const next = sw.replace(/const SW_VERSION = '[^']*';/, `const SW_VERSION = '${version}';`);
    if (next === sw) {
        console.warn('[sw] no se encontró SW_VERSION para actualizar');
    } else {
        await writeFile(swPath, next);
        console.log('[sw] versión →', version);
    }
} catch (err) {
    console.warn('[sw] bump falló (no crítico):', err.message);
}
