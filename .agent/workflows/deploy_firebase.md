---
description: Deploy the application to Firebase Hosting
---

# Pasos para publicar tu tienda en Internet

Como ya estás usando Firebase para la base de datos y las imágenes, lo mejor es usar **Firebase Hosting**. Es gratis, rápido y seguro.

Sigue estos pasos en tu terminal (puedes detener el servidor actual con `Ctrl + C` si es necesario, o abrir una nueva terminal):

1.  **Instalar herramientas de Firebase** (solo si no las tienes):
    ```powershell
    npm install -g firebase-tools
    ```

2.  **Iniciar sesión en Google**:
    ```powershell
    firebase login
    ```
    (Se abrirá una ventana en tu navegador para que aceptes).

3.  **Configurar el proyecto**:
    ```powershell
    firebase init hosting
    ```
    *   Cuando te pregunte: **Are you ready to proceed?** -> `Yes`
    *   **Please select an option:** -> `Use an existing project`
    *   Selecciona tu proyecto de Firebase de la lista.
    *   **What do you want to use as your public directory?** -> Escribe: `dist`
    *   **Configure as a single-page app (rewrite all urls to /index.html)?** -> `Yes`
    *   **Set up automatic builds and deploys with GitHub?** -> `No`

4.  **Construir y Publicar**:
    Una vez configurado, ejecuta este comando mágico para subir tu tienda:
    ```powershell
    npm run build
    firebase deploy
    ```

¡Y listo! La terminal te dará una URL (ej: `https://tu-proyecto.web.app`) donde tu tienda ya estará funcionando para todo el mundo.
