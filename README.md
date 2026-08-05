# BloxFinder 🚀

Hecho por **Witz Studio** | © Copyright 2026

Buscador y explorador avanzado de perfiles, juegos y accesorios de Roblox con integración en tiempo real.

---

## ⚡ Despliegue 100% Automático ("Todo Auto")

Si exportas este proyecto a **GitHub**, no necesitas configurar nada para tenerlo en internet de forma gratuita. Hemos incluido archivos de configuración inteligente para que las mejores plataformas lo construyan y lo mantengan en línea automáticamente:

### Opción A: Desplegar en Vercel (Recomendado)
Vercel leerá automáticamente el archivo `vercel.json` que configuramos para ti.
1. Ve a [Vercel](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New"** -> **"Project"**.
3. Selecciona el repositorio de GitHub de este proyecto que acabas de exportar.
4. Haz clic en **"Deploy"**. ¡Listo! Vercel construirá el frontend y el servidor de forma 100% automática y te dará una URL en vivo.

### Opción B: Desplegar en Render
Render leerá el archivo `render.yaml` y configurará el servidor completo por ti.
1. Ve a [Render](https://render.com/) e inicia sesión con tu cuenta de GitHub.
2. Ve a la pestaña de **Blueprints** o haz clic en **New** -> **Web Service**.
3. Vincula tu repositorio de GitHub y haz clic en crear. ¡Se configurará todo solo sin tocar nada!

---

## ⚙️ Requisitos Previos (Para correr en tu computadora de forma manual)

- **Node.js** (Versión 18 o superior recomendada)
- **npm** (o yarn / pnpm / bun)

---

## 🛠️ Instrucciones de Instalación y Ejecución en Local

Cuando clonas este proyecto en tu computadora, debes seguir estos pasos sencillos:

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Compilar el proyecto para producción:**
   ```bash
   npm run build
   ```

3. **Iniciar el servidor:**
   ```bash
   npm start
   ```
   *(El servidor se abrirá en `http://localhost:3000`)*

---

## 💻 Comandos Disponibles

- `npm run dev`: Inicia el servidor de desarrollo en vivo con `tsx`.
- `npm run build`: Empaqueta el frontend de Vite y compila el backend de Express en `dist/server.cjs`.
- `npm start`: Ejecuta la versión de producción compilada.
- `npm run lint`: Valida los tipos de TypeScript (`tsc --noEmit`).
