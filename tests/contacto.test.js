import { describe, it, expect } from 'vitest';
import { linkTelegram, linkWhatsApp, telegramDeConfig, whatsappDeConfig, canalDePedido } from '../src/utils/contacto';

describe('linkTelegram', () => {
    it('acepta las formas en que uno escribe un usuario', () => {
        expect(linkTelegram('@laboutique')).toBe('https://t.me/laboutique');
        expect(linkTelegram('laboutique')).toBe('https://t.me/laboutique');
        expect(linkTelegram('t.me/laboutique')).toBe('https://t.me/laboutique');
        expect(linkTelegram('  @laboutique  ')).toBe('https://t.me/laboutique');
    });

    it('respeta una URL ya armada', () => {
        expect(linkTelegram('https://t.me/laboutique')).toBe('https://t.me/laboutique');
    });

    it('no inventa link cuando no hay dato', () => {
        expect(linkTelegram('')).toBeNull();
        expect(linkTelegram('   ')).toBeNull();
        expect(linkTelegram(undefined)).toBeNull();
        expect(linkTelegram('@')).toBeNull();
    });

    it('rechaza el objeto de config del canal, que no es el contacto', () => {
        // siteConfig.telegram = { secret } lo usa el panel para publicar al
        // canal. Si se colara, el link saldria "t.me/[object Object]".
        expect(linkTelegram({ secret: 'abc' })).toBeNull();
    });
});

describe('linkWhatsApp', () => {
    it('limpia el numero y arma el link', () => {
        expect(linkWhatsApp('+54 9 3492 21-6487')).toBe('https://wa.me/5493492216487');
    });

    it('adjunta el mensaje codificado', () => {
        expect(linkWhatsApp('5493492216487', 'Hola & chau')).toContain('?text=Hola%20%26%20chau');
    });

    it('descarta numeros a medio cargar en vez de armar un link roto', () => {
        expect(linkWhatsApp('123')).toBeNull();
        expect(linkWhatsApp('')).toBeNull();
        expect(linkWhatsApp(undefined)).toBeNull();
    });
});

describe('lectura desde siteConfig', () => {
    it('saca el telegram de social.telegram', () => {
        expect(telegramDeConfig({ social: { telegram: '@lbde' } })).toBe('https://t.me/lbde');
    });

    it('ignora siteConfig.telegram (es el objeto del canal)', () => {
        expect(telegramDeConfig({ telegram: { secret: 'x' } })).toBeNull();
    });

    it('busca el whatsapp en los tres lugares donde pudo quedar', () => {
        expect(whatsappDeConfig({ whatsappNumber: '5493492216487' })).toContain('5493492216487');
        expect(whatsappDeConfig({ contact: { whatsapp: '5493492216487' } })).toContain('5493492216487');
        expect(whatsappDeConfig({ social: { whatsapp: '5493492216487' } })).toContain('5493492216487');
    });
});

describe('canalDePedido', () => {
    it('elige WhatsApp cuando hay, porque es el unico que lleva el pedido escrito', () => {
        const r = canalDePedido({ whatsappNumber: '5493492216487', social: { telegram: '@lbde' } }, 'Pedido #1');
        expect(r.canal).toBe('whatsapp');
        expect(r.llevaMensaje).toBe(true);
        expect(r.url).toContain('text=');
    });

    it('cae a Telegram si no hay WhatsApp cargado', () => {
        const r = canalDePedido({ social: { telegram: '@lbde' } }, 'Pedido #1');
        expect(r.canal).toBe('telegram');
        expect(r.llevaMensaje).toBe(false);
    });

    it('sin nada cargado devuelve null en vez de un numero inventado', () => {
        expect(canalDePedido({}, 'Pedido #1')).toBeNull();
        expect(canalDePedido({ whatsappNumber: '' }, 'x')).toBeNull();
    });
});
