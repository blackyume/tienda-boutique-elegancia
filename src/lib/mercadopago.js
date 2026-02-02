import React, { useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

export const MercadoPagoButton = ({ preferenceId }) => {
    useEffect(() => {
        // Initialize with PUBLIC_KEY
        // initMercadoPago('YOUR_PUBLIC_KEY', { locale: 'es-AR' });
    }, []);

    if (!preferenceId) return null;

    return (
        <div className="w-full">
            <Wallet initialization={{ preferenceId: preferenceId }} customization={{ texts: { valueProp: 'smart_option' } }} />
        </div>
    );
};
