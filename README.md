# Obsidian Network Bot

Bot de Discord en JavaScript + Discord.js v14. Incluye anuncios, postulaciones con formulario y revisión, tickets, bienvenida y moderación básica.

## Requisitos
- Node.js 20.11 o superior.
- Una aplicación y un bot creados en Discord Developer Portal.
- Permisos del bot: View Channels, Send Messages, Embed Links, Read Message History, Manage Channels, Manage Messages, Moderate Members y Manage Roles (si luego añades asignación de rangos).
- Activa **Server Members Intent** en Developer Portal para las bienvenidas.

## Instalación local o en hosting
1. Descarga el ZIP y descomprímelo.
2. Copia `.env.example` a `.env`.
3. Completa `DISCORD_TOKEN`, `CLIENT_ID` y opcionalmente `GUILD_ID`.
4. Ejecuta `npm install`.
5. Ejecuta `npm run deploy` para registrar los comandos.
6. Ejecuta `npm start` para iniciar el bot.

Si defines `GUILD_ID`, los comandos se registran solo en ese servidor para pruebas y aparecen más rápido. Si lo dejas vacío, se registran globalmente y pueden tardar un tiempo en propagarse.

## Comandos
- `/configurar anuncios canal:#canal`
- `/configurar postulaciones canal:#canal-privado`
- `/configurar bienvenidas canal:#bienvenidas`
- `/configurar logs canal:#logs` (canal reservado para ampliar registros)
- `/configurar staff rol:@Staff` (da acceso al equipo a los tickets)
- `/anuncio titulo mensaje mencion`
- `/postulaciones publicar`
- `/tickets publicar`
- `/limpiar cantidad`
- `/timeout usuario minutos razon`

## GitHub
1. Crea un repositorio llamado `obsidian-network-bot`.
2. Sube el contenido de esta carpeta (no subas `.env` ni `node_modules`).
3. En tu hosting, conecta el repositorio o descarga el ZIP.
4. Configura las variables de entorno desde el panel del hosting.

## Seguridad
- Nunca compartas tu token ni lo subas a GitHub.
- Si el token se filtra, regénéralo en Discord Developer Portal.
- Mantén privado el canal configurado para revisar postulaciones.
- La opción de `@everyone` en anuncios está restringida a usuarios con permiso para gestionar el servidor.
