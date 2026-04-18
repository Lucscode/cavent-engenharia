$blogFiles = Get-ChildItem -Path blog -Filter *.html
$utf8NoBom = New-Object System.Text.UTF8Encoding($False)

foreach ($file in $blogFiles) {
    # Read as bytes to avoid any encoding guess issues, or use ReadAllText with explicit UTF8
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    $changed = $false
    
    # Fix the specific corrupted text
    $oldText = 'Precisa de adequaÃ§Ã£o tÃ©cnica ou projeto para seu empreendimento\? Fale com nossos engenheiros\.'
    $newText = 'Precisa de adequação técnica ou projeto para seu empreendimento? Fale com nossos engenheiros.'
    
    if ($content -match $oldText) {
        $content = $content -replace $oldText, $newText
        $changed = $true
    }
    
    # Also check for other common corruptions if needed, but let's start with this one
    # If the whole file was corrupted, I might need to do a broader replacement
    # But for now, let's fix the specific request
    
    if ($changed) {
        [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
        Write-Host "Fixed characters in $($file.Name)"
    }
}
