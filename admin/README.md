# 📝 Panel de Administración Visual - Tocca Amalfi

Sistema de gestión de contenido visual tipo Gutenberg, desarrollado con HTML, CSS y JavaScript vanilla.

## 🎯 Características

- ✅ Editor visual drag & drop sin código
- ✅ 4 tipos de bloques: Texto, Imagen, Botón y Sección
- ✅ Edición en tiempo real de propiedades
- ✅ Persistencia automática con localStorage
- ✅ Vista previa instantánea
- ✅ Reordenar bloques fácilmente
- ✅ Exportar a HTML limpio y optimizado
- ✅ Sin dependencias externas
- ✅ 100% responsive

## 📁 Estructura de Archivos

```
admin/
├── index.html      # Panel de administración principal
├── admin.css       # Estilos del panel admin
├── editor.js       # Lógica del editor (drag & drop, selección, edición)
├── renderer.js     # Convierte JSON a HTML final
├── storage.js      # Maneja localStorage y persistencia
└── README.md       # Esta documentación
```

## 🚀 Cómo Usar

### 1. Acceder al Panel

Abre `admin/index.html` en tu navegador.

### 2. Agregar Bloques

- Arrastra bloques desde el panel izquierdo al canvas central
- Los bloques disponibles son:
  - **Texto**: Párrafos y títulos editables
  - **Imagen**: Subir imágenes o usar URLs
  - **Botón**: Llamados a la acción con enlaces
  - **Sección**: Contenedores para organizar contenido

### 3. Editar Propiedades

- Haz clic en cualquier bloque para seleccionarlo
- El panel derecho mostrará todas las propiedades editables:
  - Colores
  - Tipografía
  - Espaciado (márgenes y padding)
  - Alineación
  - Enlaces
  - Y más...

### 4. Reordenar Bloques

- Usa los botones ⬆️ ⬇️ en la barra de herramientas del bloque
- O arrastra el bloque completo a una nueva posición

### 5. Guardar Cambios

- Haz clic en "Guardar Cambios" en la barra superior
- Los datos se guardan automáticamente en localStorage

### 6. Vista Previa

- Haz clic en "Vista Previa" para ver cómo se verá la página final
- Se abrirá en un modal con el HTML renderizado

## 🔧 Arquitectura Técnica

### editor.js

**Responsabilidades:**
- Gestión del estado de bloques
- Manejo de drag & drop
- Selección y edición de bloques
- Sincronización con el DOM
- Interfaz de usuario interactiva

**Clases y métodos principales:**
```javascript
class Editor {
    init()                          // Inicializa el editor
    addBlock(type)                  // Agrega nuevo bloque
    selectBlock(id)                 // Selecciona bloque para editar
    updateBlockProperty(name, val)  // Actualiza propiedad de bloque
    renderCanvas()                  // Renderiza todos los bloques
    saveChanges()                   // Guarda en storage
}
```

### renderer.js

**Responsabilidades:**
- Convertir JSON de bloques a HTML
- Generar estilos CSS inline
- Crear markup semántico
- Optimización para producción

**Métodos principales:**
```javascript
Renderer.renderToHTML(blocks)       // HTML completo de la página
Renderer.renderBlock(block)         // Renderiza un bloque
Renderer.buildStyles(styleObject)   // Convierte objeto JS a CSS
Renderer.getBaseStyles()            // Estilos base de la landing
```

### storage.js

**Responsabilidades:**
- Persistencia en localStorage
- Gestión de historial (undo/redo)
- Import/export de JSON
- Manejo de errores

**Métodos principales:**
```javascript
Storage.save(blocks)          // Guarda bloques
Storage.load()                // Carga bloques
Storage.exportJSON(blocks)    // Descarga JSON
Storage.importJSON(file)      // Importa desde archivo
```

## 📦 Formato de Datos

### Estructura de un Bloque

```json
{
  "id": "block-1234567890",
  "type": "text",
  "properties": {
    "content": "Tu texto aquí",
    "textColor": "#333333",
    "fontSize": 16,
    "textAlign": "left",
    "marginTop": 0,
    "marginBottom": 16
  }
}
```

### Tipos de Bloques

#### 1. Texto (`text`)
```json
{
  "type": "text",
  "properties": {
    "tag": "p",              // p, h1, h2, h3
    "content": "...",
    "textColor": "#333",
    "fontSize": 16,
    "textAlign": "left",     // left, center, right
    "fontWeight": "normal",  // normal, 600, bold
    "marginTop": 0,
    "marginBottom": 16,
    "paddingTop": 0,
    "paddingBottom": 0
  }
}
```

#### 2. Imagen (`image`)
```json
{
  "type": "image",
  "properties": {
    "src": "https://...",
    "alt": "Descripción",
    "width": "100%",
    "maxWidth": 800,
    "borderRadius": 8,
    "alignment": "center",
    "marginTop": 16,
    "marginBottom": 16
  }
}
```

#### 3. Botón (`button`)
```json
{
  "type": "button",
  "properties": {
    "text": "Click aquí",
    "link": "#",
    "backgroundColor": "#4A9A92",
    "textColor": "#ffffff",
    "fontSize": 16,
    "fontWeight": "600",
    "paddingVertical": 12,
    "paddingHorizontal": 24,
    "borderRadius": 8,
    "alignment": "center",
    "openNewTab": false,
    "marginTop": 16,
    "marginBottom": 16
  }
}
```

#### 4. Sección (`section`)
```json
{
  "type": "section",
  "properties": {
    "backgroundColor": "#f9fafb",
    "paddingTop": 40,
    "paddingBottom": 40,
    "paddingLeft": 20,
    "paddingRight": 20,
    "maxWidth": 1200,
    "marginTop": 0,
    "marginBottom": 0,
    "content": "HTML interno"
  }
}
```

## 🎨 Personalización

### Cambiar Colores del Admin

Edita las variables CSS en `admin.css`:

```css
:root {
    --primary: #4A9A92;        /* Color principal */
    --primary-dark: #3a7a72;   /* Hover del primario */
    --secondary: #8b6a47;      /* Color secundario */
    /* ... más variables ... */
}
```

### Agregar Nuevos Tipos de Bloques

1. **En `editor.js`** - Agregar template en `createBlockData()`:
```javascript
'nuevo-bloque': {
    id,
    type: 'nuevo-bloque',
    properties: {
        // ... propiedades
    }
}
```

2. **En `renderer.js`** - Agregar renderizador:
```javascript
static renderNuevoBloque(block) {
    // Lógica de renderizado
    return `<div>...</div>`;
}
```

3. **En `index.html`** - Agregar al sidebar:
```html
<div class="block-item" draggable="true" data-block-type="nuevo-bloque">
    <!-- Icono y descripción -->
</div>
```

## ⚙️ Requisitos

- Navegador moderno (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript habilitado
- Sin dependencias externas

## 🔒 Seguridad

- ⚠️ **Importante**: Este sistema usa localStorage, que almacena datos en el navegador del usuario
- No usar para información sensible sin encriptación
- Para producción, considerar implementar un backend real con autenticación

## 🚀 Extensiones Futuras

Ideas para expandir el sistema:

- [ ] Undo/Redo completo
- [ ] Bloques de galería de imágenes
- [ ] Bloques de video
- [ ] Sistema de templates predefinidos
- [ ] Responsive preview (móvil/tablet/desktop)
- [ ] Export a diferentes formatos
- [ ] Integración con backend real
- [ ] Sistema de usuarios y permisos
- [ ] Versionado de cambios

## 📝 Notas para Desarrolladores

### Convenciones de Código

- ES6+ modules (`import/export`)
- Comentarios JSDoc para funciones principales
- Nombres descriptivos en español (para la clienta)
- camelCase para variables y funciones
- PascalCase para clases

### Debug

Abre la consola del navegador para ver logs:

```javascript
// Editor global disponible para debugging
window.editor.blocks         // Ver todos los bloques
window.editor.selectedBlock  // Ver bloque seleccionado
Storage.load()              // Ver datos guardados
```

## 📄 Licencia

Sistema propietario desarrollado para Tocca Amalfi Coast.

## 🆘 Soporte

Para preguntas o problemas:
1. Revisar esta documentación
2. Consultar los comentarios en el código
3. Contactar al desarrollador

---

**Desarrollado con ❤️ para Tocca Amalfi Coast**
