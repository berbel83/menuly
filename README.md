# Compausa

Compausa es una aplicación web instalable (PWA) para organizar el menú semanal,
crear la lista de la compra y llevar el seguimiento del ayuno.

## Desarrollo local

1. Instala las dependencias con `npm ci`.
2. Copia `.env.example` a `.env.local` y completa las variables.
3. Inicia la aplicación con `npm run dev`.

## Comprobaciones

- `npm run lint`: revisa la calidad del código.
- `npm run build`: genera la PWA de producción.
- `npm run check`: ejecuta ambas comprobaciones.

## Datos

La aplicación utiliza Supabase para hogares, menús compartidos, historial y
notificaciones. Los ajustes y el ayuno activo se conservan localmente en el
dispositivo. Los registros de ayuno que no puedan sincronizarse quedan en una
cola local y se vuelven a intentar cuando el dispositivo recupera las
condiciones necesarias.
