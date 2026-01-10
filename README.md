# Squad Metalstorm

**Squad Metalstorm** es una aplicación web desarrollada con Angular que permite gestionar y analizar información de aviones de combate del videojuego Metalstorm. La aplicación integra datos desde un Google Sheets y proporciona filtrado avanzado por nivel y tipo de avión.

## Características Principales

- **Carga automática desde Google Sheets**: Los datos de los jugadores y sus aviones se cargan automáticamente desde un Google Sheets sin necesidad de subir archivos manualmente.
- **Filtrado por Nivel**: Selecciona el nivel de combate deseado (1-20) para filtrar los aviones disponibles.
- **Filtrado por Tipo de Avión**: Filtra por tipos específicos de aviones (Light Fighter, Medium Fighter, Heavy Fighter, Interceptor, Attack).
- **Visualización en Tabla**: Presenta los resultados en una tabla interactiva con imágenes de tipos y aviones.
- **Selección Múltiple**: Permite seleccionar múltiples aviones para análisis posterior.
- **Integración con Datos Externos**: Utiliza archivos JSON para información detallada de aviones.

## Tecnologías Utilizadas

### Framework y Core
- **Angular 21.0.8**: Framework principal para el desarrollo de la aplicación
- **TypeScript 5.9.3**: Lenguaje de programación utilizado

### Librerías UI
- **PrimeNG 21.0.2**: Componentes de interfaz de usuario (Select, Checkbox, Table, Button)
- **PrimeIcons 7.0.0**: Iconografía para la interfaz
- **Angular CDK 21.0.6**: Componentes de design del Angular

### Librerías de Utilidad
- **XLSX 0.18.5**: Lectura y procesamiento de archivos Excel y Google Sheets
- **RxJS 7.8.0**: Programación reactiva y manejo de observables
- **Cheerio 1.1.2**: Parsing y manipulación de HTML
- **Angular Forms 21.0.8**: Manejo de formularios y validación

### Otras Dependencias
- **Zone.js 0.15.0**: Gestión de zonas de ejecución asíncrona
- **TSLib 2.3.0**: Libería de utilidades de TypeScript

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>

# Entrar al directorio del proyecto
cd metalstorm

# Instalar las dependencias
npm install
```

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
ng serve
```

Abre tu navegador y navega a `http://localhost:4200/`. La aplicación se recargará automáticamente cuando hagas cambios en los archivos fuente.

## Construcción

Para compilar el proyecto para producción:

```bash
ng build
```

Los artefactos compilados se almacenarán en el directorio `dist/`.

## Pruebas

Para ejecutar las pruebas unitarias:

```bash
ng test
```

Para las pruebas end-to-end:

```bash
ng e2e
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── app.component.ts       # Componente principal
│   ├── app.component.html     # Template principal
│   ├── app.component.sass     # Estilos principales
│   ├── app.routes.ts          # Configuración de rutas
│   └── app.config.ts          # Configuración de la aplicación
├── index.html                  # HTML principal
├── main.ts                     # Punto de entrada
└── styles.sass                 # Estilos globales
public/
└── files/
    └── dataInfo.json          # Información de aviones y tipos
```

## Fuente de Datos

La aplicación consume datos de:
- **Google Sheets**: Información de jugadores y sus aviones
- **dataInfo.json**: Base de datos con información detallada de aviones, tipos y sus imágenes

## Recursos Adicionales

Para más información sobre Angular CLI, visita la [documentación oficial de Angular](https://angular.dev/tools/cli).

Este proyecto fue generado con [Angular CLI](https://github.com/angular/angular-cli) versión 19.1.8.
