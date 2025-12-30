# 🚀 SUBIR ADMIN TOCCA A HOSTINGER

## ✅ VENTAJAS DE HOSTINGER vs LOCAL

- ✅ **Jessica puede acceder desde cualquier lugar** (casa, viaje, celular)
- ✅ **No necesita servidor local** ni archivos en su computadora
- ✅ **URL permanente**: `https://tudominio.com/admin`
- ✅ **Backup automático** en Hostinger
- ✅ **Funciona en cualquier navegador** sin instalación

---

## 📤 PASOS PARA SUBIR

### 1️⃣ Conectar con Hostinger

**Opción A: Administrador de Archivos Web**
1. Entra a tu panel de Hostinger
2. Ve a **Administrador de archivos**
3. Navega a `public_html`

**Opción B: FTP (Recomendado)**
1. Descarga **FileZilla** (gratis)
2. Conecta con las credenciales de Hostinger:
   - Host: `ftp.tudominio.com`
   - Usuario: Tu usuario FTP
   - Contraseña: Tu password FTP
   - Puerto: 21

### 2️⃣ Subir TODA la carpeta Tocca

```
public_html/
├── index.html
├── style.css
├── script.js
├── the_signature_journey.html
├── the_bespoke_journey.html
├── amalfi-journey.html
├── faq.html
├── imagenes/
├── imagenesparapaginas/
└── admin/                    ← ESTA CARPETA ES LA CLAVE
    ├── index.html
    ├── admin.css
    ├── editor.js
    ├── parser.js
    ├── renderer.js
    ├── storage.js
    └── README.md
```

### 3️⃣ Permisos (Importante)

En Hostinger, asegúrate que la carpeta `admin/` tenga:
- Permisos: **755** (lectura y ejecución pública)

### 4️⃣ Acceder al Admin

Una vez subido, Jessica accede desde:
```
https://tudominio.com/admin/
```

O si Tocca está en una subcarpeta:
```
https://tudominio.com/tocca/admin/
```

---

## 🎯 FLUJO PARA JESSICA EN HOSTINGER

1. **Abrir navegador** → `https://tudominio.com/admin`
2. **Click "Cargar Página"** → Selecciona página a editar
3. **Editar bloques** en tiempo real
4. **Click "Exportar"** → Descarga HTML editado
5. **Volver a Hostinger** (Administrador de archivos)
6. **Reemplazar** el archivo HTML con el nuevo
7. **Recargar** página web → ¡Cambios visibles!

---

## 🔒 SEGURIDAD (Opcional pero Recomendado)

### Proteger /admin con contraseña

Crea un archivo `.htaccess` en la carpeta `admin/`:

```apache
AuthType Basic
AuthName "Area Restringida - Tocca Admin"
AuthUserFile /home/tuusuario/public_html/admin/.htpasswd
Require valid-user
```

Crea el archivo `.htpasswd` con una contraseña:
```bash
# En el panel de Hostinger, terminal SSH:
htpasswd -c /home/tuusuario/public_html/admin/.htpasswd jessica
# Luego te pedirá crear una contraseña
```

Ahora cada vez que Jessica entre a `/admin`, le pedirá usuario y contraseña.

---

## ⚡ MEJORA: EDITAR Y SUBIR EN UN SOLO PASO

Para que Jessica NO tenga que descargar/reemplazar manualmente, podemos agregar:

### Opción 1: FTP Directo desde el Admin
Agregamos botón "Guardar en Servidor" que sube automáticamente vía FTP.

### Opción 2: API PHP Simple
Creamos `admin/save.php` que recibe el HTML y lo guarda directamente.

¿Quieres que implemente alguna de estas opciones?

---

## 📋 CHECKLIST ANTES DE SUBIR

- [ ] Todos los archivos HTML en la raíz
- [ ] Carpeta `admin/` completa con todos los .js
- [ ] Carpetas `imagenes/` e `imagenesparapaginas/`
- [ ] Verificar que `style.css` y `script.js` estén
- [ ] Probar en local que el admin funciona (http://localhost:8080/admin)
- [ ] Subir todo a `public_html/`
- [ ] Verificar permisos 755 en carpeta admin
- [ ] Abrir `https://tudominio.com/admin` y probar

---

## 🆘 SOLUCIÓN DE PROBLEMAS EN HOSTINGER

**Error: "No se muestran las páginas"**
- Verifica que los archivos HTML estén en la raíz de `public_html`
- Abre la consola del navegador (F12) y revisa errores

**Error: "Fetch failed" o CORS**
- Asegúrate que todo esté bajo el mismo dominio
- No mezcles `http://` con `https://`

**Cambios no se reflejan**
- Limpia caché del navegador (Ctrl + Shift + R)
- Verifica que reemplazaste el archivo correcto

---

## 💡 DESPUÉS DE SUBIR

Jessica solo necesita:
1. Guardar el link en favoritos: `https://tudominio.com/admin`
2. Abrirlo cuando quiera editar
3. No necesita servidor local, ni archivos en su PC
4. Puede editar desde cualquier dispositivo

**¿Cuál es tu dominio de Hostinger? Te ayudo a subirlo.**
