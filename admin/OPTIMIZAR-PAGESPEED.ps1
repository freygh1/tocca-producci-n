# Script de Optimización Automática PageSpeed
# Agrega defer a scripts y optimiza recursos críticos

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OPTIMIZADOR AUTOMÁTICO PAGESPEED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = "c:\Users\Rubir\Desktop\tocca\tocca-producci-n"
$htmlFiles = @(
    "the_signature_journey.html",
    "the_bespoke_journey.html",
    "amalfi-journey.html",
    "faq.html"
)

foreach ($file in $htmlFiles) {
    $filePath = Join-Path $rootPath $file
    
    if (Test-Path $filePath) {
        Write-Host "Optimizando: $file" -ForegroundColor Yellow
        
        # Leer contenido
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Backup
        $backupPath = "$filePath.backup"
        Copy-Item $filePath $backupPath -Force
        Write-Host "  Backup creado: $file.backup" -ForegroundColor Gray
        
        # Agregar defer a scripts jQuery si no lo tiene
        $content = $content -replace '<script src="https://code\.jquery\.com/jquery-3\.6\.0\.min\.js">', '<script src="https://code.jquery.com/jquery-3.6.0.min.js" defer>'
        
        # Agregar defer a slick carousel
        $content = $content -replace '<script type="text/javascript" src="https://cdn\.jsdelivr\.net/npm/slick-carousel@1\.8\.1/slick/slick\.min\.js">', '<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js" defer>'
        
        # Agregar defer a script.js
        $content = $content -replace '<script src="script\.js">', '<script src="script.js" defer>'
        
        # Agregar defer a Bootstrap si existe
        $content = $content -replace '<script src="https://cdn\.jsdelivr\.net/npm/bootstrap@5\.3\.0/dist/js/bootstrap\.bundle\.min\.js">', '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" defer>'
        
        # Guardar
        Set-Content $filePath $content -Encoding UTF8 -NoNewline
        Write-Host "  Optimizado exitosamente" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "  No encontrado: $file" -ForegroundColor Red
    }
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "  OPTIMIZACION COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Cambios realizados:" -ForegroundColor White
Write-Host "  - Scripts con defer agregado" -ForegroundColor White
Write-Host "  - Backups creados (.backup)" -ForegroundColor White
Write-Host ""
Write-Host "Sube los archivos optimizados a Hostinger" -ForegroundColor Yellow
Write-Host ""

Read-Host "Presiona Enter para cerrar"
