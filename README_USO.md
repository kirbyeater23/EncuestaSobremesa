# Encuesta sobre sobremesa

Proyecto web para recoger respuestas anonimas sobre la sobremesa y clasificar a cada participante dentro del mapa de actores.

## Archivos principales

- `app/page.tsx`: formulario publico de la encuesta.
- `app/resultados/page.tsx`: panel de resultados.
- `app/api/responses/route.ts`: guardado y lectura de respuestas.
- `lib/survey.ts`: preguntas, opciones y clasificacion de actores.
- `app/globals.css`: estilos visuales.
- `db/schema.ts`: estructura de la base de datos.

## Abrir en Visual Studio Code

1. Abre esta carpeta en VS Code.
2. Instala dependencias con `npm install`.
3. Ejecuta en local con `npm run dev`.

La version publicada usa una base de datos D1 conectada al despliegue. En local, para probar el guardado de respuestas, hace falta configurar el entorno de Cloudflare/Vinext y aplicar la migracion incluida en `drizzle/`.
