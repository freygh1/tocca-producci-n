# 🎯 Guía Rápida de Uso - Sistema de Traducción

## Para Usuarios de la Web

### 1️⃣ Al Visitar la Página
```
┌─────────────────────────────────────┐
│  🌐 La página detecta tu idioma     │
│  automáticamente:                    │
│                                      │
│  • Navegador en español → 🇪🇸       │
│  • Navegador en inglés → 🇺🇸        │
│  • Otros idiomas → 🇺🇸 (defecto)    │
└─────────────────────────────────────┘
```

### 2️⃣ Cambiar el Idioma Manualmente
```
┌──────────────────────────────────────┐
│  1. Busca el botón en la esquina     │
│     superior derecha                  │
│                                       │
│     Desktop:  [🇪🇸 ES] o [🇺🇸 EN]    │
│     Mobile:   [🇪🇸 ES] o [🇺🇸 EN]    │
│                                       │
│  2. Haz clic para cambiar             │
│                                       │
│  3. ✅ La página se traduce           │
│     instantáneamente                  │
└──────────────────────────────────────┘
```

### 3️⃣ Persistencia
```
┌──────────────────────────────────────┐
│  Tu elección se guarda:              │
│                                       │
│  1ra visita: Español → 🇪🇸            │
│  2da visita: Se mantiene en 🇪🇸       │
│                                       │
│  ✨ No necesitas cambiar cada vez    │
└──────────────────────────────────────┘
```

---

## Para Desarrolladores/Editores

### ✏️ Agregar una Nueva Traducción

#### Paso 1: Editar translations.js
```javascript
// Ubicación: translations.js

const translations = {
    en: {
        "mi.nueva.clave": "My New Text",
        // ... otras traducciones
    },
    es: {
        "mi.nueva.clave": "Mi Nuevo Texto",
        // ... otras traducciones
    }
};
```

#### Paso 2: Agregar en HTML
```html
<!-- Para texto simple -->
<h2 data-i18n="mi.nueva.clave">My New Text</h2>

<!-- Para texto con HTML interno (bold, italic, etc) -->
<p data-i18n="mi.otra.clave" data-i18n-html>
    Texto con <strong>negrita</strong> y <em>cursiva</em>
</p>
```

### 🔧 Convenciones de Nomenclatura

```
Formato: "seccion.subseccion.elemento"

Ejemplos:
✅ "nav.why"          → Navegación, "Why Choose Us"
✅ "hero.title"       → Hero section, título
✅ "sig.f1"           → Signature journey, feature 1
✅ "inc.transport"    → Inclusiones, transporte

❌ "whychooseus"      → No usar sin separadores
❌ "NavWhy"           → No usar camelCase
```

### 📦 Estructura de Archivos

```
tocca-producci-n/
├── translations.js       ← Sistema de traducción
├── index.html           ← Atributos data-i18n
├── style.css            ← Estilos del botón
│
├── demo-traduccion.html      ← Demo visual
└── SISTEMA-TRADUCCION.md    ← Esta documentación
```

### 🐛 Solución de Problemas

#### Problema: Texto no se traduce
```
✅ Solución:
1. Verifica que el elemento tenga data-i18n="clave.correcta"
2. Verifica que la clave existe en translations.js
3. Verifica que está en ambos idiomas (en y es)
4. Recarga la página con Ctrl+F5
```

#### Problema: Se pierde el formato HTML
```
✅ Solución:
Agrega data-i18n-html al elemento:

<p data-i18n="texto.clave" data-i18n-html>
    Texto con <strong>formato</strong>
</p>
```

#### Problema: El botón no aparece
```
✅ Solución:
1. Verifica que translations.js esté cargado
2. Verifica que el botón existe en HTML:
   <button id="language-toggle">...</button>
3. Verifica que los estilos CSS estén cargados
4. Abre la consola del navegador para ver errores
```

### 🎨 Personalizar el Botón de Idioma

#### Cambiar Posición
```css
/* En style.css */
#language-toggle {
    /* Cambiar estas propiedades: */
    top: 80px;      /* Distancia desde arriba */
    right: 25px;    /* Distancia desde la derecha */
    
    /* También puedes usar: */
    /* left: 25px;  para moverlo a la izquierda */
    /* bottom: 25px; para moverlo abajo */
}
```

#### Cambiar Colores
```css
#language-toggle {
    /* Cambiar gradiente: */
    background: linear-gradient(135deg, #TU-COLOR-1, #TU-COLOR-2);
    
    /* Cambiar borde: */
    border: 2px solid #TU-COLOR;
}
```

### 📊 Monitoreo

#### Ver Idioma Actual
```javascript
// En consola del navegador:
console.log(getCurrentLanguage());
// Output: "es" o "en"
```

#### Ver Preferencia Guardada
```javascript
// En consola del navegador:
console.log(localStorage.getItem('toccaLanguage'));
// Output: "es", "en", o null
```

#### Resetear Preferencia
```javascript
// En consola del navegador:
localStorage.removeItem('toccaLanguage');
location.reload();
// La página detectará el idioma del navegador nuevamente
```

### 🚀 Comandos Útiles

#### Agregar traducción nueva rápidamente
```bash
# 1. Abrir translations.js
# 2. Buscar la sección correspondiente
# 3. Agregar en formato:
"clave": "texto"

# 4. Agregar en HTML:
data-i18n="clave"
```

---

## 📱 Testing Checklist

- [ ] Abrir en Chrome (Windows/Mac)
- [ ] Abrir en Firefox
- [ ] Abrir en Safari (Mac)
- [ ] Probar en móvil (Android)
- [ ] Probar en móvil (iOS)
- [ ] Verificar que el botón es visible
- [ ] Verificar que el cambio es instantáneo
- [ ] Verificar que la preferencia se guarda
- [ ] Verificar todas las secciones traducidas
- [ ] Verificar que los meta tags cambian

---

## 💡 Tips Avanzados

### Traducir Fechas y Números
```javascript
// Agregar en translations.js
const dateFormatters = {
    en: new Intl.DateTimeFormat('en-US'),
    es: new Intl.DateTimeFormat('es-ES')
};

// Usar en tu código
const formatter = dateFormatters[getCurrentLanguage()];
```

### Pluralización
```javascript
// En translations.js
en: {
    "guests.singular": "1 guest",
    "guests.plural": "{count} guests"
}
```

### Variables en Traducciones
```javascript
// Ejemplo de traducción con variables
"greeting": "Hello, {name}!"

// Luego reemplazar:
text.replace('{name}', userName);
```

---

## 📞 Soporte

Si necesitas ayuda o tienes preguntas:

1. Revisa SISTEMA-TRADUCCION.md (documentación completa)
2. Revisa demo-traduccion.html (demo visual)
3. Verifica la consola del navegador por errores
4. Asegúrate que todos los archivos estén en su lugar

---

✨ **¡Listo!** El sistema está implementado y funcionando.
