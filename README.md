# Mis gastos

Registro de gastos diarios y mensuales. Sin base de datos: todo se guarda en `localStorage` del navegador.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- Recharts (gráficos), date-fns (fechas), Framer Motion (animaciones)

## Uso

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # genera dist/ (sitio estático)
```

## Funciones

- Alta y baja de gastos con monto, categoría, nota y fecha
- Navegación por mes con totales del mes, del día y promedio por día activo
- Presupuesto mensual con barra de progreso
- Gráfico de gasto por día y distribución por categoría
- Moneda configurable
- Cuatro temas: Oscuro (por defecto), Claro, Azul espacial y Bosque nocturno (la preferencia se guarda)
- Layout tipo bento grid con efectos de iluminación (glow) por tema
- Animaciones de entrada escalonadas y transiciones al agregar/eliminar gastos (respetan `prefers-reduced-motion`)
- Exportar a JSON/CSV e importar JSON (respaldo de los datos)

El despliegue es estático: sube la carpeta `dist/` a Vercel, Netlify o GitHub Pages.
