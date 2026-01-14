# 🚀 Bitácora de Vuelo - MetalTools

## Comandos Importantes

### 1. Prender el Backend (Docker) 🐳
Desde la carpeta del proyecto:
`docker compose up --build`
*(Si ya está construido, solo `docker compose up`)*

### 2. Prender el Frontend (Angular) 🅰️
En otra terminal nueva:
`ng serve`
*(Luego entrar a http://localhost:4200)*

### 3. Cargar Datos Iniciales (Semillas) 🌱
Si la base de datos está vacía:
`curl -X POST http://localhost:5000/api/seed_data`

### 4. Probar la API 🔗
Ver si funciona: `http://localhost:5000/api/health`
Ver aviones: `http://localhost:5000/api/planes`
Filtrar ataque: `http://localhost:5000/api/planes?type=Attack`

---

## Rutas Importantes
- Backend: `C:\ProyectosAlenxo\metaltools\backend`
- Frontend: `C:\ProyectosAlenxo\metaltools\src`