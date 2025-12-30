# 📖 Cómo Usar el Editor Tocca

## 🎯 Flujo de Trabajo

### **Opción 1: Editar Página Existente**

1. **Abrir el admin**: Abre `admin/index.html` en tu navegador

2. **Cargar página**:
   - Haz clic en el botón **"Cargar Página"** (arriba a la derecha)
   - Selecciona la página que quieres editar (ej: index.html, the_signature_journey.html)
   - El sistema convierte el HTML en bloques editables
   - Los bloques aparecen en el **CANVAS CENTRAL** (área grande del medio)

3. **Editar bloques**:
   - Haz clic en cualquier bloque del canvas para seleccionarlo
   - En el panel derecho **"Propiedades"** puedes cambiar:
     - Textos, colores, tamaños
     - Imágenes, enlaces, estilos
     - Márgenes, padding, alineación
   - Los cambios se ven en **tiempo real** en el canvas

4. **Reorganizar**:
   - Usa las flechas ⬆️ ⬇️ para mover bloques arriba/abajo
   - Usa el botón 📋 para duplicar
   - Usa el botón 🗑️ para eliminar

5. **Exportar**:
   - Haz clic en **"Exportar"**
   - Se descarga el archivo HTML editado
   - **IMPORTANTE**: Debes REEMPLAZAR manualmente el archivo original en tu carpeta:
     ```
     c:\Users\Rubir\Desktop\tocca\tocca-producci-n\
     ```

### **Opción 2: Crear Página Nueva**

1. **Agregar bloques**:
   - En el panel izquierdo **"Bloques"** hay 4 tipos:
     - **Texto**: Párrafos, títulos (H1, H2, H3)
     - **Imagen**: Fotos con upload o URL
     - **Botón**: Enlaces con estilos personalizados
     - **Sección**: Contenedores con fondo y padding
   
2. **Arrastra bloques al canvas**:
   - Haz clic y arrastra un bloque desde el sidebar izquierdo
   - Suéltalo en el canvas central
   - El bloque aparece con valores por defecto

3. **Editar y exportar**:
   - Igual que la Opción 1 (pasos 3-5)

## 🎨 ¿Dónde van mis bloques?

```
┌─────────────────────────────────────────────────────────┐
│  [Cargar Página]  [Exportar]  [Vista Previa]  [Guardar] │
├──────────┬───────────────────────────────┬──────────────┤
│          │                               │              │
│ BLOQUES  │         CANVAS                │ PROPIEDADES  │
│ ======== │         ======                │ =========== │
│          │                               │              │
│ [Texto]  │  ┌─────────────────────┐     │  Color: ...  │
│ [Imagen] │  │  Tu bloque aquí     │     │  Tamaño: ... │
│ [Botón]  │  │  (editable)         │◄────┤  Align: ...  │
│ [Sección]│  └─────────────────────┘     │              │
│          │  ┌─────────────────────┐     │              │
│          │  │  Otro bloque        │     │              │
│ Arrastra │  └─────────────────────┘     │              │
│ desde    │                               │              │
│ aquí ──► │  TODOS LOS BLOQUES            │              │
│          │  EDITABLES APARECEN AQUÍ      │              │
└──────────┴───────────────────────────────┴──────────────┘
```

## ⚠️ Importante

- **Los bloques NO se guardan automáticamente en los archivos HTML originales**
- **Debes descargar el HTML con "Exportar" y reemplazar manualmente el archivo**
- **"Guardar Cambios" solo guarda en localStorage del navegador** (para no perder tu progreso)
- **El canvas central es tu área de trabajo** - ahí ves todos los bloques

## 🔧 Si algo no funciona

1. Abre la **Consola del navegador** (F12)
2. Ve a la pestaña **Console**
3. Busca errores en rojo
4. Compártelos para ayuda

## ✅ Flujo Recomendado para Jessica

1. Abre `admin/index.html`
2. Click "Cargar Página" → Selecciona index.html
3. Espera a que cargue (verás bloques en el canvas)
4. Click en un bloque para editarlo
5. Cambia texto/colores en el panel derecho
6. Click "Exportar"
7. Reemplaza el archivo `index.html` en la carpeta raíz con el descargado
8. Abre `index.html` en el navegador para ver cambios
