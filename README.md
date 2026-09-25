# Mis gastos

Registro de gastos diarios y mensuales. Sin base de datos: todo se guarda en `localStorage` del navegador.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- Recharts (gráficos), date-fns (fechas)

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
- Modo oscuro/claro con selector (se guarda la preferencia)
- Exportar a JSON/CSV e importar JSON (respaldo de los datos)

El despliegue es estático: sube la carpeta `dist/` a Vercel, Netlify o GitHub Pages.
