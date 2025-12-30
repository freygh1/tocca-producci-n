# Servidor HTTP simple para Tocca Admin
$port = 8080
$url = "http://localhost:$port/"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     TOCCA ADMIN SERVER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Servidor iniciado en: " -NoNewline
Write-Host $url -ForegroundColor Green
Write-Host ""
Write-Host "Archivos servidos desde:" -NoNewline
Write-Host " $(Get-Location)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Abre el admin en:" -NoNewline
Write-Host " ${url}admin/index.html" -ForegroundColor Magenta
Write-Host ""
Write-Host "Presiona CTRL+C para detener el servidor" -ForegroundColor Red
Write-Host ""

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
$listener.Start()

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Obtener la ruta del archivo
        $path = $request.Url.LocalPath
        if ($path -eq '/') { $path = '/index.html' }
        
        $filePath = Join-Path (Get-Location) $path.TrimStart('/')
        
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - " -NoNewline -ForegroundColor Gray
        Write-Host "GET $path" -ForegroundColor Cyan
        
        if (Test-Path $filePath -PathType Leaf) {
            # Determinar Content-Type
            $contentType = switch ([System.IO.Path]::GetExtension($filePath)) {
                '.html' { 'text/html; charset=utf-8' }
                '.css'  { 'text/css; charset=utf-8' }
                '.js'   { 'application/javascript; charset=utf-8' }
                '.json' { 'application/json; charset=utf-8' }
                '.png'  { 'image/png' }
                '.jpg'  { 'image/jpeg' }
                '.jpeg' { 'image/jpeg' }
                '.gif'  { 'image/gif' }
                '.svg'  { 'image/svg+xml' }
                '.ico'  { 'image/x-icon' }
                default { 'application/octet-stream' }
            }
            
            $response.ContentType = $contentType
            $response.StatusCode = 200
            
            # Agregar headers CORS
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
            $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type")
            
            $buffer = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            Write-Host "  Archivo no encontrado: $filePath" -ForegroundColor Red
            $response.StatusCode = 404
            $html = "<h1>404 - Archivo no encontrado</h1><p>$path</p>"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($html)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        
        $response.Close()
    }
} finally {
    $listener.Stop()
    Write-Host ""
    Write-Host "Servidor detenido" -ForegroundColor Yellow
}
